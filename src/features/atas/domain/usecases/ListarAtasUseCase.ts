import type { Ata } from '../entities/ata';
import type { IAtasRepository } from '../repositories/IAtasRepository';

export class ListarAtasUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(): Promise<Ata[]> {
    return this.repository.listarAtas();
  }
}
