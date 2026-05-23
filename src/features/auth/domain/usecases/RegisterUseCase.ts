import type { RegisterCredentials } from '../entities/registerCredentials';
import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(credentials: RegisterCredentials): Promise<void> {
    if (!credentials.nome) throw new AuthError('Nome é obrigatório');
    if (!credentials.email) throw new AuthError('E-mail é obrigatório');
    if (!credentials.password) throw new AuthError('Senha é obrigatória');
    if (!credentials.cnpj) throw new AuthError('CNPJ é obrigatório');
    if (!credentials.razaoSocial) throw new AuthError('Razão social é obrigatória');
    await this.repository.register(credentials);
  }
}
