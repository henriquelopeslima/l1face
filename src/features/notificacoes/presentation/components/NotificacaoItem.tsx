import { Clock, WarningTriangle } from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';
import type { NotificacaoClicavel, TipoOrigemNotificacao } from '../../domain/entities/Notificacao';

const TIPO_ORIGEM_ICONE: Record<TipoOrigemNotificacao, typeof Clock> = {
  instrumento: Clock,
  ata: Clock,
  of: WarningTriangle,
};

interface NotificacaoItemProps {
  notificacao: NotificacaoClicavel;
  onClick?: (notificacao: NotificacaoClicavel) => void;
}

export function NotificacaoItem({ notificacao, onClick }: NotificacaoItemProps) {
  const Icon = TIPO_ORIGEM_ICONE[notificacao.tipoOrigem];
  const clicavel = Boolean(onClick);

  return (
    <div
      role={clicavel ? 'button' : undefined}
      tabIndex={clicavel ? 0 : undefined}
      onClick={clicavel ? () => onClick?.(notificacao) : undefined}
      className={cn(
        'flex gap-2 p-3 rounded-lg border-b last:border-b-0',
        !notificacao.lida && 'bg-accent/50',
        clicavel && 'cursor-pointer hover:bg-accent'
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: notificacao.conteudo.cor }} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', notificacao.lida ? 'font-normal text-muted-foreground' : 'font-medium')}>
          {notificacao.conteudo.titulo}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{notificacao.conteudo.descricao}</p>
      </div>
    </div>
  );
}
