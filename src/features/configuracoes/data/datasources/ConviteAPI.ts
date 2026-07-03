import { apiFetch } from '@/shared/infrastructure/apiClient';
import {
  ConviteError,
  ConviteExpiradoError,
  ConviteJaRespondidoError,
  ConviteTokenInvalidoError,
} from '../../domain/errors/conviteErrors';
import type { AceitarConviteResultado } from '../../domain/entities/AceitarConviteResultado';

export class ConviteAPI {
  async aceitar(token: string): Promise<AceitarConviteResultado> {
    let response: Response;
    try {
      response = await apiFetch('/api/convites/aceitar', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch {
      throw new ConviteError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 400) {
      const data = await response.json() as { message?: string };
      throw new ConviteTokenInvalidoError(data.message ?? 'Este link de convite não é válido.');
    }

    if (response.status === 409) {
      const data = await response.json() as { message?: string };
      throw new ConviteJaRespondidoError(data.message ?? 'Este convite já foi respondido.');
    }

    if (response.status === 410) {
      const data = await response.json() as { message?: string };
      throw new ConviteExpiradoError(data.message ?? 'Este convite expirou.');
    }

    if (!response.ok) {
      throw new ConviteError('Erro ao aceitar convite. Tente novamente.');
    }

    const data = await response.json() as { message: string; contaCriada: boolean };
    return { message: data.message, contaCriada: data.contaCriada };
  }

  async recusar(token: string): Promise<{ message: string }> {
    let response: Response;
    try {
      response = await apiFetch('/api/convites/recusar', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch {
      throw new ConviteError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 400) {
      const data = await response.json() as { message?: string };
      throw new ConviteTokenInvalidoError(data.message ?? 'Este link de convite não é válido.');
    }

    if (response.status === 409) {
      const data = await response.json() as { message?: string };
      throw new ConviteJaRespondidoError(data.message ?? 'Este convite já foi respondido.');
    }

    if (response.status === 410) {
      const data = await response.json() as { message?: string };
      throw new ConviteExpiradoError(data.message ?? 'Este convite expirou.');
    }

    if (!response.ok) {
      throw new ConviteError('Erro ao recusar convite. Tente novamente.');
    }

    const data = await response.json() as { message: string };
    return { message: data.message };
  }
}
