import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiMeToUser } from '../mappers/authMappers';
import type { LoginCredentials } from '../../domain/entities/authSession';
import type { RegisterCredentials } from '../../domain/entities/registerCredentials';
import type { User } from '../../domain/entities/user';
import {
  AuthError,
  ContaJaConfirmadaError,
  EmailNaoConfirmadoError,
  RateLimitReenvioError,
  TokenExpiradoError,
  TokenInvalidoError,
  UnauthenticatedError,
} from '../../domain/errors/authErrors';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class AuthRepository implements IAuthRepository {
  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    let response: Response;
    try {
      response = await apiFetch('/api/users/register-with-bidder', {
        method: 'POST',
        body: JSON.stringify({
          nome: credentials.nome,
          email: credentials.email,
          password: credentials.password,
          cnpj: credentials.cnpj,
          razao_social: credentials.razaoSocial,
        }),
      });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 409) {
      const data = await response.json() as { error?: string };
      throw new AuthError(data.error ?? 'Conflito ao realizar cadastro.');
    }

    if (!response.ok) {
      throw new AuthError('Erro ao realizar cadastro. Tente novamente.');
    }

    const data = await response.json() as { message: string };
    return { message: data.message };
  }

  async login(credentials: LoginCredentials): Promise<void> {
    let response: Response;
    try {
      response = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      const data = await response.json() as { message?: string };
      if (data.message === 'email_nao_confirmado') {
        throw new EmailNaoConfirmadoError();
      }
      throw new AuthError('E-mail ou senha incorretos.');
    }

    if (!response.ok) {
      throw new AuthError('Erro inesperado ao realizar login. Tente novamente.');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch {
      // cookie expiry handled client-side even on network failure
    }
  }

  async getMe(): Promise<User> {
    let response: Response;
    try {
      response = await apiFetch('/api/me', { method: 'GET' });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new UnauthenticatedError();
    }

    if (!response.ok) {
      throw new AuthError('Erro ao carregar perfil do usuário.');
    }

    const data: unknown = await response.json();
    return mapApiMeToUser(data as Parameters<typeof mapApiMeToUser>[0]);
  }

  async confirmarEmail(token: string): Promise<void> {
    let response: Response;
    try {
      response = await apiFetch('/api/auth/confirmar-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 400) {
      const data = await response.json() as { message?: string };
      throw new TokenInvalidoError(data.message ?? 'Token de confirmação inválido.');
    }

    if (response.status === 409) {
      const data = await response.json() as { message?: string };
      throw new ContaJaConfirmadaError(data.message ?? 'Esta conta já foi confirmada.');
    }

    if (response.status === 410) {
      const data = await response.json() as { message?: string };
      throw new TokenExpiradoError(data.message ?? 'O link de confirmação expirou.');
    }

    if (!response.ok) {
      throw new AuthError('Erro ao confirmar e-mail. Tente novamente.');
    }
  }

  async reenviarConfirmacao(email: string): Promise<void> {
    let response: Response;
    try {
      response = await apiFetch('/api/auth/reenviar-confirmacao', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 429) {
      const data = await response.json() as { message?: string };
      throw new RateLimitReenvioError(
        data.message ?? 'Muitas tentativas de reenvio. Aguarde antes de tentar novamente.',
      );
    }

    if (!response.ok) {
      throw new AuthError('Erro ao reenviar e-mail. Tente novamente.');
    }
  }
}
