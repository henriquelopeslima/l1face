import { useParams, useNavigate } from 'react-router';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  NavArrowLeft,
  Download,
  Calendar,
  Clock,
  Building,
  MapPin,
  DollarCircle,
  InfoCircle,
  List,
  DatabaseStats,
} from 'iconoir-react';

const MOCK_NE = {
  id: 'NE-001',
  numero: 'NE 88442/2025',
  tipoEmpenho: 'ordinario' as const,
  orgaoContratante: 'Prefeitura de Fortaleza',
  secretaria: 'SMS',
  descricao: 'Fornecimento de medicamentos diversos para a Secretaria Municipal de Saúde.',
  dataEmissao: '2025-03-01',
  dataVencimento: '2026-02-15',
  valorTotal: 120000,
  saldoAtual: 88000,
  status: 'liquido' as const,
  enderecoEntrega: 'Central de Abastecimento Farmacêutico, Fortaleza/CE',
  prazoEntrega: 3,
  prazoPagamento: 30,
  anexoNota: '#',
};

const MOCK_ITENS = [
  { id: 'ni1', descricao: 'Paracetamol 500mg (comprimido)', unidadeMedida: 'caixa', qtdSolicitada: 500, qtdEntregue: 320, valorUnitario: 18.5 },
  { id: 'ni2', descricao: 'Dipirona sódica 500mg', unidadeMedida: 'caixa', qtdSolicitada: 300, qtdEntregue: 200, valorUnitario: 22.0 },
  { id: 'ni3', descricao: 'Amoxicilina 500mg (cápsula)', unidadeMedida: 'caixa', qtdSolicitada: 200, qtdEntregue: 100, valorUnitario: 35.0 },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

const tipoEmpenhoLabels: Record<string, string> = {
  ordinario: 'Ordinário',
  global: 'Global',
  estimativo: 'Estimativo',
};

export function NotaEmpenhoDetalhesPage() {
  useParams();
  const navigate = useNavigate();

  const ne = MOCK_NE;
  const itens = MOCK_ITENS;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: `NE ${ne.numero}` },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold lg:text-3xl">{ne.numero}</h1>
            <Badge className="bg-[#4B5563] text-white">Empenho {tipoEmpenhoLabels[ne.tipoEmpenho]}</Badge>
            <Badge className="bg-[#0050FF] text-white">Em processamento</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{ne.orgaoContratante} · {ne.secretaria}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <NavArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarCircle className="h-4 w-4" />
              <span className="text-xs">Valor total</span>
            </div>
            <p className="font-semibold text-lg">{formatCurrency(ne.valorTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DatabaseStats className="h-4 w-4" />
              <span className="text-xs">Saldo</span>
            </div>
            <p className="font-semibold text-lg">{formatCurrency(ne.saldoAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Emissão</span>
            </div>
            <p className="font-semibold">{formatDate(ne.dataEmissao)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Prazo entrega</span>
            </div>
            <p className="font-semibold">{formatDate(ne.dataVencimento)}</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={['dados', 'itens']} className="space-y-4">
        <AccordionItem value="dados" className="border rounded-lg px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <InfoCircle className="h-4 w-4" />
              Dados da nota de empenho
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2 py-2">
              <div>
                <p className="text-xs text-muted-foreground">Descrição / objeto</p>
                <p className="text-sm">{ne.descricao}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" /> Órgão</p>
                <p className="text-sm font-medium">{ne.orgaoContratante}</p>
                <p className="text-xs text-muted-foreground">{ne.secretaria}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço de entrega</p>
                <p className="text-sm">{ne.enderecoEntrega}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Prazo entrega</p>
                  <p className="text-sm font-medium">{ne.prazoEntrega} dias</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prazo pagamento</p>
                  <p className="text-sm font-medium">{ne.prazoPagamento} dias</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="itens" className="border rounded-lg px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Itens empenhados ({itens.length})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[80px]">Unid.</TableHead>
                  <TableHead className="w-[90px] text-right">Solicitado</TableHead>
                  <TableHead className="w-[90px] text-right">Entregue</TableHead>
                  <TableHead className="w-[100px] text-right">Valor unit.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.descricao}</TableCell>
                    <TableCell className="text-sm">{item.unidadeMedida}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{item.qtdSolicitada}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{item.qtdEntregue}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{formatCurrency(item.valorUnitario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
