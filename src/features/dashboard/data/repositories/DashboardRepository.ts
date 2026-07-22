import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { IDashboardRepository } from '../../domain/contracts/IDashboardRepository';
import type { DashboardData } from '../../domain/entities/DashboardData';
import { mapApiDashboardResponseToDashboardData, type ApiDashboardResponse } from '../mappers/dashboardMappers';

class DashboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DashboardError';
  }
}

export class DashboardRepository implements IDashboardRepository {
  async obterDashboard(): Promise<DashboardData> {
    let response: Response;
    try {
      response = await apiFetch('/api/dashboard', { method: 'GET' });
    } catch {
      throw new DashboardError('Não foi possível carregar os dados da tela inicial. Tente novamente.');
    }

    if (response.status === 400) {
      throw new DashboardError('Não foi possível identificar a empresa ativa. Atualize a página e tente novamente.');
    }
    if (response.status === 401) {
      throw new DashboardError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 403) {
      throw new DashboardError('Você não tem acesso aos dados desta empresa.');
    }
    if (response.status === 404) {
      throw new DashboardError('Não foi possível localizar a empresa. Atualize a página e tente novamente.');
    }
    if (!response.ok) {
      throw new DashboardError('Não foi possível carregar os dados da tela inicial. Tente novamente.');
    }

    const data = (await response.json()) as ApiDashboardResponse;
    return mapApiDashboardResponseToDashboardData(data);
  }
}
