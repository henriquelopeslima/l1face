import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { DadosContratoPncp } from '../../domain/entities/criarContrato';
import { ConsultarContratoPncpUseCase } from '../../domain/useCases/ConsultarContratoPncpUseCase';

const repository = new InstrumentosRepository();
const consultarContratoPncpUseCase = new ConsultarContratoPncpUseCase(repository);

interface UseConsultarContratoPncpResult {
  consultar: (codigo: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  dados: DadosContratoPncp | null;
}

export function useConsultarContratoPncp(): UseConsultarContratoPncpResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosContratoPncp | null>(null);

  const consultar = useCallback(async (codigo: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setDados(null);
    try {
      const result = await consultarContratoPncpUseCase.execute(codigo);
      setDados(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao consultar PNCP. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { consultar, isLoading, error, dados };
}
