import type { DadosAtaPncp } from '../entities/criarAta';
import type { IAtasRepository } from '../repositories/IAtasRepository';

export class ConsultarAtaPncpUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(codigo: string): Promise<DadosAtaPncp> {
    return this.repository.consultarAtaPncp(codigo);
  }
}
