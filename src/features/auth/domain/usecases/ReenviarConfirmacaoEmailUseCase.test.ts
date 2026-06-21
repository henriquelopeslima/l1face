import { describe, it, expect, vi } from 'vitest';
import { ReenviarConfirmacaoEmailUseCase } from './ReenviarConfirmacaoEmailUseCase';
import { AuthError, RateLimitReenvioError } from '../errors/authErrors';
import type { IAuthRepository } from '../repositories/IAuthRepository';

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', nomeCompleto: 'A', licitantes: [] }),
    register: vi.fn().mockResolvedValue({ message: '' }),
    confirmarEmail: vi.fn().mockResolvedValue(undefined),
    reenviarConfirmacao: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ReenviarConfirmacaoEmailUseCase', () => {
  it('chama repository.reenviarConfirmacao com o e-mail fornecido', async () => {
    const repo = makeRepo();
    const useCase = new ReenviarConfirmacaoEmailUseCase(repo);
    await useCase.execute('joao@example.com');
    expect(repo.reenviarConfirmacao).toHaveBeenCalledWith('joao@example.com');
  });

  it('lança AuthError quando o e-mail está vazio', async () => {
    const repo = makeRepo();
    const useCase = new ReenviarConfirmacaoEmailUseCase(repo);
    await expect(useCase.execute('')).rejects.toBeInstanceOf(AuthError);
    expect(repo.reenviarConfirmacao).not.toHaveBeenCalled();
  });

  it('propaga RateLimitReenvioError lançado pelo repositório', async () => {
    const repo = makeRepo({
      reenviarConfirmacao: vi.fn().mockRejectedValue(
        new RateLimitReenvioError('Muitas tentativas de reenvio. Aguarde antes de tentar novamente.'),
      ),
    });
    const useCase = new ReenviarConfirmacaoEmailUseCase(repo);
    await expect(useCase.execute('joao@example.com')).rejects.toBeInstanceOf(RateLimitReenvioError);
  });

  it('propaga AuthError genérico lançado pelo repositório', async () => {
    const repo = makeRepo({
      reenviarConfirmacao: vi.fn().mockRejectedValue(new AuthError('Serviço indisponível.')),
    });
    const useCase = new ReenviarConfirmacaoEmailUseCase(repo);
    await expect(useCase.execute('joao@example.com')).rejects.toBeInstanceOf(AuthError);
  });
});
