import type { CriarContratoInput, CriarEmpenhoInput, DadosContratoPncp } from '../entities/criarContrato';
import type { InstrumentoDetalhe, InstrumentoListagem } from '../entities/instrumentoContratual';

export interface IInstrumentosRepository {
  consultarContratoPncp(codigo: string): Promise<DadosContratoPncp>;
  listarInstrumentos(): Promise<InstrumentoListagem[]>;
  criarContrato(input: CriarContratoInput): Promise<string>;
  criarEmpenho(input: CriarEmpenhoInput): Promise<string>;
  buscarInstrumento(id: string): Promise<InstrumentoDetalhe>;
}
