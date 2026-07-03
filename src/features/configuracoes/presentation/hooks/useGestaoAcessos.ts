import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import type { UsuarioLicitante } from '../../domain/entities/UsuarioLicitante';
import { ListarUsuariosLicitanteUseCase } from '../../domain/usecases/ListarUsuariosLicitanteUseCase';
import { RevogarAcessoUseCase } from '../../domain/usecases/RevogarAcessoUseCase';
import { ConvidarColaboradorUseCase } from '../../domain/usecases/ConvidarColaboradorUseCase';
import { UsuarioLicitanteRepository } from '../../data/repositories/UsuarioLicitanteRepository';

const repository = new UsuarioLicitanteRepository();
const listarUseCase = new ListarUsuariosLicitanteUseCase(repository);
const revogarUseCase = new RevogarAcessoUseCase(repository);
const convidarUseCase = new ConvidarColaboradorUseCase(repository);

export interface UseGestaoAcessosReturn {
  usuarios: UsuarioLicitante[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  isAdmin: boolean;
  removendoId: string | null;
  removeError: string | null;
  revogarAcesso: (userId: string) => Promise<void>;
  clearRemoveError: () => void;
  convidando: boolean;
  convidarError: string | null;
  convidarSucesso: string | null;
  convidarColaborador: (email: string, nome?: string) => Promise<boolean>;
  clearConvidarFeedback: () => void;
}

export function useGestaoAcessos(): UseGestaoAcessosReturn {
  const { session, user } = useAuth();
  const licitanteId = session?.licitante.id ?? null;
  const currentUserId = user?.id ?? null;

  const [usuarios, setUsuarios] = useState<UsuarioLicitante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [convidando, setConvidando] = useState(false);
  const [convidarError, setConvidarError] = useState<string | null>(null);
  const [convidarSucesso, setConvidarSucesso] = useState<string | null>(null);

  const isAdmin = useMemo(
    () => usuarios.find((u) => u.userId === currentUserId)?.papel === 'ADMIN',
    [usuarios, currentUserId]
  );

  useEffect(() => {
    if (!licitanteId) return;

    setIsLoading(true);
    setError(null);

    listarUseCase
      .execute(licitanteId)
      .then(setUsuarios)
      .catch(() => setError('Não foi possível carregar os usuários. Tente novamente.'))
      .finally(() => setIsLoading(false));
  }, [licitanteId]);

  const revogarAcesso = useCallback(
    async (userId: string) => {
      if (!licitanteId) return;

      setRemovendoId(userId);
      setRemoveError(null);

      try {
        await revogarUseCase.execute(licitanteId, userId);
        setUsuarios((prev) => prev.filter((u) => u.userId !== userId));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao revogar acesso. Tente novamente.';
        setRemoveError(message);
      } finally {
        setRemovendoId(null);
      }
    },
    [licitanteId]
  );

  const clearRemoveError = useCallback(() => setRemoveError(null), []);

  const convidarColaborador = useCallback(
    async (email: string, nome?: string): Promise<boolean> => {
      if (!licitanteId) return false;

      setConvidando(true);
      setConvidarError(null);
      setConvidarSucesso(null);

      try {
        await convidarUseCase.execute(licitanteId, email, nome);
        setConvidarSucesso(`Convite enviado para ${email}.`);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Erro ao enviar convite. Tente novamente.';
        setConvidarError(message);
        return false;
      } finally {
        setConvidando(false);
      }
    },
    [licitanteId]
  );

  const clearConvidarFeedback = useCallback(() => {
    setConvidarError(null);
    setConvidarSucesso(null);
  }, []);

  return {
    usuarios,
    isLoading,
    error,
    currentUserId,
    isAdmin,
    removendoId,
    removeError,
    revogarAcesso,
    clearRemoveError,
    convidando,
    convidarError,
    convidarSucesso,
    convidarColaborador,
    clearConvidarFeedback,
  };
}
