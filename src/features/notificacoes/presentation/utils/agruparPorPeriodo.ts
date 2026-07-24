import type { Notificacao } from '../../domain/entities/Notificacao';

export interface GrupoNotificacoesPorPeriodo {
  titulo: string;
  itens: Notificacao[];
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function diferencaEmDias(agora: Date, criadaEm: Date): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  return Math.floor((inicioDoDia(agora).getTime() - inicioDoDia(criadaEm).getTime()) / MS_POR_DIA);
}

function ordenarDecrescente(notificacoes: Notificacao[]): Notificacao[] {
  return [...notificacoes].sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
}

/**
 * Agrupa notificações em três seções fixas relativas a `agora`: Hoje (mesmo dia),
 * Esta semana (últimos 6 dias antes de hoje) e Mais antigas (o restante). Seções sem
 * nenhuma notificação são omitidas. Dentro de cada seção, a ordem é da mais recente
 * para a mais antiga.
 */
export function agruparPorPeriodo(notificacoes: Notificacao[], agora: Date): GrupoNotificacoesPorPeriodo[] {
  const hoje: Notificacao[] = [];
  const estaSemana: Notificacao[] = [];
  const maisAntigas: Notificacao[] = [];

  for (const notificacao of notificacoes) {
    const dias = diferencaEmDias(agora, new Date(notificacao.criadaEm));
    if (dias <= 0) {
      hoje.push(notificacao);
    } else if (dias <= 6) {
      estaSemana.push(notificacao);
    } else {
      maisAntigas.push(notificacao);
    }
  }

  const grupos: GrupoNotificacoesPorPeriodo[] = [
    { titulo: 'Hoje', itens: ordenarDecrescente(hoje) },
    { titulo: 'Esta semana', itens: ordenarDecrescente(estaSemana) },
    { titulo: 'Mais antigas', itens: ordenarDecrescente(maisAntigas) },
  ];

  return grupos.filter((grupo) => grupo.itens.length > 0);
}
