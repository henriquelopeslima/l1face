import { describe, expect, it, vi } from 'vitest';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import { ArquivoMuitoGrandeAnexoError, FormatoInvalidoAnexoError } from '../errors/instrumentosErrors';
import { UploadAnexoEmpenhoUseCase } from './UploadAnexoEmpenhoUseCase';

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

function makeRepo(overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository {
  return {
    consultarContratoPncp: vi.fn(),
    listarInstrumentos: vi.fn(),
    criarContrato: vi.fn(),
    criarEmpenho: vi.fn(),
    buscarInstrumento: vi.fn(),
    listarOrdensFornecimento: vi.fn(),
    uploadAnexoContrato: vi.fn(),
    removerAnexoContrato: vi.fn(),
    uploadAnexoEmpenho: vi.fn().mockResolvedValue({ anexoUrl: 'https://example.com/instrumentos/empenhos/anexo.pdf' }),
    removerAnexoEmpenho: vi.fn(),
    ...overrides,
  } as IInstrumentosRepository;
}

describe('UploadAnexoEmpenhoUseCase', () => {
  it('retorna AnexoInstrumentoResult para PDF válido', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoEmpenhoUseCase(repo);
    const arquivo = makeFile('anexo.pdf', 'application/pdf', 1024);
    const result = await useCase.execute('instrumento-1', arquivo);
    expect(result).toEqual({ anexoUrl: 'https://example.com/instrumentos/empenhos/anexo.pdf' });
    expect(repo.uploadAnexoEmpenho).toHaveBeenCalledWith('instrumento-1', arquivo);
  });

  it('lança FormatoInvalidoAnexoError para tipo diferente de application/pdf', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoEmpenhoUseCase(repo);
    const arquivo = makeFile('foto.jpg', 'image/jpeg', 1024);
    await expect(useCase.execute('instrumento-1', arquivo)).rejects.toThrow(FormatoInvalidoAnexoError);
    expect(repo.uploadAnexoEmpenho).not.toHaveBeenCalled();
  });

  it('lança ArquivoMuitoGrandeAnexoError para arquivo acima de 10 MB', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoEmpenhoUseCase(repo);
    const arquivo = makeFile('grande.pdf', 'application/pdf', 10 * 1024 * 1024 + 1);
    await expect(useCase.execute('instrumento-1', arquivo)).rejects.toThrow(ArquivoMuitoGrandeAnexoError);
    expect(repo.uploadAnexoEmpenho).not.toHaveBeenCalled();
  });

  it('aceita arquivo exatamente no limite de 10 MB', async () => {
    const repo = makeRepo();
    const useCase = new UploadAnexoEmpenhoUseCase(repo);
    const arquivo = makeFile('limite.pdf', 'application/pdf', 10 * 1024 * 1024);
    await expect(useCase.execute('instrumento-1', arquivo)).resolves.toBeDefined();
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repo = makeRepo({
      uploadAnexoEmpenho: vi.fn().mockRejectedValue(new Error('Instrumento não encontrado.')),
    });
    const useCase = new UploadAnexoEmpenhoUseCase(repo);
    const arquivo = makeFile('anexo.pdf', 'application/pdf', 1024);
    await expect(useCase.execute('instrumento-1', arquivo)).rejects.toThrow('Instrumento não encontrado.');
  });
});
