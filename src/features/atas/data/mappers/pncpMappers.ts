import type { DadosAtaPncp } from '../../domain/entities/criarAta';

interface ApiDadosAtaPncpResponse {
  numero_controle_pncp: string;
  titulo: string;
  descricao: string;
  orgao_cnpj: string;
  orgao_nome: string;
  unidade_nome: string;
  modalidade_licitacao: string;
  data_assinatura: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  situacao: string;
  cancelado: boolean;
  municipio: string;
  uf: string;
}

export function mapApiDadosAtaPncpToDadosAtaPncp(raw: ApiDadosAtaPncpResponse): DadosAtaPncp {
  return {
    numeroControlePncp: raw.numero_controle_pncp,
    titulo: raw.titulo,
    descricao: raw.descricao,
    orgaoCnpj: raw.orgao_cnpj,
    orgaoNome: raw.orgao_nome,
    unidadeNome: raw.unidade_nome,
    modalidadeLicitacao: raw.modalidade_licitacao,
    dataAssinatura: raw.data_assinatura,
    dataInicioVigencia: raw.data_inicio_vigencia,
    dataFimVigencia: raw.data_fim_vigencia,
    situacao: raw.situacao,
    cancelado: raw.cancelado,
    municipio: raw.municipio,
    uf: raw.uf,
  };
}
