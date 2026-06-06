import { describe, it, expect, vi } from 'vitest';
import { ListarAtasUseCase } from './ListarAtasUseCase';
import { AtaError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import type { Ata } from '../entities/ata';

const ataFixture: Ata = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  numero: '001/2026',
  objeto: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  orgaoGerenciador: { nome: 'Ministério da Fazenda', cnpj: '00360305000104' },
  vigenciaInicial: '2026-01-01',
  vigenciaFinal: '2026-12-31',
  valorRegistrado: 25000,
  saldo: 0,
  contratos: 0,
  status: 'ATIVA',
  aceitaAdesao: true,
  renovavel: false,
};

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn().mockResolvedValue([ataFixture]),
    getAta: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as IAtasRepository;
}

describe('ListarAtasUseCase', () => {
  it('retorna lista de atas quando repositório resolve com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new ListarAtasUseCase(repo);
    const result = await useCase.execute();
    expect(result).toEqual([ataFixture]);
    expect(repo.listarAtas).toHaveBeenCalledOnce();
  });

  it('retorna array vazio quando repositório resolve com lista vazia', async () => {
    const repo = makeRepo({ listarAtas: vi.fn().mockResolvedValue([]) });
    const useCase = new ListarAtasUseCase(repo);
    const result = await useCase.execute();
    expect(result).toEqual([]);
  });

  it('propaga AtaError lançado pelo repositório (falha de rede)', async () => {
    const repo = makeRepo({
      listarAtas: vi.fn().mockRejectedValue(new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')),
    });
    const useCase = new ListarAtasUseCase(repo);
    await expect(useCase.execute()).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (sessão expirada)', async () => {
    const repo = makeRepo({
      listarAtas: vi.fn().mockRejectedValue(new AtaError('Sessão expirada. Faça login novamente.')),
    });
    const useCase = new ListarAtasUseCase(repo);
    await expect(useCase.execute()).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (acesso negado)', async () => {
    const repo = makeRepo({
      listarAtas: vi.fn().mockRejectedValue(new AtaError('Acesso negado. Você não tem permissão para visualizar estas atas.')),
    });
    const useCase = new ListarAtasUseCase(repo);
    await expect(useCase.execute()).rejects.toBeInstanceOf(AtaError);
  });
});
