import type { DadosContratoPncp } from '../entities/criarContrato';

export interface IInstrumentosRepository {
  consultarContratoPncp(codigo: string): Promise<DadosContratoPncp>;
}
