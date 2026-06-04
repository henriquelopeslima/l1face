import { describe, it, expect, vi } from 'vitest';
import { BuscarInstrumentoUseCase } from './BuscarInstrumentoUseCase';
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { InstrumentoDetalhe } from '../entities/instrumentoContratual';

const contratoFixture: InstrumentoDetalhe = {
  instrumentoId: '01963b7a-1234-7abc-8def-000000000001',
  licitanteId: '01963b7a-0000-7abc-8def-000000000099',
  ataId: null,
  criadoEm: '2026-01-15T10:30:00+00:00',
  tipo: 'CONTRATO',
  contrato: {
    id: '01963b7a-aaaa-7abc-8def-000000000010',
    numeroPncp: null,
    numero: 'CT-001/2026',
    orgaoContratante: 'Secretaria Municipal de Obras',
    unidade: 'Departamento de Licitações',
    objeto: 'Fornecimento de materiais de construção',
    vigenciaInicial: '2026-01-01',
    vigenciaFinal: '2026-12-31',
    endereco: null,
    prazoEntrega: 30,
    tipoPrazoEntrega: 'UTEIS',
    prazoPagamento: 15,
    tipoPrazoPagamento: 'CORRIDOS',
    enderecoEntrega: null,
    renovavel: true,
    anexoUrl: null,
    status: 'ATIVA',
    criadoEm: '2026-01-15T10:30:00+00:00',
  },
  empenho: null,
  itens: [
    {
      id: '01963b7a-bbbb-7abc-8def-000000000020',
      descricao: 'Cimento Portland CP-II',
      unidadeMedida: 'saco 50kg',
      quantidadeTotal: 500,
      valorUnitario: 35.0,
      valorTotal: 17500.0,
    },
  ],
};

function makeRepo(overrides?: Partial<IInstrumentosRepository>): IInstrumentosRepository {
  return {
    listarInstrumentos: vi.fn().mockResolvedValue([]),
    criarContrato: vi.fn().mockResolvedValue(''),
    criarEmpenho: vi.fn().mockResolvedValue(''),
    consultarContratoPncp: vi.fn().mockResolvedValue({}),
    buscarInstrumento: vi.fn().mockResolvedValue(contratoFixture),
    ...overrides,
  };
}

describe('BuscarInstrumentoUseCase', () => {
  it('retorna InstrumentoDetalhe quando repositório resolve com sucesso', async () => {
    const repo = makeRepo();
    const useCase = new BuscarInstrumentoUseCase(repo);
    const result = await useCase.execute('01963b7a-1234-7abc-8def-000000000001');
    expect(result).toEqual(contratoFixture);
    expect(repo.buscarInstrumento).toHaveBeenCalledWith('01963b7a-1234-7abc-8def-000000000001');
  });

  it('propaga erro lançado pelo repositório (instrumento não encontrado)', async () => {
    const repo = makeRepo({
      buscarInstrumento: vi.fn().mockRejectedValue(new Error('Instrumento não encontrado.')),
    });
    const useCase = new BuscarInstrumentoUseCase(repo);
    await expect(useCase.execute('invalid-id')).rejects.toThrow('Instrumento não encontrado.');
  });

  it('propaga erro lançado pelo repositório (sessão expirada)', async () => {
    const repo = makeRepo({
      buscarInstrumento: vi.fn().mockRejectedValue(new Error('Sessão expirada. Faça login novamente.')),
    });
    const useCase = new BuscarInstrumentoUseCase(repo);
    await expect(useCase.execute('some-id')).rejects.toThrow('Sessão expirada. Faça login novamente.');
  });

  it('propaga erro lançado pelo repositório (erro genérico)', async () => {
    const repo = makeRepo({
      buscarInstrumento: vi.fn().mockRejectedValue(new Error('Erro ao carregar instrumento. Tente novamente.')),
    });
    const useCase = new BuscarInstrumentoUseCase(repo);
    await expect(useCase.execute('some-id')).rejects.toThrow('Erro ao carregar instrumento. Tente novamente.');
  });
});
