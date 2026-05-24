import { useCallback, useEffect, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { Ata } from '../../domain/entities/ata';
import { AtaError } from '../../domain/errors/ataErrors';
import { ListarAtasUseCase } from '../../domain/usecases/ListarAtasUseCase';

const repository = new AtasRepository();
const listarAtasUseCase = new ListarAtasUseCase(repository);

interface UseListarAtasResult {
  atas: Ata[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useListarAtas(): UseListarAtasResult {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listarAtasUseCase.execute();
      setAtas(result);
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao carregar atas. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { atas, isLoading, error, refetch: fetch };
}
