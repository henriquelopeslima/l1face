import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { LoginCredentials } from '../../domain/entities/authSession';
import { EmailNaoConfirmadoError } from '../../domain/errors/authErrors';
import { useAuth } from '../context/AuthContext';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  emailNaoConfirmado: boolean;
}

export function useLogin(): UseLoginReturn {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [emailNaoConfirmado, setEmailNaoConfirmado] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    setEmailNaoConfirmado(false);
    try {
      const licitante = await login(credentials);
      navigate(licitante ? '/' : '/selecionar-vinculo');
    } catch (err: unknown) {
      if (err instanceof EmailNaoConfirmadoError) {
        setEmailNaoConfirmado(true);
      }
    }
  };

  return { login: handleLogin, isLoading, error, emailNaoConfirmado };
}
