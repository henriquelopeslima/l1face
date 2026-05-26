import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { setActiveLicitanteId } from '@/shared/infrastructure/apiClient';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import type { AuthSession, LoginCredentials } from '../../domain/entities/authSession';
import type { Licitante } from '../../domain/entities/licitante';
import type { RegisterCredentials } from '../../domain/entities/registerCredentials';
import type { User } from '../../domain/entities/user';
import { UnauthenticatedError } from '../../domain/errors/authErrors';
import { GetMeUseCase } from '../../domain/usecases/GetMeUseCase';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { LogoutUseCase } from '../../domain/usecases/LogoutUseCase';
import { RegisterUseCase } from '../../domain/usecases/RegisterUseCase';

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<Licitante | null>;
  logout: () => Promise<void>;
  selectLicitante: (licitante: Licitante) => void;
  register: (credentials: RegisterCredentials) => Promise<Licitante | null>;
}

interface AuthState {
  user: User | null;
  licitante: Licitante | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'SET_USER'; user: User; licitante: Licitante | null }
  | { type: 'SELECT_LICITANTE'; licitante: Licitante }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_USER':
      return { user: action.user, licitante: action.licitante, isLoading: false, error: null };
    case 'SELECT_LICITANTE':
      return { ...state, licitante: action.licitante };
    case 'SET_ERROR':
      return { user: null, licitante: null, isLoading: false, error: action.error };
    case 'LOGOUT':
      return { user: null, licitante: null, isLoading: false, error: null };
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LICITANTE_ID_KEY = 'licitanteId';

const repository = new AuthRepository();
const loginUseCase = new LoginUseCase(repository);
const getMeUseCase = new GetMeUseCase(repository);
const logoutUseCase = new LogoutUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);

function resolveAutoLicitante(user: User): Licitante | null {
  if (user.licitantes.length === 1 && user.licitantes[0]) return user.licitantes[0];
  const savedId = localStorage.getItem(LICITANTE_ID_KEY);
  return user.licitantes.find((l) => l.id === savedId) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    licitante: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    getMeUseCase
      .execute()
      .then((user) => {
        const licitante = resolveAutoLicitante(user);
        setActiveLicitanteId(licitante?.id ?? null);
        dispatch({ type: 'SET_USER', user, licitante });
      })
      .catch(() => {
        setActiveLicitanteId(null);
        localStorage.removeItem(LICITANTE_ID_KEY);
        dispatch({ type: 'LOGOUT' });
      });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<Licitante | null> => {
    dispatch({ type: 'LOADING' });
    try {
      await loginUseCase.execute(credentials);
      const user = await getMeUseCase.execute();
      const licitante = resolveAutoLicitante(user);
      setActiveLicitanteId(licitante?.id ?? null);
      dispatch({ type: 'SET_USER', user, licitante });
      return licitante;
    } catch (err: unknown) {
      setActiveLicitanteId(null);
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      dispatch({ type: 'SET_ERROR', error: message });
      throw err;
    }
  };

  const logout = async () => {
    await logoutUseCase.execute();
    setActiveLicitanteId(null);
    localStorage.removeItem(LICITANTE_ID_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (credentials: RegisterCredentials): Promise<Licitante | null> => {
    dispatch({ type: 'LOADING' });
    try {
      await registerUseCase.execute(credentials);
      const user = await getMeUseCase.execute();
      const licitante = resolveAutoLicitante(user);
      setActiveLicitanteId(licitante?.id ?? null);
      dispatch({ type: 'SET_USER', user, licitante });
      return licitante;
    } catch (err: unknown) {
      setActiveLicitanteId(null);
      const message = err instanceof Error ? err.message : 'Erro ao realizar cadastro.';
      dispatch({ type: 'SET_ERROR', error: message });
      throw err;
    }
  };

  const selectLicitante = (licitante: Licitante) => {
    localStorage.setItem(LICITANTE_ID_KEY, licitante.id);
    setActiveLicitanteId(licitante.id);
    dispatch({ type: 'SELECT_LICITANTE', licitante });
  };

  const session: AuthSession | null =
    state.user && state.licitante ? { user: state.user, licitante: state.licitante } : null;

  const value: AuthContextValue = {
    session,
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.user !== null,
    error: state.error,
    login,
    logout,
    selectLicitante,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
