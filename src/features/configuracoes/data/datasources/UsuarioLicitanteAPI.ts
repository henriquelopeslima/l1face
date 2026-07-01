import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { UsuarioLicitante } from '../../domain/entities/UsuarioLicitante';

export class UsuarioLicitanteAPI {
  async listar(licitanteId: string): Promise<UsuarioLicitante[]> {
    const response = await apiFetch(`/api/licitantes/${licitanteId}/usuarios`);

    if (response.status === 401) {
      throw new Error('JWT_EXPIRED');
    }

    if (!response.ok) {
      throw new Error('FETCH_ERROR');
    }

    return response.json() as Promise<UsuarioLicitante[]>;
  }

  async revogar(licitanteId: string, userId: string): Promise<void> {
    const response = await apiFetch(`/api/licitantes/${licitanteId}/usuarios/${userId}`, {
      method: 'DELETE',
    });

    if (response.status === 401) {
      throw new Error('JWT_EXPIRED');
    }

    if (response.status === 403) {
      throw new Error('Apenas administradores podem revogar acessos.');
    }

    if (response.status === 404) {
      throw new Error('Vínculo não encontrado.');
    }

    if (response.status === 409) {
      throw new Error('Não é possível remover o último administrador.');
    }

    if (!response.ok) {
      throw new Error('Erro ao revogar acesso. Tente novamente.');
    }
  }
}
