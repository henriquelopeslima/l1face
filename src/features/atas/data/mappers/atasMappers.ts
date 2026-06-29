import type { Ata, AtaStatus } from '../../domain/entities/ata';

interface ApiAtaListagemResponse {
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
