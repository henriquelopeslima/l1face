import type { InstrumentoListagem, TipoInstrumento, StatusInstrumento } from '../../domain/entities/instrumentoContratual';

interface ApiInstrumentoListagemResponse {
  id: string;
  tipo: TipoInstrumento;
  numero: string | null;
  orgao: string;
  unidade: string;
  objeto: string;
  prazo_final: string | null;
  valor: number;
  saldo: number;
  status: StatusInstrumento;
}

export function mapApiInstrumentoListagemToInstrumentoListagem(
  raw: ApiInstrumentoListagemResponse,
): InstrumentoListagem {
  return {
    id: raw.id,
    tipo: raw.tipo,
    numero: raw.numero,
    orgao: raw.orgao,
    unidade: raw.unidade,
    objeto: raw.objeto,
    prazoFinal: raw.prazo_final,
    valor: raw.valor,
    saldo: raw.saldo,
    status: raw.status,
  };
}
