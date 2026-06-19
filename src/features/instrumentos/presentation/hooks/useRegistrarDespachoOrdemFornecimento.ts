import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { RegistrarDespachoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { RegistrarDespachoOrdemFornecimentoUseCase } from '../../domain/useCases/RegistrarDespachoOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const registrarDespachoUseCase = new RegistrarDespachoOrdemFornecimentoUseCase(repository);

interface UseRegistrarDespachoOrdemFornecimentoResult {
  registrar: (input: RegistrarDespachoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useRegistrarDespachoOrdemFornecimento(): UseRegistrarDespachoOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = useCallback(async (input: RegistrarDespachoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await registrarDespachoUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar despacho da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { registrar, isLoading, error };
}
