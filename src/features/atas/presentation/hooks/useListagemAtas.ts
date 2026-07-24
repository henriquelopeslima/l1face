import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { AtasRepository } from '../../data/repositories/AtasRepository';
import type { Ata, AtaStatus } from '../../domain/entities/ata';
import { AtaError } from '../../domain/errors/ataErrors';
import { ListarAtasPaginadoUseCase } from '../../domain/usecases/ListarAtasPaginadoUseCase';

const LIMITE_POR_PAGINA = 10;

const repository = new AtasRepository();
const listarAtasPaginadoUseCase = new ListarAtasPaginadoUseCase(repository);

export type AtaStatusFilter = 'todas' | AtaStatus;

interface UseListagemAtasResult {
  atas: Ata[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: AtaStatusFilter;
  setStatusFilter: (value: AtaStatusFilter) => void;
  temMaisPaginas: boolean;
  isLoading: boolean;
  isFiltering: boolean;
  isLoadingMais: boolean;
  error: string | null;
  carregarMais: () => void;
  refetch: () => void;
  limparFiltros: () => void;
}

/**
 * Acumula páginas de atas sob demanda ("Carregar mais"), mesmo padrão de
 * useListagemNotificacoes (028) e useListagemInstrumentos (029). Não substitui
 * useListarAtas(), que continua fornecendo a lista completa para os seletores de Ata em
 * CadastrarContrato/CadastrarNotaEmpenho (ver specs/029-paginacao-instrumentos-atas/research.md #4).
 *
 * A partir de 031-filtro-atas, busca textual (`searchTerm`, com debounce) e filtro de status
 * são enviados ao backend via GET /api/atas?geral=...&status=..., reiniciando a paginação a cada
 * mudança. Um contador de requisição (`requestIdRef`) descarta respostas desatualizadas quando o
 * filtro muda antes de uma busca anterior responder (ver research.md #4).
 */
export function useListagemAtas(): UseListagemAtasResult {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState<AtaStatusFilter>('todas');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoadingMais, setIsLoadingMais] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const primeiraCargaRef = useRef(true);

  const carregarPagina = useCallback(async (pagina: number, substituir: boolean) => {
    const requestId = ++requestIdRef.current;
    if (substituir) {
      if (primeiraCargaRef.current) setIsLoading(true);
      else setIsFiltering(true);
    } else {
      setIsLoadingMais(true);
    }
    setError(null);
    try {
      const resultado = await listarAtasPaginadoUseCase.execute({
        page: pagina,
        limit: LIMITE_POR_PAGINA,
        geral: debouncedSearchTerm || undefined,
        status: statusFilter === 'todas' ? undefined : statusFilter,
      });
      if (requestId !== requestIdRef.current) return;
      setAtas((atual) => (substituir ? resultado.itens : [...atual, ...resultado.itens]));
      setPaginaAtual(resultado.paginaAtual);
      setTotalPaginas(resultado.totalPaginas);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message = err instanceof AtaError ? err.message : 'Erro ao carregar atas. Tente novamente.';
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        primeiraCargaRef.current = false;
        setIsLoading(false);
        setIsFiltering(false);
        setIsLoadingMais(false);
      }
    }
  }, [debouncedSearchTerm, statusFilter]);

  const refetch = useCallback(() => {
    void carregarPagina(1, true);
  }, [carregarPagina]);

  useEffect(() => {
    void carregarPagina(1, true);
  }, [carregarPagina]);

  const carregarMais = useCallback(() => {
    void carregarPagina(paginaAtual + 1, false);
  }, [carregarPagina, paginaAtual]);

  const limparFiltros = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('todas');
  }, []);

  return {
    atas,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    temMaisPaginas: paginaAtual < totalPaginas,
    isLoading,
    isFiltering,
    isLoadingMais,
    error,
    carregarMais,
    refetch,
    limparFiltros,
  };
}
