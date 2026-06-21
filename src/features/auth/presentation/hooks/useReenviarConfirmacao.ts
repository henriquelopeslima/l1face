import { useState } from 'react';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { RateLimitReenvioError } from '../../domain/errors/authErrors';
import { ReenviarConfirmacaoEmailUseCase } from '../../domain/usecases/ReenviarConfirmacaoEmailUseCase';

const repository = new AuthRepository();
const reenviarUseCase = new ReenviarConfirmacaoEmailUseCase(repository);

interface UseReenviarConfirmacaoReturn {
  reenviar: (email: string) => Promise<void>;
  isLoading: boolean;
  isSent: boolean;
  isDisabled: boolean;
  error: string | null;
}

export function useReenviarConfirmacao(): UseReenviarConfirmacaoReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reenviar = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await reenviarUseCase.execute(email);
      setIsSent(true);
    } catch (err: unknown) {
      if (err instanceof RateLimitReenvioError) {
        setIsDisabled(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao reenviar e-mail.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { reenviar, isLoading, isSent, isDisabled, error };
}
