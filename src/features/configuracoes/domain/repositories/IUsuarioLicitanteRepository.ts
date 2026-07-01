import type { UsuarioLicitante } from '../entities/UsuarioLicitante';

export interface IUsuarioLicitanteRepository {
  listar(licitanteId: string): Promise<UsuarioLicitante[]>;
  revogar(licitanteId: string, userId: string): Promise<void>;
}
