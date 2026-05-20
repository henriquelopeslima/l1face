import type { Licitante } from './licitante';

export interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  licitantes: Licitante[];
}
