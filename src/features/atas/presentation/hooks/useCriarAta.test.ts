import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { CriarAtaInput } from '../../domain/entities/criarAta';
import { AtaError } from '../../domain/errors/ataErrors';

const { mockCriarAtaExecute, mockUploadExecute } = vi.hoisted(() => ({
  mockCriarAtaExecute: vi.fn(),
  mockUploadExecute: vi.fn(),
}));

vi.mock('../../data/repositories/AtasRepository', () => ({
  AtasRepository: class {},
}));

vi.mock('../../domain/usecases/CriarAtaUseCase', () => ({
  CriarAtaUseCase: class {
    execute = mockCriarAtaExecute;
  },
}));

vi.mock('../../domain/usecases/UploadAnexoAtaUseCase', () => ({
  UploadAnexoAtaUseCase: class {
    execute = mockUploadExecute;
  },
}));

import { useCriarAta } from './useCriarAta';

const inputFixture: CriarAtaInput = {
  numero: '001/2026',
  descricao: 'AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR',
  cnpjOrgaoGerenciador: '00360305000104',
  nomeOrgaoGerenciador: 'Ministério da Fazenda',
  dataInicioVigencia: '2026-01-01',
  dataFimVigencia: '2026-12-31',
  aceitaAdesao: false,
  renovavel: false,
  numeroPncp: null,
  itens: [],
};

const ataCriadaFixture = { id: '550e8400-e29b-41d4-a716-446655440010' };

function makeFile(): File {
  return new File([new Blob(['%PDF-1.4'], { type: 'application/pdf' })], 'anexo.pdf', { type: 'application/pdf' });
}

describe('useCriarAta', () => {
  beforeEach(() => {
    mockCriarAtaExecute.mockReset();
    mockUploadExecute.mockReset();
  });

  it('cria a ata sem arquivo: não tenta upload e anexoFalhouUpload permanece false', async () => {
    mockCriarAtaExecute.mockResolvedValue(ataCriadaFixture);
    const { result } = renderHook(() => useCriarAta());

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criarAta(inputFixture);
    });

    expect(retorno).toEqual(ataCriadaFixture);
    expect(mockUploadExecute).not.toHaveBeenCalled();
    expect(result.current.anexoFalhouUpload).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('cria a ata com arquivo e upload bem-sucedido: anexoFalhouUpload permanece false', async () => {
    mockCriarAtaExecute.mockResolvedValue(ataCriadaFixture);
    mockUploadExecute.mockResolvedValue({ anexoUrl: 'https://example.com/anexo.pdf' });
    const { result } = renderHook(() => useCriarAta());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criarAta(inputFixture, arquivo);
    });

    expect(retorno).toEqual(ataCriadaFixture);
    expect(mockUploadExecute).toHaveBeenCalledWith(ataCriadaFixture.id, arquivo);
    expect(result.current.anexoFalhouUpload).toBe(false);
  });

  it('cria a ata com sucesso mas upload falha: retorna a ata normalmente e sinaliza anexoFalhouUpload', async () => {
    mockCriarAtaExecute.mockResolvedValue(ataCriadaFixture);
    mockUploadExecute.mockRejectedValue(new Error('Erro ao enviar anexo. Tente novamente.'));
    const { result } = renderHook(() => useCriarAta());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criarAta(inputFixture, arquivo);
    });

    expect(retorno).toEqual(ataCriadaFixture);
    expect(result.current.anexoFalhouUpload).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('falha na criação: retorna null, seta error, e nunca tenta o upload', async () => {
    mockCriarAtaExecute.mockRejectedValue(new AtaError('Sessão expirada. Faça login novamente.'));
    const { result } = renderHook(() => useCriarAta());
    const arquivo = makeFile();

    let retorno: unknown;
    await act(async () => {
      retorno = await result.current.criarAta(inputFixture, arquivo);
    });

    expect(retorno).toBeNull();
    expect(result.current.error).toBe('Sessão expirada. Faça login novamente.');
    expect(mockUploadExecute).not.toHaveBeenCalled();
    expect(result.current.anexoFalhouUpload).toBe(false);
  });

  it('isLoading volta a false após a execução (sucesso ou falha)', async () => {
    mockCriarAtaExecute.mockResolvedValue(ataCriadaFixture);
    const { result } = renderHook(() => useCriarAta());

    await act(async () => {
      await result.current.criarAta(inputFixture);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
