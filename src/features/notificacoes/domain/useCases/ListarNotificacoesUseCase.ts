import type { ListaNotificacoes } from '../entities/Notificacao';
import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';

export class ListarNotificacoesUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}

  async execute(): Promise<ListaNotificacoes> {
    return this.repository.listar();
  }
}
