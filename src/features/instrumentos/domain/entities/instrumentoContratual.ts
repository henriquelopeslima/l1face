export type TipoInstrumentoContratual = 'contrato' | 'nota-empenho' | 'outro';

export interface InstrumentoListagem {
  id: string;
  tipo: TipoInstrumentoContratual;
  numeroInstrumento: string;
  isARP: boolean;
  orgaoContratante: string;
  secretaria: string;
  objeto: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  prazoEntregaOF?: string;
  valorGlobal: number;
  saldoAtual: number;
  status: 'em-execucao' | 'proximo-vencimento' | 'encerrado' | 'renovavel';
}
