import type { AtaCriada, CriarAtaInput } from '../entities/criarAta';
import type { IAtasRepository } from '../repositories/IAtasRepository';

export class CriarAtaUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(input: CriarAtaInput): Promise<AtaCriada> {
    return this.repository.criarAta(input);
  }
}
