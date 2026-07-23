import { describe, it, expect, vi } from 'vitest';
import { MarcarNotificacaoLidaUseCase } from './MarcarNotificacaoLidaUseCase';
import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';
import type { Notificacao } from '../entities/Notificacao';

const makeRepository = (overrides?: Partial<INotificacaoRepository>): INotificacaoRepository => ({
  listar: vi.fn(),
  marcarComoLida: vi.fn(),
  marcarTodasComoLidas: vi.fn(),
  ...overrides,
} as INotificacaoRepository);

const makeNotificacao = (overrides?: Partial<Notificacao>): Notificacao => ({
  id: '7f4e2a1b-3c0d-4e5f-a6b7-c8d9e0f1a2b3',
  tipoOrigem: 'ata',
  entidadeId: '9b8a7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
  conteudo: { titulo: 'Ata próxima do vencimento', descricao: 'Vence em 45 dias.', cor: '#F59E0B' },
  lida: false,
  lidaEm: null,
  criadaEm: '2026-07-20T10:00:00+00:00',
  ...overrides,
});

describe('MarcarNotificacaoLidaUseCase', () => {
  it('marca a notificação como lida através do repositório', async () => {
    const notificacaoLida = makeNotificacao({ lida: true, lidaEm: '2026-07-23T12:00:00+00:00' });
    const repository = makeRepository({ marcarComoLida: vi.fn().mockResolvedValue(notificacaoLida) });
    const useCase = new MarcarNotificacaoLidaUseCase(repository);

    const result = await useCase.execute(notificacaoLida.id);

    expect(result).toEqual(notificacaoLida);
    expect(repository.marcarComoLida).toHaveBeenCalledOnce();
    expect(repository.marcarComoLida).toHaveBeenCalledWith(notificacaoLida.id);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      marcarComoLida: vi.fn().mockRejectedValue(new Error('Notificação não encontrada.')),
    });
    const useCase = new MarcarNotificacaoLidaUseCase(repository);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow('Notificação não encontrada.');
  });
});
