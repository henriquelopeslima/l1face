export interface ItemAtaInput {
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  valorEstimado: number;
  qtdRegistrada: number;
  qtdParaCarona: number;
}

export interface CriarAtaInput {
  numero: string;
  descricao: string;
  cnpjOrgaoGerenciador: string;
  nomeOrgaoGerenciador: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  aceitaAdesao: boolean;
  renovavel: boolean;
  numeroPncp: string | null;
  anexoUrl: string | null;
  itens: ItemAtaInput[];
}

export interface DadosAtaPncp {
  numeroControlePncp: string;
  titulo: string;
  descricao: string;
  orgaoCnpj: string;
  orgaoNome: string;
  unidadeNome: string;
  modalidadeLicitacao: string;
  dataAssinatura: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  situacao: string;
  cancelado: boolean;
  municipio: string;
  uf: string;
}
