import { useState } from 'react';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { RecuperarSenhaUseCase } from '../../domain/usecases/RecuperarSenhaUseCase';

const repository = new AuthRepository();
const recuperarSenhaUseCase = new RecuperarSenhaUseCase(repository);

interface UseRecuperarSenhaReturn {
  submit: (email: string) => Promise<void>;
  isLoading: boolean;
  isSent: boolean;
  error: string | null;
}

export function useRecuperarSenha(): UseRecuperarSenhaReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await recuperarSenhaUseCase.execute(email);
      setIsSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, isSent, error };
}
