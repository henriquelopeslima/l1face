import type { CriarContratoInput, CriarEmpenhoInput, DadosContratoPncp } from '../entities/criarContrato';
import type {
  InstrumentoDetalhe,
  InstrumentoListagem,
  ListagemOrdensFornecimento,
  EmitirOrdemFornecimentoInput,
  IniciarSeparacaoInput,
  RegistrarDespachoInput,
  ConfirmarEntregaInput,
  OrdemFornecimento,
  RegistrarLiquidacaoInput,
  RegistrarPagamentoInput,
} from '../entities/instrumentoContratual';

export interface IInstrumentosRepository {
  consultarContratoPncp(codigo: string): Promise<DadosContratoPncp>;
  listarInstrumentos(): Promise<InstrumentoListagem[]>;
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
}
