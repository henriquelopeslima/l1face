import type { CriarEmpenhoInput } from '../entities/criarContrato';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

export class CriarEmpenhoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(input: CriarEmpenhoInput): Promise<string> {
    return this.repository.criarEmpenho(input);
  }
}
