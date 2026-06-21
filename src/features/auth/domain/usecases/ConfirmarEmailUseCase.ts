import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class ConfirmarEmailUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(token: string): Promise<void> {
    if (!token) throw new AuthError('Token de confirmação é obrigatório.');
    await this.repository.confirmarEmail(token);
  }
}
