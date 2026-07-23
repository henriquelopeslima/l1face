import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { InstrumentosRepository } from '@/features/instrumentos/data/repositories/InstrumentosRepository';
import { BuscarInstrumentoUseCase } from '@/features/instrumentos/domain/useCases/BuscarInstrumentoUseCase';
import type { NotificacaoClicavel } from '../../domain/entities/Notificacao';
import { useNotificacoes } from '../context/NotificacoesContext';

const instrumentosRepository = new InstrumentosRepository();
const buscarInstrumentoUseCase = new BuscarInstrumentoUseCase(instrumentosRepository);

/**
 * Marca a notificação como lida e, quando ela se refere a um instrumento ou a uma ata,
 * navega até a página de detalhes da entidade de origem. A navegação ocorre mesmo que a
 * notificação já esteja lida (clique é sempre acionável). Notificações de outras origens
 * (ex.: ordem de fornecimento) apenas são marcadas como lidas, sem navegação.
 */
export function useAbrirNotificacao(): (notificacao: NotificacaoClicavel) => Promise<void> {
  const navigate = useNavigate();
  const { marcarComoLida } = useNotificacoes();

  return useCallback(
    async (notificacao: NotificacaoClicavel) => {
      void marcarComoLida(notificacao.id);

      if (notificacao.tipoOrigem === 'ata') {
        navigate(`/atas/${notificacao.entidadeId}`);
        return;
      }

      if (notificacao.tipoOrigem === 'instrumento') {
        try {
          const instrumento = await buscarInstrumentoUseCase.execute(notificacao.entidadeId);
          navigate(
            instrumento.tipo === 'CONTRATO'
              ? `/contratos/detalhes/${notificacao.entidadeId}`
              : `/notas-empenho/detalhes/${notificacao.entidadeId}`
          );
        } catch {
          // Instrumento removido/inacessível: permanece na tela atual sem quebrar a UI.
        }
      }
    },
    [marcarComoLida, navigate]
  );
}
