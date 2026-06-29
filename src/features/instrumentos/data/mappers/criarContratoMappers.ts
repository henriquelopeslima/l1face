import type { CriarContratoInput } from '../../domain/entities/criarContrato';

export function mapCriarContratoInputToApiRequest(input: CriarContratoInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    numero: input.numero,
    orgao_contratante: input.orgaoContratante,
    unidade: input.unidade,
    objeto: input.objeto,
    vigencia_inicial: input.vigenciaInicial,
    vigencia_final: input.vigenciaFinal,
    renovavel: input.renovavel,
  };

  if (input.ataId != null) body.ata_id = input.ataId;
  if (input.isAdesao != null) body.adesao = input.isAdesao;
  if (input.numeroPncp != null) body.numero_pncp = input.numeroPncp;
  if (input.endereco != null) body.endereco = input.endereco;
  if (input.prazoEntrega != null) body.prazo_entrega = input.prazoEntrega;
  if (input.tipoPrazoEntrega != null) body.tipo_prazo_entrega = input.tipoPrazoEntrega;
  if (input.prazoPagamento != null) body.prazo_pagamento = input.prazoPagamento;
  if (input.tipoPrazoPagamento != null) body.tipo_prazo_pagamento = input.tipoPrazoPagamento;
  if (input.enderecoEntrega != null) body.endereco_entrega = input.enderecoEntrega;
  if (input.anexoUrl != null) body.anexo_url = input.anexoUrl;

  if (input.itens && input.itens.length > 0) {
    body.itens = input.itens.map((item) => {
      const apiItem: Record<string, unknown> = {
        descricao: item.descricao,
        unidade_medida: item.unidadeMedida,
        quantidade_total: item.quantidadeTotal,
        valor_unitario: item.valorUnitario,
        valor_total: item.valorTotal,
      };
      if (item.itemAtaId != null) apiItem.item_ata_id = item.itemAtaId;
      return apiItem;
    });
  }

  return body;
}
