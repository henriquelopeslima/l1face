import type { AtaDetalhes } from '../entities/ataDetalhes';
import type { IAtasRepository } from '../repositories/IAtasRepository';

export class GetAtaUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(ataId: string): Promise<AtaDetalhes> {
    return this.repository.getAta(ataId);
  }
}
