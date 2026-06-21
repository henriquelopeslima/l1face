import type { IPerfilRepository } from '../repositories/IPerfilRepository';

export class RemoverFotoPerfilUseCase {
  constructor(private readonly repository: IPerfilRepository) {}

  async execute(): Promise<void> {
    await this.repository.removerFoto();
  }
}
