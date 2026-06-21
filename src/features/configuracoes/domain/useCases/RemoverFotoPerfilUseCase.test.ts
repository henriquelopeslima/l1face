import { describe, expect, it, vi } from 'vitest';
import type { IPerfilRepository } from '../repositories/IPerfilRepository';
import { PerfilError } from '../errors/perfilErrors';
import { RemoverFotoPerfilUseCase } from './RemoverFotoPerfilUseCase';

describe('RemoverFotoPerfilUseCase', () => {
  it('chama repository.removerFoto com sucesso', async () => {
    const repository: IPerfilRepository = {
      uploadFoto: vi.fn(),
      removerFoto: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RemoverFotoPerfilUseCase(repository);
    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(repository.removerFoto).toHaveBeenCalledOnce();
  });

  it('propaga PerfilError em caso de falha', async () => {
    const repository: IPerfilRepository = {
      uploadFoto: vi.fn(),
      removerFoto: vi.fn().mockRejectedValue(new PerfilError('Serviço indisponível.')),
    };
    const useCase = new RemoverFotoPerfilUseCase(repository);
    await expect(useCase.execute()).rejects.toThrow(PerfilError);
  });
});
