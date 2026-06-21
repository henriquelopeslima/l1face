import type { FotoPerfilResult } from '../entities/fotoPerfil';

export interface IPerfilRepository {
  uploadFoto(arquivo: File): Promise<FotoPerfilResult>;
  removerFoto(): Promise<void>;
}
