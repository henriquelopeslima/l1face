import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { AvancarStatusOrdemFornecimentoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { AvancarStatusOrdemFornecimentoUseCase } from '../../domain/useCases/AvancarStatusOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const avancarStatusUseCase = new AvancarStatusOrdemFornecimentoUseCase(repository);

interface UseAvancarStatusOrdemFornecimentoResult {
  avancar: (input: AvancarStatusOrdemFornecimentoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useAvancarStatusOrdemFornecimento(): UseAvancarStatusOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avancar = useCallback(async (input: AvancarStatusOrdemFornecimentoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await avancarStatusUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao avançar status da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { avancar, isLoading, error };
}
