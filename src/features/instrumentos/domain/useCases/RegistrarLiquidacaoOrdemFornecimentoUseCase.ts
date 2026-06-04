import type { RegistrarLiquidacaoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class RegistrarLiquidacaoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: RegistrarLiquidacaoInput): Promise<OrdemFornecimento> {
    return this.repository.registrarLiquidacaoOrdemFornecimento(input);
  }
}
