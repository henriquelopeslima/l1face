import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { FotoPerfilResult } from '../../domain/entities/fotoPerfil';
import {
  ArquivoInvalidoError,
  ArquivoMuitoGrandeError,
  PerfilError,
  StorageIndisponivelError,
} from '../../domain/errors/perfilErrors';
import type { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';

export class PerfilRepository implements IPerfilRepository {
  async uploadFoto(arquivo: File): Promise<FotoPerfilResult> {
    const formData = new FormData();
    formData.append('foto', arquivo);

    let response: Response;
    try {
      response = await apiFetch('/api/perfil/foto', { method: 'PUT', body: formData });
    } catch {
      throw new PerfilError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 415) {
      throw new PerfilError('Formato não suportado. Envie um arquivo JPEG ou PNG.');
    }

    if (response.status === 422) {
      const data = await response.json() as { error?: string };
      if (data.error === 'arquivo_muito_grande') throw new ArquivoMuitoGrandeError();
      if (data.error === 'arquivo_invalido') throw new ArquivoInvalidoError();
      throw new PerfilError('Arquivo inválido. Tente novamente.');
    }

    if (response.status === 503) {
      throw new StorageIndisponivelError();
    }

    if (!response.ok) {
      throw new PerfilError('Erro ao enviar foto. Tente novamente.');
    }

    const data = await response.json() as { foto_url: string };
    return { fotoUrl: data.foto_url };
  }

  async removerFoto(): Promise<void> {
    let response: Response;
    try {
      response = await apiFetch('/api/perfil/foto', { method: 'DELETE' });
    } catch {
      throw new PerfilError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 204) return;

    if (!response.ok) {
      throw new PerfilError('Erro ao remover foto. Tente novamente.');
    }
  }
}
