import { describe, it, expect, vi } from 'vitest';
import { ConfirmarEntregaOrdemFornecimentoUseCase } from './ConfirmarEntregaOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { ConfirmarEntregaInput, OrdemFornecimento } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  emitirOrdemFornecimento: vi.fn(),
  iniciarSeparacaoOrdemFornecimento: vi.fn(),
  registrarDespachoOrdemFornecimento: vi.fn(),
  confirmarEntregaOrdemFornecimento: vi.fn(),
  registrarLiquidacaoOrdemFornecimento: vi.fn(),
  registrarPagamentoOrdemFornecimento: vi.fn(),
  ...overrides,
} as IInstrumentosRepository);

const ofMock: OrdemFornecimento = {
  id: 'of-uuid-001',
  codigo: 1,
  instrumentoId: 'instrumento-uuid-001',
  status: 'entregue',
  dataRecebimento: '2026-06-15',
  prazoEntrega: '2026-07-15',
  dataSeparacao: '2026-06-16',
  dataDespacho: '2026-06-20',
  codigoRastreio: null,
  numeroNfDespacho: null,
  dataEntrega: '2026-07-10',
  prazoPagamento: '2026-08-09',
  dataLiquidacao: null,
  dataPagamentoEfetivo: null,
  statusPagamento: 'pendente',
  numeroNfe: null,
  valorTotal: 5000.0,
  itens: [],
  criadoEm: '2026-06-15T10:00:00Z',
};

const input: ConfirmarEntregaInput = {
  id: 'of-uuid-001',
  dataEntrega: '2026-07-10',
  prazoPagamento: '2026-08-09',
};

describe('ConfirmarEntregaOrdemFornecimentoUseCase', () => {
  it('confirma entrega e retorna OF atualizada com status pendente', async () => {
    const repository = makeRepository({
      confirmarEntregaOrdemFornecimento: vi.fn().mockResolvedValue(ofMock),
    });
    const useCase = new ConfirmarEntregaOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(input);

    expect(result).toEqual(ofMock);
    expect(repository.confirmarEntregaOrdemFornecimento).toHaveBeenCalledWith(input);
    expect(repository.confirmarEntregaOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      confirmarEntregaOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Operação não permitida para o status atual desta ordem.')),
    });
    const useCase = new ConfirmarEntregaOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(input)).rejects.toThrow('Operação não permitida para o status atual desta ordem.');
  });
});
