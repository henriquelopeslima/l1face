import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { ListagemOrdensFornecimento } from '../entities/instrumentoContratual';

export class ListarOrdensFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  execute(instrumentoId: string): Promise<ListagemOrdensFornecimento> {
    return this.repository.listarOrdensFornecimento(instrumentoId);
  }
}
