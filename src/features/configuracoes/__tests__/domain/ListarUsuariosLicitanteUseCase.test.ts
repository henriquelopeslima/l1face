import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListarUsuariosLicitanteUseCase } from '../../domain/usecases/ListarUsuariosLicitanteUseCase';
import type { IUsuarioLicitanteRepository } from '../../domain/repositories';
import type { UsuarioLicitante } from '../../domain/entities';

const mockUsuario: UsuarioLicitante = {
  id: 'vinculo-1',
  userId: 'user-1',
  nomeCompleto: 'João Silva',
  email: 'joao@empresa.com.br',
  licitanteId: 'licitante-1',
  papel: 'ADMIN',
  criadoEm: '2026-01-15T10:30:00+00:00',
};

describe('ListarUsuariosLicitanteUseCase', () => {
  let mockRepository: IUsuarioLicitanteRepository;
  let useCase: ListarUsuariosLicitanteUseCase;

  beforeEach(() => {
    mockRepository = {
      listar: vi.fn(),
      revogar: vi.fn(),
    };
    useCase = new ListarUsuariosLicitanteUseCase(mockRepository);
  });

  it('deve retornar a lista de usuários do repositório', async () => {
    vi.mocked(mockRepository.listar).mockResolvedValueOnce([mockUsuario]);

    const result = await useCase.execute('licitante-1');

    expect(result).toEqual([mockUsuario]);
  });

  it('deve chamar o repositório com o licitanteId correto', async () => {
    vi.mocked(mockRepository.listar).mockResolvedValueOnce([]);

    await useCase.execute('licitante-abc');

    expect(mockRepository.listar).toHaveBeenCalledWith('licitante-abc');
    expect(mockRepository.listar).toHaveBeenCalledTimes(1);
  });

  it('deve retornar array vazio quando não há usuários', async () => {
    vi.mocked(mockRepository.listar).mockResolvedValueOnce([]);

    const result = await useCase.execute('licitante-1');

    expect(result).toEqual([]);
  });

  it('deve propagar exceção lançada pelo repositório', async () => {
    vi.mocked(mockRepository.listar).mockRejectedValueOnce(new Error('API_ERROR'));

    await expect(useCase.execute('licitante-1')).rejects.toThrow('API_ERROR');
  });
});
