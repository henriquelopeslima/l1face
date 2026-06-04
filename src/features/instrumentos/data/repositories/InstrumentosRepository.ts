import { apiFetch } from '@/shared/infrastructure/apiClient';
import { mapApiDadosContratoPncpToDadosContratoPncp } from '../mappers/pncpContratosMappers';
import {
  mapApiInstrumentoDetalhesToInstrumentoDetalhe,
  mapApiInstrumentoListagemToInstrumentoListagem,
} from '../mappers/instrumentosMappers';
import { mapCriarContratoInputToApiRequest } from '../mappers/criarContratoMappers';
import { mapCriarEmpenhoInputToApiRequest } from '../mappers/criarEmpenhoMappers';
import {
  mapApiOrdemFornecimentoToOrdemFornecimento,
  mapApiListagemOrdensToListagemOrdensFornecimento,
} from '../mappers/ordemFornecimentoMappers';
import type { CriarContratoInput, CriarEmpenhoInput, DadosContratoPncp } from '../../domain/entities/criarContrato';
import type {
  InstrumentoDetalhe,
  InstrumentoListagem,
  ListagemOrdensFornecimento,
  OrdemFornecimento,
  EmitirOrdemFornecimentoInput,
  AvancarStatusOrdemFornecimentoInput,
  RegistrarLiquidacaoInput,
  RegistrarPagamentoInput,
} from '../../domain/entities/instrumentoContratual';
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

  async buscarInstrumento(id: string): Promise<InstrumentoDetalhe> {
    let response: Response;
    try {
      response = await apiFetch(`/api/instrumentos/${id}`, { method: 'GET' });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Instrumento não encontrado.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao carregar instrumento. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiInstrumentoDetalhesToInstrumentoDetalhe(
      data as Parameters<typeof mapApiInstrumentoDetalhesToInstrumentoDetalhe>[0],
    );
  }

  async listarOrdensFornecimento(instrumentoId: string): Promise<ListagemOrdensFornecimento> {
    let response: Response;
    try {
      response = await apiFetch(`/api/instrumentos/${instrumentoId}/ordens-fornecimento`, { method: 'GET' });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Instrumento não encontrado.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao carregar ordens de fornecimento. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiListagemOrdensToListagemOrdensFornecimento(
      data as Parameters<typeof mapApiListagemOrdensToListagemOrdensFornecimento>[0],
    );
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

  async emitirOrdemFornecimento(input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento> {
    let response: Response;
    try {
      response = await apiFetch(`/api/instrumentos/${input.instrumentoId}/ordens-fornecimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: input.itens.map((item) => ({
            item_instrumento_id: item.itemInstrumentoId,
            quantidade_fornecida: item.quantidadeFornecida,
            valor_unitario: item.valorUnitario,
          })),
        }),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 400) {
      const data = (await response.json()) as { error?: string };
      if (data.error === 'SALDO_INSUFICIENTE') {
        throw new InstrumentosError('Saldo do instrumento insuficiente para emitir esta OF.');
      }
      throw new InstrumentosError('Dados inválidos. Verifique as informações e tente novamente.');
    }
    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Instrumento não encontrado.');
    }
    if (response.status === 422) {
      const data = (await response.json()) as { error?: string; message?: string };
      if (data.error === 'ITEM_NAO_PERTENCE_AO_CONTRATO') {
        throw new InstrumentosError(data.message ?? 'Dados inválidos. Verifique as informações e tente novamente.');
      }
      throw new InstrumentosError('Dados inválidos. Verifique as informações e tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao emitir ordem de fornecimento. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiOrdemFornecimentoToOrdemFornecimento(
      data as Parameters<typeof mapApiOrdemFornecimentoToOrdemFornecimento>[0],
    );
  }

  async avancarStatusOrdemFornecimento(input: AvancarStatusOrdemFornecimentoInput): Promise<OrdemFornecimento> {
    let response: Response;
    try {
      response = await apiFetch(`/api/ordens-fornecimento/${input.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: input.status }),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Ordem de fornecimento não encontrada.');
    }
    if (response.status === 422) {
      const data = (await response.json()) as { error?: string; message?: string };
      if (data.error === 'TRANSICAO_STATUS_INVALIDA') {
        throw new InstrumentosError(data.message ?? 'Erro ao avançar status. Tente novamente.');
      }
      throw new InstrumentosError('Erro ao avançar status. Tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao avançar status. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiOrdemFornecimentoToOrdemFornecimento(
      data as Parameters<typeof mapApiOrdemFornecimentoToOrdemFornecimento>[0],
    );
  }

  async registrarLiquidacaoOrdemFornecimento(input: RegistrarLiquidacaoInput): Promise<OrdemFornecimento> {
    let response: Response;
    try {
      response = await apiFetch(`/api/ordens-fornecimento/${input.id}/liquidacao`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_liquidacao: input.dataLiquidacao,
          prazo_pagamento: input.prazoPagamento,
          numero_nfe: input.numeroNfe,
        }),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Ordem de fornecimento não encontrada.');
    }
    if (response.status === 422) {
      const data = (await response.json()) as { error?: string; message?: string };
      if (data.error === 'LIQUIDACAO_REQUER_ENTREGA') {
        throw new InstrumentosError("A liquidação só pode ser registrada após o status 'entregue'.");
      }
      throw new InstrumentosError(data.error ?? 'Erro ao registrar liquidação. Tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao registrar liquidação. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiOrdemFornecimentoToOrdemFornecimento(
      data as Parameters<typeof mapApiOrdemFornecimentoToOrdemFornecimento>[0],
    );
  }

  async registrarPagamentoOrdemFornecimento(input: RegistrarPagamentoInput): Promise<OrdemFornecimento> {
    let response: Response;
    try {
      response = await apiFetch(`/api/ordens-fornecimento/${input.id}/pagamento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_pagamento_efetivo: input.dataPagamentoEfetivo }),
      });
    } catch {
      throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
    }

    if (response.status === 401) {
      throw new InstrumentosError('Sessão expirada. Faça login novamente.');
    }
    if (response.status === 404) {
      throw new InstrumentosError('Ordem de fornecimento não encontrada.');
    }
    if (response.status === 422) {
      const data = (await response.json()) as { error?: string; message?: string };
      if (data.error === 'PAGAMENTO_REQUER_LIQUIDACAO') {
        throw new InstrumentosError('É necessário registrar a liquidação antes do pagamento.');
      }
      throw new InstrumentosError('Erro ao registrar pagamento. Tente novamente.');
    }
    if (!response.ok) {
      throw new InstrumentosError('Erro ao registrar pagamento. Tente novamente.');
    }

    const data: unknown = await response.json();
    return mapApiOrdemFornecimentoToOrdemFornecimento(
      data as Parameters<typeof mapApiOrdemFornecimentoToOrdemFornecimento>[0],
    );
  }
}
