import { mapApiMeToUser } from '../mappers/authMappers';
import type { LoginCredentials } from '../../domain/entities/authSession';
import type { RegisterCredentials } from '../../domain/entities/registerCredentials';
import type { User } from '../../domain/entities/user';
import { AuthError, UnauthenticatedError } from '../../domain/errors/authErrors';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class AuthRepository implements IAuthRepository {
  async register(credentials: RegisterCredentials): Promise<void> {
    let response: Response;
    try {
      response = await fetch('/api/users/register-with-bidder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
  }

  async login(credentials: LoginCredentials): Promise<void> {
    let response: Response;
    try {
      response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      });
    } catch {
      throw new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AuthError('E-mail ou senha incorretos.');
    }

    if (!response.ok) {
      throw new AuthError('Erro inesperado ao realizar login. Tente novamente.');
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // cookie expiry handled client-side even on network failure
    }
  }

  async getMe(): Promise<User> {
    let response: Response;
    try {
      response = await fetch('/api/me', {
        credentials: 'include',
      });
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
}
