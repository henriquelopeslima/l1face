import type { AnexoInstrumentoResult } from '../entities/anexoInstrumento';
import { ArquivoMuitoGrandeAnexoError, FormatoInvalidoAnexoError } from '../errors/instrumentosErrors';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';

const TIPOS_ACEITOS = ['application/pdf'];
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export class UploadAnexoContratoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      throw new FormatoInvalidoAnexoError();
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      throw new ArquivoMuitoGrandeAnexoError();
    }
    return this.repository.uploadAnexoContrato(instrumentoId, arquivo);
  }
}
