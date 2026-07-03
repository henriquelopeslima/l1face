import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { ListarUsuariosLicitanteUseCase } from '../../domain/usecases/ListarUsuariosLicitanteUseCase';
import { UsuarioLicitanteRepository } from '../../data/repositories/UsuarioLicitanteRepository';

const repository = new UsuarioLicitanteRepository();
const listarUseCase = new ListarUsuariosLicitanteUseCase(repository);

export interface UseIsAdminLicitanteReturn {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useIsAdminLicitante(): UseIsAdminLicitanteReturn {
  const { session, user } = useAuth();
  const licitanteId = session?.licitante.id ?? null;
  const currentUserId = user?.id ?? null;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!licitanteId) return;

    setIsLoading(true);

    listarUseCase
      .execute(licitanteId)
      .then((usuarios) => {
        setIsAdmin(usuarios.find((u) => u.userId === currentUserId)?.papel === 'ADMIN');
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, [licitanteId, currentUserId]);

  return { isAdmin, isLoading };
}
