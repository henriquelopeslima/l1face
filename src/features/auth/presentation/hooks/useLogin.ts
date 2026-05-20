import { useNavigate } from 'react-router';
import type { LoginCredentials } from '../../domain/entities/authSession';
import { useAuth } from '../context/AuthContext';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useLogin(): UseLoginReturn {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
    navigate('/selecionar-vinculo');
  };

  return { login: handleLogin, isLoading, error };
}
