import type { Ata, AtaStatus, ListaAtas } from '../../domain/entities/ata';

export interface ApiAtaListagemResponse {
  id: string;
  numero: string;
  objeto: string;
  orgao_gerenciador: { nome: string; cnpj: string };
  vigencia_inicial: string;
  vigencia_final: string;
  valor: number;
  saldo: number;
  valor_carona: number;
  saldo_carona: number;
  contratos: number;
  status: string;
  aceita_adesao: boolean;
  renovavel: boolean;
}

export function mapApiAtaToAta(raw: ApiAtaListagemResponse): Ata {
  return {
    id: raw.id,
    numero: raw.numero,
    objeto: raw.objeto,
    orgaoGerenciador: raw.orgao_gerenciador,
    vigenciaInicial: raw.vigencia_inicial,
    vigenciaFinal: raw.vigencia_final,
    valorRegistrado: raw.valor ?? 0,
    saldo: raw.saldo ?? 0,
    valorCarona: raw.valor_carona ?? 0,
    saldoCarona: raw.saldo_carona ?? 0,
    contratos: raw.contratos ?? 0,
    status: raw.status as AtaStatus,
    aceitaAdesao: raw.aceita_adesao,
    renovavel: raw.renovavel,
  };
}

export interface ApiListaAtasResponse {
  data: ApiAtaListagemResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function mapApiListaAtasToListaAtas(raw: ApiListaAtasResponse): ListaAtas {
  return {
    itens: raw.data.map(mapApiAtaToAta),
    total: raw.meta.total,
    paginaAtual: raw.meta.page,
    totalPaginas: raw.meta.totalPages,
  };
}
