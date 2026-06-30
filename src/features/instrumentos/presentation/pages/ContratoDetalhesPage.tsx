import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CriarOrdemFornecimento } from '../components/CriarOrdemFornecimento';
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
  DollarCircle,
  Link as LinkIcon,
  BoxIso,
  DeliveryTruck,
  NavArrowDown,
  NavArrowUp,
  Plus,
  Truck,
  Check,
  Mail,
  InfoCircle,
} from 'iconoir-react';
import { useBuscarInstrumento } from '../hooks/useBuscarInstrumento';
import { useListarOrdensFornecimento } from '../hooks/useListarOrdensFornecimento';
import { useIniciarSeparacaoOrdemFornecimento } from '../hooks/useIniciarSeparacaoOrdemFornecimento';
import { useRegistrarDespachoOrdemFornecimento } from '../hooks/useRegistrarDespachoOrdemFornecimento';
import { useConfirmarEntregaOrdemFornecimento } from '../hooks/useConfirmarEntregaOrdemFornecimento';
import { useRegistrarPagamentoOrdemFornecimento } from '../hooks/useRegistrarPagamentoOrdemFornecimento';
import type { StatusInstrumento, StatusOrdemFornecimento, StatusPagamento, TipoPrazo } from '../../domain/entities/instrumentoContratual';

const CICLO_ORDER: StatusOrdemFornecimento[] = [
  'pedido_recebido',
  'em_separacao',
  'despachado',
  'entregue',
  'pago',
];

const CICLO_LABELS: Record<StatusOrdemFornecimento, string> = {
  pedido_recebido: 'Pedido Recebido',
  em_separacao: 'Em Separação',
  despachado: 'Despachado',
  entregue: 'Entregue',
  pago: 'Pago',
};

function getAcaoTransicaoLabel(status: StatusOrdemFornecimento): string | null {
  const labels: Partial<Record<StatusOrdemFornecimento, string>> = {
    pedido_recebido: 'Iniciar Separação',
    em_separacao: 'Registrar Despacho',
    despachado: 'Confirmar Entrega',
  };
  return labels[status] ?? null;
}

function calcularPrazoFinalEntrega(
  dataRecebimento: string,
  prazo: number,
  tipoPrazo: TipoPrazo | null,
): Date {
  const data = new Date(`${dataRecebimento}T00:00:00`);
  if (tipoPrazo === 'UTEIS') {
    let adicionados = 0;
    while (adicionados < prazo) {
      data.setDate(data.getDate() + 1);
      const dia = data.getDay();
      if (dia !== 0 && dia !== 6) adicionados++;
    }
  } else {
    data.setDate(data.getDate() + prazo);
  }
  return data;
}

