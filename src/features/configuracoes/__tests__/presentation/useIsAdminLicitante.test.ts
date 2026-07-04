import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { UsuarioLicitante } from '../../domain/entities';

const { mockListarExecute } = vi.hoisted(() => ({
  mockListarExecute: vi.fn(),
}));

vi.mock('@/features/auth/presentation/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../data/repositories/UsuarioLicitanteRepository', () => ({
  UsuarioLicitanteRepository: class {
    listar = vi.fn();
    revogar = vi.fn();
    convidar = vi.fn();
  },
}));

vi.mock('../../domain/usecases/ListarUsuariosLicitanteUseCase', () => ({
  ListarUsuariosLicitanteUseCase: class {
    execute = mockListarExecute;
  },
}));

import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { useIsAdminLicitante } from '../../presentation/hooks/useIsAdminLicitante';

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
    licitante: { id: 'licitante-1', cnpj: '00000000000000', nomeEmpresa: 'Empresa' },
    user: { id: 'user-1', email: 'joao@empresa.com.br', nomeCompleto: 'João', licitantes: [], fotoPerfil: null },
  },
  user: { id: 'user-1', email: 'joao@empresa.com.br', nomeCompleto: 'João', licitantes: [], fotoPerfil: null },
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

describe('useIsAdminLicitante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockAuthValue as ReturnType<typeof useAuth>);
  });

  it('deve iniciar com isLoading true', () => {
    mockListarExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useIsAdminLicitante());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('deve retornar isAdmin true quando o usuário autenticado tem papel ADMIN no licitante ativo', async () => {
    mockListarExecute.mockResolvedValueOnce(mockUsuarios);

    const { result } = renderHook(() => useIsAdminLicitante());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(true);
  });

  it('deve retornar isAdmin false quando o usuário autenticado tem papel COLABORADOR no licitante ativo', async () => {
    mockListarExecute.mockResolvedValueOnce(mockUsuarios);
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: { ...mockAuthValue.user, id: 'user-2' },
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useIsAdminLicitante());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it('deve manter isAdmin false (fail-closed) quando a consulta ao repositório falha', async () => {
    mockListarExecute.mockRejectedValueOnce(new Error('FETCH_ERROR'));

    const { result } = renderHook(() => useIsAdminLicitante());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });
});
