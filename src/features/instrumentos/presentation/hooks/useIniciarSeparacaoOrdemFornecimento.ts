import { useCallback, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { IniciarSeparacaoInput, OrdemFornecimento } from '../../domain/entities/instrumentoContratual';
import { IniciarSeparacaoOrdemFornecimentoUseCase } from '../../domain/useCases/IniciarSeparacaoOrdemFornecimentoUseCase';

const repository = new InstrumentosRepository();
const iniciarSeparacaoUseCase = new IniciarSeparacaoOrdemFornecimentoUseCase(repository);

interface UseIniciarSeparacaoOrdemFornecimentoResult {
  iniciar: (input: IniciarSeparacaoInput) => Promise<OrdemFornecimento>;
  isLoading: boolean;
  error: string | null;
}

export function useIniciarSeparacaoOrdemFornecimento(): UseIniciarSeparacaoOrdemFornecimentoResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciar = useCallback(async (input: IniciarSeparacaoInput): Promise<OrdemFornecimento> => {
    setIsLoading(true);
    setError(null);
    try {
      const ordemFornecimento = await iniciarSeparacaoUseCase.execute(input);
      return ordemFornecimento;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar separação da ordem de fornecimento. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { iniciar, isLoading, error };
}
