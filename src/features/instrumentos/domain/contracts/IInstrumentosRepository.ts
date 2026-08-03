import type { CriarContratoInput, CriarEmpenhoInput, DadosContratoPncp } from '../entities/criarContrato';
import type { AnexoInstrumentoResult } from '../entities/anexoInstrumento';
import type {
  InstrumentoDetalhe,
  ListagemOrdensFornecimento,
  ListaInstrumentos,
  EmitirOrdemFornecimentoInput,
  IniciarSeparacaoInput,
  RegistrarDespachoInput,
  ConfirmarEntregaInput,
  OrdemFornecimento,
  RegistrarLiquidacaoInput,
  RegistrarPagamentoInput,
} from '../entities/instrumentoContratual';

export interface ListarInstrumentosParams {
  page?: number;
  limit?: number;
}

export interface IInstrumentosRepository {
  consultarContratoPncp(codigo: string): Promise<DadosContratoPncp>;
  listarInstrumentos(params?: ListarInstrumentosParams): Promise<ListaInstrumentos>;
  criarContrato(input: CriarContratoInput): Promise<string>;
  criarEmpenho(input: CriarEmpenhoInput): Promise<string>;
  buscarInstrumento(id: string): Promise<InstrumentoDetalhe>;
  listarOrdensFornecimento(instrumentoId: string): Promise<ListagemOrdensFornecimento>;
  emitirOrdemFornecimento(input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento>;
  iniciarSeparacaoOrdemFornecimento(input: IniciarSeparacaoInput): Promise<OrdemFornecimento>;
  registrarDespachoOrdemFornecimento(input: RegistrarDespachoInput): Promise<OrdemFornecimento>;
  confirmarEntregaOrdemFornecimento(input: ConfirmarEntregaInput): Promise<OrdemFornecimento>;
  registrarLiquidacaoOrdemFornecimento(input: RegistrarLiquidacaoInput): Promise<OrdemFornecimento>;
  registrarPagamentoOrdemFornecimento(input: RegistrarPagamentoInput): Promise<OrdemFornecimento>;
  uploadAnexoContrato(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult>;
  removerAnexoContrato(instrumentoId: string): Promise<void>;
  uploadAnexoEmpenho(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult>;
  removerAnexoEmpenho(instrumentoId: string): Promise<void>;
}
