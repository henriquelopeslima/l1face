import { describe, it, expect, vi } from 'vitest';
import { GetMeUseCase } from './GetMeUseCase';
import { UnauthenticatedError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';
import type { User } from '../entities/user';

const fakeUser: User = {
  id: 'u1',
  email: 'a@b.com',
  nomeCompleto: 'Teste User',
  licitantes: [{ id: 'l1', cnpj: '12345678000195', nomeEmpresa: 'Empresa Ltda' }],
};

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue(fakeUser),
    ...overrides,
  } as IAuthRepository;
}

describe('GetMeUseCase', () => {
  it('retorna o perfil do usuário quando autenticado', async () => {
    const repo = makeRepo();
    const useCase = new GetMeUseCase(repo);
    const user = await useCase.execute();
    expect(user).toEqual(fakeUser);
    expect(repo.getMe).toHaveBeenCalledOnce();
  });

  it('propaga UnauthenticatedError quando o cookie está expirado', async () => {
    const repo = makeRepo({ getMe: vi.fn().mockRejectedValue(new UnauthenticatedError()) });
    const useCase = new GetMeUseCase(repo);
    await expect(useCase.execute()).rejects.toBeInstanceOf(UnauthenticatedError);
  });
});
