import { describe, it, expect, vi } from 'vitest';
import { IniciarSeparacaoOrdemFornecimentoUseCase } from './IniciarSeparacaoOrdemFornecimentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { IniciarSeparacaoInput, OrdemFornecimento } from '../entities/instrumentoContratual';

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
  status: 'em_separacao',
  dataRecebimento: '2026-06-15',
  prazoEntrega: '2026-07-15',
  dataSeparacao: '2026-06-16',
  dataDespacho: null,
  codigoRastreio: null,
  numeroNfDespacho: null,
  dataEntrega: null,
  prazoPagamento: null,
  dataLiquidacao: null,
  dataPagamentoEfetivo: null,
  statusPagamento: null,
  numeroNfe: null,
  valorTotal: 5000.0,
  itens: [],
  criadoEm: '2026-06-15T10:00:00Z',
};

const input: IniciarSeparacaoInput = {
  id: 'of-uuid-001',
  dataSeparacao: '2026-06-16',
};

describe('IniciarSeparacaoOrdemFornecimentoUseCase', () => {
  it('inicia separação e retorna OF atualizada', async () => {
    const repository = makeRepository({
      iniciarSeparacaoOrdemFornecimento: vi.fn().mockResolvedValue(ofMock),
    });
    const useCase = new IniciarSeparacaoOrdemFornecimentoUseCase(repository);

    const result = await useCase.execute(input);

    expect(result).toEqual(ofMock);
    expect(repository.iniciarSeparacaoOrdemFornecimento).toHaveBeenCalledWith(input);
    expect(repository.iniciarSeparacaoOrdemFornecimento).toHaveBeenCalledTimes(1);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      iniciarSeparacaoOrdemFornecimento: vi.fn().mockRejectedValue(new Error('Operação não permitida para o status atual desta ordem.')),
    });
    const useCase = new IniciarSeparacaoOrdemFornecimentoUseCase(repository);

    await expect(useCase.execute(input)).rejects.toThrow('Operação não permitida para o status atual desta ordem.');
  });
});
