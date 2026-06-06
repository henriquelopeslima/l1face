import { describe, it, expect, vi } from 'vitest';
import { ListarInstrumentosUseCase } from './ListarInstrumentosUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { InstrumentoListagem } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  ...overrides,
} as IInstrumentosRepository);

describe('ListarInstrumentosUseCase', () => {
  it('retorna lista de instrumentos do repositório', async () => {
    const instrumentos: InstrumentoListagem[] = [
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
      },
    ];
    const repository = makeRepository({ listarInstrumentos: vi.fn().mockResolvedValue(instrumentos) });
    const useCase = new ListarInstrumentosUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(instrumentos);
    expect(repository.listarInstrumentos).toHaveBeenCalledOnce();
  });

  it('retorna lista vazia quando não há instrumentos', async () => {
    const repository = makeRepository({ listarInstrumentos: vi.fn().mockResolvedValue([]) });
    const useCase = new ListarInstrumentosUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      listarInstrumentos: vi.fn().mockRejectedValue(new Error('Serviço indisponível')),
    });
    const useCase = new ListarInstrumentosUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow('Serviço indisponível');
  });
});
