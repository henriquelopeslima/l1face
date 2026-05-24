import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiAtaToAta } from '../mappers/atasMappers';
import { mapApiAtaDetalhesToAtaDetalhes } from '../mappers/ataDetalhesMappers';
import { mapCriarAtaInputToApiRequest } from '../mappers/criarAtaMappers';
import { mapApiDadosAtaPncpToDadosAtaPncp } from '../mappers/pncpMappers';
import type { Ata } from '../../domain/entities/ata';
import type { AtaDetalhes } from '../../domain/entities/ataDetalhes';
import type { CriarAtaInput, DadosAtaPncp } from '../../domain/entities/criarAta';
import { AtaError } from '../../domain/errors/ataErrors';
import type { IAtasRepository } from '../../domain/repositories/IAtasRepository';

export class AtasRepository implements IAtasRepository {
  async criarAta(input: CriarAtaInput): Promise<AtaDetalhes> {
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

    const data: unknown = await response.json();
    return mapApiAtaDetalhesToAtaDetalhes(data as Parameters<typeof mapApiAtaDetalhesToAtaDetalhes>[0]);
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
}
