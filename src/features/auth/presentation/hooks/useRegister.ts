import { useNavigate } from 'react-router';
import type { RegisterCredentials } from '../../domain/entities/registerCredentials';
import { useAuth } from '../context/AuthContext';

interface UseRegisterReturn {
  register: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRegister(): UseRegisterReturn {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (credentials: RegisterCredentials) => {
    await register(credentials);
    navigate('/selecionar-vinculo');
  };

  return { register: handleRegister, isLoading, error };
}
