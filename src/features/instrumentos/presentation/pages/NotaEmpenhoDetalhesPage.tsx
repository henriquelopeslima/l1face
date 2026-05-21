import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { CriarOrdemFornecimento } from '@/features/instrumentos/presentation/components/CriarOrdemFornecimento';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  NavArrowLeft,
  Download,
  WarningTriangle,
  NavArrowDown,
  NavArrowUp,
  BoxIso,
  List,
  DatabaseStats,
  DeliveryTruck,
  Plus,
} from 'iconoir-react';

interface NotaEmpenhoDetalhada {
  id: string;
  numero: string;
  tipoEmpenho: 'ordinario' | 'global' | 'estimativo';
  orgaoContratante: string;
  secretaria: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento: string;
  valorTotal: number;
  saldoAtual: number;
  status: 'em-processamento' | 'liquido' | 'pago' | 'cancelado';
  enderecoEntrega: string;
  prazoEntrega: number;
  prazoPagamento: number;
  anexoNota: string;
}

interface ItemNotaEmpenho {
  id: string;
  descricao: string;
  unidadeMedida: string;
  qtdSolicitada: number;
  qtdEntregue: number;
  qtdReservada: number;
  valorUnitario: number;
}

interface MovimentacaoItem {
  id: string;
  data: string;
  itemId: string;
  itemDescricao: string;
  tipo: 'entrega' | 'reserva' | 'cancelamento';
  numeroOF: string;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  responsavel: string;
}

type StatusCicloOF = 'pedido-recebido' | 'em-separacao' | 'despachado' | 'entregue' | 'pago';
type StatusPagamento = 'aguardando-liquidacao' | 'em-processamento' | 'pago' | 'atrasado';
type TipoEmpenho = 'ordinario' | 'global' | 'estimativo';

interface ItemOF {
  itemId: string;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
}

interface OrdemFornecimento {
  id: string;
  numero: string;
  notaEmpenhoId: string;
  dataRecebimento: string;
  numeroEmpenho: string;
  tipoEmpenho?: TipoEmpenho;
  itens: ItemOF[];
  statusCiclo: StatusCicloOF;
  dataEntrega?: string;
  dataLiquidacao?: string;
  numeroNotaFiscal?: string;
  statusPagamento?: StatusPagamento;
  dataPagamento?: string;
}

const notasEmpenhoDetalhadas: NotaEmpenhoDetalhada[] = [
  {
    id: 'NE-001',
    numero: 'NE 88442/2025',
    tipoEmpenho: 'ordinario',
    orgaoContratante: 'Prefeitura de Fortaleza',
    secretaria: 'SMS',
    descricao: 'Medicamentos diversos',
    dataEmissao: '2025-03-01',
    dataVencimento: '2026-02-15',
    valorTotal: 120000.0,
    saldoAtual: 88000.0,
    status: 'liquido',
    enderecoEntrega: 'Rua Dr. José Lourenço, 1500 - Aldeota, Fortaleza/CE - CEP 60115-282',
    prazoEntrega: 10,
    prazoPagamento: 30,
    anexoNota: '#nota-empenho-001.pdf',
  },
  {
    id: 'NE-002',
    numero: 'NE 55223/2025',
    tipoEmpenho: 'global',
    orgaoContratante: 'Secretaria de Educação de Fortaleza',
    secretaria: 'SEDFOR',
    descricao: 'Equipamentos de informática e impressoras',
    dataEmissao: '2025-04-15',
    dataVencimento: '2025-12-20',
    valorTotal: 95000.0,
    saldoAtual: 72500.0,
    status: 'em-processamento',
    enderecoEntrega: 'Av. Aguanambi, 2222 - Fátima, Fortaleza/CE - CEP 60411-145',
    prazoEntrega: 15,
    prazoPagamento: 30,
    anexoNota: '#nota-empenho-002.pdf',
  },
];

