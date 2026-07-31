import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { InstrumentoDetalhe } from '../../domain/entities/instrumentoContratual';

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock('../../data/repositories/InstrumentosRepository', () => ({
  InstrumentosRepository: class {},
}));

vi.mock('../../domain/useCases/BuscarInstrumentoUseCase', () => ({
  BuscarInstrumentoUseCase: class {
    execute = mockExecute;
  },
}));

import { useBuscarInstrumento } from './useBuscarInstrumento';

const instrumentoFixture: InstrumentoDetalhe = {
  instrumentoId: 'instrumento-1',
  licitanteId: 'licitante-1',
  ataId: null,
  criadoEm: '2026-01-15T10:30:00+00:00',
  tipo: 'CONTRATO',
  contrato: {
    id: 'contrato-1',
    numeroPncp: null,
    numero: 'CT-001/2026',
    orgaoContratante: 'Órgão Teste',
    unidade: 'Unidade Teste',
    objeto: 'Objeto Teste',
    vigenciaInicial: '2026-01-01',
    vigenciaFinal: '2026-12-31',
    endereco: null,
    prazoEntrega: null,
    tipoPrazoEntrega: null,
    prazoPagamento: null,
    tipoPrazoPagamento: null,
    enderecoEntrega: null,
    renovavel: false,
    anexoUrl: null,
    status: 'ATIVA',
    criadoEm: '2026-01-15T10:30:00+00:00',
  },
  empenho: null,
  itens: [
    {
      id: 'item-1',
      descricao: 'Item Teste',
      unidadeMedida: 'UN',
      quantidadeTotal: 100,
      quantidadeDisponivel: 70,
      valorUnitario: 10,
      valorTotal: 1000,
    },
  ],
};

describe('useBuscarInstrumento', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it('mostra isLoading durante o carregamento inicial', async () => {
    mockExecute.mockResolvedValue(instrumentoFixture);

    const { result } = renderHook(() => useBuscarInstrumento('instrumento-1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.instrumento).toEqual(instrumentoFixture);
  });

  it('refetchSilencioso atualiza os dados sem alternar isLoading', async () => {
    mockExecute.mockResolvedValue(instrumentoFixture);
    const { result } = renderHook(() => useBuscarInstrumento('instrumento-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const atualizado: InstrumentoDetalhe = {
      ...instrumentoFixture,
      itens: [{ ...instrumentoFixture.itens[0]!, quantidadeDisponivel: 40 }],
    };
    mockExecute.mockResolvedValue(atualizado);

    result.current.refetchSilencioso();

    // isLoading nunca deve virar true durante um refetch silencioso
    expect(result.current.isLoading).toBe(false);
    await waitFor(() => expect(result.current.instrumento?.itens[0]?.quantidadeDisponivel).toBe(40));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('refetchSilencioso ignora falhas silenciosamente, preservando os dados anteriores', async () => {
    mockExecute.mockResolvedValue(instrumentoFixture);
    const { result } = renderHook(() => useBuscarInstrumento('instrumento-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockExecute.mockRejectedValue(new Error('Falha de rede'));
    result.current.refetchSilencioso();

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(2));
    expect(result.current.error).toBeNull();
    expect(result.current.instrumento).toEqual(instrumentoFixture);
  });

  it('refetch (não silencioso) mostra isLoading e reporta erro em caso de falha', async () => {
    mockExecute.mockResolvedValue(instrumentoFixture);
    const { result } = renderHook(() => useBuscarInstrumento('instrumento-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockExecute.mockRejectedValue(new Error('Falha de rede'));
    result.current.refetch();

    await waitFor(() => expect(result.current.error).toBe('Falha de rede'));
    expect(result.current.isLoading).toBe(false);
  });
});
