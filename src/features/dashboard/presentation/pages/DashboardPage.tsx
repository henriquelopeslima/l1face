import { Link } from 'react-router';
import {
  Page,
  Notes,
  CheckCircle,
  DollarCircle,
  StatsUpSquare,
  Clock,
  WarningTriangle,
  ArrowUpRight,
} from 'iconoir-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
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

const monthlyData = [
  { month: 'Jan', contratos: 4200000, atas: 1500000 },
  { month: 'Fev', contratos: 3800000, atas: 1800000 },
  { month: 'Mar', contratos: 5100000, atas: 2100000 },
  { month: 'Abr', contratos: 4600000, atas: 1900000 },
  { month: 'Mai', contratos: 5800000, atas: 2400000 },
  { month: 'Jun', contratos: 6200000, atas: 2800000 },
];

const statusData = [
  { name: 'Vigentes', value: 45, color: '#0050FF' },
  { name: 'Vencendo', value: 8, color: '#4D8EFF' },
  { name: 'Vencidos', value: 3, color: '#6B4DFF' },
];

const alertas = [
  { id: '1', tipo: 'vencimento', texto: 'Contrato 042/2024 — Merenda Escolar', sub: 'Vence em 12 dias', icon: Clock, cor: '#F39C12' },
  { id: '2', tipo: 'financeiro', texto: 'NE 88442/2025 — Medicamentos', sub: 'OF com prazo próximo', icon: WarningTriangle, cor: '#EF5B5B' },
];

export function DashboardPage() {
  const { session } = useAuth();
  const currencyValueClass = 'font-bold whitespace-nowrap leading-tight text-[clamp(0.875rem,1.6vw,1.875rem)]';

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
            <div className={currencyValueClass}>R$ 1.000.000,00</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#06D6A0] inline-flex items-center font-medium">
                <StatsUpSquare className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1" />
                +12.5%
              </span>{' '}
              <span className="hidden md:inline">em relação ao mês anterior</span>
              <span className="md:hidden">vs mês anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Atas de Registro de Preços</CardTitle>
            <Notes className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className={currencyValueClass}>R$ 359.112,10</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#06D6A0] inline-flex items-center font-medium">
                <StatsUpSquare className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mr-1" />
                +8.2%
              </span>{' '}
              <span className="hidden md:inline">em relação ao mês anterior</span>
              <span className="md:hidden">vs mês anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Instrumentos ativos</CardTitle>
            <CheckCircle className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">56</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#FFB800] font-medium">8</span> próximos ao vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-2.5 lg:pb-3">
            <CardTitle className="text-xs md:text-sm lg:text-base font-medium">Pendências Financeiras</CardTitle>
            <DollarCircle className="h-4 w-4 md:h-4.5 md:w-4.5 lg:h-5 lg:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 md:pb-4 lg:pb-6">
            <div className={currencyValueClass}>R$ 125.450,00</div>
            <p className="text-xs md:text-xs lg:text-sm text-muted-foreground mt-1 md:mt-1.5 lg:mt-2">
              <span className="text-[#EF5B5B] font-medium">5</span> aguardando processamento
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
              <AreaChart data={monthlyData}>
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
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={60}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.value}</span>
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
          {alertas.map((alerta) => {
            const Icon = alerta.icon;
            return (
              <div key={alerta.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: alerta.cor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alerta.texto}</p>
                  <p className="text-xs text-muted-foreground">{alerta.sub}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
