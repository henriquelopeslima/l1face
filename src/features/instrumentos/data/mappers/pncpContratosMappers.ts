import type { DadosContratoPncp } from '../../domain/entities/criarContrato';

interface ApiDadosContratoPncpResponse {
  cnpj_do_contratante: string;
  orgao_do_contratante: string;
  unidade: string;
  objeto: string;
  n_do_instrumento: string;
  vigencia_inicial: string;
  vigencia_final: string;
}

export function mapApiDadosContratoPncpToDadosContratoPncp(
  raw: ApiDadosContratoPncpResponse,
): DadosContratoPncp {
  return {
    cnpjDoContratante: raw.cnpj_do_contratante,
    orgaoDoContratante: raw.orgao_do_contratante,
    unidade: raw.unidade,
    objeto: raw.objeto,
    nDoInstrumento: raw.n_do_instrumento,
    vigenciaInicial: raw.vigencia_inicial,
    vigenciaFinal: raw.vigencia_final,
  };
}
