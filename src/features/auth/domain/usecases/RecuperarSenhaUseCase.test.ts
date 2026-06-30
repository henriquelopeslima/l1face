import { describe, it, expect, vi } from 'vitest';
import { RecuperarSenhaUseCase } from './RecuperarSenhaUseCase';
import { AuthError } from '../errors/authErrors';
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

describe('RecuperarSenhaUseCase', () => {
  it('chama repository.recuperarSenha com o e-mail fornecido', async () => {
    const repo = makeRepo();
    const useCase = new RecuperarSenhaUseCase(repo);
    await useCase.execute('joao@example.com');
    expect(repo.recuperarSenha).toHaveBeenCalledWith('joao@example.com');
  });

  it('lança AuthError quando o e-mail está vazio', async () => {
    const repo = makeRepo();
    const useCase = new RecuperarSenhaUseCase(repo);
    await expect(useCase.execute('')).rejects.toBeInstanceOf(AuthError);
    expect(repo.recuperarSenha).not.toHaveBeenCalled();
  });

  it('lança AuthError quando o e-mail tem formato inválido', async () => {
    const repo = makeRepo();
    const useCase = new RecuperarSenhaUseCase(repo);
    await expect(useCase.execute('nao-e-um-email')).rejects.toBeInstanceOf(AuthError);
    expect(repo.recuperarSenha).not.toHaveBeenCalled();
  });

  it('lança AuthError quando o e-mail tem formato inválido (sem @)', async () => {
    const repo = makeRepo();
    const useCase = new RecuperarSenhaUseCase(repo);
    await expect(useCase.execute('joao.example.com')).rejects.toBeInstanceOf(AuthError);
    expect(repo.recuperarSenha).not.toHaveBeenCalled();
  });

  it('propaga AuthError lançado pelo repositório (falha de conexão)', async () => {
    const repo = makeRepo({
      recuperarSenha: vi.fn().mockRejectedValue(
        new AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.'),
      ),
    });
    const useCase = new RecuperarSenhaUseCase(repo);
    await expect(useCase.execute('joao@example.com')).rejects.toBeInstanceOf(AuthError);
  });
});
