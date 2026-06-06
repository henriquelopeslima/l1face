import { describe, it, expect, vi } from 'vitest';
import { CriarContratoUseCase } from './CriarContratoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { CriarContratoInput } from '../entities/criarContrato';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  ...overrides,
} as IInstrumentosRepository);

const inputValido: CriarContratoInput = {
  numero: '001/2026',
  orgaoContratante: 'Prefeitura Municipal',
  unidade: 'Secretaria de Educação',
  objeto: 'Fornecimento de material escolar',
  vigenciaInicial: '2026-01-01',
  vigenciaFinal: '2026-12-31',
  renovavel: false,
};

describe('CriarContratoUseCase', () => {
  it('cria contrato com dados válidos e retorna instrumento_id', async () => {
    const repository = makeRepository({ criarContrato: vi.fn().mockResolvedValue('instrumento-uuid-123') });
    const useCase = new CriarContratoUseCase(repository);

    const result = await useCase.execute(inputValido);

    expect(result).toBe('instrumento-uuid-123');
    expect(repository.criarContrato).toHaveBeenCalledWith(inputValido);
  });

  it('lança erro quando vigência final é anterior à inicial', async () => {
    const repository = makeRepository({ criarContrato: vi.fn() });
    const useCase = new CriarContratoUseCase(repository);

    await expect(
      useCase.execute({ ...inputValido, vigenciaFinal: '2025-12-31' }),
    ).rejects.toThrow('Data de vigência final deve ser igual ou posterior à data inicial.');
    expect(repository.criarContrato).not.toHaveBeenCalled();
  });

  it('aceita vigência final igual à inicial', async () => {
    const repository = makeRepository({ criarContrato: vi.fn().mockResolvedValue('id') });
    const useCase = new CriarContratoUseCase(repository);

    await expect(
      useCase.execute({ ...inputValido, vigenciaFinal: '2026-01-01' }),
    ).resolves.toBe('id');
  });

  it('lança erro quando tipo_prazo_entrega é inválido', async () => {
    const repository = makeRepository({ criarContrato: vi.fn() });
    const useCase = new CriarContratoUseCase(repository);

    await expect(
      useCase.execute({ ...inputValido, tipoPrazoEntrega: 'INVALIDO' as 'UTEIS' }),
    ).rejects.toThrow('Tipo de prazo de entrega inválido.');
  });

  it('lança erro quando tipo_prazo_pagamento é inválido', async () => {
    const repository = makeRepository({ criarContrato: vi.fn() });
    const useCase = new CriarContratoUseCase(repository);

    await expect(
      useCase.execute({ ...inputValido, tipoPrazoPagamento: 'INVALIDO' as 'CORRIDOS' }),
    ).rejects.toThrow('Tipo de prazo de pagamento inválido.');
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      criarContrato: vi.fn().mockRejectedValue(new Error('Acesso negado ao licitante informado.')),
    });
    const useCase = new CriarContratoUseCase(repository);

    await expect(useCase.execute(inputValido)).rejects.toThrow('Acesso negado ao licitante informado.');
  });
});
