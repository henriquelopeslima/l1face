import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { UsuarioLicitante } from '../../domain/entities';

const { mockListarExecute, mockRevogarExecute } = vi.hoisted(() => ({
  mockListarExecute: vi.fn(),
  mockRevogarExecute: vi.fn(),
}));

vi.mock('@/features/auth/presentation/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../data/repositories/UsuarioLicitanteRepository', () => ({
  UsuarioLicitanteRepository: class {
    listar = vi.fn();
    revogar = vi.fn();
  },
}));

vi.mock('../../domain/usecases/ListarUsuariosLicitanteUseCase', () => ({
  ListarUsuariosLicitanteUseCase: class {
    execute = mockListarExecute;
  },
}));

vi.mock('../../domain/usecases/RevogarAcessoUseCase', () => ({
  RevogarAcessoUseCase: class {
    execute = mockRevogarExecute;
  },
}));

import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { useGestaoAcessos } from '../../presentation/hooks/useGestaoAcessos';

const mockUsuarios: UsuarioLicitante[] = [
  {
    id: 'vinculo-1',
    userId: 'user-1',
    nomeCompleto: 'João Silva',
    email: 'joao@empresa.com.br',
    licitanteId: 'licitante-1',
    papel: 'ADMIN',
    criadoEm: '2026-01-15T10:30:00+00:00',
  },
  {
    id: 'vinculo-2',
    userId: 'user-2',
    nomeCompleto: 'Maria Souza',
    email: 'maria@empresa.com.br',
    licitanteId: 'licitante-1',
    papel: 'COLABORADOR',
    criadoEm: '2026-02-01T08:00:00+00:00',
  },
];

const mockAuthValue = {
  session: {
    licitante: { id: 'licitante-1', cnpj: '00000000000000', nome_empresa: 'Empresa' },
    user: { id: 'user-1', email: 'joao@empresa.com.br', nome_completo: 'João', licitantes: [], fotoPerfil: null },
  },
  user: { id: 'user-1', email: 'joao@empresa.com.br', nome_completo: 'João', licitantes: [], fotoPerfil: null },
  isLoading: false,
  isAuthenticated: true,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  selectLicitante: vi.fn(),
  clearLicitanteSelection: vi.fn(),
  register: vi.fn(),
  confirmarEmail: vi.fn(),
  updateFotoPerfil: vi.fn(),
};

describe('useGestaoAcessos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthValue as ReturnType<typeof useAuth>);
    mockListarExecute.mockResolvedValue(mockUsuarios);
    mockRevogarExecute.mockResolvedValue(undefined);
  });

  it('deve carregar lista de usuários na inicialização', async () => {
    const { result } = renderHook(() => useGestaoAcessos());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.usuarios).toEqual(mockUsuarios);
    expect(result.current.error).toBeNull();
  });

  it('deve definir error quando listar falha', async () => {
    mockListarExecute.mockRejectedValueOnce(new Error('FETCH_ERROR'));

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Não foi possível carregar os usuários. Tente novamente.');
    expect(result.current.usuarios).toEqual([]);
  });

  it('deve remover usuário da lista após revogação bem-sucedida', async () => {
    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.revogarAcesso('user-2');
    });

    expect(result.current.usuarios).toHaveLength(1);
    expect(result.current.usuarios[0].userId).toBe('user-1');
    expect(result.current.removeError).toBeNull();
  });

  it('deve definir removeError quando revogação falha', async () => {
    mockRevogarExecute.mockRejectedValueOnce(
      new Error('Não é possível remover o último administrador.')
    );

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.revogarAcesso('user-1');
    });

    expect(result.current.removeError).toBe('Não é possível remover o último administrador.');
    expect(result.current.usuarios).toHaveLength(2);
  });

  it('deve limpar removeError ao chamar clearRemoveError', async () => {
    mockRevogarExecute.mockRejectedValueOnce(new Error('Erro qualquer'));

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.revogarAcesso('user-1');
    });

    expect(result.current.removeError).not.toBeNull();

    act(() => {
      result.current.clearRemoveError();
    });

    expect(result.current.removeError).toBeNull();
  });

  it('deve expor currentUserId do usuário autenticado', async () => {
    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentUserId).toBe('user-1');
  });
});
