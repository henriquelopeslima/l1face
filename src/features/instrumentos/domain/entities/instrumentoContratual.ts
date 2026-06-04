export type TipoInstrumento = 'CONTRATO' | 'EMPENHO';

export type StatusInstrumento = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA';

export type TipoPrazo = 'UTEIS' | 'CORRIDOS';

export interface InstrumentoListagem {
  id: string;
  tipo: TipoInstrumento;
  numero: string | null;
  orgao: string;
  unidade: string;
  objeto: string;
  prazoFinal: string | null;
  valor: number;
  saldo: number;
  status: StatusInstrumento;
}

export interface ItemInstrumentoDetalhe {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ContratoDetalhe {
  id: string;
  numeroPncp: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  endereco: string | null;
  prazoEntrega: number | null;
  tipoPrazoEntrega: TipoPrazo | null;
  prazoPagamento: number | null;
  tipoPrazoPagamento: TipoPrazo | null;
  enderecoEntrega: string | null;
  renovavel: boolean;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}

export interface EmpenhoDetalhe {
  id: string;
  numeroPncp: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}

type InstrumentoDetalheBase = {
  instrumentoId: string;
  licitanteId: string;
  ataId: string | null;
  criadoEm: string;
  itens: ItemInstrumentoDetalhe[];
};

export type InstrumentoDetalhe =
  | (InstrumentoDetalheBase & { tipo: 'CONTRATO'; contrato: ContratoDetalhe; empenho: null })
  | (InstrumentoDetalheBase & { tipo: 'EMPENHO'; empenho: EmpenhoDetalhe; contrato: null });

export type StatusOrdemFornecimento =
  | 'pedido_recebido'
  | 'em_separacao'
  | 'despachado'
  | 'entregue'
  | 'pago';

export type StatusPagamento = 'pendente' | 'em_atraso' | 'pago' | null;

export interface ItemOrdemFornecimento {
  id: string;
  itemInstrumentoId: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeFornecida: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemFornecimento {
  id: string;
  codigo: number;
  instrumentoId: string;
  status: StatusOrdemFornecimento;
  dataRecebimento: string;
  dataEntrega: string | null;
  dataLiquidacao: string | null;
  prazoPagamento: string | null;
  dataPagamentoEfetivo: string | null;
  statusPagamento: StatusPagamento;
  numeroNfe: string | null;
  valorTotal: number;
  itens: ItemOrdemFornecimento[];
  criadoEm: string;
}

export interface ListagemOrdensFornecimento {
  instrumentoId: string;
  saldoRemanescente: number;
  ordensFornecimento: OrdemFornecimento[];
}
