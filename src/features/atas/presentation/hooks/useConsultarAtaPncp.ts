import { useCallback, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { DadosAtaPncp } from '../../domain/entities/criarAta';
import { AtaError } from '../../domain/errors/ataErrors';
import { ConsultarAtaPncpUseCase } from '../../domain/usecases/ConsultarAtaPncpUseCase';

const repository = new AtasRepository();
const consultarAtaPncpUseCase = new ConsultarAtaPncpUseCase(repository);

interface UseConsultarAtaPncpResult {
  consultar: (codigo: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  dados: DadosAtaPncp | null;
}

export function useConsultarAtaPncp(): UseConsultarAtaPncpResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosAtaPncp | null>(null);

  const consultar = useCallback(async (codigo: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setDados(null);
    try {
      const result = await consultarAtaPncpUseCase.execute(codigo);
      setDados(result);
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao consultar PNCP. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { consultar, isLoading, error, dados };
}
