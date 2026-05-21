import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
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
  Calendar,
  Clock,
  Page,
  Building,
  Package,
  MapPin,
  Truck,
  DollarCircle,
  Link as LinkIcon,
  InfoCircle,
  BoxIso,
  List,
  DatabaseStats,
  NavArrowDown,
  NavArrowUp,
  Check,
  DeliveryTruck,
  Mail,
  Plus,
} from 'iconoir-react';

interface ContratoDetalhado {
  id: string;
  numeroInstrumento: string;
  isARP: boolean;
  orgaoContratante: string;
  secretaria: string;
  objeto: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  valorGlobal: number;
  saldoAtual: number;
  status: 'em-execucao' | 'proximo-vencimento' | 'encerrado' | 'renovavel';
  enderecoEntrega: string;
  prazoEntrega: number;
  prazoPagamento: number;
  renovavel: boolean;
  anexoContrato: string;
  arpOrigemId?: string;
  arpOrigemNumero?: string;
}

interface ItemContrato {
  id: string;
  descricao: string;
  unidadeMedida: string;
  qtdContratada: number;
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
  contratoId: string;
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

const contratosDetalhados: ContratoDetalhado[] = [
  {
    id: 'CT-001',
    numeroInstrumento: '042/2024',
    isARP: false,
    orgaoContratante: 'Prefeitura Municipal de Russas',
    secretaria: 'SEMED',
    objeto: 'Merenda Escolar',
    vigenciaInicio: '2024-04-01',
    vigenciaFim: '2026-03-31',
    valorGlobal: 250000.0,
    saldoAtual: 28000.0,
    status: 'proximo-vencimento',
    enderecoEntrega: 'Av. Principal, 1000 - Centro, Russas/CE - CEP 62900-000',
    prazoEntrega: 10,
    prazoPagamento: 30,
    renovavel: true,
    anexoContrato: '#contrato-042-2024.pdf',
  },
  {
    id: 'CT-002',
    numeroInstrumento: '118/2025',
    isARP: false,
    orgaoContratante: 'Governo do Estado do Ceará',
    secretaria: 'SEDUC',
    objeto: 'Material de Expediente',
    vigenciaInicio: '2025-01-15',
    vigenciaFim: '2026-06-15',
    valorGlobal: 80000.0,
    saldoAtual: 52000.0,
    status: 'em-execucao',
    enderecoEntrega: 'Av. Aguanambi, 2222 - Fátima, Fortaleza/CE - CEP 60411-145',
    prazoEntrega: 15,
    prazoPagamento: 30,
    renovavel: false,
    anexoContrato: '#contrato-118-2025.pdf',
  },
  {
    id: 'CT-003',
    numeroInstrumento: '203/2025',
    isARP: true,
    orgaoContratante: 'Prefeitura de Fortaleza',
    secretaria: 'SMS',
    objeto: 'Material Hospitalar',
    vigenciaInicio: '2025-02-10',
    vigenciaFim: '2026-09-10',
    valorGlobal: 420000.0,
    saldoAtual: 310000.0,
    status: 'em-execucao',
    enderecoEntrega: 'Rua Dr. José Lourenço, 1500 - Aldeota, Fortaleza/CE - CEP 60115-282',
    prazoEntrega: 5,
    prazoPagamento: 15,
    renovavel: false,
    anexoContrato: '#contrato-203-2025.pdf',
    arpOrigemId: 'ARP-001',
    arpOrigemNumero: '089/2024',
  },
];

const catalogoCestaBasica: Array<{ nome: string; unidade: string; base: number }> = [
  { nome: 'Açúcar Cristal', unidade: 'fardo c/ 30 kg', base: 95 },
  { nome: 'Café Torrado e Moído', unidade: 'caixa c/ 20 un', base: 210 },
  { nome: 'Macarrão Espaguete', unidade: 'fardo c/ 20 kg', base: 130 },
  { nome: 'Farinha de Mandioca', unidade: 'fardo c/ 25 kg', base: 145 },
  { nome: 'Farinha de Trigo', unidade: 'fardo c/ 25 kg', base: 155 },
  { nome: 'Fubá de Milho', unidade: 'fardo c/ 20 kg', base: 118 },
  { nome: 'Sal Refinado', unidade: 'fardo c/ 30 kg', base: 88 },
  { nome: 'Leite em Pó Integral', unidade: 'caixa c/ 24 un', base: 255 },
  { nome: 'Biscoito Cream Cracker', unidade: 'caixa c/ 40 un', base: 165 },
  { nome: 'Biscoito Maria', unidade: 'caixa c/ 40 un', base: 158 },
  { nome: 'Sardinha em Lata', unidade: 'caixa c/ 50 un', base: 275 },
  { nome: 'Molho de Tomate', unidade: 'caixa c/ 24 un', base: 142 },
  { nome: 'Milho Verde em Conserva', unidade: 'caixa c/ 24 un', base: 176 },
  { nome: 'Ervilha em Conserva', unidade: 'caixa c/ 24 un', base: 168 },
  { nome: 'Feijão Carioca', unidade: 'fardo c/ 30 kg', base: 122 },
  { nome: 'Arroz Parboilizado', unidade: 'fardo c/ 30 kg', base: 92 },
  { nome: 'Óleo Composto', unidade: 'caixa de 20 litros', base: 186 },
  { nome: 'Achocolatado em Pó', unidade: 'caixa c/ 24 un', base: 198 },
  { nome: 'Flocão de Milho', unidade: 'fardo c/ 20 kg', base: 116 },
  { nome: 'Extrato de Tomate', unidade: 'caixa c/ 24 un', base: 149 },
];

const itensContratoMassaCT001: ItemContrato[] = [
  { id: 'ITEM-001', descricao: 'Arroz Tipo 1', unidadeMedida: 'fardo c/ 30 kg', qtdContratada: 200, qtdEntregue: 150, qtdReservada: 30, valorUnitario: 85.0 },
  { id: 'ITEM-002', descricao: 'Feijão Preto', unidadeMedida: 'fardo c/ 30 kg', qtdContratada: 150, qtdEntregue: 120, qtdReservada: 20, valorUnitario: 120.0 },
  { id: 'ITEM-003', descricao: 'Óleo de Soja', unidadeMedida: 'caixa de 20 litros', qtdContratada: 100, qtdEntregue: 80, qtdReservada: 15, valorUnitario: 180.0 },
  ...Array.from({ length: 97 }, (_, index): ItemContrato => {
    const numeroItem = index + 4;
    const itemCatalogo = catalogoCestaBasica[index % catalogoCestaBasica.length];
    const qtdContratada = 120 + (numeroItem % 35) * 4;
    const qtdEntregue = Math.max(10, Math.floor(qtdContratada * 0.55));
    const qtdReservada = Math.max(2, Math.floor(qtdContratada * 0.12));
    const valorUnitario = itemCatalogo.base + (index % 5) * 3.5;
    return {
      id: `ITEM-${String(numeroItem).padStart(3, '0')}`,
      descricao: `${itemCatalogo.nome} ${String(numeroItem).padStart(3, '0')}`,
      unidadeMedida: itemCatalogo.unidade,
      qtdContratada,
      qtdEntregue,
      qtdReservada,
      valorUnitario,
    };
  }),
];

const itensContrato: Record<string, ItemContrato[]> = {
  'CT-001': itensContratoMassaCT001,
  'CT-002': [
    { id: 'ITEM-001', descricao: 'Notebook i7 16GB', unidadeMedida: 'un', qtdContratada: 50, qtdEntregue: 30, qtdReservada: 5, valorUnitario: 6000.0 },
    { id: 'ITEM-002', descricao: 'Docking Station TB4', unidadeMedida: 'un', qtdContratada: 50, qtdEntregue: 42, qtdReservada: 5, valorUnitario: 1000.0 },
    { id: 'ITEM-003', descricao: 'Mouse sem fio', unidadeMedida: 'un', qtdContratada: 100, qtdEntregue: 99, qtdReservada: 1, valorUnitario: 150.0 },
  ],
  'CT-003': [
    { id: 'ITEM-001', descricao: 'Luva de Procedimento', unidadeMedida: 'caixa de 100 un', qtdContratada: 500, qtdEntregue: 200, qtdReservada: 50, valorUnitario: 45.0 },
    { id: 'ITEM-002', descricao: 'Máscara Cirúrgica', unidadeMedida: 'caixa de 50 un', qtdContratada: 800, qtdEntregue: 350, qtdReservada: 100, valorUnitario: 38.0 },
    { id: 'ITEM-003', descricao: 'Álcool em Gel 70%', unidadeMedida: 'galão 5L', qtdContratada: 300, qtdEntregue: 180, qtdReservada: 50, valorUnitario: 85.0 },
    { id: 'ITEM-004', descricao: 'Termômetro Digital', unidadeMedida: 'un', qtdContratada: 100, qtdEntregue: 95, qtdReservada: 3, valorUnitario: 120.0 },
  ],
};

const movimentacoesContrato: Record<string, MovimentacaoItem[]> = {
  'CT-001': [
    { id: 'MOV-001', data: '2025-01-15', itemId: 'ITEM-001', itemDescricao: 'Arroz Tipo 1', tipo: 'entrega', numeroOF: 'OF-001/2025', quantidade: 50, saldoAnterior: 200, saldoPosterior: 150, responsavel: 'João Silva' },
    { id: 'MOV-002', data: '2025-01-20', itemId: 'ITEM-002', itemDescricao: 'Feijão Preto', tipo: 'entrega', numeroOF: 'OF-002/2025', quantidade: 30, saldoAnterior: 150, saldoPosterior: 120, responsavel: 'Maria Santos' },
    { id: 'MOV-003', data: '2025-01-25', itemId: 'ITEM-001', itemDescricao: 'Arroz Tipo 1', tipo: 'reserva', numeroOF: 'OF-003/2025', quantidade: 30, saldoAnterior: 150, saldoPosterior: 120, responsavel: 'Pedro Oliveira' },
    { id: 'MOV-004', data: '2025-02-10', itemId: 'ITEM-001', itemDescricao: 'Arroz Tipo 1', tipo: 'entrega', numeroOF: 'OF-004/2025', quantidade: 100, saldoAnterior: 150, saldoPosterior: 50, responsavel: 'Ana Costa' },
    { id: 'MOV-005', data: '2025-02-15', itemId: 'ITEM-003', itemDescricao: 'Óleo de Soja', tipo: 'entrega', numeroOF: 'OF-005/2025', quantidade: 80, saldoAnterior: 100, saldoPosterior: 20, responsavel: 'Carlos Mendes' },
    { id: 'MOV-006', data: '2025-02-20', itemId: 'ITEM-002', itemDescricao: 'Feijão Preto', tipo: 'reserva', numeroOF: 'OF-006/2025', quantidade: 20, saldoAnterior: 120, saldoPosterior: 100, responsavel: 'Fernanda Lima' },
  ],
};

const ordensFornecimento: Record<string, OrdemFornecimento[]> = {
  'CT-001': [
    {
      id: 'OF-CT001-001', numero: 'OF #001', contratoId: 'CT-001', dataRecebimento: '2025-05-10',
      numeroEmpenho: '2025NE001234', tipoEmpenho: 'global',
      itens: [
        { itemId: 'ITEM-001', descricao: 'Arroz Tipo 1', quantidade: 50, unidadeMedida: 'fardo c/ 30 kg' },
        { itemId: 'ITEM-002', descricao: 'Feijão Preto', quantidade: 30, unidadeMedida: 'fardo c/ 30 kg' },
      ],
      statusCiclo: 'pago', dataEntrega: '2025-05-18', dataLiquidacao: '2025-05-22',
      numeroNotaFiscal: '000.123.456', statusPagamento: 'pago', dataPagamento: '2025-06-18',
    },
    {
      id: 'OF-CT001-002', numero: 'OF #002', contratoId: 'CT-001', dataRecebimento: '2025-12-15',
      numeroEmpenho: '2025NE002891', tipoEmpenho: 'ordinario',
      itens: [{ itemId: 'ITEM-003', descricao: 'Óleo de Soja', quantidade: 80, unidadeMedida: 'caixa de 20 litros' }],
      statusCiclo: 'entregue', dataEntrega: '2025-12-23', dataLiquidacao: '2025-12-28',
      numeroNotaFiscal: '000.234.567', statusPagamento: 'pago', dataPagamento: '2026-01-20',
    },
    {
      id: 'OF-CT001-003', numero: 'OF #003', contratoId: 'CT-001', dataRecebimento: '2026-03-01',
      numeroEmpenho: '2026NE000445', tipoEmpenho: 'estimativo',
      itens: [{ itemId: 'ITEM-001', descricao: 'Arroz Tipo 1', quantidade: 30, unidadeMedida: 'fardo c/ 30 kg' }],
      statusCiclo: 'despachado',
    },
  ],
  'CT-002': [
    {
      id: 'OF-001', numero: 'OF #001', contratoId: 'CT-002', dataRecebimento: '2026-01-10',
      numeroEmpenho: '2026NE000142', tipoEmpenho: 'global',
      itens: [
        { itemId: 'ITEM-001', descricao: 'Notebook i7 16GB', quantidade: 10, unidadeMedida: 'un' },
        { itemId: 'ITEM-002', descricao: 'Docking Station TB4', quantidade: 10, unidadeMedida: 'un' },
      ],
      statusCiclo: 'pago', dataEntrega: '2026-01-22', dataLiquidacao: '2026-01-28',
      numeroNotaFiscal: '000.442.181', statusPagamento: 'pago', dataPagamento: '2026-02-20',
    },
    {
      id: 'OF-002', numero: 'OF #002', contratoId: 'CT-002', dataRecebimento: '2026-02-05',
      numeroEmpenho: '2026NE000201', tipoEmpenho: 'ordinario',
      itens: [{ itemId: 'ITEM-001', descricao: 'Notebook i7 16GB', quantidade: 10, unidadeMedida: 'un' }],
      statusCiclo: 'entregue', dataEntrega: '2026-02-18', dataLiquidacao: '2026-02-25',
      numeroNotaFiscal: '000.442.195', statusPagamento: 'atrasado',
    },
    {
      id: 'OF-003', numero: 'OF #003', contratoId: 'CT-002', dataRecebimento: '2026-03-10',
      numeroEmpenho: '2026NE000318', tipoEmpenho: 'estimativo',
      itens: [
        { itemId: 'ITEM-003', descricao: 'Mouse sem fio', quantidade: 10, unidadeMedida: 'un' },
        { itemId: 'ITEM-002', descricao: 'Docking Station TB4', quantidade: 5, unidadeMedida: 'un' },
      ],
      statusCiclo: 'em-separacao',
    },
  ],
};

export function ContratoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contrato = contratosDetalhados.find((c) => c.id === id);
  const [visaoItens, setVisaoItens] = useState<'consolidada' | 'extrato'>('consolidada');
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(true);
  const [dialogCriarOFAberto, setDialogCriarOFAberto] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<{ label: string; callback: () => void } | null>(null);
  const [filtroEmpenho, setFiltroEmpenho] = useState('');
  const [paginaItensContrato, setPaginaItensContrato] = useState(1);

