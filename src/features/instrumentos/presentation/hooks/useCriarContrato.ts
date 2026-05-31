import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { CriarContratoInput } from '../../domain/entities/criarContrato';
import { CriarContratoUseCase } from '../../domain/useCases/CriarContratoUseCase';

const repository = new InstrumentosRepository();
const criarContratoUseCase = new CriarContratoUseCase(repository);

interface UseCriarContratoResult {
  criar: (input: CriarContratoInput) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCriarContrato(): UseCriarContratoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criar = useCallback(async (input: CriarContratoInput): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const instrumentoId = await criarContratoUseCase.execute(input);
      return instrumentoId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar contrato. Tente novamente.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { criar, isLoading, error };
}
