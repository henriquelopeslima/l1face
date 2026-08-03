import type { AnexoAtaResult } from '../entities/anexoAta';
import { ArquivoMuitoGrandeAnexoError, FormatoInvalidoAnexoError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';

const TIPOS_ACEITOS = ['application/pdf'];
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export class UploadAnexoAtaUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(ataId: string, arquivo: File): Promise<AnexoAtaResult> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      throw new FormatoInvalidoAnexoError();
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      throw new ArquivoMuitoGrandeAnexoError();
    }
    return this.repository.uploadAnexo(ataId, arquivo);
  }
}
