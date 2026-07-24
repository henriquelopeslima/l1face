import type { ListaInstrumentos } from '../entities/instrumentoContratual';
import type { IInstrumentosRepository, ListarInstrumentosParams } from '../contracts/IInstrumentosRepository';

export class ListarInstrumentosUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(params?: ListarInstrumentosParams): Promise<ListaInstrumentos> {
    return this.repository.listarInstrumentos(params);
  }
}
