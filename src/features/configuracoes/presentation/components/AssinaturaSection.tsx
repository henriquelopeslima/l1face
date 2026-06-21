import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DollarCircle, Check } from 'iconoir-react';

const pagamentos = [
  { mes: 'Março 2026', data: '14/03/2026' },
  { mes: 'Fevereiro 2026', data: '14/02/2026' },
];

export function AssinaturaSection() {
  return (
    <Card id="assinatura" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <DollarCircle className="h-4 w-4 lg:h-5 lg:w-5" />
          Assinatura e cobrança
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Gerencie seu plano e método de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 lg:space-y-4">
          <div className="p-4 rounded-lg border-2 border-[#0050FF] bg-gradient-to-br from-[#EDF4FF] to-white dark:from-[#0050FF]/10 dark:to-transparent">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg lg:text-xl font-semibold">Plano Professional</h3>
                  <Badge className="bg-[#0050FF] text-white border-[#0050FF] text-[10px] h-5">Ativo</Badge>
                </div>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Usuários ilimitados • Contratos ilimitados
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl lg:text-3xl font-bold text-[#0050FF]">R$ 497</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
              <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0050FF] to-[#4D8EFF] rounded-full"
                  style={{ width: '65%' }}
                />
              </div>
              <span className="whitespace-nowrap">19 de 30 dias</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-accent/50">
              <p className="text-xs text-muted-foreground mb-1">Próxima cobrança</p>
              <p className="text-base lg:text-lg font-semibold">14 de Abr, 2026</p>
              <p className="text-xs text-muted-foreground mt-1">R$ 497,00 via Stripe</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-accent/50">
              <p className="text-xs text-muted-foreground mb-1">Método de pagamento</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-gradient-to-r from-[#1434CB] to-[#F7981D] rounded" />
                <p className="text-base lg:text-lg font-semibold">•••• 4242</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Visa • Expira 12/2027</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Histórico de pagamentos</p>
            <div className="space-y-2">
              {pagamentos.map((p) => (
                <div key={p.mes} className="flex items-center gap-3 p-2 lg:p-3 rounded-lg border border-border">
                  <div className="h-8 w-8 rounded-full bg-[#06D6A0]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-[#06D6A0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs lg:text-sm">{p.mes}</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">Pago em {p.data}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm lg:text-base">R$ 497,00</p>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] lg:text-xs">
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:gap-3 pt-2">
            <Button variant="outline" className="h-9 lg:h-10 text-xs lg:text-sm">Alterar plano</Button>
            <Button className="h-9 lg:h-10 text-xs lg:text-sm">Gerenciar pagamento</Button>
          </div>
          <div className="pt-2 border-t">
            <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground hover:text-foreground">
              Acessar portal de cobrança
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
