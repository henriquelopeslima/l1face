import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { useTheme } from 'next-themes';
import { useLocation, useNavigate } from 'react-router';
import {
  Settings,
  User,
  HalfMoon,
  SunLight,
  Bell,
  Lock,
  LogOut,
  Mail,
  Phone,
  Building,
  NavArrowRight,
  DollarCircle,
  WarningCircle,
  Check,
} from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';
import { GestaoAcessosSection } from '@/features/configuracoes/presentation/components/GestaoAcessosSection';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import fotoPerfil from '@/shared/assets/foto-perfil-placeholder.jpg';

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

const pagamentos = [
  { mes: 'Março 2026', data: '14/03/2026' },
  { mes: 'Fevereiro 2026', data: '14/02/2026' },
];

export function ConfiguracoesPage() {
  const { user, session } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [notifState, setNotifState] = useState<Record<string, boolean>>(
    Object.fromEntries(notificacoes.map((n) => [n.id, n.active]))
  );

  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Configurações' }]} />

      <div className="space-y-1">
        <h1 className="text-xl lg:text-4xl">Configurações</h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Gerencie suas preferências <span className="hidden lg:inline">e informações da conta</span>
        </p>
      </div>

      {/* Perfil */}
      <Card id="meu-perfil" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <User className="h-4 w-4 lg:h-5 lg:w-5" />
            Meu Perfil
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 lg:space-y-6">
          <div className="flex items-center gap-4 lg:gap-6">
            <img src={fotoPerfil} alt={`Foto de perfil de ${user?.nomeCompleto ?? ''}`} className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg lg:text-xl font-semibold">{user?.nomeCompleto ?? '—'}</h3>
              <p className="text-muted-foreground text-sm lg:text-base">{session?.licitante?.nomeEmpresa ?? '—'}</p>
              <Button variant="outline" size="sm" className="mt-2 lg:mt-3 h-8 text-xs lg:h-9 lg:text-sm">Alterar foto</Button>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-4 pt-3 lg:pt-4 border-t">
            {[
              { icon: Mail, label: 'E-mail', value: user?.email ?? '—' },
              { icon: Phone, label: 'Telefone', value: '—' },
              { icon: Building, label: 'Organização', value: session?.licitante?.nomeEmpresa ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-lg hover:bg-accent transition-colors">
                <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
                  <p className="font-medium text-sm lg:text-base truncate">{value}</p>
                </div>
                <NavArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card id="aparencia" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            {theme === 'dark' ? <HalfMoon className="h-4 w-4 lg:h-5 lg:w-5" /> : <SunLight className="h-4 w-4 lg:h-5 lg:w-5" />}
            Aparência
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">Personalize a aparência do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 lg:space-y-3">
            <p className="text-sm font-medium">Tema</p>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {[
                { value: 'light', icon: SunLight, label: 'Claro', desc: 'Tema claro' },
                { value: 'dark', icon: HalfMoon, label: 'Escuro', desc: 'Tema escuro' },
              ].map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all',
                    theme === value ? 'border-[#0050FF] bg-[#EDF4FF] dark:bg-[#0050FF]/10' : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-sm lg:text-base">{label}</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card id="notificacoes" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            Notificações
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">Configure como você deseja receber alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 lg:space-y-4">
            {notificacoes.map((n) => {
              const isOn = notifState[n.id];
              return (
                <div key={n.id} className="flex items-center justify-between p-2 lg:p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1 pr-3">
                    <p className="font-medium text-sm lg:text-base">{n.label}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifState((p) => ({ ...p, [n.id]: !p[n.id] }))}
                    className={cn('w-11 h-6 lg:w-12 rounded-full relative cursor-pointer flex-shrink-0 transition-colors', isOn ? 'bg-[#0050FF]' : 'bg-border')}
                  >
                    <div className={cn('absolute top-0.5 w-5 h-5 bg-white dark:bg-muted rounded-full transition-all', isOn ? 'right-0.5' : 'left-0.5')} />
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
                <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-[#EF4444] text-white text-xs">3</Badge>
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

      {/* Assinatura */}
      <Card id="assinatura" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <DollarCircle className="h-4 w-4 lg:h-5 lg:w-5" />
            Assinatura e cobrança
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">Gerencie seu plano e método de pagamento</CardDescription>
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
                  <p className="text-xs lg:text-sm text-muted-foreground">Usuários ilimitados • Contratos ilimitados</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-[#0050FF]">R$ 497</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0050FF] to-[#4D8EFF] rounded-full" style={{ width: '65%' }} />
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
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] lg:text-xs">Invoice</Button>
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

      {/* Segurança */}
      <Card id="seguranca" className="scroll-mt-4">
        <CardHeader className="pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
            Segurança
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">Gerencie a segurança da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 lg:space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base">
            <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
            Alterar senha
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base">
            <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
            Autenticação em duas etapas
          </Button>
        </CardContent>
      </Card>

      <GestaoAcessosSection />

      <Card className="border-destructive/50">
        <CardContent className="pt-4 lg:pt-6">
          <Button variant="destructive" className="w-full gap-2 h-10 lg:h-11 text-sm lg:text-base" onClick={() => navigate('/login')}>
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
