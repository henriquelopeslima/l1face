import { describe, it, expect, vi } from 'vitest';
import { ListarAtasPaginadoUseCase } from './ListarAtasPaginadoUseCase';
import { AtaError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import type { Ata, ListaAtas } from '../entities/ata';

const ataFixture: Ata = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  numero: '001/2026',
  objeto: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  orgaoGerenciador: { nome: 'Ministério da Fazenda', cnpj: '00360305000104' },
  vigenciaInicial: '2026-01-01',
  vigenciaFinal: '2026-12-31',
  valorRegistrado: 25000,
  saldo: 0,
  valorCarona: 0,
  saldoCarona: 0,
  contratos: 0,
  status: 'ATIVA',
  aceitaAdesao: true,
  renovavel: false,
};

const makeListaAtas = (): ListaAtas => ({
  itens: [ataFixture],
  total: 1,
  paginaAtual: 1,
  totalPaginas: 1,
});

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn().mockResolvedValue([ataFixture]),
    listarAtasPaginado: vi.fn().mockResolvedValue(makeListaAtas()),
    getAta: vi.fn().mockResolvedValue(null),
    ...overrides,
  } as IAtasRepository;
}

describe('ListarAtasPaginadoUseCase', () => {
  it('retorna a lista paginada de atas do repositório', async () => {
    const lista = makeListaAtas();
    const repo = makeRepo({ listarAtasPaginado: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarAtasPaginadoUseCase(repo);

    const result = await useCase.execute();

    expect(result).toEqual(lista);
    expect(repo.listarAtasPaginado).toHaveBeenCalledOnce();
    expect(repo.listarAtasPaginado).toHaveBeenCalledWith(undefined);
  });

  it('repassa parâmetros de paginação ao repositório', async () => {
    const lista = makeListaAtas();
    const repo = makeRepo({ listarAtasPaginado: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarAtasPaginadoUseCase(repo);

    const result = await useCase.execute({ page: 2, limit: 20 });

    expect(result).toEqual(lista);
    expect(repo.listarAtasPaginado).toHaveBeenCalledWith({ page: 2, limit: 20 });
  });

  it('propaga AtaError lançado pelo repositório', async () => {
    const repo = makeRepo({
      listarAtasPaginado: vi.fn().mockRejectedValue(new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')),
    });
    const useCase = new ListarAtasPaginadoUseCase(repo);

    await expect(useCase.execute()).rejects.toBeInstanceOf(AtaError);
  });
});
