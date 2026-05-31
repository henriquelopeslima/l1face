import type { CriarContratoInput } from '../entities/criarContrato';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class CriarContratoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: CriarContratoInput): Promise<string> {
    if (input.vigenciaFinal < input.vigenciaInicial) {
      throw new Error('Data de vigência final deve ser igual ou posterior à data inicial.');
    }
    if (input.tipoPrazoEntrega != null && input.tipoPrazoEntrega !== 'UTEIS' && input.tipoPrazoEntrega !== 'CORRIDOS') {
      throw new Error('Tipo de prazo de entrega inválido. Use UTEIS ou CORRIDOS.');
    }
    if (input.tipoPrazoPagamento != null && input.tipoPrazoPagamento !== 'UTEIS' && input.tipoPrazoPagamento !== 'CORRIDOS') {
      throw new Error('Tipo de prazo de pagamento inválido. Use UTEIS ou CORRIDOS.');
    }
    return this.repository.criarContrato(input);
  }
}
