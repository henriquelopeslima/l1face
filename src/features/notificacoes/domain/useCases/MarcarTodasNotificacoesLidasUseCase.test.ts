import { describe, it, expect, vi } from 'vitest';
import { MarcarTodasNotificacoesLidasUseCase } from './MarcarTodasNotificacoesLidasUseCase';
import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';

const makeRepository = (overrides?: Partial<INotificacaoRepository>): INotificacaoRepository => ({
  listar: vi.fn(),
  marcarComoLida: vi.fn(),
  marcarTodasComoLidas: vi.fn(),
  ...overrides,
} as INotificacaoRepository);

describe('MarcarTodasNotificacoesLidasUseCase', () => {
  it('marca todas as notificações como lidas através do repositório', async () => {
    const repository = makeRepository({ marcarTodasComoLidas: vi.fn().mockResolvedValue({ marcadas: 7 }) });
    const useCase = new MarcarTodasNotificacoesLidasUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({ marcadas: 7 });
    expect(repository.marcarTodasComoLidas).toHaveBeenCalledOnce();
    expect(repository.marcarTodasComoLidas).toHaveBeenCalledWith();
  });

  it('retorna zero quando não há notificações pendentes', async () => {
    const repository = makeRepository({ marcarTodasComoLidas: vi.fn().mockResolvedValue({ marcadas: 0 }) });
    const useCase = new MarcarTodasNotificacoesLidasUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({ marcadas: 0 });
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      marcarTodasComoLidas: vi.fn().mockRejectedValue(new Error('Não foi possível atualizar as notificações. Tente novamente.')),
    });
    const useCase = new MarcarTodasNotificacoesLidasUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow('Não foi possível atualizar as notificações. Tente novamente.');
  });
});
