import { useCallback, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { AtaCriada, CriarAtaInput } from '../../domain/entities/criarAta';
import { AtaError } from '../../domain/errors/ataErrors';
import { CriarAtaUseCase } from '../../domain/usecases/CriarAtaUseCase';

const repository = new AtasRepository();
const criarAtaUseCase = new CriarAtaUseCase(repository);

interface UseCriarAtaResult {
  criarAta: (input: CriarAtaInput) => Promise<AtaCriada | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCriarAta(): UseCriarAtaResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarAta = useCallback(async (input: CriarAtaInput): Promise<AtaCriada | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await criarAtaUseCase.execute(input);
      return result;
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao cadastrar ata. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criarAta, isLoading, error };
}
