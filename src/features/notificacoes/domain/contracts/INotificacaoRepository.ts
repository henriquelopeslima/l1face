import type { ListaNotificacoes, Notificacao } from '../entities/Notificacao';

export interface ListarNotificacoesParams {
  page?: number;
  limit?: number;
}

export interface INotificacaoRepository {
  listar(params?: ListarNotificacoesParams): Promise<ListaNotificacoes>;
  marcarComoLida(id: string): Promise<Notificacao>;
  marcarTodasComoLidas(): Promise<{ marcadas: number }>;
}
