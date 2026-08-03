import { describe, expect, it, vi } from 'vitest';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import { ArquivoMuitoGrandeAnexoError, FormatoInvalidoAnexoError } from '../errors/ataErrors';
import { UploadAnexoAtaUseCase } from './UploadAnexoAtaUseCase';

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn(),
    listarAtasPaginado: vi.fn(),
    getAta: vi.fn(),
    criarAta: vi.fn(),
    consultarAtaPncp: vi.fn(),
    uploadAnexo: vi.fn().mockResolvedValue({ anexoUrl: 'https://example.com/atas/anexo.pdf' }),
    removerAnexo: vi.fn(),
    ...overrides,
  } as IAtasRepository;
}

describe('UploadAnexoAtaUseCase', () => {
  it('retorna AnexoAtaResult para PDF válido', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoAtaUseCase(repo);
    const arquivo = makeFile('anexo.pdf', 'application/pdf', 1024);
    const result = await useCase.execute('ata-1', arquivo);
    expect(result).toEqual({ anexoUrl: 'https://example.com/atas/anexo.pdf' });
    expect(repo.uploadAnexo).toHaveBeenCalledWith('ata-1', arquivo);
  });

  it('lança FormatoInvalidoAnexoError para tipo diferente de application/pdf', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoAtaUseCase(repo);
    const arquivo = makeFile('foto.jpg', 'image/jpeg', 1024);
    await expect(useCase.execute('ata-1', arquivo)).rejects.toThrow(FormatoInvalidoAnexoError);
    expect(repo.uploadAnexo).not.toHaveBeenCalled();
  });

  it('lança ArquivoMuitoGrandeAnexoError para arquivo acima de 10 MB', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoAtaUseCase(repo);
    const arquivo = makeFile('grande.pdf', 'application/pdf', 10 * 1024 * 1024 + 1);
    await expect(useCase.execute('ata-1', arquivo)).rejects.toThrow(ArquivoMuitoGrandeAnexoError);
    expect(repo.uploadAnexo).not.toHaveBeenCalled();
  });

  it('aceita arquivo exatamente no limite de 10 MB', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoAtaUseCase(repo);
    const arquivo = makeFile('limite.pdf', 'application/pdf', 10 * 1024 * 1024);
    await expect(useCase.execute('ata-1', arquivo)).resolves.toBeDefined();
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repo = makeRepo({
      uploadAnexo: vi.fn().mockRejectedValue(new Error('Serviço indisponível. Verifique sua conexão e tente novamente.')),
    });
    const useCase = new UploadAnexoAtaUseCase(repo);
    const arquivo = makeFile('anexo.pdf', 'application/pdf', 1024);
    await expect(useCase.execute('ata-1', arquivo)).rejects.toThrow('Serviço indisponível. Verifique sua conexão e tente novamente.');
  });
});
