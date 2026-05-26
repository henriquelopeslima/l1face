import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiDadosContratoPncpToDadosContratoPncp } from '../mappers/pncpContratosMappers';
import type { DadosContratoPncp } from '../../domain/entities/criarContrato';
import type { IInstrumentosRepository } from '../../domain/contracts/IInstrumentosRepository';

class InstrumentosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstrumentosError';
  }
}

export class InstrumentosRepository implements IInstrumentosRepository {
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
