import type { ChangePasswordRequest, ChangePasswordResponse } from '../../domain/entities';
import type { IChangePasswordRepository } from '../../domain/repositories';
import { ChangePasswordAPI } from '../datasources/ChangePasswordAPI';

export class ChangePasswordRepository implements IChangePasswordRepository {
  private api = new ChangePasswordAPI();

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await this.api.changePassword(request);
      return response;
    } catch (error: any) {
      // Handle JWT expiration - redirect to login
      if (error.message === 'JWT_EXPIRED') {
        window.location.href = '/login';
        return {
          success: false,
          error: 'Sessão expirada'
        };
      }

      // Handle timeout - show generic error
      if (error.message === 'TIMEOUT') {
        return {
          success: false,
          error: 'Operação expirou. Verifique sua conexão.'
        };
      }

      // Generic error fallback
      return {
        success: false,
        error: 'Erro ao alterar senha. Tente novamente.'
      };
    }
  }
}
