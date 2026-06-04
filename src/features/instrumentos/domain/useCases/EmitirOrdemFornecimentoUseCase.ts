import type { EmitirOrdemFornecimentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class EmitirOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  async execute(input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento> {
    return this.repository.emitirOrdemFornecimento(input);
  }
}
