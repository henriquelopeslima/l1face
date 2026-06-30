import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChangePassword } from '../../presentation/hooks/useChangePassword';
import { AlterarSenhaUseCase } from '../../domain/usecases/AlterarSenhaUseCase';
import { ValidarForcaSenhaUseCase } from '../../domain/usecases/ValidarForcaSenhaUseCase';
import type { IChangePasswordRepository } from '../../domain/repositories';

describe('useChangePassword', () => {
  let mockRepository: IChangePasswordRepository;
  let useCase: AlterarSenhaUseCase;
  let validarForcaSenha: ValidarForcaSenhaUseCase;

  beforeEach(() => {
    mockRepository = {
      changePassword: vi.fn()
    };
    useCase = new AlterarSenhaUseCase(mockRepository, new ValidarForcaSenhaUseCase());
    validarForcaSenha = new ValidarForcaSenhaUseCase();
  });

  it('deve inicializar com estado vazio', () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    expect(result.current.formData.currentPassword).toBe('');
    expect(result.current.formData.newPassword).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.validationErrors).toHaveLength(0);
  });

  it('deve atualizar senha atual', () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateCurrentPassword('MyPassword123');
    });

    expect(result.current.formData.currentPassword).toBe('MyPassword123');
  });

  it('deve validar nova senha em tempo real', () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateNewPassword('short');
    });

    expect(result.current.validationErrors).toContain('MIN_LENGTH');
    expect(result.current.validationErrors).toContain('NO_NUMBERS');
  });

  it('deve limpar erros ao atualizar novo password', () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateNewPassword('short');
    });

    expect(result.current.validationErrors.length).toBeGreaterThan(0);

    act(() => {
      result.current.updateCurrentPassword('Test');
    });

    // error should be cleared
    expect(result.current.error).toBe(null);
  });

  it('deve submeter com sucesso', async () => {
    vi.mocked(mockRepository.changePassword).mockResolvedValueOnce({
      success: true,
      error: null
    });

    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateCurrentPassword('OldPassword123');
      result.current.updateNewPassword('NewPassword456');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.formData.currentPassword).toBe('');
    expect(result.current.formData.newPassword).toBe('');
  });

  it('deve exibir erro ao submeter com senha inválida', async () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateCurrentPassword('OldPassword123');
      result.current.updateNewPassword('short');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(mockRepository.changePassword).not.toHaveBeenCalled();
  });

  it('deve exibir erro de API', async () => {
    vi.mocked(mockRepository.changePassword).mockResolvedValueOnce({
      success: false,
      error: 'Senha atual incorreta'
    });

    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateCurrentPassword('WrongPassword');
      result.current.updateNewPassword('NewPassword456');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Senha atual incorreta');
  });

  it('deve resetar estado', () => {
    const { result } = renderHook(() => useChangePassword(useCase, validarForcaSenha));

    act(() => {
      result.current.updateCurrentPassword('Password');
      result.current.updateNewPassword('NewPassword123');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.formData.currentPassword).toBe('');
    expect(result.current.formData.newPassword).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.success).toBe(false);
    expect(result.current.validationErrors).toHaveLength(0);
  });
});