  if (!contrato) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Contrato não encontrado</p>
            <Button onClick={() => navigate('/instrumentos/gestao')} className="mt-4">
              Voltar para gestão de contratos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calcularDiasRestantes = (vigenciaFim: string): number => {
    const hoje = new Date();
    const dataFim = new Date(vigenciaFim);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  const adicionarDiasUteis = (dataInicial: string, diasUteis: number): Date => {
    const data = new Date(dataInicial);
    let diasAdicionados = 0;
    while (diasAdicionados < diasUteis) {
      data.setDate(data.getDate() + 1);
      const diaSemana = data.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) diasAdicionados++;
    }
    return data;
  };

  const adicionarDiasCorridos = (dataInicial: string, dias: number): Date => {
    const data = new Date(dataInicial);
    data.setDate(data.getDate() + dias);
    return data;
  };

  const calcularDiasAteData = (dataFutura: Date): number => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataFutura.setHours(0, 0, 0, 0);
    return Math.ceil((dataFutura.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
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
      case 'em-execucao': return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em Execução</Badge>;
      case 'proximo-vencimento': return <Badge className="bg-[#F39C12] text-white border-[#F39C12]">Próximo ao Vencimento</Badge>;
      case 'encerrado': return <Badge className="bg-gray-500 text-white border-gray-500">Encerrado</Badge>;
      case 'renovavel': return <Badge className="bg-[#06D6A0] text-white border-[#06D6A0]">Renovável</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const diasRestantes = calcularDiasRestantes(contrato.vigenciaFim);
  const vigenciaProximaFim = diasRestantes < 90 && contrato.status !== 'encerrado';
  const percentualConsumo = ((contrato.valorGlobal - contrato.saldoAtual) / contrato.valorGlobal) * 100;
  const ordensContrato = ordensFornecimento[id || ''] || [];
  const ordensFiltradas = [...ordensContrato]
    .sort((a, b) => b.numero.localeCompare(a.numero))
    .filter((of) => !filtroEmpenho.trim() || (of.numeroEmpenho || '').toLowerCase().includes(filtroEmpenho.toLowerCase()));

  const itensPorPagina = 5;
  const itensDoContrato = itensContrato[id || ''] || [];
  const totalPaginasItens = Math.max(1, Math.ceil(itensDoContrato.length / itensPorPagina));
  const paginaAtualItens = Math.min(Math.max(1, paginaItensContrato), totalPaginasItens);
  const itensPaginados = itensDoContrato.slice((paginaAtualItens - 1) * itensPorPagina, paginaAtualItens * itensPorPagina);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Contratos' },
          { label: 'Gestão', href: '/instrumentos/gestao' },
          { label: contrato.numeroInstrumento },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/instrumentos/gestao')} className="h-9 w-9 p-0 lg:h-10 lg:w-10">
            <NavArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl lg:text-4xl">Contrato {contrato.numeroInstrumento}</h1>
              {contrato.isARP && <Badge variant="outline" className="text-xs">ARP</Badge>}
              {getStatusBadge(contrato.status)}
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">{contrato.objeto}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 h-9 lg:h-10">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {contrato.renovavel && vigenciaProximaFim && (
        <div className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#F39C12] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#F39C12] mb-1">Contrato Renovável com Vigência Próxima ao Fim</h3>
              <p className="text-sm">
                Este contrato é renovável. A vigência se encerra em <strong>{diasRestantes} dias</strong> ({formatDate(contrato.vigenciaFim)}).
                Considere entrar em contato com o órgão sobre a renovação.
              </p>
            </div>
          </div>
        </div>
      )}

      {!contrato.renovavel && vigenciaProximaFim && (
        <div className="bg-[#DD4B39]/10 border border-[#DD4B39]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#DD4B39] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#DD4B39] mb-1">Vigência Próxima ao Fim</h3>
              <p className="text-sm">
                A vigência deste contrato se encerra em <strong>{diasRestantes} dias</strong> ({formatDate(contrato.vigenciaFim)}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid principal com 4 colunas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Detalhes do Contrato</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setDetalhesExpandidos(!detalhesExpandidos)} className="h-8 w-8 p-0">
              {detalhesExpandidos ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {detalhesExpandidos && (
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:divide-x">
              {/* Informações Gerais */}
              <div className="flex-1 lg:pr-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Building className="h-4 w-4" />
                  Informações Gerais
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Órgão Contratante</p>
                    <p className="text-sm font-medium">{contrato.orgaoContratante}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Secretaria</p>
                    <p className="text-sm">{contrato.secretaria}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Nº Instrumento</p>
                    <p className="text-sm font-mono font-semibold">{contrato.numeroInstrumento}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Renovável?</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-5 rounded-full flex items-center px-0.5 ${contrato.renovavel ? 'bg-[#06D6A0]' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${contrato.renovavel ? 'translate-x-3.5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium">{contrato.renovavel ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Objeto</p>
                    <p className="text-sm">{contrato.objeto}</p>
                  </div>
                </div>
              </div>

              {/* Vigência e Valores */}
              <div className="flex-1 lg:px-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Calendar className="h-4 w-4" />
                  Vigência e Valores
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Vigência inicial</p>
                    <p className="text-sm font-mono">{formatDate(contrato.vigenciaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      Vigência final
                      {vigenciaProximaFim && <WarningTriangle className="h-3 w-3 text-[#F39C12]" />}
                    </p>
                    <p className={`text-sm font-mono font-semibold ${vigenciaProximaFim ? 'text-[#F39C12]' : ''}`}>
                      {formatDate(contrato.vigenciaFim)}
                      {vigenciaProximaFim && <span className="text-xs font-normal ml-1.5">({diasRestantes}d)</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Valor global</p>
                    <p className="text-sm font-mono font-semibold">{formatCurrency(contrato.valorGlobal)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Saldo atual</p>
                    <p className="text-sm font-mono font-semibold">{formatCurrency(contrato.saldoAtual)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">Consumo</span>
                      <span className="font-mono font-semibold">{percentualConsumo.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0050FF] to-[#4D8EFF] rounded-full transition-all duration-300"
                        style={{ width: `${percentualConsumo}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega + Documentos */}
              <div className="flex-1 lg:px-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <MapPin className="h-4 w-4" />
                  Endereço de Entrega
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Endereço</p>
                    <p className="text-sm leading-relaxed">{contrato.enderecoEntrega}</p>
                  </div>
                </div>
                <div className="pt-4 border-t mt-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Page className="h-4 w-4" />
                    Documentos
                  </h3>
                  <div className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#DD4B39]/10 flex items-center justify-center flex-shrink-0">
                        <Page className="h-4 w-4 text-[#DD4B39]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contrato Assinado</p>
                        <p className="text-xs text-muted-foreground">{contrato.numeroInstrumento}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>

              {/* Prazos Operacionais */}
              <div className="flex-1 lg:pl-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Clock className="h-4 w-4" />
                  Prazos Operacionais
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Prazo de Entrega</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-2xl font-bold text-[#0050FF]">{contrato.prazoEntrega}</p>
                      <p className="text-sm font-medium text-muted-foreground">dias úteis</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Após recebimento da OF</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Prazo de Pagamento</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="text-2xl font-bold text-[#06D6A0]">{contrato.prazoPagamento}</p>
                      <p className="text-sm font-medium text-muted-foreground">dias corridos</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Após liquidação da despesa</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Valores utilizados automaticamente no cálculo de todas as Ordens de Fornecimento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ARP de Origem */}
      {contrato.arpOrigemId && contrato.arpOrigemNumero && (
        <Card className="border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <LinkIcon className="h-5 w-5 text-[#06D6A0]" />
              ARP de Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border border-[#06D6A0]/20 rounded-lg bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#06D6A0]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ata de Registro de Preços</p>
                  <p className="text-xs text-muted-foreground">Nº {contrato.arpOrigemNumero}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/atas/detalhes/${contrato.arpOrigemId}`)}>
                Ver ARP
                <NavArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Este contrato foi originado a partir desta Ata de Registro de Preços</p>
          </CardContent>
        </Card>
      )}

      {/* Resumo Financeiro */}
      {itensContrato[id ?? ''] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <DollarCircle className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Saldo Contratado Total</p>
                <p className="text-xl font-semibold font-mono text-[#0050FF]">
                  {formatCurrency(itensContrato[id ?? ''].reduce((acc, item) => acc + item.qtdContratada * item.valorUnitario, 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Valor original de todos os itens</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Saldo Reservado</p>
                <p className="text-xl font-semibold font-mono text-[#F39C12] dark:text-orange-400">
                  {formatCurrency(itensContrato[id ?? ''].reduce((acc, item) => acc + item.qtdReservada * item.valorUnitario, 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Em OFs abertas (ainda não entregue)</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Saldo Efetivamente Disponível</p>
                <p className="text-xl font-semibold font-mono text-[#00A65A] dark:text-green-400">
                  {formatCurrency(itensContrato[id ?? ''].reduce((acc, item) => {
                    const saldo = item.qtdContratada - item.qtdEntregue - item.qtdReservada;
                    return acc + saldo * item.valorUnitario;
                  }, 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pode ser pedido em novas OFs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itens do Contrato */}
      {itensContrato[id ?? ''] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <BoxIso className="h-5 w-5" />
                  Itens do Contrato
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Controle de saldo em tempo real — Principal ferramenta operacional do sistema</p>
              </div>
              <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
                <Button
                  variant={visaoItens === 'consolidada' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => { setVisaoItens('consolidada'); setPaginaItensContrato(1); }}
                  className="gap-2 h-8"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Consolidada</span>
                </Button>
                <Button
                  variant={visaoItens === 'extrato' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => { setVisaoItens('extrato'); setPaginaItensContrato(1); }}
                  className="gap-2 h-8"
                >
                  <DatabaseStats className="h-4 w-4" />
                  <span className="hidden sm:inline">Extrato</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {visaoItens === 'consolidada' ? (
              <>
                <div className="max-h-[52vh] overflow-y-auto overflow-x-hidden">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Descrição</TableHead>
                        <TableHead className="text-xs">Unid. Med.</TableHead>
                        <TableHead className="text-right text-xs">Qtd. Contratada</TableHead>
                        <TableHead className="text-right text-xs">
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 justify-end w-full cursor-help">
                              <span className="text-xs">Qtd. Entregue</span>
                              <InfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Calculado automaticamente: soma das OFs com status "Entregue"</TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="text-right text-xs">
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 justify-end w-full cursor-help">
                              <span className="text-xs">Qtd. Reservada</span>
                              <InfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Quantidade em OFs abertas — ainda não debitada do saldo</TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="text-right text-xs">
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 justify-end w-full cursor-help">
                              <span className="text-xs">Saldo Disponível</span>
                              <InfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Qtd. Contratada − Qtd. Entregue − Qtd. Reservada</TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="text-right text-xs">Valor Unitário</TableHead>
                        <TableHead className="text-right text-xs">
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 justify-end w-full cursor-help">
                              <span className="text-xs">Valor do Saldo</span>
                              <InfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>Saldo Disponível × Valor Unitário</TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="w-32 text-xs">Consumo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensPaginados.map((item) => {
                        const saldoDisponivel = item.qtdContratada - item.qtdEntregue - item.qtdReservada;
                        const valorSaldo = saldoDisponivel * item.valorUnitario;
                        const percentualConsumido = ((item.qtdEntregue + item.qtdReservada) / item.qtdContratada) * 100;
                        const saldoEsgotado = saldoDisponivel === 0;
                        let progressBarColor = '#00A65A';
                        if (percentualConsumido >= 95) progressBarColor = '#DD4B39';
                        else if (percentualConsumido >= 80) progressBarColor = '#F39C12';
                        return (
                          <TableRow key={item.id} className={`${saldoEsgotado ? 'bg-red-50/50 dark:bg-red-950/20' : 'dark:hover:bg-slate-800/50'} transition-colors`}>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-medium break-words">{item.descricao}</span>
                                {saldoEsgotado && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <WarningTriangle className="h-4 w-4 text-[#DD4B39]" />
                                    </TooltipTrigger>
                                    <TooltipContent>Saldo esgotado — novas OFs para este item serão bloqueadas</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm break-words">{item.unidadeMedida}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums">{item.qtdContratada}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums bg-accent/30 dark:bg-slate-700/40">{item.qtdEntregue}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums bg-accent/30 dark:bg-slate-700/40">{item.qtdReservada}</TableCell>
                            <TableCell className={`text-right font-mono tabular-nums font-semibold bg-accent/30 dark:bg-slate-700/40 ${saldoEsgotado ? 'text-[#DD4B39]' : ''}`}>
                              {saldoDisponivel}
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-sm">{formatCurrency(item.valorUnitario)}</TableCell>
                            <TableCell className={`text-right font-mono tabular-nums font-semibold bg-accent/30 dark:bg-slate-700/40 ${saldoEsgotado ? 'text-[#DD4B39]' : ''}`}>
                              {formatCurrency(valorSaldo)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Consumido</span>
                                  <span className="font-mono font-semibold">{percentualConsumido.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${percentualConsumido}%`, backgroundColor: progressBarColor }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Exibindo {itensPaginados.length} de {itensDoContrato.length} itens</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" disabled={paginaAtualItens <= 1} onClick={() => setPaginaItensContrato(paginaAtualItens - 1)}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">{paginaAtualItens} / {totalPaginasItens}</span>
                    <Button size="sm" variant="ghost" disabled={paginaAtualItens >= totalPaginasItens} onClick={() => setPaginaItensContrato(paginaAtualItens + 1)}>Próxima</Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28 text-xs">Data</TableHead>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="w-32 text-xs">Nº OF</TableHead>
                        <TableHead className="w-28 text-xs">Operação</TableHead>
                        <TableHead className="w-24 text-right text-xs">Quantidade</TableHead>
                        <TableHead className="w-28 text-right text-xs">Saldo Anterior</TableHead>
                        <TableHead className="w-28 text-right text-xs">Saldo Posterior</TableHead>
                        <TableHead className="text-xs">Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoesContrato[id ?? ''] ? (
                        movimentacoesContrato[id ?? '']
                          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                          .map((mov) => {
                            const getTipoBadge = (tipo: string) => {
                              switch (tipo) {
                                case 'entrega': return <Badge className="bg-[#06D6A0] text-white border-[#06D6A0] text-xs">Entrega</Badge>;
                                case 'reserva': return <Badge className="bg-[#F39C12] text-white border-[#F39C12] text-xs">Reserva</Badge>;
                                case 'cancelamento': return <Badge className="bg-gray-500 text-white border-gray-500 text-xs">Cancelamento</Badge>;
                                default: return <Badge variant="outline" className="text-xs">{tipo}</Badge>;
                              }
                            };
                            return (
                              <TableRow key={mov.id}>
                                <TableCell className="font-mono text-sm">{formatDate(mov.data)}</TableCell>
                                <TableCell className="font-medium">{mov.itemDescricao}</TableCell>
                                <TableCell className="font-mono text-sm">{mov.numeroOF}</TableCell>
                                <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                                <TableCell className="text-right font-mono tabular-nums font-semibold">
                                  {mov.tipo === 'cancelamento' ? '+' : '-'}{mov.quantidade}
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums bg-accent/30">{mov.saldoAnterior}</TableCell>
                                <TableCell className="text-right font-mono tabular-nums bg-accent/30 font-semibold">{mov.saldoPosterior}</TableCell>
                                <TableCell className="text-sm">{mov.responsavel}</TableCell>
                              </TableRow>
                            );
                          })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            Nenhuma movimentação registrada para este contrato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {movimentacoesContrato[id ?? ''] && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <InfoCircle className="h-4 w-4 text-[#0050FF]" />
                      <p className="text-sm font-semibold text-[#0050FF]">Sobre o Extrato</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O extrato mostra todas as movimentações dos itens do contrato em ordem cronológica reversa.
                      <strong className="text-foreground"> Entregas</strong> debitam o saldo imediatamente,
                      <strong className="text-foreground"> Reservas</strong> bloqueiam temporariamente o saldo (OF aberta), e
                      <strong className="text-foreground"> Cancelamentos</strong> devolvem quantidade ao saldo disponível.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ordens de Fornecimento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <DeliveryTruck className="h-5 w-5" />
                Ordens de Fornecimento
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Histórico e gestão das OFs vinculadas ao contrato</p>
            </div>
            {contrato.status !== 'encerrado' && (
              <Button onClick={() => setDialogCriarOFAberto(true)} className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Nova OF
              </Button>
            )}
          </div>
        </CardHeader>
        {ordensFornecimento[id ?? ''] && ordensFornecimento[id ?? ''].length > 0 ? (
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-md space-y-1.5">
                <Input
                  placeholder="Filtrar por número do empenho (ex: 2026NE000201)"
                  value={filtroEmpenho}
                  onChange={(e) => setFiltroEmpenho(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Exibindo {ordensFiltradas.length} de {ordensContrato.length} OFs</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button size="sm" variant="ghost" onClick={() => setFiltroEmpenho('')}>Limpar</Button>
              </div>
            </div>
            {ordensFiltradas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma OF encontrada para o empenho informado.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {ordensFiltradas.map((of) => {
                  const prazoFinalEntrega = adicionarDiasUteis(of.dataRecebimento, contrato.prazoEntrega);
                  const diasAtePrazoEntrega = calcularDiasAteData(prazoFinalEntrega);
                  const prazoFinalPagamento = of.dataLiquidacao ? adicionarDiasCorridos(of.dataLiquidacao, contrato.prazoPagamento) : null;
                  const diasAtePrazoPagamento = prazoFinalPagamento ? calcularDiasAteData(prazoFinalPagamento) : null;

                  let indicadorPrazo: { cor: string; texto: string; badge: string } | null = null;
                  if (of.statusCiclo !== 'entregue' && of.statusCiclo !== 'pago') {
                    if (diasAtePrazoEntrega > 5) indicadorPrazo = { cor: '#00A65A', texto: 'Dentro do prazo', badge: 'bg-[#00A65A]' };
                    else if (diasAtePrazoEntrega >= 0) indicadorPrazo = { cor: '#F39C12', texto: 'Prazo se encerrando', badge: 'bg-[#F39C12]' };
                    else indicadorPrazo = { cor: '#DD4B39', texto: 'Prazo vencido', badge: 'bg-[#DD4B39]' };
                  }

                  const pagamentoAtrasado = of.statusPagamento === 'atrasado' ||
                    (of.statusCiclo === 'entregue' && diasAtePrazoPagamento !== null && diasAtePrazoPagamento < 0 && !of.dataPagamento);

                  const estagios: Array<{ key: StatusCicloOF; label: string; icon: React.ReactNode; concluido: boolean }> = [
                    { key: 'pedido-recebido', label: 'Pedido Recebido', icon: <Mail className="h-4 w-4" />, concluido: true },
                    { key: 'em-separacao', label: 'Em Separação', icon: <BoxIso className="h-4 w-4" />, concluido: ['em-separacao', 'despachado', 'entregue', 'pago'].includes(of.statusCiclo) },
                    { key: 'despachado', label: 'Despachado', icon: <Truck className="h-4 w-4" />, concluido: ['despachado', 'entregue', 'pago'].includes(of.statusCiclo) },
                    { key: 'entregue', label: 'Entregue', icon: <Check className="h-4 w-4" />, concluido: ['entregue', 'pago'].includes(of.statusCiclo) },
                    { key: 'pago', label: 'Pago', icon: <DollarCircle className="h-4 w-4" />, concluido: of.statusCiclo === 'pago' },
                  ];

                  const estagioAtual = estagios.findIndex((e) => e.key === of.statusCiclo);
                  const proximoEstagio = estagios[estagioAtual + 1];

                  let acaoContextual: { label: string; onClick: () => void } | null = null;
                  if (proximoEstagio) {
                    const acoes: Record<string, string> = {
                      'em-separacao': 'Iniciar Separação',
                      'despachado': 'Registrar Despacho',
                      'entregue': 'Confirmar Entrega',
                      'pago': 'Confirmar Pagamento',
                    };
                    acaoContextual = {
                      label: acoes[proximoEstagio.key] || 'Avançar',
                      onClick: () => {
                        setAcaoPendente({ label: acoes[proximoEstagio.key] || 'Avançar', callback: () => alert(`Ação: ${acoes[proximoEstagio.key]}`) });
                        setConfirmacaoAberta(true);
                      },
                    };
                  }

                  return (
                    <AccordionItem key={of.id} value={of.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between gap-4 w-full pr-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base font-bold">{of.numero}</h3>
                            <Badge variant="outline" className="border-[#0050FF] text-[#0050FF] text-xs">
                              {estagios.find(e => e.key === of.statusCiclo)?.label || of.statusCiclo}
                            </Badge>
                            {pagamentoAtrasado && <Badge className="bg-[#DD4B39] text-white border-[#DD4B39]">Pagamento Atrasado</Badge>}
                            {indicadorPrazo && <Badge className={`${indicadorPrazo.badge} text-white border-none text-xs`}>{indicadorPrazo.texto}</Badge>}
                            <span className="text-xs text-muted-foreground font-normal">{formatDate(of.dataRecebimento)}</span>
                          </div>
                          {acaoContextual && (
                            <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); acaoContextual!.onClick(); }} className="flex-shrink-0">
                              {acaoContextual.label}
                            </Button>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Data de Recebimento</p>
                            <p className="text-sm font-mono">{formatDate(of.dataRecebimento)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Número do Empenho</p>
                            <p className="text-sm font-mono font-semibold">{of.numeroEmpenho}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo do Empenho</p>
                            <p className="text-sm font-medium">{formatarTipoEmpenho(of.tipoEmpenho)}</p>
                          </div>
                        </div>
                        <div className="bg-accent/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Itens Solicitados</p>
                          <div className="flex flex-wrap gap-2">
                            {of.itens.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item.descricao} × {item.quantidade} {item.unidadeMedida}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold">Ciclo de Vida</p>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                O saldo dos itens só é debitado definitivamente quando o status atinge "Entregue".
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            {estagios.map((estagio, idx) => (
                              <div key={estagio.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${estagio.concluido ? 'bg-[#0050FF] text-white' : 'bg-accent text-muted-foreground'}`}>
                                    {estagio.icon}
                                  </div>
                                  <p className={`text-[10px] mt-1.5 text-center ${estagio.concluido ? 'font-semibold' : 'text-muted-foreground'}`}>
                                    {estagio.label}
                                  </p>
                                </div>
                                {idx < estagios.length - 1 && (
                                  <div className={`h-0.5 flex-1 -mx-2 ${estagio.concluido ? 'bg-[#0050FF]' : 'bg-accent'}`} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        {indicadorPrazo && (
                          <div className="rounded-lg p-3 border-2" style={{ borderColor: indicadorPrazo.cor, backgroundColor: `${indicadorPrazo.cor}15` }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Prazo Final de Entrega</p>
                                <p className="text-sm font-mono font-semibold">{formatDate(prazoFinalEntrega)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Data de Recebimento + {contrato.prazoEntrega} dias úteis</p>
                              </div>
                              <Badge className={`${indicadorPrazo.badge} text-white border-none`}>
                                {indicadorPrazo.texto}{diasAtePrazoEntrega >= 0 && ` (${diasAtePrazoEntrega}d)`}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {(of.statusCiclo === 'entregue' || of.statusCiclo === 'pago') && (
                          <div className="border-t pt-4 space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <DollarCircle className="h-4 w-4" />
                              Dados Financeiros
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Data de Entrega Efetiva</p>
                                <p className="text-sm font-mono">{of.dataEntrega ? formatDate(of.dataEntrega) : '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Data de Liquidação</p>
                                <p className="text-sm font-mono">{of.dataLiquidacao ? formatDate(of.dataLiquidacao) : '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Número da NF-e</p>
                                <p className="text-sm font-mono font-semibold">{of.numeroNotaFiscal || '—'}</p>
                              </div>
                              {prazoFinalPagamento && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Prazo Final de Pagamento</p>
                                  <p className={`text-sm font-mono font-semibold ${pagamentoAtrasado ? 'text-[#DD4B39]' : ''}`}>{formatDate(prazoFinalPagamento)}</p>
                                  <p className="text-xs text-muted-foreground mt-1">Data de Liquidação + {contrato.prazoPagamento} dias corridos</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Status de Pagamento</p>
                                {pagamentoAtrasado ? (
                                  <Badge className="bg-[#DD4B39] text-white border-[#DD4B39]">Atrasado</Badge>
                                ) : of.statusPagamento === 'pago' ? (
                                  <Badge className="bg-[#06D6A0] text-white border-[#06D6A0]">Pago</Badge>
                                ) : of.statusPagamento === 'em-processamento' ? (
                                  <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em Processamento</Badge>
                                ) : (
                                  <Badge variant="outline">Aguardando Liquidação</Badge>
                                )}
                              </div>
                              {of.dataPagamento && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Data de Pagamento Efetivo</p>
                                  <p className="text-sm font-mono font-semibold text-[#06D6A0]">{formatDate(of.dataPagamento)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <DeliveryTruck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma ordem de fornecimento criada ainda.</p>
              <p className="text-sm mt-1">Clique em "Nova OF" para começar.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <CriarOrdemFornecimento
        open={dialogCriarOFAberto}
        onOpenChange={setDialogCriarOFAberto}
        contratoId={id ?? ''}
        itensContrato={itensContrato[id ?? ''] ?? []}
        prazoEntrega={contrato.prazoEntrega}
        onSubmit={(data) => {
          console.log('Nova OF criada:', data);
          setDialogCriarOFAberto(false);
        }}
      />

      <Dialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja realizar a ação: <strong>{acaoPendente?.label}</strong>?
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
