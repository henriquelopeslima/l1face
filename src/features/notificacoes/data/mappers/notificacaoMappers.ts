import type { ListaNotificacoes, Notificacao, TipoOrigemNotificacao } from '../../domain/entities/Notificacao';

export interface ApiNotificacaoResponse {
  id: string;
  tipoOrigem: TipoOrigemNotificacao;
  entidadeId: string;
  conteudo: { titulo: string; descricao: string; cor: string };
  lida: boolean;
  lidaEm: string | null;
  criadaEm: string;
}

export interface ApiListaNotificacoesResponse {
  data: ApiNotificacaoResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function mapApiNotificacaoToNotificacao(raw: ApiNotificacaoResponse): Notificacao {
  return {
    id: raw.id,
    tipoOrigem: raw.tipoOrigem,
    entidadeId: raw.entidadeId,
    conteudo: raw.conteudo,
    lida: raw.lida,
    lidaEm: raw.lidaEm,
    criadaEm: raw.criadaEm,
  };
}

export function mapApiListaNotificacoesToListaNotificacoes(raw: ApiListaNotificacoesResponse): ListaNotificacoes {
  return {
    itens: raw.data.map(mapApiNotificacaoToNotificacao),
    total: raw.meta.total,
    paginaAtual: raw.meta.page,
    totalPaginas: raw.meta.totalPages,
  };
}
