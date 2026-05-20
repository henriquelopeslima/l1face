import type { User } from '../entities/user';
import type { IAuthRepository } from '../repositories/IAuthRepository';

export class GetMeUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<User> {
    return this.repository.getMe();
  }
}
