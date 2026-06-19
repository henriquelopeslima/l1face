import type { IniciarSeparacaoInput, OrdemFornecimento } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class IniciarSeparacaoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: IniciarSeparacaoInput): Promise<OrdemFornecimento> {
    return this.repository.iniciarSeparacaoOrdemFornecimento(input);
  }
}
