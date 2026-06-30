import { useState, useCallback } from 'react';
import type { ChangePasswordRequest, PasswordValidationError } from '../../domain/entities';
import { AlterarSenhaUseCase } from '../../domain/usecases/AlterarSenhaUseCase';
import { ValidarForcaSenhaUseCase } from '../../domain/usecases/ValidarForcaSenhaUseCase';

export interface UseChangePasswordState {
  formData: {
    currentPassword: string;
    newPassword: string;
  };
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: PasswordValidationError[];
}

export interface UseChangePasswordActions {
  updateCurrentPassword: (password: string) => void;
  updateNewPassword: (password: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export type UseChangePasswordReturn = UseChangePasswordState & UseChangePasswordActions;

export function useChangePassword(
  changePasswordUseCase: AlterarSenhaUseCase,
  validarForcaSenhaUseCase: ValidarForcaSenhaUseCase
): UseChangePasswordReturn {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PasswordValidationError[]>([]);

  const updateCurrentPassword = useCallback((password: string) => {
    setFormData(prev => ({ ...prev, currentPassword: password }));
    setError(null);
  }, []);

  const updateNewPassword = useCallback((password: string) => {
    setFormData(prev => ({ ...prev, newPassword: password }));
    const result = validarForcaSenhaUseCase.execute(password);
    setValidationErrors(result.errors);
    setError(null);
  }, [validarForcaSenhaUseCase]);

  const submit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create request object
      const request: ChangePasswordRequest = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      // Execute use case
      const response = await changePasswordUseCase.execute(request);

      if (response.success) {
        setSuccess(true);
        setFormData({ currentPassword: '', newPassword: '' });
        setValidationErrors([]);
      } else {
        setError(response.error || 'Erro ao alterar senha');
      }
    } catch (err: any) {
      setError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, changePasswordUseCase]);

  const reset = useCallback(() => {
    setFormData({ currentPassword: '', newPassword: '' });
    setError(null);
    setSuccess(false);
    setValidationErrors([]);
  }, []);

  return {
    formData,
    isLoading,
    error,
    success,
    validationErrors,
    updateCurrentPassword,
    updateNewPassword,
    submit,
    reset
  };
}
