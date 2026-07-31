import { useCallback, useEffect, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { InstrumentoDetalhe } from '../../domain/entities/instrumentoContratual';
import { BuscarInstrumentoUseCase } from '../../domain/useCases/BuscarInstrumentoUseCase';

const repository = new InstrumentosRepository();
const buscarInstrumentoUseCase = new BuscarInstrumentoUseCase(repository);

interface UseBuscarInstrumentoResult {
  instrumento: InstrumentoDetalhe | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /**
   * Atualiza os dados em segundo plano, sem alternar `isLoading` nem `error`.
   * Usado após uma mutação bem-sucedida (ex.: emitir uma OF) para refletir o
   * novo saldo sem substituir a página inteira pelo skeleton de carregamento.
   * Falhas são ignoradas silenciosamente — os dados anteriores permanecem.
   */
  refetchSilencioso: () => void;
}

export function useBuscarInstrumento(id: string): UseBuscarInstrumentoResult {
  const [instrumento, setInstrumento] = useState<InstrumentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const result = await buscarInstrumentoUseCase.execute(id);
      setInstrumento(result);
    } catch (err) {
      if (!silencioso) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar instrumento. Tente novamente.';
        setError(message);
      }
    } finally {
      if (!silencioso) {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    void buscar();
  }, [buscar]);

  return {
    instrumento,
    isLoading,
    error,
    refetch: () => { void buscar(); },
    refetchSilencioso: () => { void buscar(true); },
  };
}
