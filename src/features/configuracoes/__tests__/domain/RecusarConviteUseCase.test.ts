import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecusarConviteUseCase } from '../../domain/usecases/RecusarConviteUseCase';
import { ConviteError, ConviteJaRespondidoError } from '../../domain/errors/conviteErrors';
import type { IConviteRepository } from '../../domain/repositories/IConviteRepository';

describe('RecusarConviteUseCase', () => {
  let mockRepository: IConviteRepository;
  let useCase: RecusarConviteUseCase;

  beforeEach(() => {
    mockRepository = {
      aceitar: vi.fn(),
      recusar: vi.fn(),
    };
    useCase = new RecusarConviteUseCase(mockRepository);
  });

  it('deve retornar a mensagem do repositório em caso de sucesso', async () => {
    vi.mocked(mockRepository.recusar).mockResolvedValueOnce({ message: 'Convite recusado.' });

    const result = await useCase.execute('token-valido');

    expect(result).toEqual({ message: 'Convite recusado.' });
  });

  it('deve chamar o repositório com o token correto', async () => {
    vi.mocked(mockRepository.recusar).mockResolvedValueOnce({ message: 'ok' });

    await useCase.execute('abc123');

    expect(mockRepository.recusar).toHaveBeenCalledWith('abc123');
    expect(mockRepository.recusar).toHaveBeenCalledTimes(1);
  });

  it('deve lançar ConviteError quando o token está vazio', async () => {
    await expect(useCase.execute('')).rejects.toThrow(ConviteError);
    expect(mockRepository.recusar).not.toHaveBeenCalled();
  });

  it('deve propagar exceção lançada pelo repositório', async () => {
    vi.mocked(mockRepository.recusar).mockRejectedValueOnce(
      new ConviteJaRespondidoError('Este convite já foi respondido.')
    );

    await expect(useCase.execute('token-respondido')).rejects.toThrow(ConviteJaRespondidoError);
  });
});
