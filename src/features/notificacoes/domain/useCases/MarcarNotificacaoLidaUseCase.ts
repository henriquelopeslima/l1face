import type { Notificacao } from '../entities/Notificacao';
import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';

export class MarcarNotificacaoLidaUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}

  async execute(id: string): Promise<Notificacao> {
    return this.repository.marcarComoLida(id);
  }
}
