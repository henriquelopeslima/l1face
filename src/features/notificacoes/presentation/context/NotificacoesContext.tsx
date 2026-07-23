import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { NotificacaoRepository } from '../../data/repositories/NotificacaoRepository';
import type { Notificacao } from '../../domain/entities/Notificacao';
import { ListarNotificacoesUseCase } from '../../domain/useCases/ListarNotificacoesUseCase';
import { MarcarNotificacaoLidaUseCase } from '../../domain/useCases/MarcarNotificacaoLidaUseCase';
import { MarcarTodasNotificacoesLidasUseCase } from '../../domain/useCases/MarcarTodasNotificacoesLidasUseCase';

const POLLING_INTERVAL_MS = 60_000;

interface NotificacoesContextValue {
  notificacoes: Notificacao[];
  quantidadeNaoLidas: number;
  isLoading: boolean;
  error: string | null;
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  refetch: () => void;
}

const NotificacoesContext = createContext<NotificacoesContextValue | null>(null);

const repository = new NotificacaoRepository();
const listarNotificacoesUseCase = new ListarNotificacoesUseCase(repository);
const marcarNotificacaoLidaUseCase = new MarcarNotificacaoLidaUseCase(repository);
const marcarTodasNotificacoesLidasUseCase = new MarcarTodasNotificacoesLidasUseCase(repository);

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const licitanteId = session?.licitante.id ?? null;

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificacoes = useCallback(
    async (opts?: { silencioso?: boolean }) => {
      if (!licitanteId) {
        setNotificacoes([]);
        setIsLoading(false);
        return;
      }
      if (!opts?.silencioso) setIsLoading(true);
      setError(null);
      try {
        const { itens } = await listarNotificacoesUseCase.execute();
        setNotificacoes(itens);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível carregar as notificações. Tente novamente.';
        setError(message);
      } finally {
        if (!opts?.silencioso) setIsLoading(false);
      }
    },
    [licitanteId]
  );

  useEffect(() => {
    void fetchNotificacoes();
  }, [fetchNotificacoes]);

  useEffect(() => {
    if (!licitanteId) return;
    const intervalId = setInterval(() => {
      void fetchNotificacoes({ silencioso: true });
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [licitanteId, fetchNotificacoes]);

  const marcarComoLida = useCallback(async (id: string) => {
    let anterior: Notificacao[] = [];
    setNotificacoes((atual) => {
      anterior = atual;
      const agora = new Date().toISOString();
      return atual.map((n) => (n.id === id && !n.lida ? { ...n, lida: true, lidaEm: agora } : n));
    });
    try {
      const atualizada = await marcarNotificacaoLidaUseCase.execute(id);
      setNotificacoes((atual) => atual.map((n) => (n.id === id ? atualizada : n)));
    } catch {
      setNotificacoes(anterior);
    }
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    let anterior: Notificacao[] = [];
    setNotificacoes((atual) => {
      anterior = atual;
      const agora = new Date().toISOString();
      return atual.map((n) => (n.lida ? n : { ...n, lida: true, lidaEm: agora }));
    });
    try {
      await marcarTodasNotificacoesLidasUseCase.execute();
    } catch {
      setNotificacoes(anterior);
    }
  }, []);

  const quantidadeNaoLidas = useMemo(() => notificacoes.filter((n) => !n.lida).length, [notificacoes]);

  const value = useMemo<NotificacoesContextValue>(
    () => ({
      notificacoes,
      quantidadeNaoLidas,
      isLoading,
      error,
      marcarComoLida,
      marcarTodasComoLidas,
      refetch: () => void fetchNotificacoes(),
    }),
    [notificacoes, quantidadeNaoLidas, isLoading, error, marcarComoLida, marcarTodasComoLidas, fetchNotificacoes]
  );

  return <NotificacoesContext.Provider value={value}>{children}</NotificacoesContext.Provider>;
}

export function useNotificacoes(): NotificacoesContextValue {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error('useNotificacoes deve ser usado dentro de NotificacoesProvider');
  return ctx;
}
