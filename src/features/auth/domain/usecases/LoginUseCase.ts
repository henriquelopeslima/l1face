import type { LoginCredentials } from '../entities/authSession';
import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<void> {
    if (!credentials.email || !credentials.password) {
      throw new AuthError('E-mail e senha são obrigatórios');
    }
    await this.repository.login(credentials);
  }
}
