import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { CriarEmpenhoInput } from '../../domain/entities/criarContrato';

const { mockCriarEmpenhoExecute, mockUploadExecute } = vi.hoisted(() => ({
  mockCriarEmpenhoExecute: vi.fn(),
  mockUploadExecute: vi.fn(),
}));

vi.mock('../../data/repositories/InstrumentosRepository', () => ({
  InstrumentosRepository: class {},
}));

vi.mock('../../domain/useCases/CriarEmpenhoUseCase', () => ({
  CriarEmpenhoUseCase: class {
    execute = mockCriarEmpenhoExecute;
  },
}));

vi.mock('../../domain/useCases/UploadAnexoEmpenhoUseCase', () => ({
  UploadAnexoEmpenhoUseCase: class {
    execute = mockUploadExecute;
  },
}));

import { useCriarEmpenho } from './useCriarEmpenho';

const inputFixture: CriarEmpenhoInput = {
  numero: '2026.000123',
  orgaoContratante: 'Prefeitura Municipal',
  unidade: 'Secretaria de Saúde',
  objeto: 'Aquisição de insumos médicos',
};

function makeFile(): File {
  return new File([new Blob(['%PDF-1.4'], { type: 'application/pdf' })], 'anexo.pdf', { type: 'application/pdf' });
}

describe('useCriarEmpenho', () => {
  beforeEach(() => {
    mockCriarEmpenhoExecute.mockReset();
    mockUploadExecute.mockReset();
  });

  it('cria o empenho sem arquivo: não tenta upload e anexoFalhouUpload permanece false', async () => {
    mockCriarEmpenhoExecute.mockResolvedValue('empenho-uuid-456');
    const { result } = renderHook(() => useCriarEmpenho());

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture);
    });

    expect(retorno).toBe('empenho-uuid-456');
    expect(mockUploadExecute).not.toHaveBeenCalled();
    expect(result.current.anexoFalhouUpload).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cria o empenho com arquivo e upload bem-sucedido: anexoFalhouUpload permanece false', async () => {
    mockCriarEmpenhoExecute.mockResolvedValue('empenho-uuid-456');
    mockUploadExecute.mockResolvedValue({ anexoUrl: 'https://example.com/anexo.pdf' });
    const { result } = renderHook(() => useCriarEmpenho());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture, arquivo);
    });

    expect(retorno).toBe('empenho-uuid-456');
    expect(mockUploadExecute).toHaveBeenCalledWith('empenho-uuid-456', arquivo);
    expect(result.current.anexoFalhouUpload).toBe(false);
  });

  it('cria o empenho com sucesso mas upload falha: retorna o id normalmente e sinaliza anexoFalhouUpload', async () => {
    mockCriarEmpenhoExecute.mockResolvedValue('empenho-uuid-456');
    mockUploadExecute.mockRejectedValue(new Error('Erro ao enviar anexo. Tente novamente.'));
    const { result } = renderHook(() => useCriarEmpenho());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture, arquivo);
    });

    expect(retorno).toBe('empenho-uuid-456');
    expect(result.current.anexoFalhouUpload).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('falha na criação: retorna null, seta error, e nunca tenta o upload', async () => {
    mockCriarEmpenhoExecute.mockRejectedValue(new Error('Acesso negado ao licitante informado.'));
    const { result } = renderHook(() => useCriarEmpenho());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture, arquivo);
    });

    expect(retorno).toBeNull();
    expect(result.current.error).toBe('Acesso negado ao licitante informado.');
    expect(mockUploadExecute).not.toHaveBeenCalled();
    expect(result.current.anexoFalhouUpload).toBe(false);
  });
});
