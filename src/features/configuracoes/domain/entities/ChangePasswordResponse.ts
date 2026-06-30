export type PasswordValidationError = 'MIN_LENGTH' | 'MAX_LENGTH' | 'NO_LETTERS' | 'NO_NUMBERS';

export interface ValidationResult {
  isValid: boolean;
  errors: PasswordValidationError[];
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  error: string | null;
}
