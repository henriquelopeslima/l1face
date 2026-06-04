import { useCallback, useEffect, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { ListagemOrdensFornecimento } from '../../domain/entities/instrumentoContratual';
import { ListarOrdensFornecimentoUseCase } from '../../domain/useCases/ListarOrdensFornecimentoUseCase';

const repository = new InstrumentosRepository();
const listarOrdensFornecimentoUseCase = new ListarOrdensFornecimentoUseCase(repository);

interface UseListarOrdensFornecimentoResult {
  dados: ListagemOrdensFornecimento | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useListarOrdensFornecimento(instrumentoId: string): UseListarOrdensFornecimentoResult {
  const [dados, setDados] = useState<ListagemOrdensFornecimento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listarOrdensFornecimentoUseCase.execute(instrumentoId);
      setDados(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar ordens de fornecimento. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [instrumentoId]);

  useEffect(() => {
    void listar();
  }, [listar]);

  return { dados, isLoading, error, refetch: listar };
}
