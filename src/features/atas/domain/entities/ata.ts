export type AtaStatus = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA';

export interface Ata {
  id: string;
  numero: string;
  objeto: string;
  orgaoGerenciador: { nome: string; cnpj: string };
  vigenciaInicial: string;
  vigenciaFinal: string;
  valorRegistrado: number;
  saldo: number;
  contratos: number;
  status: AtaStatus;
  aceitaAdesao: boolean;
  renovavel: boolean;
}
