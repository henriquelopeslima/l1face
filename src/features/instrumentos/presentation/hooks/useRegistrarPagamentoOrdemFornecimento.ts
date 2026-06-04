import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { RegistrarPagamentoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { RegistrarPagamentoOrdemFornecimentoUseCase } from '../../domain/useCases/RegistrarPagamentoOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const registrarPagamentoUseCase = new RegistrarPagamentoOrdemFornecimentoUseCase(repository);

interface UseRegistrarPagamentoOrdemFornecimentoResult {
  registrar: (input: RegistrarPagamentoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useRegistrarPagamentoOrdemFornecimento(): UseRegistrarPagamentoOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = useCallback(async (input: RegistrarPagamentoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await registrarPagamentoUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar pagamento da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { registrar, isLoading, error };
}
