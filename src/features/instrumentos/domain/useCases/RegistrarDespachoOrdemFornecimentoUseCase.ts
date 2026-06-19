import type { RegistrarDespachoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class RegistrarDespachoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: RegistrarDespachoInput): Promise<OrdemFornecimento> {
    return this.repository.registrarDespachoOrdemFornecimento(input);
  }
}
