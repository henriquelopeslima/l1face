import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { PasswordValidationError } from '../../domain/entities';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface AlterarSenhaFormProps {
  formData: {
    currentPassword: string;
    newPassword: string;
  };
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: PasswordValidationError[];
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void>;
}

export const AlterarSenhaForm: React.FC<AlterarSenhaFormProps> = ({
  formData,
  isLoading,
  error,
  success,
  validationErrors,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSubmit
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const isFormValid = formData.currentPassword && formData.newPassword && validationErrors.length === 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm font-medium">
                ✓ Senha alterada com sucesso
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">
                ✗ {error}
              </p>
            </div>
          )}

          {/* Campos — visíveis apenas quando não há sucesso */}
          {!success && (
            <>
              {/* Current Password Field */}
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium mb-2">
                  Senha Atual
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="Digite sua senha atual"
                  className="w-full"
                />
              </div>

              {/* New Password Field */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                  Nova Senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  disabled={isLoading}
                  placeholder="Digite sua nova senha"
                  className="w-full"
                />
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <PasswordStrengthIndicator
                    password={formData.newPassword}
                    validationErrors={validationErrors}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full"
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
