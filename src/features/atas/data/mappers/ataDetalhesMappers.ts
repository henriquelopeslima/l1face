import type { AtaDetalhes, ItemAta } from '../../domain/entities/ataDetalhes';
import type { AtaStatus } from '../../domain/entities/ata';

interface ApiItemAtaResponse {
  id: string;
  numero_item: number;
  descricao: string;
  unidade_medida: string;
  valor_estimado: number;
  qtd_registrada: number;
  qtd_para_carona: number;
  qtd_consumida_orgao: number;
  qtd_consumida_carona: number;
}

interface ApiAtaDetalhesResponse {
  id: string;
  numero: string;
  descricao: string;
  cnpj_orgao_gerenciador: string;
  nome_orgao_gerenciador: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  aceita_adesao: boolean;
  renovavel: boolean;
  numero_pncp: string | null;
  anexo_url: string | null;
  status: string;
  itens: ApiItemAtaResponse[];
}

export function mapApiItemAtaToItemAta(raw: ApiItemAtaResponse): ItemAta {
  return {
    id: raw.id,
    numeroItem: raw.numero_item,
    descricao: raw.descricao,
    unidadeMedida: raw.unidade_medida,
    valorEstimado: raw.valor_estimado,
    qtdRegistrada: raw.qtd_registrada,
    qtdParaCarona: raw.qtd_para_carona,
    qtdConsumidaOrgao: raw.qtd_consumida_orgao,
    qtdConsumidaCarona: raw.qtd_consumida_carona,
  };
}

export function mapApiAtaDetalhesToAtaDetalhes(raw: ApiAtaDetalhesResponse): AtaDetalhes {
  return {
    id: raw.id,
    numero: raw.numero,
    descricao: raw.descricao,
    cnpjOrgaoGerenciador: raw.cnpj_orgao_gerenciador,
    nomeOrgaoGerenciador: raw.nome_orgao_gerenciador,
    dataInicioVigencia: raw.data_inicio_vigencia,
    dataFimVigencia: raw.data_fim_vigencia,
    aceitaAdesao: raw.aceita_adesao,
    renovavel: raw.renovavel,
    numeroPncp: raw.numero_pncp,
    anexoUrl: raw.anexo_url,
    status: raw.status as AtaStatus,
    itens: raw.itens.map(mapApiItemAtaToItemAta),
  };
}
