import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiAtaToAta, mapApiListaAtasToListaAtas, type ApiListaAtasResponse } from '../mappers/atasMappers';
import { mapApiAtaDetalhesToAtaDetalhes } from '../mappers/ataDetalhesMappers';
import { mapCriarAtaInputToApiRequest } from '../mappers/criarAtaMappers';
import { mapApiDadosAtaPncpToDadosAtaPncp } from '../mappers/pncpMappers';
import type { Ata, ListaAtas } from '../../domain/entities/ata';
import type { AtaDetalhes } from '../../domain/entities/ataDetalhes';
import type { AnexoAtaResult } from '../../domain/entities/anexoAta';
import type { AtaCriada, CriarAtaInput, DadosAtaPncp } from '../../domain/entities/criarAta';
import { ArquivoMuitoGrandeAnexoError, AtaError, FormatoInvalidoAnexoError } from '../../domain/errors/ataErrors';
import type { IAtasRepository, ListarAtasParams } from '../../domain/repositories/IAtasRepository';

export class AtasRepository implements IAtasRepository {
  async criarAta(input: CriarAtaInput): Promise<AtaCriada> {
    let response: Response;
    try {
      response = await apiFetch('/api/atas', {
        method: 'POST',
        body: JSON.stringify(mapCriarAtaInputToApiRequest(input)),
      });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AtaError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 403) {
      throw new AtaError('Acesso negado ao licitante informado.');
    }

    if (response.status === 400) {
      throw new AtaError('Nenhum licitante ativo selecionado.');
    }

    if (response.status === 404) {
      throw new AtaError('Licitante não encontrado.');
    }

    if (response.status === 422) {
      const data = await response.json() as { error?: string };
      throw new AtaError(data.error ?? 'Dados inválidos. Verifique os campos e tente novamente.');
    }

    if (!response.ok) {
      throw new AtaError('Erro ao cadastrar ata. Tente novamente.');
    }

    const data = (await response.json()) as { id: string };
    return { id: data.id };
  }

  async consultarAtaPncp(codigo: string): Promise<DadosAtaPncp> {
    let response: Response;
    try {
      response = await apiFetch(`/api/pncp/atas?codigo=${encodeURIComponent(codigo)}`, { method: 'GET' });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AtaError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 400) {
      throw new AtaError('Código PNCP é obrigatório.');
    }

    if (response.status === 404 || response.status === 422 || response.status === 503) {
      const data = await response.json() as { erro?: string };
      throw new AtaError(data.erro ?? 'Erro ao consultar PNCP. Tente novamente.');
    }

    if (!response.ok) {
      throw new AtaError('Erro ao consultar PNCP. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiDadosAtaPncpToDadosAtaPncp(data as Parameters<typeof mapApiDadosAtaPncpToDadosAtaPncp>[0]);
  }

  async getAta(ataId: string): Promise<AtaDetalhes> {
    let response: Response;
    try {
      response = await apiFetch(`/api/atas/${encodeURIComponent(ataId)}`, { method: 'GET' });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AtaError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 403) {
      throw new AtaError('Acesso negado ao licitante informado.');
    }

    if (response.status === 404) {
      throw new AtaError('Ata não encontrada.');
    }

    if (!response.ok) {
      throw new AtaError('Erro ao carregar ata. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiAtaDetalhesToAtaDetalhes(data as Parameters<typeof mapApiAtaDetalhesToAtaDetalhes>[0]);
  }

  async listarAtas(): Promise<Ata[]> {
    let response: Response;
    try {
      response = await apiFetch('/api/atas', { method: 'GET' });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AtaError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 403) {
      throw new AtaError('Acesso negado. Você não tem permissão para visualizar estas atas.');
    }

    if (response.status === 400) {
      throw new AtaError('Nenhum licitante ativo selecionado.');
    }

    if (!response.ok) {
      throw new AtaError('Erro ao carregar atas. Tente novamente.');
    }

    const data: unknown = await response.json();
    return (data as Parameters<typeof mapApiAtaToAta>[0][]).map(mapApiAtaToAta);
  }

  async listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params?.page ?? 1));
    searchParams.set('limit', String(params?.limit ?? 20));
    if (params?.geral) searchParams.set('geral', params.geral);
    if (params?.status) searchParams.set('status', params.status);

    let response: Response;
    try {
      response = await apiFetch(`/api/atas?${searchParams.toString()}`, { method: 'GET' });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new AtaError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 403) {
      throw new AtaError('Acesso negado. Você não tem permissão para visualizar estas atas.');
    }

    if (response.status === 400) {
      throw new AtaError('Nenhum licitante ativo selecionado.');
    }

    if (response.status === 422) {
      throw new AtaError('Filtro de status inválido.');
    }

    if (!response.ok) {
      throw new AtaError('Erro ao carregar atas. Tente novamente.');
    }

    const data = (await response.json()) as ApiListaAtasResponse;
    return mapApiListaAtasToListaAtas(data);
  }

  async uploadAnexo(ataId: string, arquivo: File): Promise<AnexoAtaResult> {
    const formData = new FormData();
    formData.append('anexo', arquivo);

    let response: Response;
    try {
      response = await apiFetch(`/api/atas/${encodeURIComponent(ataId)}/anexo`, {
        method: 'PUT',
        body: formData,
      });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 404) {
      throw new AtaError('Ata não encontrada.');
    }
    if (response.status === 415) {
      throw new FormatoInvalidoAnexoError();
    }
    if (response.status === 422) {
      const data = (await response.json()) as { error?: string };
      if (data.error === 'arquivo_muito_grande') throw new ArquivoMuitoGrandeAnexoError();
      throw new FormatoInvalidoAnexoError();
    }
    if (response.status === 503) {
      throw new AtaError('Não foi possível armazenar o anexo. Tente novamente.');
    }
    if (!response.ok) {
      throw new AtaError('Erro ao enviar anexo. Tente novamente.');
    }

    const data = (await response.json()) as { anexo_url: string };
    return { anexoUrl: data.anexo_url };
  }

  async removerAnexo(ataId: string): Promise<void> {
    let response: Response;
    try {
      response = await apiFetch(`/api/atas/${encodeURIComponent(ataId)}/anexo`, { method: 'DELETE' });
    } catch {
      throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 204) return;
    if (response.status === 404) {
      throw new AtaError('Ata não encontrada.');
    }
    if (!response.ok) {
      throw new AtaError('Erro ao remover anexo. Tente novamente.');
    }
  }
}
