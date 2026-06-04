import type { RegistrarPagamentoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class RegistrarPagamentoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: RegistrarPagamentoInput): Promise<OrdemFornecimento> {
    return this.repository.registrarPagamentoOrdemFornecimento(input);
  }
}
