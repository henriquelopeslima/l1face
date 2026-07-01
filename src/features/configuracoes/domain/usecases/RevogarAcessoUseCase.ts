import type { IUsuarioLicitanteRepository } from '../repositories/IUsuarioLicitanteRepository';

export class RevogarAcessoUseCase {
  constructor(private repository: IUsuarioLicitanteRepository) {}

  execute(licitanteId: string, userId: string): Promise<void> {
    return this.repository.revogar(licitanteId, userId);
  }
}
