import { useState } from 'react';
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
import { CriarOrdemFornecimento } from '@/features/instrumentos/presentation/components/CriarOrdemFornecimento';
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
  Plus,
} from 'iconoir-react';

interface ItemContrato {
  id: string;
  descricao: string;
  unidadeMedida: string;
  qtdContratada: number;
  qtdEntregue: number;
  qtdReservada: number;
  valorUnitario: number;
}

const MOCK_CONTRATO = {
  id: 'CT-001',
  numeroInstrumento: '042/2024',
  isARP: false,
  orgaoContratante: 'Prefeitura Municipal de Russas',
  secretaria: 'SEMED',
  objeto: 'Fornecimento de merenda escolar para a rede municipal de ensino fundamental e pré-escolar.',
  vigenciaInicio: '2024-04-01',
  vigenciaFim: '2026-03-31',
  valorGlobal: 250000,
  saldoAtual: 28000,
  status: 'proximo-vencimento' as const,
  enderecoEntrega: 'Rua das Escolas, 100 — Russas, CE',
  prazoEntrega: 5,
  prazoPagamento: 30,
  renovavel: true,
  anexoContrato: '#',
};

const MOCK_ITENS: ItemContrato[] = [
  { id: 'i1', descricao: 'Arroz branco tipo 1', unidadeMedida: 'kg', qtdContratada: 5000, qtdEntregue: 3200, qtdReservada: 400, valorUnitario: 4.5 },
  { id: 'i2', descricao: 'Feijão carioca tipo 1', unidadeMedida: 'kg', qtdContratada: 3000, qtdEntregue: 1800, qtdReservada: 200, valorUnitario: 7.2 },
  { id: 'i3', descricao: 'Óleo de soja refinado', unidadeMedida: 'L', qtdContratada: 2000, qtdEntregue: 1200, qtdReservada: 100, valorUnitario: 6.8 },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

export function ContratoDetalhesPage() {
  useParams();
  const navigate = useNavigate();
  const [ofOpen, setOfOpen] = useState(false);

  const contrato = MOCK_CONTRATO;
  const itens = MOCK_ITENS;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: `Contrato ${contrato.numeroInstrumento}` },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold lg:text-3xl">Contrato {contrato.numeroInstrumento}</h1>
            <Badge className="bg-[#F39C12] text-white">Próx. vencimento</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{contrato.orgaoContratante} · {contrato.secretaria}</p>
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
          <Button size="sm" className="gap-2" onClick={() => setOfOpen(true)}>
            <Plus className="h-4 w-4" />
            Criar OF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarCircle className="h-4 w-4" />
              <span className="text-xs">Valor global</span>
            </div>
            <p className="font-semibold text-lg">{formatCurrency(contrato.valorGlobal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DatabaseStats className="h-4 w-4" />
              <span className="text-xs">Saldo atual</span>
            </div>
            <p className="font-semibold text-lg">{formatCurrency(contrato.saldoAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Início vigência</span>
            </div>
            <p className="font-semibold">{formatDate(contrato.vigenciaInicio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Fim vigência</span>
            </div>
            <p className="font-semibold text-[#F39C12]">{formatDate(contrato.vigenciaFim)}</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={['dados', 'itens']} className="space-y-4">
        <AccordionItem value="dados" className="border rounded-lg px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <InfoCircle className="h-4 w-4" />
              Dados do contrato
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2 py-2">
              <div>
                <p className="text-xs text-muted-foreground">Objeto</p>
                <p className="text-sm">{contrato.objeto}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" /> Órgão contratante</p>
                <p className="text-sm font-medium">{contrato.orgaoContratante}</p>
                <p className="text-xs text-muted-foreground">{contrato.secretaria}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço de entrega</p>
                <p className="text-sm">{contrato.enderecoEntrega}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Prazo entrega</p>
                  <p className="text-sm font-medium">{contrato.prazoEntrega} dias úteis</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prazo pagamento</p>
                  <p className="text-sm font-medium">{contrato.prazoPagamento} dias</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="itens" className="border rounded-lg px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Itens do contrato ({itens.length})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[80px]">Unid.</TableHead>
                  <TableHead className="w-[90px] text-right">Contratado</TableHead>
                  <TableHead className="w-[90px] text-right">Entregue</TableHead>
                  <TableHead className="w-[90px] text-right">Reservado</TableHead>
                  <TableHead className="w-[100px] text-right">Valor unit.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.descricao}</TableCell>
                    <TableCell className="text-sm">{item.unidadeMedida}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{item.qtdContratada}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{item.qtdEntregue}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{item.qtdReservada}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{formatCurrency(item.valorUnitario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <CriarOrdemFornecimento
        open={ofOpen}
        onOpenChange={setOfOpen}
        contratoId={contrato.id}
        itensContrato={itens}
        prazoEntrega={contrato.prazoEntrega}
        onSubmit={(data) => {
          console.log('OF criada:', data);
          setOfOpen(false);
        }}
      />
    </div>
  );
}
