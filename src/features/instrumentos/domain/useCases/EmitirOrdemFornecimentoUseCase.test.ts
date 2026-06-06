import { describe, it, expect, vi } from 'vitest';
import { EmitirOrdemFornecimentoUseCase } from './EmitirOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { EmitirOrdemFornecimentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';

const makeRepository = (overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository => ({
  consultarContratoPncp: vi.fn(),
  listarInstrumentos: vi.fn(),
  criarContrato: vi.fn(),
  criarEmpenho: vi.fn(),
  buscarInstrumento: vi.fn(),
  listarOrdensFornecimento: vi.fn(),
  emitirOrdemFornecimento: vi.fn(),
  avancarStatusOrdemFornecimento: vi.fn(),
  registrarLiquidacaoOrdemFornecimento: vi.fn(),
  registrarPagamentoOrdemFornecimento: vi.fn(),
  ...overrides,
} as IInstrumentosRepository);

const ordemFornecimentoMock: OrdemFornecimento = {
  id: 'of-uuid-001',
  codigo: 1,
  instrumentoId: 'instrumento-uuid-001',
  status: 'pedido_recebido',
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

const inputEmitir: EmitirOrdemFornecimentoInput = {
  instrumentoId: 'instrumento-uuid-001',
  itens: [
    {
      itemInstrumentoId: 'item-instrumento-uuid-001',
      quantidadeFornecida: 100,
      valorUnitario: 50.0,
    },
  ],
};

describe('EmitirOrdemFornecimentoUseCase', () => {
  it('emite ordem de fornecimento e retorna OF criada', async () => {
    const repository = makeRepository({
      emitirOrdemFornecimento: vi.fn().mockResolvedValue(ordemFornecimentoMock),
    });
    const useCase = new EmitirOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(inputEmitir);

    expect(result).toEqual(ordemFornecimentoMock);
    expect(repository.emitirOrdemFornecimento).toHaveBeenCalledWith(inputEmitir);
    expect(repository.emitirOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      emitirOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Saldo do instrumento insuficiente para emitir esta OF.')),
    });
    const useCase = new EmitirOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(inputEmitir)).rejects.toThrow('Saldo do instrumento insuficiente para emitir esta OF.');
    expect(repository.emitirOrdemFornecimento).toHaveBeenCalledWith(inputEmitir);
  });
});
