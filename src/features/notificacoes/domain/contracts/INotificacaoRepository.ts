import type { ListaNotificacoes, Notificacao } from '../entities/Notificacao';

export interface INotificacaoRepository {
  listar(): Promise<ListaNotificacoes>;
  marcarComoLida(id: string): Promise<Notificacao>;
  marcarTodasComoLidas(): Promise<{ marcadas: number }>;
}
