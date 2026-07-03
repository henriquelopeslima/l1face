import { ConviteError } from '../errors/conviteErrors';
import type { IConviteRepository } from '../repositories/IConviteRepository';

export class RecusarConviteUseCase {
  constructor(private readonly repository: IConviteRepository) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token) throw new ConviteError('Token de convite é obrigatório.');
    return this.repository.recusar(token);
  }
}
