import type { ConviteColaborador } from '../entities/ConviteColaborador';
import type { IUsuarioLicitanteRepository } from '../repositories/IUsuarioLicitanteRepository';

export class ConvidarColaboradorUseCase {
  constructor(private repository: IUsuarioLicitanteRepository) {}

  execute(licitanteId: string, email: string, nome?: string): Promise<ConviteColaborador> {
    return this.repository.convidar(licitanteId, email, nome);
  }
}
