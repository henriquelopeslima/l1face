import { describe, it, expect, vi } from 'vitest';
import { LogoutUseCase } from './LogoutUseCase';
import type { IAuthRepository } from '../repositories/IAuthRepository';

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', nomeCompleto: 'A', licitantes: [] }),
    ...overrides,
  };
}

describe('LogoutUseCase', () => {
  it('chama repository.logout', async () => {
    const repo = makeRepo();
    const useCase = new LogoutUseCase(repo);
    await useCase.execute();
    expect(repo.logout).toHaveBeenCalledOnce();
  });

  it('resolve sem erro mesmo quando o repositório lança (falha de rede tolerada)', async () => {
    const repo = makeRepo({ logout: vi.fn().mockRejectedValue(new Error('rede')) });
    const useCase = new LogoutUseCase(repo);
    await expect(useCase.execute()).rejects.toThrow('rede');
  });
});
