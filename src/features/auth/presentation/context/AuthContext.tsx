import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import type { AuthSession, LoginCredentials } from '../../domain/entities/authSession';
import type { Licitante } from '../../domain/entities/licitante';
import type { User } from '../../domain/entities/user';
import { UnauthenticatedError } from '../../domain/errors/authErrors';
import { GetMeUseCase } from '../../domain/usecases/GetMeUseCase';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { LogoutUseCase } from '../../domain/usecases/LogoutUseCase';

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  selectLicitante: (licitante: Licitante) => void;
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

const repository = new AuthRepository();
const loginUseCase = new LoginUseCase(repository);
const getMeUseCase = new GetMeUseCase(repository);
const logoutUseCase = new LogoutUseCase(repository);

function resolveAutoLicitante(user: User): Licitante | null {
  return user.licitantes.length === 1 && user.licitantes[0] ? user.licitantes[0] : null;
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
        dispatch({ type: 'SET_USER', user, licitante: resolveAutoLicitante(user) });
      })
      .catch((err: unknown) => {
        if (err instanceof UnauthenticatedError) {
          dispatch({ type: 'LOGOUT' });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOADING' });
    try {
      await loginUseCase.execute(credentials);
      const user = await getMeUseCase.execute();
      dispatch({ type: 'SET_USER', user, licitante: resolveAutoLicitante(user) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      dispatch({ type: 'SET_ERROR', error: message });
      throw err;
    }
  };

  const logout = async () => {
    await logoutUseCase.execute();
    dispatch({ type: 'LOGOUT' });
  };

  const selectLicitante = (licitante: Licitante) => {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
