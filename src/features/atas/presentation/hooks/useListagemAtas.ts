import { useCallback, useEffect, useState } from 'react';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { Ata } from '../../domain/entities/ata';
import { AtaError } from '../../domain/errors/ataErrors';
import { ListarAtasPaginadoUseCase } from '../../domain/usecases/ListarAtasPaginadoUseCase';

const LIMITE_POR_PAGINA = 10;

const repository = new AtasRepository();
const listarAtasPaginadoUseCase = new ListarAtasPaginadoUseCase(repository);

interface UseListagemAtasResult {
  atas: Ata[];
  temMaisPaginas: boolean;
  isLoading: boolean;
  isLoadingMais: boolean;
  error: string | null;
  carregarMais: () => void;
  refetch: () => void;
}

/**
 * Acumula páginas de atas sob demanda ("Carregar mais"), mesmo padrão de
 * useListagemNotificacoes (028) e useListagemInstrumentos (029). Não substitui
 * useListarAtas(), que continua fornecendo a lista completa para os seletores de Ata em
 * CadastrarContrato/CadastrarNotaEmpenho (ver specs/029-paginacao-instrumentos-atas/research.md #4).
 */
export function useListagemAtas(): UseListagemAtasResult {
  const [atas, setAtas] = useState<Ata[]>([]);
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
      const resultado = await listarAtasPaginadoUseCase.execute({ page: pagina, limit: LIMITE_POR_PAGINA });
      setAtas((atual) => (substituir ? resultado.itens : [...atual, ...resultado.itens]));
      setPaginaAtual(resultado.paginaAtual);
      setTotalPaginas(resultado.totalPaginas);
    } catch (err) {
      const message = err instanceof AtaError ? err.message : 'Erro ao carregar atas. Tente novamente.';
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
    atas,
    temMaisPaginas: paginaAtual < totalPaginas,
    isLoading,
    isLoadingMais,
    error,
    carregarMais,
    refetch,
  };
}
