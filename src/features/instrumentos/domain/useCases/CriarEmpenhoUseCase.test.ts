import { describe, it, expect, vi } from 'vitest';
import { CriarEmpenhoUseCase } from './CriarEmpenhoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { CriarEmpenhoInput } from '../entities/criarContrato';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  ...overrides,
});

const inputMinimo: CriarEmpenhoInput = {
  orgaoContratante: 'Prefeitura Municipal',
  unidade: 'Secretaria de Saúde',
  objeto: 'Aquisição de insumos médicos',
};

describe('CriarEmpenhoUseCase', () => {
  it('cria empenho com campos mínimos e retorna instrumento_id', async () => {
    const repository = makeRepository({ criarEmpenho: vi.fn().mockResolvedValue('empenho-uuid-456') });
    const useCase = new CriarEmpenhoUseCase(repository);

    const result = await useCase.execute(inputMinimo);

    expect(result).toBe('empenho-uuid-456');
    expect(repository.criarEmpenho).toHaveBeenCalledWith(inputMinimo);
  });

  it('cria empenho com ata vinculada e itens', async () => {
    const inputCompleto: CriarEmpenhoInput = {
      ...inputMinimo,
      ataId: 'ata-uuid-789',
      numeroPncp: '12345678000195-2-000001/2026',
      itens: [
        { descricao: 'Luva M', unidadeMedida: 'CX', quantidadeTotal: 500, valorUnitario: 35, valorTotal: 17500 },
      ],
    };
    const repository = makeRepository({ criarEmpenho: vi.fn().mockResolvedValue('empenho-uuid-completo') });
    const useCase = new CriarEmpenhoUseCase(repository);

    const result = await useCase.execute(inputCompleto);

    expect(result).toBe('empenho-uuid-completo');
    expect(repository.criarEmpenho).toHaveBeenCalledWith(inputCompleto);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      criarEmpenho: vi.fn().mockRejectedValue(new Error('Acesso negado ao licitante informado.')),
    });
    const useCase = new CriarEmpenhoUseCase(repository);

    await expect(useCase.execute(inputMinimo)).rejects.toThrow('Acesso negado ao licitante informado.');
  });
});
