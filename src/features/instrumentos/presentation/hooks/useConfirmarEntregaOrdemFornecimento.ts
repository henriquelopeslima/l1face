import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { ConfirmarEntregaInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { ConfirmarEntregaOrdemFornecimentoUseCase } from '../../domain/useCases/ConfirmarEntregaOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const confirmarEntregaUseCase = new ConfirmarEntregaOrdemFornecimentoUseCase(repository);

interface UseConfirmarEntregaOrdemFornecimentoResult {
  confirmar: (input: ConfirmarEntregaInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useConfirmarEntregaOrdemFornecimento(): UseConfirmarEntregaOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmar = useCallback(async (input: ConfirmarEntregaInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await confirmarEntregaUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar entrega da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { confirmar, isLoading, error };
}
