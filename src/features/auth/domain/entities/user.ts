import type { Licitante } from './licitante';

export interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  fotoPerfil?: string | null;
  licitantes: Licitante[];
}
