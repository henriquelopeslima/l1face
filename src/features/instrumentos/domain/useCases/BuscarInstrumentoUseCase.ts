import type { InstrumentoDetalhe } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class BuscarInstrumentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(id: string): Promise<InstrumentoDetalhe> {
    return this.repository.buscarInstrumento(id);
  }
}
