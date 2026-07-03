import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { UsuarioLicitante } from '../../domain/entities/UsuarioLicitante';
import type { ConviteColaborador } from '../../domain/entities/ConviteColaborador';

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

  async convidar(licitanteId: string, email: string, nome?: string): Promise<ConviteColaborador> {
    const response = await apiFetch(`/api/licitantes/${licitanteId}/convites`, {
      method: 'POST',
      body: JSON.stringify({ email, nome }),
    });

    if (response.status === 401) {
      throw new Error('JWT_EXPIRED');
    }

    if (response.status === 403) {
      throw new Error('Apenas administradores podem enviar convites.');
    }

    if (response.status === 404) {
      throw new Error('Não foi possível localizar a empresa. Atualize a página e tente novamente.');
    }

    if (response.status === 409) {
      throw new Error('Este e-mail já tem acesso a esta empresa.');
    }

    if (response.status === 422) {
      throw new Error('Informe um e-mail válido.');
    }

    if (!response.ok) {
      throw new Error('Erro ao enviar convite. Tente novamente.');
    }

    return response.json() as Promise<ConviteColaborador>;
  }
}
