import type { Licitante } from './licitante';
import type { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  licitante: Licitante;
}
