import type { LoginCredentials } from '../entities/authSession';
import type { RegisterCredentials } from '../entities/registerCredentials';
import type { User } from '../entities/user';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  register(credentials: RegisterCredentials): Promise<{ message: string }>;
  confirmarEmail(token: string): Promise<void>;
  reenviarConfirmacao(email: string): Promise<void>;
}
