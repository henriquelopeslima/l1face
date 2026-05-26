import type { DadosContratoPncp } from '../entities/criarContrato';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class ConsultarContratoPncpUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(codigo: string): Promise<DadosContratoPncp> {
    return this.repository.consultarContratoPncp(codigo);
  }
}
