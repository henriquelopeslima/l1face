import type {
  ContratoDetalhe,
  EmpenhoDetalhe,
  InstrumentoDetalhe,
  InstrumentoListagem,
  ItemInstrumentoDetalhe,
  StatusInstrumento,
  TipoInstrumento,
  TipoPrazo,
} from '../../domain/entities/instrumentoContratual';

interface ApiInstrumentoListagemResponse {
  id: string;
  tipo: TipoInstrumento;
  numero: string | null;
  orgao: string;
  unidade: string;
  objeto: string;
  prazo_final: string | null;
  valor: number;
  saldo: number;
  status: StatusInstrumento;
}

export function mapApiInstrumentoListagemToInstrumentoListagem(
  raw: ApiInstrumentoListagemResponse,
): InstrumentoListagem {
  return {
    id: raw.id,
    tipo: raw.tipo,
    numero: raw.numero,
    orgao: raw.orgao,
    unidade: raw.unidade,
    objeto: raw.objeto,
    prazoFinal: raw.prazo_final,
    valor: raw.valor,
    saldo: raw.saldo,
    status: raw.status,
  };
}

interface ApiItemInstrumentoDetalheResponse {
  id: string;
  descricao: string;
  unidade_medida: string;
  quantidade_total: number;
  valor_unitario: number;
  valor_total: number;
}

interface ApiContratoDetalheResponse {
  id: string;
  numero_pncp: string | null;
  numero: string;
  orgao_contratante: string;
  unidade: string;
  objeto: string;
  vigencia_inicial: string;
  vigencia_final: string;
  endereco: string | null;
  prazo_entrega: number | null;
  tipo_prazo_entrega: TipoPrazo | null;
  prazo_pagamento: number | null;
  tipo_prazo_pagamento: TipoPrazo | null;
  endereco_entrega: string | null;
  renovavel: boolean;
  anexo_url: string | null;
  status: StatusInstrumento;
  criado_em: string;
}

interface ApiEmpenhoDetalheResponse {
  id: string;
  numero_pncp: string | null;
  orgao_contratante: string;
  unidade: string;
  objeto: string;
  anexo_url: string | null;
  status: StatusInstrumento;
  criado_em: string;
}

interface ApiInstrumentoDetalhesBase {
  instrumento_id: string;
  licitante_id: string;
  ata_id: string | null;
  criado_em: string;
  itens: ApiItemInstrumentoDetalheResponse[];
}

type ApiInstrumentoDetalhesResponse =
  | (ApiInstrumentoDetalhesBase & { tipo: 'CONTRATO'; contrato: ApiContratoDetalheResponse; empenho: null })
  | (ApiInstrumentoDetalhesBase & { tipo: 'EMPENHO'; empenho: ApiEmpenhoDetalheResponse; contrato: null });

function mapApiItem(raw: ApiItemInstrumentoDetalheResponse): ItemInstrumentoDetalhe {
  return {
    id: raw.id,
    descricao: raw.descricao,
    unidadeMedida: raw.unidade_medida,
    quantidadeTotal: raw.quantidade_total,
    valorUnitario: raw.valor_unitario,
    valorTotal: raw.valor_total,
  };
}

function mapApiContrato(raw: ApiContratoDetalheResponse): ContratoDetalhe {
  return {
    id: raw.id,
    numeroPncp: raw.numero_pncp,
    numero: raw.numero,
    orgaoContratante: raw.orgao_contratante,
    unidade: raw.unidade,
    objeto: raw.objeto,
    vigenciaInicial: raw.vigencia_inicial,
    vigenciaFinal: raw.vigencia_final,
    endereco: raw.endereco,
    prazoEntrega: raw.prazo_entrega,
    tipoPrazoEntrega: raw.tipo_prazo_entrega,
    prazoPagamento: raw.prazo_pagamento,
    tipoPrazoPagamento: raw.tipo_prazo_pagamento,
    enderecoEntrega: raw.endereco_entrega,
    renovavel: raw.renovavel,
    anexoUrl: raw.anexo_url,
    status: raw.status,
    criadoEm: raw.criado_em,
  };
}

function mapApiEmpenho(raw: ApiEmpenhoDetalheResponse): EmpenhoDetalhe {
  return {
    id: raw.id,
    numeroPncp: raw.numero_pncp,
    orgaoContratante: raw.orgao_contratante,
    unidade: raw.unidade,
    objeto: raw.objeto,
    anexoUrl: raw.anexo_url,
    status: raw.status,
    criadoEm: raw.criado_em,
  };
}

export function mapApiInstrumentoDetalhesToInstrumentoDetalhe(
  raw: ApiInstrumentoDetalhesResponse,
): InstrumentoDetalhe {
  const base = {
    instrumentoId: raw.instrumento_id,
    licitanteId: raw.licitante_id,
    ataId: raw.ata_id,
    criadoEm: raw.criado_em,
    itens: raw.itens.map(mapApiItem),
  };

  if (raw.tipo === 'CONTRATO') {
    return { ...base, tipo: 'CONTRATO', contrato: mapApiContrato(raw.contrato), empenho: null };
  }
  return { ...base, tipo: 'EMPENHO', empenho: mapApiEmpenho(raw.empenho), contrato: null };
}
