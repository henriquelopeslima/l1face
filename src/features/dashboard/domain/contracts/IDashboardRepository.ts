import type { DashboardData } from '../entities/DashboardData';

export interface IDashboardRepository {
  obterDashboard(): Promise<DashboardData>;
}
