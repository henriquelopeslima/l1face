import { describe, it, expect, vi } from 'vitest';
import { CriarAtaUseCase } from './CriarAtaUseCase';
import { AtaError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import type { AtaDetalhes } from '../entities/ataDetalhes';
import type { CriarAtaInput } from '../entities/criarAta';

const inputFixture: CriarAtaInput = {
  numero: '001/2026',
  descricao: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  cnpjOrgaoGerenciador: '00360305000104',
  nomeOrgaoGerenciador: 'Ministério da Fazenda',
  dataInicioVigencia: '2026-01-01',
  dataFimVigencia: '2026-12-31',
  aceitaAdesao: false,
  renovavel: false,
  numeroPncp: null,
  anexoUrl: null,
  itens: [
    {
      numeroItem: 1,
      descricao: 'Seringa descartável 10ml',
      unidadeMedida: 'UN',
      valorEstimado: 1.5,
      qtdRegistrada: 1000,
      qtdParaCarona: 0,
    },
  ],
};

const ataDetalhesFixture: AtaDetalhes = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  numero: '001/2026',
  descricao: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  cnpjOrgaoGerenciador: '00360305000104',
  nomeOrgaoGerenciador: 'Ministério da Fazenda',
  dataInicioVigencia: '2026-01-01',
  dataFimVigencia: '2026-12-31',
  aceitaAdesao: false,
  renovavel: false,
  numeroPncp: null,
  anexoUrl: null,
  status: 'ATIVA',
  itens: [
    {
      id: '7f4e2a1b-3c0d-4e5f-a6b7-c8d9e0f1a2b3',
      numeroItem: 1,
      descricao: 'Seringa descartável 10ml',
      unidadeMedida: 'UN',
      valorEstimado: 1.5,
      qtdOrgao: 1000,
      qtdCarona: 0,
      qtdSaldoOrgao: 1000,
      qtdSaldoCarona: 0,
    },
  ],
};

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn().mockResolvedValue([]),
    getAta: vi.fn().mockResolvedValue(ataDetalhesFixture),
    criarAta: vi.fn().mockResolvedValue(ataDetalhesFixture),
    consultarAtaPncp: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('CriarAtaUseCase', () => {
  it('retorna AtaDetalhes quando repositório resolve com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new CriarAtaUseCase(repo);
    const result = await useCase.execute(inputFixture);
    expect(result).toEqual(ataDetalhesFixture);
    expect(repo.criarAta).toHaveBeenCalledWith(inputFixture);
  });

  it('propaga AtaError lançado pelo repositório (sessão expirada - 401)', async () => {
    const repo = makeRepo({
      criarAta: vi.fn().mockRejectedValue(new AtaError('Sessão expirada. Faça login novamente.')),
    });
    const useCase = new CriarAtaUseCase(repo);
    await expect(useCase.execute(inputFixture)).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (acesso negado - 403)', async () => {
    const repo = makeRepo({
      criarAta: vi.fn().mockRejectedValue(new AtaError('Acesso negado ao licitante informado.')),
    });
    const useCase = new CriarAtaUseCase(repo);
    await expect(useCase.execute(inputFixture)).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (licitante não encontrado - 404)', async () => {
    const repo = makeRepo({
      criarAta: vi.fn().mockRejectedValue(new AtaError('Licitante não encontrado.')),
    });
    const useCase = new CriarAtaUseCase(repo);
    await expect(useCase.execute(inputFixture)).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (dados inválidos - 422)', async () => {
    const repo = makeRepo({
      criarAta: vi.fn().mockRejectedValue(new AtaError('Data de fim de vigência deve ser posterior à data de início')),
    });
    const useCase = new CriarAtaUseCase(repo);
    await expect(useCase.execute(inputFixture)).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (falha de rede)', async () => {
    const repo = makeRepo({
      criarAta: vi.fn().mockRejectedValue(new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')),
    });
    const useCase = new CriarAtaUseCase(repo);
    await expect(useCase.execute(inputFixture)).rejects.toBeInstanceOf(AtaError);
  });
});
