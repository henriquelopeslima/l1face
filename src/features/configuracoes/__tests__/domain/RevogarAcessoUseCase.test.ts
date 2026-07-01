import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RevogarAcessoUseCase } from '../../domain/usecases/RevogarAcessoUseCase';
import type { IUsuarioLicitanteRepository } from '../../domain/repositories';

describe('RevogarAcessoUseCase', () => {
  let mockRepository: IUsuarioLicitanteRepository;
  let useCase: RevogarAcessoUseCase;

  beforeEach(() => {
    mockRepository = {
      listar: vi.fn(),
      revogar: vi.fn(),
    };
    useCase = new RevogarAcessoUseCase(mockRepository);
  });

  it('deve chamar repositório com licitanteId e userId corretos', async () => {
    vi.mocked(mockRepository.revogar).mockResolvedValueOnce(undefined);

    await useCase.execute('licitante-1', 'user-1');

    expect(mockRepository.revogar).toHaveBeenCalledWith('licitante-1', 'user-1');
    expect(mockRepository.revogar).toHaveBeenCalledTimes(1);
  });

  it('deve resolver sem valor em caso de sucesso', async () => {
    vi.mocked(mockRepository.revogar).mockResolvedValueOnce(undefined);

    await expect(useCase.execute('licitante-1', 'user-1')).resolves.toBeUndefined();
  });

  it('deve propagar erro 403 do repositório', async () => {
    vi.mocked(mockRepository.revogar).mockRejectedValueOnce(
      new Error('Apenas administradores podem revogar acessos.')
    );

    await expect(useCase.execute('licitante-1', 'user-1')).rejects.toThrow(
      'Apenas administradores podem revogar acessos.'
    );
  });

  it('deve propagar erro 409 do repositório', async () => {
    vi.mocked(mockRepository.revogar).mockRejectedValueOnce(
      new Error('Não é possível remover o último administrador.')
    );

    await expect(useCase.execute('licitante-1', 'user-1')).rejects.toThrow(
      'Não é possível remover o último administrador.'
    );
  });

  it('deve propagar erro 404 do repositório', async () => {
    vi.mocked(mockRepository.revogar).mockRejectedValueOnce(new Error('Vínculo não encontrado.'));

    await expect(useCase.execute('licitante-1', 'user-1')).rejects.toThrow(
      'Vínculo não encontrado.'
    );
  });
});
