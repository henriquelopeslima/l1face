import { useCallback, useEffect, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { InstrumentoListagem } from '../../domain/entities/instrumentoContratual';
import { ListarInstrumentosUseCase } from '../../domain/useCases/ListarInstrumentosUseCase';

const repository = new InstrumentosRepository();
const listarInstrumentosUseCase = new ListarInstrumentosUseCase(repository);

interface UseListarInstrumentosResult {
  instrumentos: InstrumentoListagem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useListarInstrumentos(): UseListarInstrumentosResult {
  const [instrumentos, setInstrumentos] = useState<InstrumentoListagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listarInstrumentosUseCase.execute();
      setInstrumentos(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar instrumentos. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { instrumentos, isLoading, error, refetch: fetch };
}
