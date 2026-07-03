import type { UsuarioLicitante } from '../entities/UsuarioLicitante';
import type { ConviteColaborador } from '../entities/ConviteColaborador';

export interface IUsuarioLicitanteRepository {
  listar(licitanteId: string): Promise<UsuarioLicitante[]>;
  revogar(licitanteId: string, userId: string): Promise<void>;
  convidar(licitanteId: string, email: string, nome?: string): Promise<ConviteColaborador>;
}
