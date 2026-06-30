import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlterarSenhaUseCase } from '../../domain/usecases/AlterarSenhaUseCase';
import { ValidarForcaSenhaUseCase } from '../../domain/usecases/ValidarForcaSenhaUseCase';
import type { IChangePasswordRepository } from '../../domain/repositories';
import type { ChangePasswordRequest } from '../../domain/entities';

describe('AlterarSenhaUseCase', () => {
  let mockRepository: IChangePasswordRepository;
  let validarForcaSenha: ValidarForcaSenhaUseCase;
  let useCase: AlterarSenhaUseCase;

  beforeEach(() => {
    mockRepository = {
      changePassword: vi.fn()
    };
    validarForcaSenha = new ValidarForcaSenhaUseCase();
    useCase = new AlterarSenhaUseCase(mockRepository, validarForcaSenha);
  });

  it('deve chamar repository com request válida', async () => {
    const request: ChangePasswordRequest = {
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword456'
    };

    vi.mocked(mockRepository.changePassword).mockResolvedValueOnce({
      success: true,
      error: null
    });

    const result = await useCase.execute(request);

    expect(mockRepository.changePassword).toHaveBeenCalledWith(request);
    expect(result.success).toBe(true);
  });

  it('deve retornar erro se nova senha for inválida', async () => {
    const request: ChangePasswordRequest = {
      currentPassword: 'OldPassword123',
      newPassword: 'short'
    };

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mínimo 8 caracteres');
    expect(mockRepository.changePassword).not.toHaveBeenCalled();
  });

  it('deve retornar resposta do repository sem erros de validação', async () => {
    const request: ChangePasswordRequest = {
      currentPassword: 'OldPassword123',
      newPassword: 'NewPassword456'
    };

    vi.mocked(mockRepository.changePassword).mockResolvedValueOnce({
      success: false,
      error: 'Senha atual incorreta'
    });

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Senha atual incorreta');
  });
});
