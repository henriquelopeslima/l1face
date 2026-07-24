import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { NotificacaoRepository } from '../../data/repositories/NotificacaoRepository';
import type { Notificacao, TipoOrigemNotificacao } from '../../domain/entities/Notificacao';
import { ListarNotificacoesUseCase } from '../../domain/useCases/ListarNotificacoesUseCase';
import { agruparPorPeriodo, type GrupoNotificacoesPorPeriodo } from '../utils/agruparPorPeriodo';
import { useNotificacoes } from '../context/NotificacoesContext';

const LIMITE_POR_PAGINA = 20;

const repository = new NotificacaoRepository();
const listarNotificacoesUseCase = new ListarNotificacoesUseCase(repository);

export type FiltroLeitura = 'todas' | 'nao_lidas';
export type FiltroOrigem = TipoOrigemNotificacao | 'todas';

interface UseListagemNotificacoesResult {
  notificacoesFiltradas: Notificacao[];
  gruposPorPeriodo: GrupoNotificacoesPorPeriodo[];
  filtroLeitura: FiltroLeitura;
  filtroOrigem: FiltroOrigem;
  temNotificacoes: boolean;
  temMaisPaginas: boolean;
  isLoading: boolean;
  error: string | null;
  carregarMais: () => void;
  definirFiltroLeitura: (filtro: FiltroLeitura) => void;
  definirFiltroOrigem: (filtro: FiltroOrigem) => void;
  /**
   * Espelha localmente que uma notificação foi lida, SEM chamar a API — o clique em uma
   * notificação já dispara a chamada real via `useAbrirNotificacao` (que usa o mesmo
   * `marcarComoLida` do NotificacoesContext compartilhado). Chamar as duas ao mesmo tempo
   * duplicaria a requisição PATCH.
   */
  marcarComoLidaLocal: (id: string) => void;
  marcarTodasComoLidas: () => Promise<void>;
}

/**
 * Acumula páginas de notificações sob demanda ("Carregar mais") e aplica filtros de
 * leitura/origem inteiramente no cliente, já que a API não expõe esses filtros (ver
 * specs/028-listagem-notificacoes/research.md #1). "Marcar todas como lidas" é delegado ao
 * NotificacoesContext compartilhado (mesma chamada usada pelo sino/Configurações) e
 * espelhado localmente; marcar uma notificação individual como lida acontece via
 * `useAbrirNotificacao` no ponto de uso, e só precisa ser espelhado aqui (`marcarComoLidaLocal`).
 */
export function useListagemNotificacoes(): UseListagemNotificacoesResult {
  const { session } = useAuth();
  const licitanteId = session?.licitante.id ?? null;
  const { marcarTodasComoLidas: marcarTodasComoLidasCompartilhado } = useNotificacoes();

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroLeitura, setFiltroLeitura] = useState<FiltroLeitura>('todas');
  const [filtroOrigem, setFiltroOrigem] = useState<FiltroOrigem>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPagina = useCallback(
    async (pagina: number, substituir: boolean) => {
      if (!licitanteId) {
        setNotificacoes([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const resultado = await listarNotificacoesUseCase.execute({ page: pagina, limit: LIMITE_POR_PAGINA });
        setNotificacoes((atual) => (substituir ? resultado.itens : [...atual, ...resultado.itens]));
        setPaginaAtual(resultado.paginaAtual);
        setTotalPaginas(resultado.totalPaginas);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível carregar as notificações. Tente novamente.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [licitanteId]
  );

  useEffect(() => {
    setNotificacoes([]);
    setPaginaAtual(1);
    setTotalPaginas(1);
    void carregarPagina(1, true);
  }, [licitanteId, carregarPagina]);

  const carregarMais = useCallback(() => {
    void carregarPagina(paginaAtual + 1, false);
  }, [carregarPagina, paginaAtual]);

  const marcarComoLidaLocal = useCallback((id: string) => {
    const agora = new Date().toISOString();
    setNotificacoes((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true, lidaEm: n.lidaEm ?? agora } : n)));
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    await marcarTodasComoLidasCompartilhado();
    const agora = new Date().toISOString();
    setNotificacoes((atual) => atual.map((n) => (n.lida ? n : { ...n, lida: true, lidaEm: agora })));
  }, [marcarTodasComoLidasCompartilhado]);

  const notificacoesFiltradas = useMemo(
    () =>
      notificacoes.filter((n) => {
        if (filtroLeitura === 'nao_lidas' && n.lida) return false;
        if (filtroOrigem !== 'todas' && n.tipoOrigem !== filtroOrigem) return false;
        return true;
      }),
    [notificacoes, filtroLeitura, filtroOrigem]
  );

  const gruposPorPeriodo = useMemo(
    () => agruparPorPeriodo(notificacoesFiltradas, new Date()),
    [notificacoesFiltradas]
  );

  return {
    notificacoesFiltradas,
    gruposPorPeriodo,
    filtroLeitura,
    filtroOrigem,
    temNotificacoes: notificacoes.length > 0,
    temMaisPaginas: paginaAtual < totalPaginas,
    isLoading,
    error,
    carregarMais,
    definirFiltroLeitura: setFiltroLeitura,
    definirFiltroOrigem: setFiltroOrigem,
    marcarComoLidaLocal,
    marcarTodasComoLidas,
  };
}