function calcularIndicadorPrazo(
  dataRecebimento: string,
  prazoEntrega: number,
  tipoPrazo: TipoPrazo | null,
): { cor: string; texto: string; diasRestantes: number } {
  const prazoFinal = calcularPrazoFinalEntrega(dataRecebimento, prazoEntrega, tipoPrazo);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  prazoFinal.setHours(0, 0, 0, 0);
  const dias = Math.ceil((prazoFinal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (dias > 5) return { cor: '#00A65A', texto: 'Dentro do prazo', diasRestantes: dias };
  if (dias >= 0) return { cor: '#F39C12', texto: 'Prazo se encerrando', diasRestantes: dias };
  return { cor: '#DD4B39', texto: 'Prazo vencido', diasRestantes: dias };
}

function formatDateObj(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const calcularDiasRestantes = (vigenciaFim: string): number => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataFim = new Date(`${vigenciaFim}T00:00:00`);
  return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
};

function getStatusBadge(status: StatusInstrumento) {
  switch (status) {
    case 'ATIVA':
      return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em Execução</Badge>;
    case 'PROXIMA_AO_VENCIMENTO':
      return <Badge className="bg-[#F39C12] text-white border-[#F39C12]">Próximo ao Vencimento</Badge>;
    case 'ENCERRADA':
      return <Badge className="bg-gray-500 text-white border-gray-500">Encerrado</Badge>;
  }
}

function getStatusPagamentoBadge(status: NonNullable<StatusPagamento>) {
  const config: Record<NonNullable<StatusPagamento>, { label: string; className: string }> = {
    pendente: { label: 'Pag. Pendente', className: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    em_atraso: { label: 'Pag. em Atraso', className: 'text-red-700 bg-red-50 border-red-200' },
    pago: { label: 'Pago', className: 'text-purple-700 bg-purple-50 border-purple-200' },
  };
  const { label, className } = config[status];
  return <Badge className={`text-xs border ${className}`}>{label}</Badge>;
}

const formatTipoPrazo = (tipo: 'UTEIS' | 'CORRIDOS' | null) => {
  if (!tipo) return '';
  return tipo === 'UTEIS' ? 'dias úteis' : 'dias corridos';
};

export function ContratoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { instrumento, isLoading, error, refetch } = useBuscarInstrumento(id ?? '');
  const { dados: ordensData, isLoading: isLoadingOrdens, refetch: refetchOrdens } = useListarOrdensFornecimento(id ?? '');
  const { iniciar, isLoading: isSeparacaoLoading, error: separacaoError } = useIniciarSeparacaoOrdemFornecimento();
  const { registrar: registrarDespacho, isLoading: isDespachoLoading, error: despachoError } = useRegistrarDespachoOrdemFornecimento();
  const { confirmar, isLoading: isEntregaLoading, error: entregaError } = useConfirmarEntregaOrdemFornecimento();
  const { registrar: registrarPagamento, isLoading: isRegistrarPagamentoLoading, error: registrarPagamentoError } = useRegistrarPagamentoOrdemFornecimento();

  const [detalhesExpandidos, setDetalhesExpandidos] = useState(true);
  const [paginaItens, setPaginaItens] = useState(1);
  const [emitirOFOpen, setEmitirOFOpen] = useState(false);
  const [openOfs, setOpenOfs] = useState<string[]>([]);

  const [separacaoOpenId, setSeparacaoOpenId] = useState<string | null>(null);
  const [separacaoForm, setSeparacaoForm] = useState({ dataSeparacao: '' });

  const [despachoOpenId, setDespachoOpenId] = useState<string | null>(null);
  const [despachoForm, setDespachoForm] = useState({ dataDespacho: '', codigoRastreio: '', numeroNf: '' });

  const [entregaOpenId, setEntregaOpenId] = useState<string | null>(null);
  const [entregaForm, setEntregaForm] = useState({ dataEntrega: '', prazoPagamento: '' });

  const [pagamentoOpenId, setPagamentoOpenId] = useState<string | null>(null);
  const [pagamentoForm, setPagamentoForm] = useState({ dataPagamentoEfetivo: '' });

  function expandirEAbrirFormulario(ofId: string, abrirFormulario: () => void) {
    setOpenOfs((prev) => (prev.includes(ofId) ? prev : [...prev, ofId]));
    abrirFormulario();
  }

  function fecharTodosFormularios() {
    setSeparacaoOpenId(null);
    setDespachoOpenId(null);
    setEntregaOpenId(null);
    setPagamentoOpenId(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-accent animate-pulse rounded" />
        <div className="h-64 bg-accent animate-pulse rounded-lg" />
        <div className="h-48 bg-accent animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !instrumento || instrumento.tipo !== 'CONTRATO') {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">
              {error ?? 'Contrato não encontrado.'}
            </p>
            {error && (
              <Button variant="outline" onClick={refetch} className="mr-2">
                Tentar novamente
              </Button>
            )}
            <Button onClick={() => navigate('/instrumentos/gestao')} className="mt-2">
              Voltar para gestão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { contrato, itens, ataId } = instrumento;
  const diasRestantes = calcularDiasRestantes(contrato.vigenciaFinal);
  const vigenciaProximaFim = contrato.status === 'PROXIMA_AO_VENCIMENTO';
  const valorTotal = itens.reduce((s, i) => s + i.valorTotal, 0);

  const cicloEstagios = [
    { key: 'pedido_recebido' as StatusOrdemFornecimento, label: 'Pedido Recebido', icon: <Mail className="h-4 w-4" /> },
    { key: 'em_separacao' as StatusOrdemFornecimento, label: 'Em Separação', icon: <BoxIso className="h-4 w-4" /> },
    { key: 'despachado' as StatusOrdemFornecimento, label: 'Despachado', icon: <Truck className="h-4 w-4" /> },
    { key: 'entregue' as StatusOrdemFornecimento, label: 'Entregue', icon: <Check className="h-4 w-4" /> },
    { key: 'pago' as StatusOrdemFornecimento, label: 'Pago', icon: <DollarCircle className="h-4 w-4" /> },
  ];

  const itensPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(itens.length / itensPorPagina));
  const paginaAtual = Math.min(Math.max(1, paginaItens), totalPaginas);
  const itensPaginados = itens.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Contratos' },
          { label: 'Gestão', href: '/instrumentos/gestao' },
          { label: contrato.numero },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/instrumentos/gestao')}
            className="h-9 w-9 p-0 lg:h-10 lg:w-10"
          >
            <NavArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl lg:text-4xl">Contrato {contrato.numero}</h1>
              {ataId !== null && <Badge variant="outline" className="text-xs">ARP</Badge>}
              {getStatusBadge(contrato.status)}
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">{contrato.objeto}</p>
          </div>
        </div>
        {contrato.anexoUrl && (
          <Button variant="outline" className="gap-2 h-9 lg:h-10" asChild>
            <a href={contrato.anexoUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Baixar Contrato
            </a>
          </Button>
        )}
      </div>

      {/* Alerta de vigência */}
      {vigenciaProximaFim && contrato.renovavel && (
        <div className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#F39C12] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#F39C12] mb-1">
                Contrato Renovável com Vigência Próxima ao Fim
              </h3>
              <p className="text-sm">
                A vigência se encerra em <strong>{diasRestantes} dias</strong> ({formatDate(contrato.vigenciaFinal)}).
                Considere contato com o órgão sobre a renovação.
              </p>
            </div>
          </div>
        </div>
      )}

      {vigenciaProximaFim && !contrato.renovavel && (
        <div className="bg-[#DD4B39]/10 border border-[#DD4B39]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#DD4B39] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#DD4B39] mb-1">Vigência Próxima ao Fim</h3>
              <p className="text-sm">
                A vigência deste contrato se encerra em{' '}
                <strong>{diasRestantes} dias</strong> ({formatDate(contrato.vigenciaFinal)}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes principais */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Detalhes do Contrato</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetalhesExpandidos(!detalhesExpandidos)}
              className="h-8 w-8 p-0"
            >
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
                    <p className="text-xs font-medium text-muted-foreground mb-1">Unidade</p>
                    <p className="text-sm">{contrato.unidade}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Nº Instrumento</p>
                    <p className="text-sm font-mono font-semibold">{contrato.numero}</p>
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
                  {contrato.numeroPncp && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Nº PNCP</p>
                      <p className="text-sm font-mono">{contrato.numeroPncp}</p>
                    </div>
                  )}
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
                    <p className="text-sm font-mono">{formatDate(contrato.vigenciaInicial)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      Vigência final
                      {vigenciaProximaFim && <WarningTriangle className="h-3 w-3 text-[#F39C12]" />}
                    </p>
                    <p className={`text-sm font-mono font-semibold ${vigenciaProximaFim ? 'text-[#F39C12]' : ''}`}>
                      {formatDate(contrato.vigenciaFinal)}
                      {vigenciaProximaFim && (
                        <span className="text-xs font-normal ml-1.5">({diasRestantes}d)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Valor total dos itens</p>
                    <p className="text-sm font-mono font-semibold">{formatCurrency(valorTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Endereço e Documentos */}
              <div className="flex-1 lg:px-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <MapPin className="h-4 w-4" />
                  Endereços
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Endereço do contratante</p>
                    <p className="text-sm leading-relaxed">{contrato.endereco ?? 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Endereço de entrega</p>
                    <p className="text-sm leading-relaxed">{contrato.enderecoEntrega ?? 'Não informado'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Page className="h-4 w-4" />
                    Documentos
                  </h3>
                  <div className="space-y-2">
                    {contrato.anexoUrl ? (
                      <a
                        href={contrato.anexoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-[#DD4B39]/10 flex items-center justify-center flex-shrink-0">
                            <Page className="h-4 w-4 text-[#DD4B39]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Contrato Assinado</p>
                            <p className="text-xs text-muted-foreground">{contrato.numero}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" tabIndex={-1}>
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </a>
                    ) : null}

                    {ataId !== null && (
                      <button
                        onClick={() => navigate(`/atas/detalhes/${ataId}`)}
                        className="w-full flex items-center justify-between py-2 px-0 hover:opacity-80 transition-opacity text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#06D6A0] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Ata de Registro de Preços</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{ataId}</p>
                          </div>
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                      </button>
                    )}

                    {!contrato.anexoUrl && ataId === null && (
                      <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prazos */}
              <div className="flex-1 lg:pl-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Clock className="h-4 w-4" />
                  Prazos Operacionais
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Prazo de Entrega</p>
                    {contrato.prazoEntrega !== null ? (
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-2xl font-bold text-[#0050FF]">{contrato.prazoEntrega}</p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {formatTipoPrazo(contrato.tipoPrazoEntrega)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Não informado</p>
                    )}
                    <p className="text-xs text-muted-foreground">Após recebimento da OF</p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Prazo de Pagamento</p>
                    {contrato.prazoPagamento !== null ? (
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className="text-2xl font-bold text-[#06D6A0]">{contrato.prazoPagamento}</p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {formatTipoPrazo(contrato.tipoPrazoPagamento)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Não informado</p>
                    )}
                    <p className="text-xs text-muted-foreground">Após liquidação da despesa</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Resumo Financeiro */}
      {itens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <DollarCircle className="h-5 w-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Valor Total dos Itens</p>
                <p className="text-xl font-semibold font-mono text-[#0050FF]">{formatCurrency(valorTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">Soma dos valores totais de todos os itens</p>
              </div>
              <div className="bg-accent/30 border rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Total de Itens</p>
                <p className="text-xl font-semibold font-mono">{itens.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Itens registrados no contrato</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Itens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <BoxIso className="h-5 w-5" />
            Itens do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BoxIso className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item registrado.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Descrição</TableHead>
                      <TableHead className="text-xs">Unid. Med.</TableHead>
                      <TableHead className="text-right text-xs">Qtd. Total</TableHead>
                      <TableHead className="text-right text-xs">Valor Unitário</TableHead>
                      <TableHead className="text-right text-xs">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensPaginados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-mono text-sm">{item.unidadeMedida}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{item.quantidadeTotal}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-sm">
                          {formatCurrency(item.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Exibindo {itensPaginados.length} de {itens.length} itens
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={paginaAtual <= 1}
                      onClick={() => setPaginaItens(paginaAtual - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">{paginaAtual} / {totalPaginas}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={paginaAtual >= totalPaginas}
                      onClick={() => setPaginaItens(paginaAtual + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ordens de Fornecimento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <DeliveryTruck className="h-5 w-5" />
                Ordens de Fornecimento
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Histórico e gestão das OFs vinculadas ao contrato
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setEmitirOFOpen(true)}
              disabled={itens.length === 0}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nova OF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingOrdens && (
            <div className="space-y-2">
              <div className="h-14 bg-accent animate-pulse rounded-lg" />
              <div className="h-14 bg-accent animate-pulse rounded-lg" />
            </div>
          )}

          {!isLoadingOrdens && (!ordensData || ordensData.ordensFornecimento.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <DeliveryTruck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Nenhuma ordem de fornecimento</p>
              <p className="text-xs">Emita a primeira OF usando o botão acima.</p>
            </div>
          )}

          {!isLoadingOrdens && ordensData && ordensData.ordensFornecimento.length > 0 && (
            <Accordion type="multiple" value={openOfs} onValueChange={setOpenOfs} className="space-y-2">
              {ordensData.ordensFornecimento.map((of) => {
                const acaoLabel = getAcaoTransicaoLabel(of.status);
                const showPagamento = of.status === 'entregue' && !of.dataPagamentoEfetivo;
                const indicadorPrazo =
                  of.status !== 'entregue' &&
                  of.status !== 'pago' &&
                  contrato.prazoEntrega !== null
                    ? calcularIndicadorPrazo(
                        of.dataRecebimento,
                        contrato.prazoEntrega,
                        contrato.tipoPrazoEntrega,
                      )
                    : null;
                const prazoFinalEntrega =
                  indicadorPrazo !== null && contrato.prazoEntrega !== null
                    ? calcularPrazoFinalEntrega(
                        of.dataRecebimento,
                        contrato.prazoEntrega,
                        contrato.tipoPrazoEntrega,
                      )
                    : null;

                return (
                  <AccordionItem
                    key={of.id}
                    value={of.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between w-full gap-3 pr-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm font-bold">OF #{of.codigo}</span>
                          <Badge className="border text-xs border-[#0050FF] text-[#0050FF] bg-transparent">
                            {CICLO_LABELS[of.status]}
                          </Badge>
                          {of.statusPagamento === 'em_atraso' && (
                            <Badge className="bg-[#DD4B39] text-white border-[#DD4B39] text-xs">
                              Pagamento Atrasado
                            </Badge>
                          )}
                          {indicadorPrazo && (
                            <Badge
                              className="text-white border-none text-xs"
                              style={{ backgroundColor: indicadorPrazo.cor }}
                            >
                              {indicadorPrazo.texto}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground font-normal">
                            {formatDate(of.dataRecebimento)}
                          </span>
                        </div>
                        {acaoLabel && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-shrink-0 text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              fecharTodosFormularios();
                              if (of.status === 'pedido_recebido') {
                                expandirEAbrirFormulario(of.id, () => {
                                  setSeparacaoForm({ dataSeparacao: '' });
                                  setSeparacaoOpenId(of.id);
                                });
                              } else if (of.status === 'em_separacao') {
                                expandirEAbrirFormulario(of.id, () => {
                                  setDespachoForm({ dataDespacho: '', codigoRastreio: '', numeroNf: '' });
                                  setDespachoOpenId(of.id);
                                });
                              } else if (of.status === 'despachado') {
                                expandirEAbrirFormulario(of.id, () => {
                                  const hoje = new Date().toISOString().split('T')[0] ?? '';
                                  const prazoPag = contrato.prazoPagamento
                                    ? calcularPrazoFinalEntrega(hoje, contrato.prazoPagamento, contrato.tipoPrazoPagamento).toISOString().split('T')[0] ?? ''
                                    : '';
                                  setEntregaForm({ dataEntrega: hoje, prazoPagamento: prazoPag });
                                  setEntregaOpenId(of.id);
                                });
                              }
                            }}
                          >
                            {acaoLabel}
                          </Button>
                        )}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="border-t px-4 pb-4 pt-3 space-y-4">
                      {/* 1. Informações básicas */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Data de Recebimento</p>
                          <p className="text-sm font-mono">{formatDate(of.dataRecebimento)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Prazo de Entrega</p>
                          <p className="text-sm font-mono">{formatDate(of.prazoEntrega)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                          <p className="text-sm font-semibold font-mono">
                            {formatCurrency(of.valorTotal)}
                          </p>
                        </div>
                      </div>

                      {/* 2. Itens Solicitados */}
                      {of.itens.length > 0 && (
                        <div className="bg-accent/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Itens Solicitados
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {of.itens.map((item) => (
                              <Badge key={item.id} variant="outline" className="text-xs">
                                {item.descricao} × {item.quantidadeFornecida} {item.unidadeMedida}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Ciclo de Vida */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Ciclo de Vida</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              O saldo dos itens só é debitado definitivamente quando o status
                              atinge "Entregue". Antes disso, as quantidades ficam como
                              "Reservadas".
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex items-center">
                          {cicloEstagios.map((estagio, idx) => {
                            const concluido =
                              CICLO_ORDER.indexOf(of.status) >=
                              CICLO_ORDER.indexOf(estagio.key);
                            return (
                              <div key={estagio.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      concluido
                                        ? 'bg-[#0050FF] text-white'
                                        : 'bg-accent text-muted-foreground'
                                    }`}
                                  >
                                    {estagio.icon}
                                  </div>
                                  <p
                                    className={`text-[10px] mt-1.5 text-center ${
                                      concluido ? 'font-semibold' : 'text-muted-foreground'
                                    }`}
                                  >
                                    {estagio.label}
                                  </p>
                                </div>
                                {idx < cicloEstagios.length - 1 && (
                                  <div
                                    className={`h-0.5 flex-1 -mx-2 ${
                                      concluido ? 'bg-[#0050FF]' : 'bg-accent'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Prazo final de entrega */}
                      {prazoFinalEntrega && indicadorPrazo && (
                        <div
                          className="rounded-lg p-3 border-2"
                          style={{
                            borderColor: indicadorPrazo.cor,
                            backgroundColor: `${indicadorPrazo.cor}26`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Prazo Final de Entrega
                              </p>
                              <p className="text-sm font-mono font-semibold">
                                {formatDateObj(prazoFinalEntrega)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Data de Recebimento + {contrato.prazoEntrega}{' '}
                                {formatTipoPrazo(contrato.tipoPrazoEntrega)}
                              </p>
                            </div>
                            <Badge
                              className="text-white border-none"
                              style={{ backgroundColor: indicadorPrazo.cor }}
                            >
                              {indicadorPrazo.texto}
                              {indicadorPrazo.diasRestantes >= 0
                                ? ` (${indicadorPrazo.diasRestantes}d)`
                                : ''}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* 4. Dados Financeiros */}
                      {(of.status === 'entregue' || of.status === 'pago') && (
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <DollarCircle className="h-4 w-4" />
                            Dados Financeiros
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Data de Entrega Efetiva
                              </p>
                              <p className="text-sm font-mono">
                                {of.dataEntrega ? formatDate(of.dataEntrega) : '—'}
                              </p>
                            </div>
                            {of.prazoPagamento && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Prazo Final de Pagamento
                                </p>
                                <p
                                  className={`text-sm font-mono font-semibold ${
                                    of.statusPagamento === 'em_atraso' ? 'text-[#DD4B39]' : ''
                                  }`}
                                >
                                  {formatDate(of.prazoPagamento)}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Status de Pagamento
                              </p>
                              {of.statusPagamento ? (
                                getStatusPagamentoBadge(of.statusPagamento)
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </div>
                            {of.dataPagamentoEfetivo && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Data de Pagamento Efetivo
                                </p>
                                <p className="text-sm font-mono font-semibold text-[#06D6A0]">
                                  {formatDate(of.dataPagamentoEfetivo)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 5. Botões de ação */}
                      {(acaoLabel || showPagamento) && (
                        <div className="flex items-center gap-2 flex-wrap pt-3 border-t">
                          {acaoLabel && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() => {
                                fecharTodosFormularios();
                                if (of.status === 'pedido_recebido') {
                                  setSeparacaoForm({ dataSeparacao: '' });
                                  setSeparacaoOpenId(of.id);
                                } else if (of.status === 'em_separacao') {
                                  setDespachoForm({ dataDespacho: '', codigoRastreio: '', numeroNf: '' });
                                  setDespachoOpenId(of.id);
                                } else if (of.status === 'despachado') {
                                  const hoje = new Date().toISOString().split('T')[0] ?? '';
                                  const prazoPag = contrato.prazoPagamento
                                    ? calcularPrazoFinalEntrega(hoje, contrato.prazoPagamento, contrato.tipoPrazoPagamento).toISOString().split('T')[0] ?? ''
                                    : '';
                                  setEntregaForm({ dataEntrega: hoje, prazoPagamento: prazoPag });
                                  setEntregaOpenId(of.id);
                                }
                              }}
                            >
                              {acaoLabel}
                            </Button>
                          )}
                          {showPagamento && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                              onClick={() => {
                                fecharTodosFormularios();
                                setPagamentoForm({ dataPagamentoEfetivo: '' });
                                setPagamentoOpenId(of.id);
                              }}
                            >
                              Registrar Pagamento
                            </Button>
                          )}
                        </div>
                      )}

                      {/* 6. Formulário inline de separação */}
                      {separacaoOpenId === of.id && (
                        <div className="p-3 border rounded-lg bg-accent/20 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground">Iniciar Separação</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Data de Separação</Label>
                              <Input
                                type="date"
                                value={separacaoForm.dataSeparacao}
                                onChange={(e) =>
                                  setSeparacaoForm({ dataSeparacao: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          {separacaoError && (
                            <p className="text-xs text-destructive">{separacaoError}</p>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSeparacaoOpenId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={!separacaoForm.dataSeparacao || isSeparacaoLoading}
                              onClick={async () => {
                                try {
                                  await iniciar({ id: of.id, dataSeparacao: separacaoForm.dataSeparacao });
                                  refetchOrdens();
                                  setSeparacaoOpenId(null);
                                } catch {
                                  // error displayed via separacaoError
                                }
                              }}
                            >
                              {isSeparacaoLoading ? 'Salvando...' : 'Confirmar'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 7. Formulário inline de despacho */}
                      {despachoOpenId === of.id && (
                        <div className="p-3 border rounded-lg bg-accent/20 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground">Registrar Despacho</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Data de Despacho</Label>
                              <Input
                                type="date"
                                value={despachoForm.dataDespacho}
                                onChange={(e) =>
                                  setDespachoForm((f) => ({ ...f, dataDespacho: e.target.value }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Código de Rastreio (opcional)</Label>
                              <Input
                                value={despachoForm.codigoRastreio}
                                onChange={(e) =>
                                  setDespachoForm((f) => ({ ...f, codigoRastreio: e.target.value }))
                                }
                                placeholder="BR123456789BR"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Nº NF (opcional)</Label>
                              <Input
                                value={despachoForm.numeroNf}
                                onChange={(e) =>
                                  setDespachoForm((f) => ({ ...f, numeroNf: e.target.value }))
                                }
                                placeholder="000000"
                              />
                            </div>
                          </div>
                          {despachoError && (
                            <p className="text-xs text-destructive">{despachoError}</p>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDespachoOpenId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={!despachoForm.dataDespacho || isDespachoLoading}
                              onClick={async () => {
                                try {
                                  await registrarDespacho({
                                    id: of.id,
                                    dataDespacho: despachoForm.dataDespacho,
                                    ...(despachoForm.codigoRastreio && { codigoRastreio: despachoForm.codigoRastreio }),
                                    ...(despachoForm.numeroNf && { numeroNf: despachoForm.numeroNf }),
                                  });
                                  refetchOrdens();
                                  setDespachoOpenId(null);
                                } catch {
                                  // error displayed via despachoError
                                }
                              }}
                            >
                              {isDespachoLoading ? 'Salvando...' : 'Confirmar'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 8. Formulário inline de entrega */}
                      {entregaOpenId === of.id && (
                        <div className="p-3 border rounded-lg bg-accent/20 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground">Confirmar Entrega</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Data de Entrega</Label>
                              <Input
                                type="date"
                                value={entregaForm.dataEntrega}
                                onChange={(e) => {
                                  const novaData = e.target.value;
                                  setEntregaForm((f) => ({
                                    ...f,
                                    dataEntrega: novaData,
                                    prazoPagamento: contrato.prazoPagamento && novaData
                                      ? calcularPrazoFinalEntrega(novaData, contrato.prazoPagamento, contrato.tipoPrazoPagamento).toISOString().split('T')[0] ?? f.prazoPagamento
                                      : f.prazoPagamento,
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Prazo de Pagamento</Label>
                              <Input
                                type="date"
                                value={entregaForm.prazoPagamento}
                                min={entregaForm.dataEntrega || undefined}
                                onChange={(e) =>
                                  setEntregaForm((f) => ({ ...f, prazoPagamento: e.target.value }))
                                }
                              />
                              {contrato.prazoPagamento && (
                                <p className="text-xs text-muted-foreground">
                                  Sugestão baseada em {contrato.prazoPagamento} dia{contrato.prazoPagamento !== 1 ? 's' : ''}{' '}
                                  {contrato.tipoPrazoPagamento === 'UTEIS' ? 'úteis' : 'corridos'} após a entrega
                                </p>
                              )}
                            </div>
                          </div>
                          {entregaError && (
                            <p className="text-xs text-destructive">{entregaError}</p>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEntregaOpenId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={!entregaForm.dataEntrega || !entregaForm.prazoPagamento || isEntregaLoading}
                              onClick={async () => {
                                try {
                                  await confirmar({
                                    id: of.id,
                                    dataEntrega: entregaForm.dataEntrega,
                                    prazoPagamento: entregaForm.prazoPagamento,
                                  });
                                  refetchOrdens();
                                  setEntregaOpenId(null);
                                } catch {
                                  // error displayed via entregaError
                                }
                              }}
                            >
                              {isEntregaLoading ? 'Salvando...' : 'Confirmar'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 9. Formulário inline de pagamento */}
                      {pagamentoOpenId === of.id && (
                        <div className="p-3 border rounded-lg bg-accent/20 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground">Registrar Pagamento</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Data de Pagamento Efetivo</Label>
                              <Input
                                type="date"
                                value={pagamentoForm.dataPagamentoEfetivo}
                                onChange={(e) =>
                                  setPagamentoForm({ dataPagamentoEfetivo: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          {registrarPagamentoError && (
                            <p className="text-xs text-destructive">{registrarPagamentoError}</p>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPagamentoOpenId(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              disabled={
                                !pagamentoForm.dataPagamentoEfetivo || isRegistrarPagamentoLoading
                              }
                              onClick={async () => {
                                try {
                                  await registrarPagamento({ id: of.id, ...pagamentoForm });
                                  refetchOrdens();
                                  setPagamentoOpenId(null);
                                } catch {
                                  // error displayed via registrarPagamentoError
                                }
                              }}
                            >
                              {isRegistrarPagamentoLoading ? 'Salvando...' : 'Confirmar'}
                            </Button>
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
      </Card>

      {/* CriarOrdemFornecimento Dialog */}
      <CriarOrdemFornecimento
        open={emitirOFOpen}
        onOpenChange={setEmitirOFOpen}
        instrumentoId={instrumento.instrumentoId}
        itensContrato={itens}
        prazoEntregaInstrumento={contrato.prazoEntrega}
        tipoPrazoEntregaInstrumento={contrato.tipoPrazoEntrega}
        onSuccess={refetchOrdens}
      />
    </div>
  );
}
