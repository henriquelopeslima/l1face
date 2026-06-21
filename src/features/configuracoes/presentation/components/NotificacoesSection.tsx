import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, WarningCircle } from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';

const notificacoes = [
  { id: 'vencimento', label: 'Contratos próximos ao vencimento', desc: 'Receber alerta 30 dias antes', active: true },
  { id: 'financeiro', label: 'Pendências financeiras', desc: 'Alertas de pagamentos pendentes', active: true },
  { id: 'email', label: 'E-mail diário', desc: 'Resumo das atividades do dia', active: false },
];

const alertas = [
  { cor: 'bg-[#EF4444]', titulo: 'Contrato 042/2024 próximo ao vencimento', sub: 'Vence em 15 dias' },
  { cor: 'bg-[#F59E0B]', titulo: 'Ata de registro precisa de renovação', sub: 'Vence em 45 dias' },
  { cor: 'bg-[#10B981]', titulo: 'Pagamento processado com sucesso', sub: 'Há 2 horas' },
];

export function NotificacoesSection() {
  const [notifState, setNotifState] = useState<Record<string, boolean>>(
    Object.fromEntries(notificacoes.map((n) => [n.id, n.active]))
  );

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
          {notificacoes.map((n) => {
            const isOn = notifState[n.id];
            return (
              <div
                key={n.id}
                className="flex items-center justify-between p-2 lg:p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 pr-3">
                  <p className="font-medium text-sm lg:text-base">{n.label}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <button
                  onClick={() => setNotifState((p) => ({ ...p, [n.id]: !p[n.id] }))}
                  className={cn(
                    'w-11 h-6 lg:w-12 rounded-full relative cursor-pointer flex-shrink-0 transition-colors',
                    isOn ? 'bg-[#0050FF]' : 'bg-border'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white dark:bg-muted rounded-full transition-all',
                      isOn ? 'right-0.5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            );
          })}

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <WarningCircle className="h-4 w-4" />
                Alertas recentes
              </p>
              <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-[#EF4444] text-white text-xs">
                3
              </Badge>
            </div>
            <div className="space-y-2">
              {alertas.map((a) => (
                <div key={a.titulo} className="p-3 rounded-lg bg-accent border border-border">
                  <div className="flex gap-2">
                    <div className={`w-2 h-2 rounded-full ${a.cor} mt-1.5 flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-medium">{a.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