const itensNotaEmpenho: Record<string, ItemNotaEmpenho[]> = {
  'NE-001': [
    { id: 'ITEM-001', descricao: 'Medicamentos - Analgésicos', unidadeMedida: 'caixa', qtdSolicitada: 200, qtdEntregue: 150, qtdReservada: 30, valorUnitario: 85.0 },
    { id: 'ITEM-002', descricao: 'Medicamentos - Antibióticos', unidadeMedida: 'caixa', qtdSolicitada: 150, qtdEntregue: 120, qtdReservada: 20, valorUnitario: 120.0 },
    { id: 'ITEM-003', descricao: 'Seringas Descartáveis', unidadeMedida: 'caixa de 100', qtdSolicitada: 100, qtdEntregue: 80, qtdReservada: 15, valorUnitario: 180.0 },
  ],
  'NE-002': [
    { id: 'ITEM-001', descricao: 'Notebook i7 16GB', unidadeMedida: 'un', qtdSolicitada: 50, qtdEntregue: 30, qtdReservada: 5, valorUnitario: 6000.0 },
    { id: 'ITEM-002', descricao: 'Impressora Laser A3', unidadeMedida: 'un', qtdSolicitada: 20, qtdEntregue: 12, qtdReservada: 3, valorUnitario: 3500.0 },
    { id: 'ITEM-003', descricao: 'Mouse sem fio', unidadeMedida: 'un', qtdSolicitada: 100, qtdEntregue: 99, qtdReservada: 1, valorUnitario: 150.0 },
  ],
};

const movimentacoesNotaEmpenho: Record<string, MovimentacaoItem[]> = {
  'NE-001': [
    { id: 'MOV-001', data: '2025-03-15', itemId: 'ITEM-001', itemDescricao: 'Medicamentos - Analgésicos', tipo: 'entrega', numeroOF: 'OF-001/2025', quantidade: 50, saldoAnterior: 200, saldoPosterior: 150, responsavel: 'João Silva' },
  ],
  'NE-002': [
    { id: 'MOV-101', data: '2025-05-01', itemId: 'ITEM-001', itemDescricao: 'Notebook i7 16GB', tipo: 'entrega', numeroOF: 'OF-010/2025', quantidade: 15, saldoAnterior: 50, saldoPosterior: 35, responsavel: 'Ricardo Alves' },
  ],
};

const ordensFornecimento: Record<string, OrdemFornecimento[]> = {
  'NE-001': [
    {
      id: 'OF-NE001-001', numero: 'OF #001', notaEmpenhoId: 'NE-001', dataRecebimento: '2025-05-10',
      numeroEmpenho: '2025NE001234', tipoEmpenho: 'ordinario',
      itens: [{ itemId: 'ITEM-001', descricao: 'Medicamentos - Analgésicos', quantidade: 50, unidadeMedida: 'caixa' }],
      statusCiclo: 'pago', dataEntrega: '2025-05-18', dataLiquidacao: '2025-05-22',
      numeroNotaFiscal: '000.123.456', statusPagamento: 'pago', dataPagamento: '2025-06-18',
    },
  ],
  'NE-002': [
    {
      id: 'OF-001', numero: 'OF #001', notaEmpenhoId: 'NE-002', dataRecebimento: '2026-01-10',
      numeroEmpenho: '2026NE000142', tipoEmpenho: 'global',
      itens: [{ itemId: 'ITEM-001', descricao: 'Notebook i7 16GB', quantidade: 10, unidadeMedida: 'un' }],
      statusCiclo: 'despachado',
    },
  ],
};

