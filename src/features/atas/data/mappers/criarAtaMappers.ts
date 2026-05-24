import type { CriarAtaInput, ItemAtaInput } from '../../domain/entities/criarAta';

interface ApiItemAtaRequest {
  numero_item: number;
  descricao: string;
  unidade_medida: string;
  valor_estimado: number;
  qtd_registrada: number;
  qtd_para_carona: number;
}

interface ApiCriarAtaRequest {
  numero: string;
  descricao: string;
  ativo: true;
  cnpj_orgao_gerenciador: string;
  nome_orgao_gerenciador: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  aceita_adesao: boolean;
  renovavel: boolean;
  numero_pncp: string | null;
  anexo_url: string | null;
  itens: ApiItemAtaRequest[];
}

function mapItemAtaInputToApiRequest(item: ItemAtaInput): ApiItemAtaRequest {
  return {
    numero_item: item.numeroItem,
    descricao: item.descricao,
    unidade_medida: item.unidadeMedida,
    valor_estimado: item.valorEstimado,
    qtd_registrada: item.qtdRegistrada,
    qtd_para_carona: item.qtdParaCarona,
  };
}

export function mapCriarAtaInputToApiRequest(input: CriarAtaInput): ApiCriarAtaRequest {
  return {
    numero: input.numero,
    descricao: input.descricao,
    ativo: true,
    cnpj_orgao_gerenciador: input.cnpjOrgaoGerenciador,
    nome_orgao_gerenciador: input.nomeOrgaoGerenciador,
    data_inicio_vigencia: input.dataInicioVigencia,
    data_fim_vigencia: input.dataFimVigencia,
    aceita_adesao: input.aceitaAdesao,
    renovavel: input.renovavel,
    numero_pncp: input.numeroPncp,
    anexo_url: input.anexoUrl || null,
    itens: input.itens.map(mapItemAtaInputToApiRequest),
  };
}
