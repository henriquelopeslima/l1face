import { describe, it, expect, vi } from 'vitest';
import { AvancarStatusOrdemFornecimentoUseCase } from './AvancarStatusOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { AvancarStatusOrdemFornecimentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  avancarStatusOrdemFornecimento: vi.fn(),
  ...overrides,
});

const ordemFornecimentoMock: OrdemFornecimento = {
  id: 'of-uuid-001',
  codigo: 1,
  instrumentoId: 'instrumento-uuid-001',
  status: 'em_separacao',
  dataRecebimento: '2026-06-04',
  dataEntrega: null,
  dataLiquidacao: null,
  prazoPagamento: null,
  dataPagamentoEfetivo: null,
  statusPagamento: null,
  numeroNfe: null,
  valorTotal: 5000.0,
  itens: [
    {
      id: 'item-of-uuid-001',
      itemInstrumentoId: 'item-instrumento-uuid-001',
      descricao: 'Luva M',
      unidadeMedida: 'CX',
      quantidadeFornecida: 100,
      valorUnitario: 50.0,
      valorTotal: 5000.0,
    },
  ],
  criadoEm: '2026-06-04T10:00:00Z',
};

const inputAvancarParaSeparacao: AvancarStatusOrdemFornecimentoInput = {
  id: 'of-uuid-001',
  status: 'em_separacao',
};

describe('AvancarStatusOrdemFornecimentoUseCase', () => {
  it('avança status da ordem de fornecimento e retorna OF atualizada', async () => {
    const repository = makeRepository({
      avancarStatusOrdemFornecimento: vi.fn().mockResolvedValue(ordemFornecimentoMock),
    });
    const useCase = new AvancarStatusOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(inputAvancarParaSeparacao);

    expect(result).toEqual(ordemFornecimentoMock);
    expect(repository.avancarStatusOrdemFornecimento).toHaveBeenCalledWith(inputAvancarParaSeparacao);
    expect(repository.avancarStatusOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      avancarStatusOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Transição de status inválida.')),
    });
    const useCase = new AvancarStatusOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(inputAvancarParaSeparacao)).rejects.toThrow('Transição de status inválida.');
    expect(repository.avancarStatusOrdemFornecimento).toHaveBeenCalledWith(inputAvancarParaSeparacao);
  });
});
