import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { EmitirOrdemFornecimentoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { EmitirOrdemFornecimentoUseCase } from '../../domain/useCases/EmitirOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const emitirOrdemFornecimentoUseCase = new EmitirOrdemFornecimentoUseCase(repository);

interface UseEmitirOrdemFornecimentoResult {
  emitir: (input: EmitirOrdemFornecimentoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useEmitirOrdemFornecimento(): UseEmitirOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emitir = useCallback(async (input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await emitirOrdemFornecimentoUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { emitir, isLoading, error };
}
