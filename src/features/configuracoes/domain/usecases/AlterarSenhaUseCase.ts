import type { ChangePasswordRequest, ChangePasswordResponse } from '../entities';
import type { IChangePasswordRepository } from '../repositories';
import { ValidarForcaSenhaUseCase } from './ValidarForcaSenhaUseCase';

export class AlterarSenhaUseCase {
  constructor(
    private repository: IChangePasswordRepository,
    private validarForcaSenha: ValidarForcaSenhaUseCase
  ) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    // Validar força da nova senha
    const validation = this.validarForcaSenha.execute(request.newPassword);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.message
      };
    }

    // Chamar repositório para alterar senha via API
    return this.repository.changePassword(request);
  }
}
