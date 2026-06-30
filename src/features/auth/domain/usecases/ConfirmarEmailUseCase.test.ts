import { describe, it, expect, vi } from 'vitest';
import { ConfirmarEmailUseCase } from './ConfirmarEmailUseCase';
import { AuthError, ContaJaConfirmadaError, TokenExpiradoError, TokenInvalidoError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', nomeCompleto: 'A', licitantes: [] }),
    register: vi.fn().mockResolvedValue({ message: '' }),
    confirmarEmail: vi.fn().mockResolvedValue(undefined),
    reenviarConfirmacao: vi.fn().mockResolvedValue(undefined),
    recuperarSenha: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ConfirmarEmailUseCase', () => {
  it('chama repository.confirmarEmail com o token fornecido', async () => {
    const repo = makeRepo();
    const useCase = new ConfirmarEmailUseCase(repo);
    await useCase.execute('token-valido');
    expect(repo.confirmarEmail).toHaveBeenCalledWith('token-valido');
  });

  it('lança AuthError quando o token está vazio', async () => {
    const repo = makeRepo();
    const useCase = new ConfirmarEmailUseCase(repo);
    await expect(useCase.execute('')).rejects.toBeInstanceOf(AuthError);
    expect(repo.confirmarEmail).not.toHaveBeenCalled();
  });

  it('propaga TokenInvalidoError lançado pelo repositório', async () => {
    const repo = makeRepo({
      confirmarEmail: vi.fn().mockRejectedValue(new TokenInvalidoError('Token de confirmação inválido.')),
    });
    const useCase = new ConfirmarEmailUseCase(repo);
    await expect(useCase.execute('token-invalido')).rejects.toBeInstanceOf(TokenInvalidoError);
  });

  it('propaga TokenExpiradoError lançado pelo repositório', async () => {
    const repo = makeRepo({
      confirmarEmail: vi.fn().mockRejectedValue(new TokenExpiradoError('O link de confirmação expirou.')),
    });
    const useCase = new ConfirmarEmailUseCase(repo);
    await expect(useCase.execute('token-expirado')).rejects.toBeInstanceOf(TokenExpiradoError);
  });

  it('propaga ContaJaConfirmadaError lançado pelo repositório', async () => {
    const repo = makeRepo({
      confirmarEmail: vi.fn().mockRejectedValue(new ContaJaConfirmadaError('Esta conta já foi confirmada.')),
    });
    const useCase = new ConfirmarEmailUseCase(repo);
    await expect(useCase.execute('token-usado')).rejects.toBeInstanceOf(ContaJaConfirmadaError);
  });

  it('propaga AuthError genérico lançado pelo repositório', async () => {
    const repo = makeRepo({
      confirmarEmail: vi.fn().mockRejectedValue(new AuthError('Serviço indisponível.')),
    });
    const useCase = new ConfirmarEmailUseCase(repo);
    await expect(useCase.execute('token-qualquer')).rejects.toBeInstanceOf(AuthError);
  });
});
