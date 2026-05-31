export type TipoInstrumento = 'CONTRATO' | 'EMPENHO';

export type StatusInstrumento = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA';

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
