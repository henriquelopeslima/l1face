import type { DashboardData } from '../entities/DashboardData';
import type { IDashboardRepository } from '../contracts/IDashboardRepository';

export class ObterDashboardUseCase {
  constructor(private readonly repository: IDashboardRepository) {}

  async execute(): Promise<DashboardData> {
    return this.repository.obterDashboard();
  }
}
