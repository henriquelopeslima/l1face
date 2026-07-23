import type { CriarEmpenhoInput } from '../../domain/entities/criarContrato';

export function mapCriarEmpenhoInputToApiRequest(input: CriarEmpenhoInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    numero: input.numero,
    orgao_contratante: input.orgaoContratante,
    unidade: input.unidade,
    objeto: input.objeto,
  };

  if (input.ataId != null) body.ata_id = input.ataId;
  if (input.isAdesao != null) body.adesao = input.isAdesao;
  if (input.numeroPncp != null) body.numero_pncp = input.numeroPncp;
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
