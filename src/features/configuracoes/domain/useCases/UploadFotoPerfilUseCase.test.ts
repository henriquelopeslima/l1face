import { describe, expect, it, vi } from 'vitest';
import type { IPerfilRepository } from '../repositories/IPerfilRepository';
import { ArquivoMuitoGrandeError, FormatoInvalidoError } from '../errors/perfilErrors';
import { UploadFotoPerfilUseCase } from './UploadFotoPerfilUseCase';

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

const mockRepository: IPerfilRepository = {
  uploadFoto: vi.fn().mockResolvedValue({ fotoUrl: 'https://example.com/foto.jpg' }),
  removerFoto: vi.fn().mockResolvedValue(undefined),
};

describe('UploadFotoPerfilUseCase', () => {
  it('retorna FotoPerfilResult para arquivo JPEG válido', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('foto.jpg', 'image/jpeg', 1024);
    const result = await useCase.execute(arquivo);
    expect(result.fotoUrl).toBe('https://example.com/foto.jpg');
    expect(mockRepository.uploadFoto).toHaveBeenCalledWith(arquivo);
  });

  it('retorna FotoPerfilResult para arquivo PNG válido', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('foto.png', 'image/png', 2048);
    await expect(useCase.execute(arquivo)).resolves.toMatchObject({ fotoUrl: expect.any(String) });
  });

  it('lança FormatoInvalidoError para tipo não suportado', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('doc.pdf', 'application/pdf', 1024);
    await expect(useCase.execute(arquivo)).rejects.toThrow(FormatoInvalidoError);
  });

  it('lança FormatoInvalidoError para GIF', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('anim.gif', 'image/gif', 512);
    await expect(useCase.execute(arquivo)).rejects.toThrow(FormatoInvalidoError);
  });

  it('lança ArquivoMuitoGrandeError para arquivo acima de 5 MB', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('grande.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1);
    await expect(useCase.execute(arquivo)).rejects.toThrow(ArquivoMuitoGrandeError);
  });

  it('aceita arquivo exatamente no limite de 5 MB', async () => {
    const useCase = new UploadFotoPerfilUseCase(mockRepository);
    const arquivo = makeFile('limite.jpg', 'image/jpeg', 5 * 1024 * 1024);
    await expect(useCase.execute(arquivo)).resolves.toBeDefined();
  });
});
