import { describe, it, expect, vi } from 'vitest';
import { ObterDashboardUseCase } from './ObterDashboardUseCase';
import type { IDashboardRepository } from '../contracts/IDashboardRepository';
import type { DashboardData } from '../entities/DashboardData';

const makeRepository = (overrides?: Partial<IDashboardRepository>): IDashboardRepository => ({
  obterDashboard: vi.fn(),
  ...overrides,
} as IDashboardRepository);

const makeDashboardData = (): DashboardData => ({
  cards: {
    valorTotalContratado: { valor: 1000000, variacaoPercentualMesAnterior: 12.5 },
    valorTotalAtas: { valor: 359112.1, variacaoPercentualMesAnterior: 8.2 },
    instrumentosAtivos: { quantidade: 56, proximosAoVencimento: 8 },
    pendenciasFinanceiras: { valor: 125450, quantidadeAguardandoProcessamento: 5 },
  },
  evolucaoMensal: [{ mes: '2026-07', contratos: 4200000, atas: 1500000 }],
  statusInstrumentos: [{ status: 'ATIVA', quantidade: 45 }],
  alertas: [],
});

describe('ObterDashboardUseCase', () => {
  it('retorna os dados do dashboard do repositório', async () => {
    const dashboardData = makeDashboardData();
    const repository = makeRepository({ obterDashboard: vi.fn().mockResolvedValue(dashboardData) });
    const useCase = new ObterDashboardUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(dashboardData);
    expect(repository.obterDashboard).toHaveBeenCalledOnce();
    expect(repository.obterDashboard).toHaveBeenCalledWith();
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      obterDashboard: vi.fn().mockRejectedValue(new Error('Não foi possível carregar os dados da tela inicial. Tente novamente.')),
    });
    const useCase = new ObterDashboardUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow('Não foi possível carregar os dados da tela inicial. Tente novamente.');
  });
});
