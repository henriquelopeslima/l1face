import { useNavigate } from 'react-router';
import type { Licitante } from '../../domain/entities/licitante';
import { useAuth } from '../context/AuthContext';

interface UseSelecionarLicitanteReturn {
  selectLicitante: (licitante: Licitante) => void;
}

export function useSelecionarLicitante(): UseSelecionarLicitanteReturn {
  const { selectLicitante } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (licitante: Licitante) => {
    selectLicitante(licitante);
    navigate('/');
  };

  return { selectLicitante: handleSelect };
}
