import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class ReenviarConfirmacaoEmailUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) throw new AuthError('E-mail é obrigatório.');
    await this.repository.reenviarConfirmacao(email);
  }
}
