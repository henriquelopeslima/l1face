import { useState } from 'react';
import type { RegisterCredentials } from '../../domain/entities/registerCredentials';
import { useAuth } from '../context/AuthContext';

interface UseRegisterReturn {
  register: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  registrationMessage: string | null;
}

export function useRegister(): UseRegisterReturn {
  const { register, isLoading, error } = useAuth();
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);

  const handleRegister = async (credentials: RegisterCredentials) => {
    const result = await register(credentials);
    setRegistrationMessage(result.message);
  };

  return { register: handleRegister, isLoading, error, registrationMessage };
}
