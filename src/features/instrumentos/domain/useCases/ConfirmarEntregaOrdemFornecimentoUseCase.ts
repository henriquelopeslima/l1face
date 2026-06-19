import type { ConfirmarEntregaInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class ConfirmarEntregaOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: ConfirmarEntregaInput): Promise<OrdemFornecimento> {
    return this.repository.confirmarEntregaOrdemFornecimento(input);
  }
}
