import { describe, it, expect, vi } from 'vitest';
import { ConsultarAtaPncpUseCase } from './ConsultarAtaPncpUseCase';
import { AtaError } from '../errors/ataErrors';
import type { IAtasRepository } from '../repositories/IAtasRepository';
import type { DadosAtaPncp } from '../entities/criarAta';

const dadosPncpFixture: DadosAtaPncp = {
  numeroControlePncp: '19876424000142-1-000189/2025-000016',
  titulo: 'Ata nº 63/2026/2026',
  descricao: 'AQUISIÇÃO FUTURA DE MATERIAL MÉDICO HOSPITALAR',
  orgaoCnpj: '19876424000142',
  orgaoNome: 'MUNICIPIO DE IPATINGA',
  unidadeNome: 'Unidade Única',
  modalidadeLicitacao: 'Pregão - Eletrônico',
  dataAssinatura: '2026-05-05',
  dataInicioVigencia: '2026-05-05',
  dataFimVigencia: '2027-05-05',
  situacao: 'Divulgada no PNCP',
  cancelado: false,
  municipio: 'Ipatinga',
  uf: 'MG',
};

function makeRepo(overrides?: Partial<IAtasRepository>): IAtasRepository {
  return {
    listarAtas: vi.fn().mockResolvedValue([]),
    getAta: vi.fn().mockResolvedValue({}),
    criarAta: vi.fn().mockResolvedValue({}),
    consultarAtaPncp: vi.fn().mockResolvedValue(dadosPncpFixture),
    ...overrides,
  };
}

describe('ConsultarAtaPncpUseCase', () => {
  it('retorna DadosAtaPncp quando repositório resolve com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new ConsultarAtaPncpUseCase(repo);
    const result = await useCase.execute('19876424000142-1-000189/2025-000016');
    expect(result).toEqual(dadosPncpFixture);
    expect(repo.consultarAtaPncp).toHaveBeenCalledWith('19876424000142-1-000189/2025-000016');
  });

  it('propaga AtaError lançado pelo repositório (não encontrado - 404)', async () => {
    const repo = makeRepo({
      consultarAtaPncp: vi.fn().mockRejectedValue(
        new AtaError('Nenhuma ata encontrada no PNCP para o código informado.')
      ),
    });
    const useCase = new ConsultarAtaPncpUseCase(repo);
    await expect(useCase.execute('codigo-inexistente')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (resultado ambíguo - 422)', async () => {
    const repo = makeRepo({
      consultarAtaPncp: vi.fn().mockRejectedValue(
        new AtaError('O código retornou mais de um resultado no PNCP. Utilize um código mais específico.')
      ),
    });
    const useCase = new ConsultarAtaPncpUseCase(repo);
    await expect(useCase.execute('codigo-ambiguo')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (PNCP indisponível - 503)', async () => {
    const repo = makeRepo({
      consultarAtaPncp: vi.fn().mockRejectedValue(
        new AtaError('O serviço do PNCP está temporariamente indisponível. Tente novamente em instantes.')
      ),
    });
    const useCase = new ConsultarAtaPncpUseCase(repo);
    await expect(useCase.execute('qualquer-codigo')).rejects.toBeInstanceOf(AtaError);
  });

  it('propaga AtaError lançado pelo repositório (falha de rede)', async () => {
    const repo = makeRepo({
      consultarAtaPncp: vi.fn().mockRejectedValue(
        new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')
      ),
    });
    const useCase = new ConsultarAtaPncpUseCase(repo);
    await expect(useCase.execute('qualquer-codigo')).rejects.toBeInstanceOf(AtaError);
  });
});
