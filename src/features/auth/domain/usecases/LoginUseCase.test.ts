import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from './LoginUseCase';
import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', nomeCompleto: 'A', licitantes: [] }),
    ...overrides,
  } as IAuthRepository;
}

describe('LoginUseCase', () => {
  it('chama repository.login com as credenciais fornecidas', async () => {
    const repo = makeRepo();
    const useCase = new LoginUseCase(repo);
    await useCase.execute({ email: 'a@b.com', password: 'senha123' });
    expect(repo.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'senha123' });
  });

  it('lança AuthError quando o email está vazio', async () => {
    const repo = makeRepo();
    const useCase = new LoginUseCase(repo);
    await expect(useCase.execute({ email: '', password: 'senha123' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.login).not.toHaveBeenCalled();
  });

  it('lança AuthError quando a senha está vazia', async () => {
    const repo = makeRepo();
    const useCase = new LoginUseCase(repo);
    await expect(useCase.execute({ email: 'a@b.com', password: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.login).not.toHaveBeenCalled();
  });

  it('propaga AuthError lançado pelo repositório (credenciais inválidas)', async () => {
    const repo = makeRepo({ login: vi.fn().mockRejectedValue(new AuthError('E-mail ou senha incorretos.')) });
    const useCase = new LoginUseCase(repo);
    await expect(useCase.execute({ email: 'a@b.com', password: 'senha123' })).rejects.toBeInstanceOf(AuthError);
  });

  it('propaga AuthError lançado pelo repositório (serviço indisponível)', async () => {
    const repo = makeRepo({ login: vi.fn().mockRejectedValue(new AuthError('Serviço indisponível.')) });
    const useCase = new LoginUseCase(repo);
    await expect(useCase.execute({ email: 'a@b.com', password: 'senha123' })).rejects.toBeInstanceOf(AuthError);
  });
});
