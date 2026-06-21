import type { Licitante } from '../../domain/entities/licitante';
import type { User } from '../../domain/entities/user';

export interface ApiRegisterResponse {
  user: { id: string; email: string; nome: string };
  licitante: { id: string; cnpj: string; razao_social: string };
  message: string;
}

interface ApiLicitante {
  id: string;
  cnpj: string;
  nome_empresa: string;
}

interface ApiMeResponse {
  id: string;
  email: string;
  nome_completo: string;
  licitantes: ApiLicitante[];
}

function mapLicitante(raw: ApiLicitante): Licitante {
  return {
    id: raw.id,
    cnpj: raw.cnpj,
    nomeEmpresa: raw.nome_empresa,
  };
}

export function mapApiMeToUser(raw: ApiMeResponse): User {
  return {
    id: raw.id,
    email: raw.email,
    nomeCompleto: raw.nome_completo,
    licitantes: raw.licitantes.map(mapLicitante),
  };
}
