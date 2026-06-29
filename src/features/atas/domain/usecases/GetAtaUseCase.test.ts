import { describe, it, expect, vi } from 'vitest';
import { GetAtaUseCase } from './GetAtaUseCase';
import { AtaError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import type { AtaDetalhes } from '../entities/ataDetalhes';

const ataDetalhesFixture: AtaDetalhes = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  numero: '001/2026',
  descricao: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  cnpjOrgaoGerenciador: '00360305000104',
  nomeOrgaoGerenciador: 'Ministério da Fazenda',
  dataInicioVigencia: '2026-01-01',
  dataFimVigencia: '2026-12-31',
  aceitaAdesao: true,
  renovavel: false,
  numeroPncp: '00360305000104-1-000001/2026',
  anexoUrl: null,
  status: 'ATIVA',
  itens: [
    {
      id: '7f4e2a1b-3c0d-4e5f-a6b7-c8d9e0f1a2b3',
      numeroItem: 1,
      descricao: 'Seringa descartável 10ml',
      unidadeMedida: 'UN',
      valorEstimado: 1.5,
      qtdOrgao: 10000,
      qtdCarona: 2000,
      qtdSaldoOrgao: 10000,
      qtdSaldoCarona: 2000,
    },
  ],
};

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn().mockResolvedValue([]),
    getAta: vi.fn().mockResolvedValue(ataDetalhesFixture),
    ...overrides,
  } as IAtasRepository;
}

describe('GetAtaUseCase', () => {
  it('retorna AtaDetalhes quando repositório resolve com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new GetAtaUseCase(repo);
    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440010');
    expect(result).toEqual(ataDetalhesFixture);
    expect(repo.getAta).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440010');
  });

  it('propaga AtaError lançado pelo repositório (ata não encontrada)', async () => {
    const repo = makeRepo({
      getAta: vi.fn().mockRejectedValue(new AtaError('Ata não encontrada.')),
    });
    const useCase = new GetAtaUseCase(repo);
    await expect(useCase.execute('invalid-id')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (sessão expirada)', async () => {
    const repo = makeRepo({
      getAta: vi.fn().mockRejectedValue(new AtaError('Sessão expirada. Faça login novamente.')),
    });
    const useCase = new GetAtaUseCase(repo);
    await expect(useCase.execute('some-id')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (acesso negado)', async () => {
    const repo = makeRepo({
      getAta: vi.fn().mockRejectedValue(new AtaError('Acesso negado ao licitante informado.')),
    });
    const useCase = new GetAtaUseCase(repo);
    await expect(useCase.execute('some-id')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (erro genérico)', async () => {
    const repo = makeRepo({
      getAta: vi.fn().mockRejectedValue(new AtaError('Erro ao carregar ata. Tente novamente.')),
    });
    const useCase = new GetAtaUseCase(repo);
    await expect(useCase.execute('some-id')).rejects.toBeInstanceOf(AtaError);
  });
});
