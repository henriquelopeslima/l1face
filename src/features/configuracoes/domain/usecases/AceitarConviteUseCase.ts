import { ConviteError } from '../errors/conviteErrors';
import type { AceitarConviteResultado } from '../entities/AceitarConviteResultado';
import type { IConviteRepository } from '../repositories/IConviteRepository';

export class AceitarConviteUseCase {
  constructor(private readonly repository: IConviteRepository) {}

  async execute(token: string): Promise<AceitarConviteResultado> {
    if (!token) throw new ConviteError('Token de convite é obrigatório.');
    return this.repository.aceitar(token);
  }
}
