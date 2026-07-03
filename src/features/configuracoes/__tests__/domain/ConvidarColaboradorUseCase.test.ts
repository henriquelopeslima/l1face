import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConvidarColaboradorUseCase } from '../../domain/usecases/ConvidarColaboradorUseCase';
import type { IUsuarioLicitanteRepository } from '../../domain/repositories';
import type { ConviteColaborador } from '../../domain/entities';

const mockConvite: ConviteColaborador = {
  id: 'convite-1',
  email: 'colaborador@empresa.com.br',
  nome: 'Colaborador',
  licitanteId: 'licitante-1',
  usuarioJaCadastrado: false,
  status: 'PENDENTE',
  criadoEm: '2026-01-15T10:30:00+00:00',
  expiresAt: '2026-01-16T10:30:00+00:00',
};

describe('ConvidarColaboradorUseCase', () => {
  let mockRepository: IUsuarioLicitanteRepository;
  let useCase: ConvidarColaboradorUseCase;

  beforeEach(() => {
    mockRepository = {
      listar: vi.fn(),
      revogar: vi.fn(),
      convidar: vi.fn(),
    };
    useCase = new ConvidarColaboradorUseCase(mockRepository);
  });

  it('deve retornar o convite criado pelo repositório', async () => {
    vi.mocked(mockRepository.convidar).mockResolvedValueOnce(mockConvite);

    const result = await useCase.execute('licitante-1', 'colaborador@empresa.com.br');

    expect(result).toEqual(mockConvite);
  });

  it('deve chamar o repositório com licitanteId e email corretos', async () => {
    vi.mocked(mockRepository.convidar).mockResolvedValueOnce(mockConvite);

    await useCase.execute('licitante-abc', 'novo@empresa.com.br');

    expect(mockRepository.convidar).toHaveBeenCalledWith('licitante-abc', 'novo@empresa.com.br', undefined);
    expect(mockRepository.convidar).toHaveBeenCalledTimes(1);
  });

  it('deve repassar o nome opcional ao repositório quando informado', async () => {
    vi.mocked(mockRepository.convidar).mockResolvedValueOnce(mockConvite);

    await useCase.execute('licitante-abc', 'novo@empresa.com.br', 'Maria Souza');

    expect(mockRepository.convidar).toHaveBeenCalledWith(
      'licitante-abc',
      'novo@empresa.com.br',
      'Maria Souza'
    );
  });

  it('deve propagar exceção lançada pelo repositório', async () => {
    vi.mocked(mockRepository.convidar).mockRejectedValueOnce(
      new Error('Este e-mail já tem acesso a esta empresa.')
    );

    await expect(useCase.execute('licitante-1', 'existente@empresa.com.br')).rejects.toThrow(
      'Este e-mail já tem acesso a esta empresa.'
    );
  });
});
