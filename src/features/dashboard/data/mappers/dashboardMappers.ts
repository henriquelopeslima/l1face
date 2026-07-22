import type {
  AlertaDashboard,
  DashboardCards,
  DashboardData,
  PontoEvolucaoMensal,
  StatusInstrumentoResumo,
  TipoOrigemAlerta,
} from '../../domain/entities/DashboardData';

interface ApiNotificacaoResponse {
  id: string;
  tipoOrigem: TipoOrigemAlerta;
  entidadeId: string;
  conteudo: { titulo: string; descricao: string; cor: string };
  lida: boolean;
  lidaEm: string | null;
  criadaEm: string;
}

export interface ApiDashboardResponse {
  cards: DashboardCards;
  evolucaoMensal: PontoEvolucaoMensal[];
  statusInstrumentos: StatusInstrumentoResumo[];
  alertas: ApiNotificacaoResponse[];
}

function mapApiAlertaToAlertaDashboard(raw: ApiNotificacaoResponse): AlertaDashboard {
  return {
    id: raw.id,
    tipoOrigem: raw.tipoOrigem,
    entidadeId: raw.entidadeId,
    conteudo: raw.conteudo,
    lida: raw.lida,
    criadaEm: raw.criadaEm,
  };
}

export function mapApiDashboardResponseToDashboardData(raw: ApiDashboardResponse): DashboardData {
  return {
    cards: raw.cards,
    evolucaoMensal: raw.evolucaoMensal,
    statusInstrumentos: raw.statusInstrumentos,
    alertas: raw.alertas.map(mapApiAlertaToAlertaDashboard),
  };
}
