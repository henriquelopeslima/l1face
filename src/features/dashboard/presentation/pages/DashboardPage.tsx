import { Link } from 'react-router';
import {
  Page,
  Notes,
  CheckCircle,
  DollarCircle,
  StatsUpSquare,
  StatsDownSquare,
  WarningTriangle,
  ArrowUpRight,
  RefreshDouble,
} from 'iconoir-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import type { StatusInstrumento } from '../../domain/entities/DashboardData';
import { LoadingLogo } from '@/shared/components/feedback/LoadingLogo';
import { NotificacaoItem } from '@/features/notificacoes/presentation/components/NotificacaoItem';
import { useAbrirNotificacao } from '@/features/notificacoes/presentation/hooks/useAbrirNotificacao';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const MESES_ABREVIADOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatarMesAbreviado(mes: string): string {
  const [, mesNumero] = mes.split('-');
  const indice = Number(mesNumero) - 1;
  return MESES_ABREVIADOS[indice] ?? mes;
}

const STATUS_LABEL_COR: Record<StatusInstrumento, { label: string; color: string }> = {
  ATIVA: { label: 'Vigentes', color: '#0050FF' },
  PROXIMA_AO_VENCIMENTO: { label: 'Vencendo', color: '#4D8EFF' },
  ENCERRADA: { label: 'Vencidos', color: '#6B4DFF' },
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DashboardPage() {
  const { session } = useAuth();
  const { dashboard, isLoading, error, refetch } = useDashboard();
  const abrirNotificacao = useAbrirNotificacao();
  const currencyValueClass = 'font-bold whitespace-nowrap leading-tight text-[clamp(0.875rem,1.6vw,1.875rem)]';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <WarningTriangle className="h-8 w-8 text-[var(--danger)]" />
              <p className="text-[var(--danger)]">{error ?? 'Não foi possível carregar os dados da tela inicial.'}</p>
              <Button variant="outline" onClick={refetch}>
                <RefreshDouble className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { cards, evolucaoMensal, statusInstrumentos, alertas } = dashboard;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-3xl">Bem-vindo ao LicitaOne, {session?.user.nomeCompleto}!</h1>
        <p className="text-muted-foreground mt-1 text-sm lg:text-base">
          Aqui está um resumo das suas licitações e instrumentos contratuais
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:gap-4 lg:gap-6 lg:grid-cols-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Valor Total Contratado</CardTitle>
            <Page className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className={currencyValueClass}>{formatarMoeda(cards.valorTotalContratado.valor)}</div>
            {cards.valorTotalContratado.variacaoPercentualMesAnterior !== null && (
              <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
                <VariacaoPercentual valor={cards.valorTotalContratado.variacaoPercentualMesAnterior} />{' '}
                <span className="hidden md:inline">em relação ao mês anterior</span>
                <span className="md:hidden">vs mês anterior</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Atas de Registro de Preços</CardTitle>
            <Notes className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className={currencyValueClass}>{formatarMoeda(cards.valorTotalAtas.valor)}</div>
            {cards.valorTotalAtas.variacaoPercentualMesAnterior !== null && (
              <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
                <VariacaoPercentual valor={cards.valorTotalAtas.variacaoPercentualMesAnterior} />{' '}
                <span className="hidden md:inline">em relação ao mês anterior</span>
                <span className="md:hidden">vs mês anterior</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Instrumentos ativos</CardTitle>
            <CheckCircle className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">{cards.instrumentosAtivos.quantidade}</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#FFB800] font-medium">{cards.instrumentosAtivos.proximosAoVencimento}</span> próximos ao vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Pendências Financeiras</CardTitle>
            <DollarCircle className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className={currencyValueClass}>{formatarMoeda(cards.pendenciasFinanceiras.valor)}</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#EF5B5B] font-medium">{cards.pendenciasFinanceiras.quantidadeAguardandoProcessamento}</span> aguardando processamento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="text-base lg:text-xl">Evolução Mensal</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Valores contratados <span className="hidden lg:inline">e em atas de registro de preços</span> nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 lg:pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={evolucaoMensal.map((ponto) => ({ ...ponto, month: formatarMesAbreviado(ponto.mes) }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-[10px] lg:text-xs" />
                <YAxis className="text-[10px] lg:text-xs" tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="contratos" stackId="1" stroke="#0050FF" fill="#0050FF" fillOpacity={0.6} name="Contratos" />
                <Area type="monotone" dataKey="atas" stackId="1" stroke="#4D8EFF" fill="#4D8EFF" fillOpacity={0.6} name="Atas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 lg:pb-6">
            <CardTitle className="text-base lg:text-xl">Status dos instrumentos</CardTitle>
            <CardDescription className="text-sm lg:text-base">
              Distribuição por situação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 lg:pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusInstrumentos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={60}
                  dataKey="quantidade"
                  nameKey="status"
                >
                  {statusInstrumentos.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_LABEL_COR[entry.status].color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _name, entry) => [value, STATUS_LABEL_COR[(entry.payload as { status: StatusInstrumento }).status].label]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusInstrumentos.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_LABEL_COR[item.status].color }} />
                    <span className="text-sm">{STATUS_LABEL_COR[item.status].label}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.quantidade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            {[
              { href: '/instrumentos/cadastrar', icon: Page, color: '#0050FF', bg: '#0050FF', title: 'Cadastrar contrato', sub: 'Novo contrato ou aditivo' },
              { href: '/atas/cadastrar', icon: Notes, color: '#06D6A0', bg: '#06D6A0', title: 'Cadastrar ata de registro de preços', sub: 'Nova ata ou adesão' },
              { href: '/instrumentos/gestao', icon: Page, color: '#6B4DFF', bg: '#6B4DFF', title: 'Gestão de instrumentos', sub: 'Contratos, empenhos e outros' },
              { href: '/configuracoes', icon: DollarCircle, color: '#FFB800', bg: '#FFB800', title: 'Controle Financeiro', sub: 'Pendências e pagamentos' },
            ].map(({ href, icon: Icon, color, bg, title, sub }) => (
              <Button key={href} asChild variant="outline" className="w-full justify-start gap-3 h-auto py-3 lg:py-4 flex-col items-start text-left xl:flex-row xl:items-center whitespace-normal">
                <Link to={href}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${bg}1A` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm lg:text-base">{title}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{sub}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 lg:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-xl">Alertas e pendências</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-[#0050FF]" asChild>
              <Link to="/instrumentos/gestao">
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta no momento.</p>
          )}
          {alertas.map((alerta) => (
            <div key={alerta.id} className="rounded-lg border border-border overflow-hidden">
              <NotificacaoItem notificacao={alerta} onClick={abrirNotificacao} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VariacaoPercentual({ valor }: { valor: number }) {
  const isPositivo = valor >= 0;
  const Icon = isPositivo ? StatsUpSquare : StatsDownSquare;
  return (
    <span className={`inline-flex items-center font-medium ${isPositivo ? 'text-[#06D6A0]' : 'text-[#EF5B5B]'}`}>
      <Icon className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1" />
      {isPositivo ? '+' : ''}
      {valor.toFixed(1)}%
    </span>
  );
}
