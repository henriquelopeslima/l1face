import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { CriarContratoInput } from '../../domain/entities/criarContrato';

const { mockCriarContratoExecute, mockUploadExecute } = vi.hoisted(() => ({
  mockCriarContratoExecute: vi.fn(),
  mockUploadExecute: vi.fn(),
}));

vi.mock('../../data/repositories/InstrumentosRepository', () => ({
  InstrumentosRepository: class {},
}));

vi.mock('../../domain/useCases/CriarContratoUseCase', () => ({
  CriarContratoUseCase: class {
    execute = mockCriarContratoExecute;
  },
}));

vi.mock('../../domain/useCases/UploadAnexoContratoUseCase', () => ({
  UploadAnexoContratoUseCase: class {
    execute = mockUploadExecute;
  },
}));

import { useCriarContrato } from './useCriarContrato';

const inputFixture: CriarContratoInput = {
  numero: '001/2026',
  orgaoContratante: 'Prefeitura Municipal',
  unidade: 'Secretaria de Educação',
  objeto: 'Fornecimento de material escolar',
  vigenciaInicial: '2026-01-01',
  vigenciaFinal: '2026-12-31',
  renovavel: false,
};

function makeFile(): File {
  return new File([new Blob(['%PDF-1.4'], { type: 'application/pdf' })], 'anexo.pdf', { type: 'application/pdf' });
}

describe('useCriarContrato', () => {
  beforeEach(() => {
    mockCriarContratoExecute.mockReset();
    mockUploadExecute.mockReset();
  });

  it('cria o contrato sem arquivo: não tenta upload e anexoFalhouUpload permanece false', async () => {
    mockCriarContratoExecute.mockResolvedValue('instrumento-uuid-123');
    const { result } = renderHook(() => useCriarContrato());

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture);
    });

    expect(retorno).toBe('instrumento-uuid-123');
    expect(mockUploadExecute).not.toHaveBeenCalled();
    expect(result.current.anexoFalhouUpload).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cria o contrato com arquivo e upload bem-sucedido: anexoFalhouUpload permanece false', async () => {
    mockCriarContratoExecute.mockResolvedValue('instrumento-uuid-123');
    mockUploadExecute.mockResolvedValue({ anexoUrl: 'https://example.com/anexo.pdf' });
    const { result } = renderHook(() => useCriarContrato());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture, arquivo);
    });

    expect(retorno).toBe('instrumento-uuid-123');
    expect(mockUploadExecute).toHaveBeenCalledWith('instrumento-uuid-123', arquivo);
    expect(result.current.anexoFalhouUpload).toBe(false);
  });

  it('cria o contrato com sucesso mas upload falha: retorna o id normalmente e sinaliza anexoFalhouUpload', async () => {
    mockCriarContratoExecute.mockResolvedValue('instrumento-uuid-123');
    mockUploadExecute.mockRejectedValue(new Error('Erro ao enviar anexo. Tente novamente.'));
    const { result } = renderHook(() => useCriarContrato());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criar(inputFixture, arquivo);
    });

    expect(retorno).toBe('instrumento-uuid-123');
    expect(result.current.anexoFalhouUpload).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('falha na criação: retorna null, seta error, e nunca tenta o upload', async () => {
    mockCriarContratoExecute.mockRejectedValue(new Error('Acesso negado ao licitante informado.'));
    const { result } = renderHook(() => useCriarContrato());
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
