import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiDadosContratoPncpToDadosContratoPncp } from '../mappers/pncpContratosMappers';
import { mapApiInstrumentoListagemToInstrumentoListagem } from '../mappers/instrumentosMappers';
import { mapCriarContratoInputToApiRequest } from '../mappers/criarContratoMappers';
import { mapCriarEmpenhoInputToApiRequest } from '../mappers/criarEmpenhoMappers';
import type { CriarContratoInput, CriarEmpenhoInput, DadosContratoPncp } from '../../domain/entities/criarContrato';
import type { InstrumentoListagem } from '../../domain/entities/instrumentoContratual';
import type { IInstrumentosRepository } from '../../domain/contracts/IInstrumentosRepository';

class InstrumentosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstrumentosError';
  }
}

export class InstrumentosRepository implements IInstrumentosRepository {
  async listarInstrumentos(): Promise<InstrumentoListagem[]> {
    let response: Response;
    try {
      response = await apiFetch('/api/instrumentos', { method: 'GET' });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 403) {
      throw new InstrumentosError('Acesso negado ao licitante informado.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Licitante não encontrado.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao carregar instrumentos. Tente novamente.');
    }

    const data: unknown = await response.json();
    return (data as Parameters<typeof mapApiInstrumentoListagemToInstrumentoListagem>[0][]).map(
      mapApiInstrumentoListagemToInstrumentoListagem,
    );
  }

  async criarContrato(input: CriarContratoInput): Promise<string> {
    let response: Response;
    try {
      response = await apiFetch('/api/instrumentos/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapCriarContratoInputToApiRequest(input)),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 403) {
      throw new InstrumentosError('Acesso negado ao licitante informado.');
    }
    if (response.status === 422 || response.status === 400) {
      const data = (await response.json()) as { error?: string };
      throw new InstrumentosError(data.error ?? 'Dados inválidos. Verifique as informações e tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao cadastrar contrato. Tente novamente.');
    }

    const data = (await response.json()) as { instrumento_id: string };
    return data.instrumento_id;
  }

  async criarEmpenho(input: CriarEmpenhoInput): Promise<string> {
    let response: Response;
    try {
      response = await apiFetch('/api/instrumentos/empenhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapCriarEmpenhoInputToApiRequest(input)),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 403) {
      throw new InstrumentosError('Acesso negado ao licitante informado.');
    }
    if (response.status === 422 || response.status === 400) {
      const data = (await response.json()) as { error?: string };
      throw new InstrumentosError(data.error ?? 'Dados inválidos. Verifique as informações e tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao cadastrar empenho. Tente novamente.');
    }

    const data = (await response.json()) as { instrumento_id: string };
    return data.instrumento_id;
  }

  async consultarContratoPncp(codigo: string): Promise<DadosContratoPncp> {
    let response: Response;
    try {
      response = await apiFetch(`/api/pncp/contratos?codigo=${encodeURIComponent(codigo)}`, {
        method: 'GET',
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }

    if (response.status === 400) {
      throw new InstrumentosError('Código PNCP é obrigatório.');
    }

    if (response.status === 404 || response.status === 422 || response.status === 503) {
      const data = (await response.json()) as { erro?: string };
      throw new InstrumentosError(data.erro ?? 'Erro ao consultar PNCP. Tente novamente.');
    }

    if (!response.ok) {
      throw new InstrumentosError('Erro ao consultar PNCP. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiDadosContratoPncpToDadosContratoPncp(
      data as Parameters<typeof mapApiDadosContratoPncpToDadosContratoPncp>[0],
    );
  }
}
