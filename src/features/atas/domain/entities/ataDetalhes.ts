import type { AtaStatus } from './ata';
import type { InstrumentoListagem } from '@/features/instrumentos/domain/entities/instrumentoContratual';

export interface ItemAta {
  id: string;
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  valorEstimado: number;
  qtdOrgao: number;
  qtdCarona: number;
  qtdSaldoOrgao: number;
  qtdSaldoCarona: number;
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
  instrumentos: InstrumentoListagem[];
}
