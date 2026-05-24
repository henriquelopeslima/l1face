import type { AtaStatus } from './ata';

export interface ItemAta {
  id: string;
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  valorEstimado: number;
  qtdRegistrada: number;
  qtdParaCarona: number;
  qtdConsumidaOrgao: number;
  qtdConsumidaCarona: number;
}

export interface AtaDetalhes {
  id: string;
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
  status: AtaStatus;
  itens: ItemAta[];
}