export function NotaEmpenhoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notaEmpenho = notasEmpenhoDetalhadas.find((n) => n.id === id);
  const [visaoItens, setVisaoItens] = useState<'consolidada' | 'extrato'>('consolidada');
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(true);
  const [dialogCriarOFAberto, setDialogCriarOFAberto] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<{ label: string; callback: () => void } | null>(null);
  const [filtroEmpenho, setFiltroEmpenho] = useState('');
  const [paginaItensNotaEmpenho, setPaginaItensNotaEmpenho] = useState(1);

  if (!notaEmpenho) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nota de Empenho não encontrada</p>
            <Button onClick={() => navigate('/instrumentos/gestao')} className="mt-4">
              Voltar para gestão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calcularDiasRestantes = (dataVencimento: string): number => {
    const hoje = new Date();
    const dataFim = new Date(dataVencimento);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  };

  const formatarTipoEmpenho = (tipo?: TipoEmpenho) => {
    if (tipo === 'global') return 'Global';
    if (tipo === 'estimativo') return 'Estimativo';
    return 'Ordinário';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em-processamento': return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em Processamento</Badge>;
      case 'liquido': return <Badge className="bg-[#06D6A0] text-white border-[#06D6A0]">Líquido</Badge>;
      case 'pago': return <Badge className="bg-[#06D6A0] text-white border-[#06D6A0]">Pago</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const diasRestantes = calcularDiasRestantes(notaEmpenho.dataVencimento);
  const vencimentoProximo = diasRestantes < 90;
  const percentualConsumo = ((notaEmpenho.valorTotal - notaEmpenho.saldoAtual) / notaEmpenho.valorTotal) * 100;
  const ordensNotaEmpenho = ordensFornecimento[id || ''] || [];
  const ordensFiltradas = [...ordensNotaEmpenho]
    .sort((a, b) => b.numero.localeCompare(a.numero))
    .filter((of) => !filtroEmpenho.trim() || (of.numeroEmpenho || '').toLowerCase().includes(filtroEmpenho.toLowerCase()));

  const itensPorPagina = 5;
  const itensNotaEmpenhoAtual = itensNotaEmpenho[id || ''] || [];
  const totalPaginasItens = Math.max(1, Math.ceil(itensNotaEmpenhoAtual.length / itensPorPagina));
  const paginaAtualItens = Math.min(Math.max(1, paginaItensNotaEmpenho), totalPaginasItens);
  const itensPaginados = itensNotaEmpenhoAtual.slice(
    (paginaAtualItens - 1) * itensPorPagina,
    paginaAtualItens * itensPorPagina,
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: notaEmpenho.numero },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/instrumentos/gestao')} className="h-9 w-9 p-0 lg:h-10 lg:w-10">
            <NavArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl lg:text-4xl font-bold">{notaEmpenho.numero}</h1>
              {getStatusBadge(notaEmpenho.status)}
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">{notaEmpenho.descricao}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 h-9 lg:h-10">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {vencimentoProximo && (
        <div className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#F39C12] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#F39C12] mb-1">Nota de Empenho com Vencimento Próximo</h3>
              <p className="text-sm">
                Vence em <strong>{diasRestantes} dias</strong> ({formatDate(notaEmpenho.dataVencimento)}).
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Detalhes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setDetalhesExpandidos(!detalhesExpandidos)} className="h-8 w-8 p-0">
              {detalhesExpandidos ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {detalhesExpandidos && (
          <CardContent className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Órgão</p>
              <p className="text-sm font-medium">{notaEmpenho.orgaoContratante}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Tipo</p>
              <p className="text-sm">{formatarTipoEmpenho(notaEmpenho.tipoEmpenho)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Data de Emissão</p>
              <p className="text-sm font-mono">{formatDate(notaEmpenho.dataEmissao)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Vencimento</p>
              <p className={`text-sm font-mono ${vencimentoProximo ? 'text-[#F39C12]' : ''}`}>
                {formatDate(notaEmpenho.dataVencimento)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Valor Total</p>
              <p className="text-sm font-mono font-semibold">{formatCurrency(notaEmpenho.valorTotal)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Saldo</p>
              <p className="text-sm font-mono font-semibold">{formatCurrency(notaEmpenho.saldoAtual)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Consumo</p>
              <p className="text-sm font-mono font-semibold">{percentualConsumo.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Endereço</p>
              <p className="text-xs">{notaEmpenho.enderecoEntrega}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {itensNotaEmpenho[id ?? ''] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <BoxIso className="h-5 w-5" />
                Itens
              </CardTitle>
              <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
                <Button
                  variant={visaoItens === 'consolidada' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => { setVisaoItens('consolidada'); setPaginaItensNotaEmpenho(1); }}
                  className="gap-2 h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={visaoItens === 'extrato' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => { setVisaoItens('extrato'); setPaginaItensNotaEmpenho(1); }}
                  className="gap-2 h-8"
                >
                  <DatabaseStats className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {visaoItens === 'consolidada' ? (
              <>
                <div className="max-h-[52vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Descrição</TableHead>
                        <TableHead className="text-xs">Unid.</TableHead>
                        <TableHead className="text-right text-xs">Qtd.</TableHead>
                        <TableHead className="text-right text-xs">Entregue</TableHead>
                        <TableHead className="text-right text-xs">Reservada</TableHead>
                        <TableHead className="text-right text-xs">Disponível</TableHead>
                        <TableHead className="text-right text-xs">Valor Unit.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensPaginados.map((item) => {
                        const saldoDisponivel = item.qtdSolicitada - item.qtdEntregue - item.qtdReservada;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">{item.descricao}</TableCell>
                            <TableCell className="font-mono text-sm">{item.unidadeMedida}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums">{item.qtdSolicitada}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums bg-accent/30">{item.qtdEntregue}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums bg-accent/30">{item.qtdReservada}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums font-semibold bg-accent/30">{saldoDisponivel}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-sm">{formatCurrency(item.valorUnitario)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">{itensPaginados.length} de {itensNotaEmpenhoAtual.length}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" disabled={paginaAtualItens <= 1} onClick={() => setPaginaItensNotaEmpenho(paginaAtualItens - 1)}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">{paginaAtualItens} / {totalPaginasItens}</span>
                    <Button size="sm" variant="ghost" disabled={paginaAtualItens >= totalPaginasItens} onClick={() => setPaginaItensNotaEmpenho(paginaAtualItens + 1)}>Próxima</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28 text-xs">Data</TableHead>
                      <TableHead className="text-xs">Item</TableHead>
                      <TableHead className="w-32 text-xs">Nº OF</TableHead>
                      <TableHead className="w-28 text-xs">Operação</TableHead>
                      <TableHead className="w-24 text-right text-xs">Qtd</TableHead>
                      <TableHead className="text-xs">Responsável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoesNotaEmpenho[id ?? '']
                      ?.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell className="font-mono text-sm">{formatDate(mov.data)}</TableCell>
                          <TableCell className="font-medium text-sm">{mov.itemDescricao}</TableCell>
                          <TableCell className="font-mono text-sm">{mov.numeroOF}</TableCell>
                          <TableCell>
                            <Badge className="text-xs" variant="outline">{mov.tipo}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{mov.quantidade}</TableCell>
                          <TableCell className="text-sm">{mov.responsavel}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <DeliveryTruck className="h-5 w-5" />
              Ordens de Fornecimento
            </CardTitle>
            <Button onClick={() => setDialogCriarOFAberto(true)} className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Nova OF
            </Button>
          </div>
        </CardHeader>
        {ordensNotaEmpenho.length > 0 ? (
          <CardContent>
            <div className="mb-4 w-full sm:max-w-md">
              <Input
                placeholder="Filtrar por empenho"
                value={filtroEmpenho}
                onChange={(e) => setFiltroEmpenho(e.target.value)}
              />
            </div>
            <Accordion type="multiple" className="space-y-3">
              {ordensFiltradas.map((of) => (
                <AccordionItem key={of.id} value={of.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold">{of.numero}</h3>
                      <Badge variant="outline" className="text-xs">{of.statusCiclo}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(of.dataRecebimento)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 pb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Empenho</p>
                        <p className="text-sm font-mono font-semibold">{of.numeroEmpenho}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                        <p className="text-sm">{formatarTipoEmpenho(of.tipoEmpenho)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge variant="outline" className="text-xs">{of.statusCiclo}</Badge>
                      </div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Itens</p>
                      <div className="flex flex-wrap gap-2">
                        {of.itens.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item.descricao} × {item.quantidade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {of.statusCiclo === 'entregue' && (
                      <div className="grid grid-cols-3 gap-4 border-t pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Data Entrega</p>
                          <p className="text-sm font-mono">{of.dataEntrega ? formatDate(of.dataEntrega) : '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">NF-e</p>
                          <p className="text-sm font-mono">{of.numeroNotaFiscal || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status Pgto</p>
                          <Badge variant="outline" className="text-xs">{of.statusPagamento || 'Aguardando'}</Badge>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <DeliveryTruck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma ordem de fornecimento criada.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <CriarOrdemFornecimento
        open={dialogCriarOFAberto}
        onOpenChange={setDialogCriarOFAberto}
        contratoId={id || ''}
        itensContrato={itensNotaEmpenho[id || ''] || []}
        prazoEntrega={notaEmpenho.prazoEntrega}
        onSubmit={() => setDialogCriarOFAberto(false)}
      />

      <Dialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              Confirmar: <strong>{acaoPendente?.label}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => { setConfirmacaoAberta(false); setAcaoPendente(null); }}>Cancelar</Button>
            <Button onClick={() => {
              if (acaoPendente) acaoPendente.callback();
              setConfirmacaoAberta(false);
              setAcaoPendente(null);
            }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
