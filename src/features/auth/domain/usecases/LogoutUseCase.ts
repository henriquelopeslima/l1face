import type { IAuthRepository } from '../repositories/IAuthRepository';

export class LogoutUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.repository.logout();
  }
}
