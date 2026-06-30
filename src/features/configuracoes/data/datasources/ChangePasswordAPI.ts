import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { ChangePasswordRequest, ChangePasswordResponse } from '../../domain/entities';

export class ChangePasswordAPI {
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiFetch('/api/auth/alterar-senha', {
        method: 'POST',
        body: JSON.stringify({
          senhaAtual: request.currentPassword,
          novaSenha: request.newPassword
        })
      });

      if (response.status === 401) {
        throw new Error('JWT_EXPIRED');
      }

      const data = await response.json();

      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          error: data.error || 'Erro ao alterar senha'
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          error: 'Erro ao alterar senha. Tente novamente.'
        };
      }

      return { success: true, error: null };
    } catch (error: any) {
      if (error.message === 'JWT_EXPIRED') {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }

      throw error;
    }
  }
}
