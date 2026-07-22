import { useCallback, useEffect, useState } from 'react';
import { DashboardRepository } from '../../data/repositories/DashboardRepository';
import type { DashboardData } from '../../domain/entities/DashboardData';
import { ObterDashboardUseCase } from '../../domain/useCases/ObterDashboardUseCase';

const repository = new DashboardRepository();
const obterDashboardUseCase = new ObterDashboardUseCase(repository);

interface UseDashboardResult {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await obterDashboardUseCase.execute();
      setDashboard(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível carregar os dados da tela inicial. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { dashboard, isLoading, error, refetch: fetch };
}
