import { useEffect, useState } from 'react';
import { ConviteExpiradoError, ConviteJaRespondidoError, ConviteTokenInvalidoError } from '../../domain/errors/conviteErrors';
import { AceitarConviteUseCase } from '../../domain/usecases/AceitarConviteUseCase';
import { ConviteRepository } from '../../data/repositories/ConviteRepository';

const repository = new ConviteRepository();
const aceitarUseCase = new AceitarConviteUseCase(repository);

type AceitarConviteStatus = 'loading' | 'success' | 'invalid' | 'expired' | 'already_responded';

export interface UseAceitarConviteReturn {
  status: AceitarConviteStatus;
  message: string | null;
  contaCriada: boolean;
}

export function useAceitarConvite(token: string | null): UseAceitarConviteReturn {
  const [status, setStatus] = useState<AceitarConviteStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [contaCriada, setContaCriada] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Este link de convite não é válido.');
      return;
    }

    let cancelled = false;

    aceitarUseCase
      .execute(token)
      .then((resultado) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(resultado.message);
        setContaCriada(resultado.contaCriada);
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
          setMessage('Não foi possível aceitar o convite. Tente novamente.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { status, message, contaCriada };
}
