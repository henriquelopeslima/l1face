import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, WarningCircle } from 'iconoir-react';
import { useNotificacoes } from '@/features/notificacoes/presentation/context/NotificacoesContext';
import { useAbrirNotificacao } from '@/features/notificacoes/presentation/hooks/useAbrirNotificacao';
import { NotificacaoItem } from '@/features/notificacoes/presentation/components/NotificacaoItem';

const preferenciasNotificacao = [
  { id: 'vencimento', label: 'Contratos próximos ao vencimento', desc: 'Receber alerta 30 dias antes' },
  { id: 'financeiro', label: 'Pendências financeiras', desc: 'Alertas de pagamentos pendentes' },
  { id: 'email', label: 'E-mail diário', desc: 'Resumo das atividades do dia' },
];

export function NotificacoesSection() {
  const { notificacoes, quantidadeNaoLidas, isLoading, error } = useNotificacoes();
  const abrirNotificacao = useAbrirNotificacao();

  return (
    <Card id="notificacoes" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
          Notificações
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Configure como você deseja receber alertas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 lg:space-y-4">
          {preferenciasNotificacao.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between p-2 lg:p-3 rounded-lg opacity-60"
            >
              <div className="flex-1 pr-3">
                <p className="font-medium text-sm lg:text-base">{n.label}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">{n.desc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs">
                  Em breve
                </Badge>
                <button disabled className="w-11 h-6 lg:w-12 rounded-full relative bg-border cursor-not-allowed">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-muted rounded-full" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <WarningCircle className="h-4 w-4" />
                Alertas recentes
              </p>
              {quantidadeNaoLidas > 0 && (
                <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-[#EF4444] text-white text-xs">
                  {quantidadeNaoLidas > 9 ? '9+' : quantidadeNaoLidas}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {isLoading && <p className="text-sm text-muted-foreground text-center py-4">Carregando alertas…</p>}
              {!isLoading && error && <p className="text-sm text-muted-foreground text-center py-4">{error}</p>}
              {!isLoading && !error && notificacoes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta no momento.</p>
              )}
              {!isLoading &&
                !error &&
                notificacoes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border overflow-hidden">
                    <NotificacaoItem notificacao={n} onClick={abrirNotificacao} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
