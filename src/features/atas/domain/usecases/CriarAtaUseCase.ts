import type { AtaDetalhes } from '../entities/ataDetalhes';
import type { CriarAtaInput } from '../entities/criarAta';
import type { IAtasRepository } from '../repositories/IAtasRepository';

export class CriarAtaUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(input: CriarAtaInput): Promise<AtaDetalhes> {
    return this.repository.criarAta(input);
  }
}
