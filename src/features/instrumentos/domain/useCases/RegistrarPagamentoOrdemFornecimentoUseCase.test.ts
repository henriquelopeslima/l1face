import { describe, it, expect, vi } from 'vitest';
import { RegistrarPagamentoOrdemFornecimentoUseCase } from './RegistrarPagamentoOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { RegistrarPagamentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';

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
  status: 'pago',
  dataRecebimento: '2026-06-04',
  dataEntrega: '2026-06-10',
  dataLiquidacao: '2026-06-15',
  prazoPagamento: '2026-07-15',
  dataPagamentoEfetivo: '2026-07-10',
  statusPagamento: 'pago',
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

const inputRegistrarPagamento: RegistrarPagamentoInput = {
  id: 'of-uuid-001',
  dataPagamentoEfetivo: '2026-07-10',
};

describe('RegistrarPagamentoOrdemFornecimentoUseCase', () => {
  it('registra pagamento da ordem de fornecimento e retorna OF atualizada', async () => {
    const repository = makeRepository({
      registrarPagamentoOrdemFornecimento: vi.fn().mockResolvedValue(ordemFornecimentoMock),
    });
    const useCase = new RegistrarPagamentoOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(inputRegistrarPagamento);

    expect(result).toEqual(ordemFornecimentoMock);
    expect(repository.registrarPagamentoOrdemFornecimento).toHaveBeenCalledWith(inputRegistrarPagamento);
    expect(repository.registrarPagamentoOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      registrarPagamentoOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Falha ao registrar pagamento.')),
    });
    const useCase = new RegistrarPagamentoOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(inputRegistrarPagamento)).rejects.toThrow('Falha ao registrar pagamento.');
    expect(repository.registrarPagamentoOrdemFornecimento).toHaveBeenCalledWith(inputRegistrarPagamento);
  });
});
