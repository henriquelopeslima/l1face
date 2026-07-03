import type { UsuarioLicitante } from '../../domain/entities/UsuarioLicitante';
import type { ConviteColaborador } from '../../domain/entities/ConviteColaborador';
import type { IUsuarioLicitanteRepository } from '../../domain/repositories/IUsuarioLicitanteRepository';
import { UsuarioLicitanteAPI } from '../datasources/UsuarioLicitanteAPI';

export class UsuarioLicitanteRepository implements IUsuarioLicitanteRepository {
  private api = new UsuarioLicitanteAPI();

  async listar(licitanteId: string): Promise<UsuarioLicitante[]> {
    try {
      return await this.api.listar(licitanteId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'JWT_EXPIRED') {
        window.location.href = '/login';
        return [];
      }
      throw error;
    }
  }

  async revogar(licitanteId: string, userId: string): Promise<void> {
    try {
      await this.api.revogar(licitanteId, userId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'JWT_EXPIRED') {
        window.location.href = '/login';
        return;
      }
      throw error;
    }
  }

  async convidar(licitanteId: string, email: string, nome?: string): Promise<ConviteColaborador> {
    try {
      return await this.api.convidar(licitanteId, email, nome);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'JWT_EXPIRED') {
        window.location.href = '/login';
      }
      throw error;
    }
  }
}
