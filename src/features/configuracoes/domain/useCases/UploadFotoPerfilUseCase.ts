import type { FotoPerfilResult } from '../entities/fotoPerfil';
import { ArquivoMuitoGrandeError, FormatoInvalidoError } from '../errors/perfilErrors';
import type { IPerfilRepository } from '../repositories/IPerfilRepository';

const TIPOS_ACEITOS = ['image/jpeg', 'image/png'];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export class UploadFotoPerfilUseCase {
  constructor(private readonly repository: IPerfilRepository) {}

  async execute(arquivo: File): Promise<FotoPerfilResult> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      throw new FormatoInvalidoError();
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      throw new ArquivoMuitoGrandeError();
    }
    return this.repository.uploadFoto(arquivo);
  }
}
