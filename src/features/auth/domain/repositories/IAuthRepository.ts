import type { LoginCredentials } from '../entities/authSession';
import type { User } from '../entities/user';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<void>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
}
