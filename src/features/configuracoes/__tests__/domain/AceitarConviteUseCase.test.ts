import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AceitarConviteUseCase } from '../../domain/usecases/AceitarConviteUseCase';
import { ConviteError, ConviteExpiradoError } from '../../domain/errors/conviteErrors';
import type { IConviteRepository } from '../../domain/repositories/IConviteRepository';

describe('AceitarConviteUseCase', () => {
  let mockRepository: IConviteRepository;
  let useCase: AceitarConviteUseCase;

  beforeEach(() => {
    mockRepository = {
      aceitar: vi.fn(),
      recusar: vi.fn(),
    };
    useCase = new AceitarConviteUseCase(mockRepository);
  });

  it('deve retornar o resultado do repositório em caso de sucesso', async () => {
    vi.mocked(mockRepository.aceitar).mockResolvedValueOnce({
      message: 'Convite aceito. Você agora é colaborador do licitante.',
      contaCriada: false,
    });

    const result = await useCase.execute('token-valido');

    expect(result).toEqual({
      message: 'Convite aceito. Você agora é colaborador do licitante.',
      contaCriada: false,
    });
  });

  it('deve chamar o repositório com o token correto', async () => {
    vi.mocked(mockRepository.aceitar).mockResolvedValueOnce({ message: 'ok', contaCriada: true });

    await useCase.execute('abc123');

    expect(mockRepository.aceitar).toHaveBeenCalledWith('abc123');
    expect(mockRepository.aceitar).toHaveBeenCalledTimes(1);
  });

  it('deve lançar ConviteError quando o token está vazio', async () => {
    await expect(useCase.execute('')).rejects.toThrow(ConviteError);
    expect(mockRepository.aceitar).not.toHaveBeenCalled();
  });

  it('deve propagar exceção lançada pelo repositório', async () => {
    vi.mocked(mockRepository.aceitar).mockRejectedValueOnce(
      new ConviteExpiradoError('Este convite expirou.')
    );

    await expect(useCase.execute('token-expirado')).rejects.toThrow(ConviteExpiradoError);
  });
});
