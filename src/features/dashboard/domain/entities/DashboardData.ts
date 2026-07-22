export interface IndicadorValor {
  valor: number;
  variacaoPercentualMesAnterior: number | null;
}

export interface IndicadorInstrumentosAtivos {
  quantidade: number;
  proximosAoVencimento: number;
}

export interface IndicadorPendenciasFinanceiras {
  valor: number;
  quantidadeAguardandoProcessamento: number;
}

export interface DashboardCards {
  valorTotalContratado: IndicadorValor;
  valorTotalAtas: IndicadorValor;
  instrumentosAtivos: IndicadorInstrumentosAtivos;
  pendenciasFinanceiras: IndicadorPendenciasFinanceiras;
}

export interface PontoEvolucaoMensal {
  mes: string;
  contratos: number;
  atas: number;
}

export type StatusInstrumento = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA';

export interface StatusInstrumentoResumo {
  status: StatusInstrumento;
  quantidade: number;
}

export type TipoOrigemAlerta = 'instrumento' | 'ata' | 'of';

export interface ConteudoAlertaDashboard {
  titulo: string;
  descricao: string;
  cor: string;
}

export interface AlertaDashboard {
  id: string;
  tipoOrigem: TipoOrigemAlerta;
  entidadeId: string;
  conteudo: ConteudoAlertaDashboard;
  lida: boolean;
  criadaEm: string;
}

export interface DashboardData {
  cards: DashboardCards;
  evolucaoMensal: PontoEvolucaoMensal[];
  statusInstrumentos: StatusInstrumentoResumo[];
  alertas: AlertaDashboard[];
}
