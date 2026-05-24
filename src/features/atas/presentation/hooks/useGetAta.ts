import { useCallback, useEffect, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { AtaDetalhes } from '../../domain/entities/ataDetalhes';
import { AtaError } from '../../domain/errors/ataErrors';
import { GetAtaUseCase } from '../../domain/usecases/GetAtaUseCase';

const repository = new AtasRepository();
const getAtaUseCase = new GetAtaUseCase(repository);

interface UseGetAtaResult {
  ata: AtaDetalhes | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGetAta(ataId: string): UseGetAtaResult {
  const [ata, setAta] = useState<AtaDetalhes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAta = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAtaUseCase.execute(ataId);
      setAta(result);
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao carregar ata. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [ataId]);

  useEffect(() => {
    void fetchAta();
  }, [fetchAta]);

  return { ata, isLoading, error, refetch: fetchAta };
}
