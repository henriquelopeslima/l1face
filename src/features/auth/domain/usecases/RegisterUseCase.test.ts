import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from './RegisterUseCase';
import { AuthError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

const validCredentials = {
  nome: 'João Silva',
  email: 'joao@empresa.com',
  password: 'SenhaForte123',
  cnpj: '12345678000195',
  razaoSocial: 'Empresa Exemplo Ltda',
};

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', nomeCompleto: 'A', licitantes: [] }),
    register: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('RegisterUseCase', () => {
  it('chama repository.register com as credenciais fornecidas', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await useCase.execute(validCredentials);
    expect(repo.register).toHaveBeenCalledWith(validCredentials);
  });

  it('lança AuthError quando nome está vazio', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute({ ...validCredentials, nome: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.register).not.toHaveBeenCalled();
  });

  it('lança AuthError quando email está vazio', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute({ ...validCredentials, email: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.register).not.toHaveBeenCalled();
  });

  it('lança AuthError quando password está vazia', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute({ ...validCredentials, password: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.register).not.toHaveBeenCalled();
  });

  it('lança AuthError quando cnpj está vazio', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute({ ...validCredentials, cnpj: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.register).not.toHaveBeenCalled();
  });

  it('lança AuthError quando razaoSocial está vazia', async () => {
    const repo = makeRepo();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute({ ...validCredentials, razaoSocial: '' })).rejects.toBeInstanceOf(AuthError);
    expect(repo.register).not.toHaveBeenCalled();
  });

  it('propaga AuthError lançado pelo repositório (duplicidade de e-mail)', async () => {
    const repo = makeRepo({ register: vi.fn().mockRejectedValue(new AuthError('Email já cadastrado.')) });
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute(validCredentials)).rejects.toBeInstanceOf(AuthError);
  });

  it('propaga AuthError lançado pelo repositório (serviço indisponível)', async () => {
    const repo = makeRepo({ register: vi.fn().mockRejectedValue(new AuthError('Serviço indisponível.')) });
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute(validCredentials)).rejects.toBeInstanceOf(AuthError);
  });
});
