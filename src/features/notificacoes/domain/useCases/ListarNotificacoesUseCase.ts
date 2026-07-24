import type { ListaNotificacoes } from '../entities/Notificacao';
import type { INotificacaoRepository, ListarNotificacoesParams } from '../contracts/INotificacaoRepository';

export class ListarNotificacoesUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}

  async execute(params?: ListarNotificacoesParams): Promise<ListaNotificacoes> {
    return this.repository.listar(params);
  }
}
