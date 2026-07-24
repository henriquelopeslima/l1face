import { describe, it, expect } from 'vitest';
import { agruparPorPeriodo } from './agruparPorPeriodo';
import type { Notificacao } from '../../domain/entities/Notificacao';

const AGORA = new Date('2026-07-23T15:00:00');

function makeNotificacao(overrides: Partial<Notificacao> & { id: string; criadaEm: string }): Notificacao {
  return {
    tipoOrigem: 'instrumento',
    entidadeId: '9b8a7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    conteudo: { titulo: 'Título', descricao: 'Descrição', cor: '#F59E0B' },
    lida: false,
    lidaEm: null,
    ...overrides,
  };
}

describe('agruparPorPeriodo', () => {
  it('retorna lista vazia quando não há notificações', () => {
    expect(agruparPorPeriodo([], AGORA)).toEqual([]);
  });

  it('agrupa em Hoje, Esta semana e Mais antigas, omitindo seções vazias', () => {
    const hoje1 = makeNotificacao({ id: 'hoje-1', criadaEm: '2026-07-23T09:00:00' });
    const hoje2 = makeNotificacao({ id: 'hoje-2', criadaEm: '2026-07-23T14:00:00' });
    const semana = makeNotificacao({ id: 'semana-1', criadaEm: '2026-07-20T10:00:00' });
    const antiga = makeNotificacao({ id: 'antiga-1', criadaEm: '2026-06-01T10:00:00' });

    const grupos = agruparPorPeriodo([hoje1, hoje2, semana, antiga], AGORA);

    expect(grupos.map((g) => g.titulo)).toEqual(['Hoje', 'Esta semana', 'Mais antigas']);
    expect(grupos.find((g) => g.titulo === 'Hoje')?.itens.map((n) => n.id)).toEqual(['hoje-2', 'hoje-1']);
    expect(grupos.find((g) => g.titulo === 'Esta semana')?.itens.map((n) => n.id)).toEqual(['semana-1']);
    expect(grupos.find((g) => g.titulo === 'Mais antigas')?.itens.map((n) => n.id)).toEqual(['antiga-1']);
  });

  it('omite a seção "Esta semana" quando não há notificações nesse período', () => {
    const hoje = makeNotificacao({ id: 'hoje-1', criadaEm: '2026-07-23T09:00:00' });
    const antiga = makeNotificacao({ id: 'antiga-1', criadaEm: '2026-01-01T10:00:00' });

    const grupos = agruparPorPeriodo([antiga, hoje], AGORA);

    expect(grupos.map((g) => g.titulo)).toEqual(['Hoje', 'Mais antigas']);
  });

  it('considera o limite de 6 dias corridos como "Esta semana" e o 7º dia como "Mais antigas"', () => {
    const seisDiasAtras = makeNotificacao({ id: 'seis-dias', criadaEm: '2026-07-17T10:00:00' });
    const seteDiasAtras = makeNotificacao({ id: 'sete-dias', criadaEm: '2026-07-16T10:00:00' });

    const grupos = agruparPorPeriodo([seisDiasAtras, seteDiasAtras], AGORA);

    const estaSemana = grupos.find((g) => g.titulo === 'Esta semana');
    const maisAntigas = grupos.find((g) => g.titulo === 'Mais antigas');

    expect(estaSemana?.itens.map((n) => n.id)).toEqual(['seis-dias']);
    expect(maisAntigas?.itens.map((n) => n.id)).toEqual(['sete-dias']);
  });
});
