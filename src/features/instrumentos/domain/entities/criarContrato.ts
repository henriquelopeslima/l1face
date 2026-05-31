export interface DadosContratoPncp {
  cnpjDoContratante: string;
  orgaoDoContratante: string;
  unidade: string;
  objeto: string;
  nDoInstrumento: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
}

export interface ItemInstrumentoInput {
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface CriarContratoInput {
  ataId?: string | null;
  numeroPncp?: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  endereco?: string | null;
  prazoEntrega?: number | null;
  tipoPrazoEntrega?: 'UTEIS' | 'CORRIDOS' | null;
  prazoPagamento?: number | null;
  tipoPrazoPagamento?: 'UTEIS' | 'CORRIDOS' | null;
  enderecoEntrega?: string | null;
  renovavel: boolean;
  anexoUrl?: string | null;
  itens?: ItemInstrumentoInput[];
}

export interface CriarEmpenhoInput {
  ataId?: string | null;
  numeroPncp?: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl?: string | null;
  itens?: ItemInstrumentoInput[];
}
