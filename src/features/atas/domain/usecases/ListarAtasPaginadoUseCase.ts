import type { ListaAtas } from '../entities/ata';
import type { IAtasRepository, ListarAtasParams } from '../repositories/IAtasRepository';

export class ListarAtasPaginadoUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(params?: ListarAtasParams): Promise<ListaAtas> {
    return this.repository.listarAtasPaginado(params);
  }
}
