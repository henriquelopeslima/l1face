import { describe, it, expect, vi } from 'vitest';
import { ListarInstrumentosUseCase } from './ListarInstrumentosUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { ListaInstrumentos } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  ...overrides,
} as IInstrumentosRepository);

const makeListaInstrumentos = (): ListaInstrumentos => ({
  itens: [
    {
      id: '1',
      tipo: 'CONTRATO',
      numero: '001/2026',
      orgao: 'Prefeitura',
      unidade: 'Secretaria de Saúde',
      objeto: 'Fornecimento de medicamentos',
      prazoFinal: '2026-12-31',
      valor: 100000,
      saldo: 100000,
      status: 'ATIVA',
      adesao: false,
    },
  ],
  total: 1,
  paginaAtual: 1,
  totalPaginas: 1,
});

describe('ListarInstrumentosUseCase', () => {
  it('retorna a lista paginada de instrumentos do repositório', async () => {
    const lista = makeListaInstrumentos();
    const repository = makeRepository({ listarInstrumentos: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarInstrumentosUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(lista);
    expect(repository.listarInstrumentos).toHaveBeenCalledOnce();
    expect(repository.listarInstrumentos).toHaveBeenCalledWith(undefined);
  });

  it('repassa parâmetros de paginação ao repositório', async () => {
    const lista = makeListaInstrumentos();
    const repository = makeRepository({ listarInstrumentos: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarInstrumentosUseCase(repository);

    const result = await useCase.execute({ page: 2, limit: 20 });

    expect(result).toEqual(lista);
    expect(repository.listarInstrumentos).toHaveBeenCalledWith({ page: 2, limit: 20 });
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      listarInstrumentos: vi.fn().mockRejectedValue(new Error('Serviço indisponível')),
    });
    const useCase = new ListarInstrumentosUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow('Serviço indisponível');
  });
});
