import type { ValidationResult, PasswordValidationError } from '../entities';

export class ValidarForcaSenhaUseCase {
  execute(password: string): ValidationResult {
    const errors: PasswordValidationError[] = [];

    if (password.length < 8) {
      errors.push('MIN_LENGTH');
    }
    if (password.length > 20) {
      errors.push('MAX_LENGTH');
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('NO_LETTERS');
    }
    if (!/\d/.test(password)) {
      errors.push('NO_NUMBERS');
    }

    const isValid = errors.length === 0;
    const message = this.buildMessage(errors, isValid);

    return { isValid, errors, message };
  }

  private buildMessage(errors: PasswordValidationError[], isValid: boolean): string {
    if (isValid) {
      return 'Senha válida';
    }

    const messages: Record<PasswordValidationError, string> = {
      MIN_LENGTH: 'Mínimo 8 caracteres',
      MAX_LENGTH: 'Máximo 20 caracteres',
      NO_LETTERS: 'Deve conter letras',
      NO_NUMBERS: 'Deve conter números'
    };

    const errorMessages = errors.map(error => messages[error]);
    return errorMessages.join('; ');
  }
}
