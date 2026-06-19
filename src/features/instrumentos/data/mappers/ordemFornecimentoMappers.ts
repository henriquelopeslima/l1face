import type {
  ItemOrdemFornecimento,
  OrdemFornecimento,
  ListagemOrdensFornecimento,
  StatusOrdemFornecimento,
  StatusPagamento,
} from '../../domain/entities/instrumentoContratual';

interface ApiItemOrdemFornecimento {
  id: string;
  item_instrumento_id: string;
  descricao: string;
  unidade_medida: string;
  quantidade_fornecida: number;
  valor_unitario: number;
  valor_total: number;
}

interface ApiOrdemFornecimento {
  id: string;
  codigo: number;
  instrumento_id: string;
  status: StatusOrdemFornecimento;
  data_recebimento: string;
  prazo_entrega: string;
  data_separacao: string | null;
  data_despacho: string | null;
  codigo_rastreio: string | null;
  numero_nf_despacho: string | null;
  data_entrega: string | null;
  prazo_pagamento: string | null;
  data_liquidacao: string | null;
  data_pagamento_efetivo: string | null;
  status_pagamento: StatusPagamento;
  numero_nfe: string | null;
  valor_total: number;
  itens: ApiItemOrdemFornecimento[];
  criado_em: string;
}

interface ApiListagemOrdensFornecimento {
  instrumento_id: string;
  saldo_remanescente: number;
  ordens_fornecimento: ApiOrdemFornecimento[];
}

export function mapApiItemOrdemFornecimentoToItemOrdemFornecimento(
  api: ApiItemOrdemFornecimento,
): ItemOrdemFornecimento {
  return {
    id: api.id,
    itemInstrumentoId: api.item_instrumento_id,
    descricao: api.descricao,
    unidadeMedida: api.unidade_medida,
    quantidadeFornecida: api.quantidade_fornecida,
    valorUnitario: api.valor_unitario,
    valorTotal: api.valor_total,
  };
}

export function mapApiOrdemFornecimentoToOrdemFornecimento(
  api: ApiOrdemFornecimento,
): OrdemFornecimento {
  return {
    id: api.id,
    codigo: api.codigo,
    instrumentoId: api.instrumento_id,
    status: api.status,
    dataRecebimento: api.data_recebimento,
    prazoEntrega: api.prazo_entrega,
    dataSeparacao: api.data_separacao,
    dataDespacho: api.data_despacho,
    codigoRastreio: api.codigo_rastreio,
    numeroNfDespacho: api.numero_nf_despacho,
    dataEntrega: api.data_entrega,
    prazoPagamento: api.prazo_pagamento,
    dataLiquidacao: api.data_liquidacao,
    dataPagamentoEfetivo: api.data_pagamento_efetivo,
    statusPagamento: api.status_pagamento,
    numeroNfe: api.numero_nfe,
    valorTotal: api.valor_total,
    itens: api.itens.map(mapApiItemOrdemFornecimentoToItemOrdemFornecimento),
    criadoEm: api.criado_em,
  };
}

export function mapApiListagemOrdensToListagemOrdensFornecimento(
  api: ApiListagemOrdensFornecimento,
): ListagemOrdensFornecimento {
  return {
    instrumentoId: api.instrumento_id,
    saldoRemanescente: api.saldo_remanescente,
    ordensFornecimento: api.ordens_fornecimento.map(mapApiOrdemFornecimentoToOrdemFornecimento),
  };
}
