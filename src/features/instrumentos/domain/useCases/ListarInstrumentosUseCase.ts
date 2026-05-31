import type { InstrumentoListagem } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class ListarInstrumentosUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(): Promise<InstrumentoListagem[]> {
    return this.repository.listarInstrumentos();
  }
}
