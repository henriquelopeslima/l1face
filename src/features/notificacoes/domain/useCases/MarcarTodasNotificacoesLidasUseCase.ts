import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';

export class MarcarTodasNotificacoesLidasUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}

  async execute(): Promise<{ marcadas: number }> {
    return this.repository.marcarTodasComoLidas();
  }
}
