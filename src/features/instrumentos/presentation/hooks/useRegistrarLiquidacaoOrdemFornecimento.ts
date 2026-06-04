import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { RegistrarLiquidacaoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { RegistrarLiquidacaoOrdemFornecimentoUseCase } from '../../domain/useCases/RegistrarLiquidacaoOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const registrarLiquidacaoUseCase = new RegistrarLiquidacaoOrdemFornecimentoUseCase(repository);

interface UseRegistrarLiquidacaoOrdemFornecimentoResult {
  registrar: (input: RegistrarLiquidacaoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useRegistrarLiquidacaoOrdemFornecimento(): UseRegistrarLiquidacaoOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = useCallback(async (input: RegistrarLiquidacaoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await registrarLiquidacaoUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar liquidação da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { registrar, isLoading, error };
}
