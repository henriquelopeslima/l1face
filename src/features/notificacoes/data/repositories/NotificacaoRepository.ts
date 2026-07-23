import { apiFetch } from '@/shared/infrastructure/apiClient';
import type { INotificacaoRepository } from '../../domain/contracts/INotificacaoRepository';
import type { ListaNotificacoes, Notificacao } from '../../domain/entities/Notificacao';
import {
  mapApiListaNotificacoesToListaNotificacoes,
  mapApiNotificacaoToNotificacao,
  type ApiListaNotificacoesResponse,
  type ApiNotificacaoResponse,
} from '../mappers/notificacaoMappers';

class NotificacaoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificacaoError';
  }
}

function errorParaListagem(status: number): string {
  if (status === 400) return 'Não foi possível identificar a empresa ativa. Atualize a página e tente novamente.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem acesso às notificações desta empresa.';
  if (status === 404) return 'Não foi possível localizar a empresa. Atualize a página e tente novamente.';
  return 'Não foi possível carregar as notificações. Tente novamente.';
}

function errorParaMarcarLida(status: number): string {
  if (status === 400) return 'Não foi possível identificar a empresa ativa. Atualize a página e tente novamente.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem acesso às notificações desta empresa.';
  if (status === 404) return 'Notificação não encontrada.';
  return 'Não foi possível atualizar a notificação. Tente novamente.';
}

function errorParaMarcarTodasLidas(status: number): string {
  if (status === 400) return 'Não foi possível identificar a empresa ativa. Atualize a página e tente novamente.';
  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem acesso às notificações desta empresa.';
  return 'Não foi possível atualizar as notificações. Tente novamente.';
}

export class NotificacaoRepository implements INotificacaoRepository {
  async listar(): Promise<ListaNotificacoes> {
    let response: Response;
    try {
      response = await apiFetch('/api/notificacoes?limit=20', { method: 'GET' });
    } catch {
      throw new NotificacaoError('Não foi possível carregar as notificações. Tente novamente.');
    }

    if (!response.ok) {
      throw new NotificacaoError(errorParaListagem(response.status));
    }

    const data = (await response.json()) as ApiListaNotificacoesResponse;
    return mapApiListaNotificacoesToListaNotificacoes(data);
  }

  async marcarComoLida(id: string): Promise<Notificacao> {
    let response: Response;
    try {
      response = await apiFetch(`/api/notificacoes/${id}/lida`, { method: 'PATCH' });
    } catch {
      throw new NotificacaoError('Não foi possível atualizar a notificação. Tente novamente.');
    }

    if (!response.ok) {
      throw new NotificacaoError(errorParaMarcarLida(response.status));
    }

    const data = (await response.json()) as ApiNotificacaoResponse;
    return mapApiNotificacaoToNotificacao(data);
  }

  async marcarTodasComoLidas(): Promise<{ marcadas: number }> {
    let response: Response;
    try {
      response = await apiFetch('/api/notificacoes/lidas', { method: 'PATCH' });
    } catch {
      throw new NotificacaoError('Não foi possível atualizar as notificações. Tente novamente.');
    }

    if (!response.ok) {
      throw new NotificacaoError(errorParaMarcarTodasLidas(response.status));
    }

    return (await response.json()) as { marcadas: number };
  }
}
