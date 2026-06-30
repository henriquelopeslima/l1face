import { describe, it, expect } from 'vitest';
import { ValidarForcaSenhaUseCase } from '../../domain/usecases/ValidarForcaSenhaUseCase';

describe('ValidarForcaSenhaUseCase', () => {
  const useCase = new ValidarForcaSenhaUseCase();

  it('deve validar uma senha correta', () => {
    const result = useCase.execute('Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    const result = useCase.execute('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MIN_LENGTH');
  });

  it('deve rejeitar senha com mais de 20 caracteres', () => {
    const result = useCase.execute('VeryLongPasswordWith123456');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MAX_LENGTH');
  });

  it('deve rejeitar senha sem letras', () => {
    const result = useCase.execute('12345678');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('NO_LETTERS');
  });

  it('deve rejeitar senha sem números', () => {
    const result = useCase.execute('Password');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('NO_NUMBERS');
  });

  it('deve rejeitar senha com múltiplos problemas', () => {
    const result = useCase.execute('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MIN_LENGTH');
    expect(result.errors).toContain('NO_NUMBERS');
  });

  it('deve gerar mensagem de erro apropriada', () => {
    const result = useCase.execute('Pass');
    expect(result.message).toContain('Mínimo 8 caracteres');
    expect(result.message).toContain('Deve conter números');
  });

  it('deve aceitar senha com letras maiúsculas e minúsculas', () => {
    const result = useCase.execute('pAssword123');
    expect(result.isValid).toBe(true);
  });

  it('deve aceitar senha com exatamente 8 caracteres', () => {
    const result = useCase.execute('Pass1234');
    expect(result.isValid).toBe(true);
  });

  it('deve aceitar senha com exatamente 20 caracteres', () => {
    const result = useCase.execute('Password12345678901');
    expect(result.isValid).toBe(true);
  });
});
