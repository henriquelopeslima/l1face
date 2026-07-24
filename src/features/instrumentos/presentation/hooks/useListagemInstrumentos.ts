import { useCallback, useEffect, useState } from 'react';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { InstrumentoListagem } from '../../domain/entities/instrumentoContratual';
import { ListarInstrumentosUseCase } from '../../domain/useCases/ListarInstrumentosUseCase';

const LIMITE_POR_PAGINA = 20;

const repository = new InstrumentosRepository();
const listarInstrumentosUseCase = new ListarInstrumentosUseCase(repository);

interface UseListagemInstrumentosResult {
  instrumentos: InstrumentoListagem[];
  totalNaBase: number;
  temMaisPaginas: boolean;
  isLoading: boolean;
  isLoadingMais: boolean;
  error: string | null;
  carregarMais: () => void;
  refetch: () => void;
}

/**
 * Acumula páginas de instrumentos sob demanda ("Carregar mais"), mesmo padrão de
 * useListagemNotificacoes (028). Busca/filtro continuam resolvidos pela página sobre o array
 * acumulado (ver specs/029-paginacao-instrumentos-atas/research.md #2).
 */
export function useListagemInstrumentos(): UseListagemInstrumentosResult {
  const [instrumentos, setInstrumentos] = useState<InstrumentoListagem[]>([]);
  const [totalNaBase, setTotalNaBase] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMais, setIsLoadingMais] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarPagina = useCallback(async (pagina: number, substituir: boolean) => {
    if (substituir) setIsLoading(true);
    else setIsLoadingMais(true);
    setError(null);
    try {
      const resultado = await listarInstrumentosUseCase.execute({ page: pagina, limit: LIMITE_POR_PAGINA });
      setInstrumentos((atual) => (substituir ? resultado.itens : [...atual, ...resultado.itens]));
      setTotalNaBase(resultado.total);
      setPaginaAtual(resultado.paginaAtual);
      setTotalPaginas(resultado.totalPaginas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar instrumentos. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMais(false);
    }
  }, []);

  const refetch = useCallback(() => {
    void carregarPagina(1, true);
  }, [carregarPagina]);

  useEffect(() => {
    void carregarPagina(1, true);
  }, [carregarPagina]);

  const carregarMais = useCallback(() => {
    void carregarPagina(paginaAtual + 1, false);
  }, [carregarPagina, paginaAtual]);

  return {
    instrumentos,
    totalNaBase,
    temMaisPaginas: paginaAtual < totalPaginas,
    isLoading,
    isLoadingMais,
    error,
    carregarMais,
    refetch,
  };
}
