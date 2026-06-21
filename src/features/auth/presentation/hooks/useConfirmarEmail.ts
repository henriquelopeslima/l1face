import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ContaJaConfirmadaError, TokenExpiradoError, TokenInvalidoError } from '../../domain/errors/authErrors';
import { useAuth } from '../context/AuthContext';

type ConfirmacaoStatus = 'loading' | 'success' | 'invalid' | 'expired' | 'already_confirmed';

interface UseConfirmarEmailReturn {
  status: ConfirmacaoStatus;
  errorMessage: string | null;
}

export function useConfirmarEmail(token: string | null): UseConfirmarEmailReturn {
  const { confirmarEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmacaoStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMessage('Token de confirmação inválido.');
      return;
    }

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    confirmarEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus('success');
        redirectTimer = setTimeout(() => {
          if (!cancelled) navigate('/', { replace: true });
        }, 3000);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof TokenExpiradoError) {
          setStatus('expired');
          setErrorMessage(err.message);
        } else if (err instanceof ContaJaConfirmadaError) {
          setStatus('already_confirmed');
          setErrorMessage(err.message);
        } else if (err instanceof TokenInvalidoError) {
          setStatus('invalid');
          setErrorMessage(err.message);
        } else {
          setStatus('invalid');
          setErrorMessage('Não foi possível confirmar o e-mail. Tente novamente.');
        }
      });

    return () => {
      cancelled = true;
      if (redirectTimer !== null) clearTimeout(redirectTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { status, errorMessage };
}
