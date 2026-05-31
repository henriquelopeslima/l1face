import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { CriarEmpenhoInput } from '../../domain/entities/criarContrato';
import { CriarEmpenhoUseCase } from '../../domain/useCases/CriarEmpenhoUseCase';

const repository = new InstrumentosRepository();
const criarEmpenhoUseCase = new CriarEmpenhoUseCase(repository);

interface UseCriarEmpenhoResult {
  criar: (input: CriarEmpenhoInput) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCriarEmpenho(): UseCriarEmpenhoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criar = useCallback(async (input: CriarEmpenhoInput): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const instrumentoId = await criarEmpenhoUseCase.execute(input);
      return instrumentoId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar empenho. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criar, isLoading, error };
}
