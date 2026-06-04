import { describe, it, expect, vi } from 'vitest';
import { RegistrarLiquidacaoOrdemFornecimentoUseCase } from './RegistrarLiquidacaoOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { RegistrarLiquidacaoInput, OrdemFornecimento } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  avancarStatusOrdemFornecimento: vi.fn(),
  registrarLiquidacaoOrdemFornecimento: vi.fn(),
  registrarPagamentoOrdemFornecimento: vi.fn(),
  ...overrides,
});

const ordemFornecimentoMock: OrdemFornecimento = {
  id: 'of-uuid-001',
  codigo: 1,
  instrumentoId: 'instrumento-uuid-001',
  status: 'entregue',
  dataRecebimento: '2026-06-04',
  dataEntrega: '2026-06-10',
  dataLiquidacao: '2026-06-15',
  prazoPagamento: '2026-07-15',
  dataPagamentoEfetivo: null,
  statusPagamento: 'pendente',
  numeroNfe: 'NF-2026-001',
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

const inputRegistrarLiquidacao: RegistrarLiquidacaoInput = {
  id: 'of-uuid-001',
  dataLiquidacao: '2026-06-15',
  prazoPagamento: '2026-07-15',
  numeroNfe: 'NF-2026-001',
};

describe('RegistrarLiquidacaoOrdemFornecimentoUseCase', () => {
  it('registra liquidação da ordem de fornecimento e retorna OF atualizada', async () => {
    const repository = makeRepository({
      registrarLiquidacaoOrdemFornecimento: vi.fn().mockResolvedValue(ordemFornecimentoMock),
    });
    const useCase = new RegistrarLiquidacaoOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(inputRegistrarLiquidacao);

    expect(result).toEqual(ordemFornecimentoMock);
    expect(repository.registrarLiquidacaoOrdemFornecimento).toHaveBeenCalledWith(inputRegistrarLiquidacao);
    expect(repository.registrarLiquidacaoOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      registrarLiquidacaoOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Falha ao registrar liquidação.')),
    });
    const useCase = new RegistrarLiquidacaoOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(inputRegistrarLiquidacao)).rejects.toThrow('Falha ao registrar liquidação.');
    expect(repository.registrarLiquidacaoOrdemFornecimento).toHaveBeenCalledWith(inputRegistrarLiquidacao);
  });
});
