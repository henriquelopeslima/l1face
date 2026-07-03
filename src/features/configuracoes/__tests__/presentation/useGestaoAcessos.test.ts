import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { UsuarioLicitante } from '../../domain/entities';

const { mockListarExecute, mockRevogarExecute, mockConvidarExecute } = vi.hoisted(() => ({
  mockListarExecute: vi.fn(),
  mockRevogarExecute: vi.fn(),
  mockConvidarExecute: vi.fn(),
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

vi.mock('../../domain/usecases/RevogarAcessoUseCase', () => ({
  RevogarAcessoUseCase: class {
    execute = mockRevogarExecute;
  },
}));

vi.mock('../../domain/usecases/ConvidarColaboradorUseCase', () => ({
  ConvidarColaboradorUseCase: class {
    execute = mockConvidarExecute;
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

  it('deve expor isAdmin true quando o usuário autenticado é ADMIN na lista', async () => {
    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(true);
  });

  it('deve expor isAdmin false quando o usuário autenticado é COLABORADOR na lista', async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: { ...mockAuthValue.user, id: 'user-2' },
    } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it('deve definir convidarSucesso ao convidar colaborador com sucesso', async () => {
    mockConvidarExecute.mockResolvedValueOnce({
      id: 'convite-1',
      email: 'novo@empresa.com.br',
      nome: 'novo',
      licitanteId: 'licitante-1',
      usuarioJaCadastrado: false,
      status: 'PENDENTE',
      criadoEm: '2026-01-15T10:30:00+00:00',
      expiresAt: '2026-01-16T10:30:00+00:00',
    });

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let sucesso = false;
    await act(async () => {
      sucesso = await result.current.convidarColaborador('novo@empresa.com.br');
    });

    expect(sucesso).toBe(true);
    expect(result.current.convidarSucesso).toContain('novo@empresa.com.br');
    expect(result.current.convidarError).toBeNull();
    expect(mockConvidarExecute).toHaveBeenCalledWith('licitante-1', 'novo@empresa.com.br', undefined);
  });

  it('deve repassar o nome opcional ao use case ao convidar colaborador', async () => {
    mockConvidarExecute.mockResolvedValueOnce({
      id: 'convite-1',
      email: 'novo@empresa.com.br',
      nome: 'Maria Souza',
      licitanteId: 'licitante-1',
      usuarioJaCadastrado: false,
      status: 'PENDENTE',
      criadoEm: '2026-01-15T10:30:00+00:00',
      expiresAt: '2026-01-16T10:30:00+00:00',
    });

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.convidarColaborador('novo@empresa.com.br', 'Maria Souza');
    });

    expect(mockConvidarExecute).toHaveBeenCalledWith('licitante-1', 'novo@empresa.com.br', 'Maria Souza');
  });

  it('deve definir convidarError quando o e-mail já tem acesso ao licitante (409)', async () => {
    mockConvidarExecute.mockRejectedValueOnce(new Error('Este e-mail já tem acesso a esta empresa.'));

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let sucesso = true;
    await act(async () => {
      sucesso = await result.current.convidarColaborador('joao@empresa.com.br');
    });

    expect(sucesso).toBe(false);
    expect(result.current.convidarError).toBe('Este e-mail já tem acesso a esta empresa.');
    expect(result.current.convidarSucesso).toBeNull();
    expect(result.current.usuarios).toEqual(mockUsuarios);
  });

  it('deve definir convidarError quando o e-mail é inválido (422)', async () => {
    mockConvidarExecute.mockRejectedValueOnce(new Error('Informe um e-mail válido.'));

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.convidarColaborador('invalido');
    });

    expect(result.current.convidarError).toBe('Informe um e-mail válido.');
  });

  it('deve limpar convidarError/convidarSucesso ao chamar clearConvidarFeedback', async () => {
    mockConvidarExecute.mockRejectedValueOnce(new Error('Erro qualquer'));

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.convidarColaborador('novo@empresa.com.br');
    });

    expect(result.current.convidarError).not.toBeNull();

    act(() => {
      result.current.clearConvidarFeedback();
    });

    expect(result.current.convidarError).toBeNull();
    expect(result.current.convidarSucesso).toBeNull();
  });

  it('deve tratar convites repetidos para o mesmo e-mail (novo + reenvio) como dois sucessos independentes', async () => {
    mockConvidarExecute.mockResolvedValue({
      id: 'convite-1',
      email: 'pendente@empresa.com.br',
      nome: 'pendente',
      licitanteId: 'licitante-1',
      usuarioJaCadastrado: false,
      status: 'PENDENTE',
      criadoEm: '2026-01-15T10:30:00+00:00',
      expiresAt: '2026-01-16T10:30:00+00:00',
    });

    const { result } = renderHook(() => useGestaoAcessos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let primeiro = false;
    await act(async () => {
      primeiro = await result.current.convidarColaborador('pendente@empresa.com.br');
    });
    expect(primeiro).toBe(true);
    expect(result.current.convidarSucesso).toContain('pendente@empresa.com.br');

    let segundo = false;
    await act(async () => {
      segundo = await result.current.convidarColaborador('pendente@empresa.com.br');
    });

    expect(segundo).toBe(true);
    expect(result.current.convidarSucesso).toContain('pendente@empresa.com.br');
    expect(result.current.convidarError).toBeNull();
    expect(mockConvidarExecute).toHaveBeenCalledTimes(2);
  });
});
