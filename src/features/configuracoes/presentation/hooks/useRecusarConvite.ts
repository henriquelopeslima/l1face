import { useEffect, useState } from 'react';
import { ConviteExpiradoError, ConviteJaRespondidoError, ConviteTokenInvalidoError } from '../../domain/errors/conviteErrors';
import { RecusarConviteUseCase } from '../../domain/usecases/RecusarConviteUseCase';
import { ConviteRepository } from '../../data/repositories/ConviteRepository';

const repository = new ConviteRepository();
const recusarUseCase = new RecusarConviteUseCase(repository);

type RecusarConviteStatus = 'loading' | 'success' | 'invalid' | 'expired' | 'already_responded';

export interface UseRecusarConviteReturn {
  status: RecusarConviteStatus;
  message: string | null;
}

export function useRecusarConvite(token: string | null): UseRecusarConviteReturn {
  const [status, setStatus] = useState<RecusarConviteStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Este link de convite não é válido.');
      return;
    }

    let cancelled = false;

    recusarUseCase
      .execute(token)
      .then((resultado) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(resultado.message);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ConviteExpiradoError) {
          setStatus('expired');
          setMessage(err.message);
        } else if (err instanceof ConviteJaRespondidoError) {
          setStatus('already_responded');
          setMessage(err.message);
        } else if (err instanceof ConviteTokenInvalidoError) {
          setStatus('invalid');
          setMessage(err.message);
        } else {
          setStatus('invalid');
          setMessage('Não foi possível recusar o convite. Tente novamente.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { status, message };
}
