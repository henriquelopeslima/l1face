import type { AvancarStatusOrdemFornecimentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class AvancarStatusOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: AvancarStatusOrdemFornecimentoInput): Promise<OrdemFornecimento> {
    return this.repository.avancarStatusOrdemFornecimento(input);
  }
}
