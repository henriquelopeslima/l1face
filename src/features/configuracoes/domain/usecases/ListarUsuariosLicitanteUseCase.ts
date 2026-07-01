import type { UsuarioLicitante } from '../entities/UsuarioLicitante';
import type { IUsuarioLicitanteRepository } from '../repositories/IUsuarioLicitanteRepository';

export class ListarUsuariosLicitanteUseCase {
  constructor(private repository: IUsuarioLicitanteRepository) {}

  execute(licitanteId: string): Promise<UsuarioLicitante[]> {
    return this.repository.listar(licitanteId);
  }
}
