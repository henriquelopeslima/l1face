import { describe, it, expect, vi } from 'vitest';
import { ListarNotificacoesUseCase } from './ListarNotificacoesUseCase';
import type { INotificacaoRepository } from '../contracts/INotificacaoRepository';
import type { ListaNotificacoes } from '../entities/Notificacao';

const makeRepository = (overrides?: Partial<INotificacaoRepository>): INotificacaoRepository => ({
  listar: vi.fn(),
  marcarComoLida: vi.fn(),
  marcarTodasComoLidas: vi.fn(),
  ...overrides,
} as INotificacaoRepository);

const makeListaNotificacoes = (): ListaNotificacoes => ({
  itens: [
    {
      id: '7f4e2a1b-3c0d-4e5f-a6b7-c8d9e0f1a2b3',
      tipoOrigem: 'instrumento',
      entidadeId: '9b8a7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
      conteudo: { titulo: 'Instrumento próximo do vencimento', descricao: 'Vence em 30 dias.', cor: '#F59E0B' },
      lida: false,
      lidaEm: null,
      criadaEm: '2026-07-20T10:00:00+00:00',
    },
  ],
  total: 1,
  paginaAtual: 1,
  totalPaginas: 1,
});

describe('ListarNotificacoesUseCase', () => {
  it('retorna a lista de notificações do repositório', async () => {
    const lista = makeListaNotificacoes();
    const repository = makeRepository({ listar: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarNotificacoesUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(lista);
    expect(repository.listar).toHaveBeenCalledOnce();
    expect(repository.listar).toHaveBeenCalledWith(undefined);
  });

  it('propaga erro lançado pelo repositório', async () => {
    const repository = makeRepository({
      listar: vi.fn().mockRejectedValue(new Error('Não foi possível carregar as notificações. Tente novamente.')),
    });
    const useCase = new ListarNotificacoesUseCase(repository);

    await expect(useCase.execute()).rejects.toThrow('Não foi possível carregar as notificações. Tente novamente.');
  });

  it('repassa parâmetros de paginação ao repositório', async () => {
    const lista = makeListaNotificacoes();
    const repository = makeRepository({ listar: vi.fn().mockResolvedValue(lista) });
    const useCase = new ListarNotificacoesUseCase(repository);

    const result = await useCase.execute({ page: 2, limit: 20 });

    expect(result).toEqual(lista);
    expect(repository.listar).toHaveBeenCalledWith({ page: 2, limit: 20 });
  });
});
