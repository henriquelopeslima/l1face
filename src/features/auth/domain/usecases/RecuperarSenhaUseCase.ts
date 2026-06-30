import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class RecuperarSenhaUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new AuthError('E-mail é obrigatório.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthError('Informe um e-mail válido.');
    }
    await this.repository.recuperarSenha(email);
  }
}
