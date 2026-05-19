import { useParams, useNavigate } from 'react-router';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { NavArrowLeft, Download, InfoCircle, Plus } from 'iconoir-react';

const MOCK_ARP = {
  id: '1',
  numeroAta: 'ARP 012/2025',
  orgaoGerenciador: 'Prefeitura de Fortaleza',
  objeto: 'Aquisição de Material de Tecnologia da Informação para todas as secretarias',
  vigenciaInicial: '2025-01-15',
  vigenciaFinal: '2026-06-30',
  aceitaAdesao: true,
  renovavel: true,
  itens: [
    { id: '1', descricao: 'Notebook i7 16GB RAM', unidadeMedida: 'un', valorUnitario: 6000, qtdRegistrada: 60, qtdConsumidaOrgao: 35, qtdParaCarona: 120, qtdConsumidaCarona: 70 },
    { id: '2', descricao: 'Monitor 27" 4K', unidadeMedida: 'un', valorUnitario: 3500, qtdRegistrada: 40, qtdConsumidaOrgao: 37, qtdParaCarona: 80, qtdConsumidaCarona: 80 },
  ],
  contratos: [
    { id: 'c1', numeroInstrumento: '203/2025', tipo: 'Contrato' as const, origemSaldo: 'Órgão gerenciador' as const, valor: 210000, status: 'Em Execução' as const },
    { id: 'c2', numeroInstrumento: 'NE 55223/2025', tipo: 'Empenho' as const, origemSaldo: 'Adesão (Carona)' as const, valor: 95000, status: 'Em Execução' as const },
  ],
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

export function ArpDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const arp = MOCK_ARP;

  const saldoOrgao = arp.itens.reduce((acc, i) => acc + (i.qtdRegistrada - i.qtdConsumidaOrgao) * i.valorUnitario, 0);
  const saldoCarona = arp.aceitaAdesao ? arp.itens.reduce((acc, i) => acc + ((i.qtdParaCarona ?? 0) - (i.qtdConsumidaCarona ?? 0)) * i.valorUnitario, 0) : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold lg:text-3xl">{arp.numeroAta}</h1>
            <Badge className="bg-[#06D6A0] text-white">Ativa</Badge>
            {arp.aceitaAdesao && <Badge variant="outline">Aceita adesão</Badge>}
          </div>
          <p className="text-muted-foreground text-sm mt-1">{arp.orgaoGerenciador}</p>
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
          <Button size="sm" onClick={() => navigate(`/atas/${id}/gerar-contrato`)}>
            <Plus className="h-4 w-4 mr-1" />
            Gerar contrato
          </Button>
        </div>
      </div>

      {saldoOrgao <= 0 && (
        <Alert>
          <InfoCircle className="h-4 w-4" />
          <AlertDescription>O saldo do órgão gerenciador está esgotado para esta ata.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vigência inicial</p><p className="font-semibold">{formatDate(arp.vigenciaInicial)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vigência final</p><p className="font-semibold">{formatDate(arp.vigenciaFinal)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Saldo órgão</p><p className="font-semibold">{formatCurrency(saldoOrgao)}</p></CardContent></Card>
        {arp.aceitaAdesao && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Saldo carona</p><p className="font-semibold text-[#0050FF]">{formatCurrency(saldoCarona)}</p></CardContent></Card>}
      </div>

      <Tabs defaultValue="itens">
        <TabsList>
          <TabsTrigger value="itens">Itens registrados</TabsTrigger>
          <TabsTrigger value="contratos">Contratos gerados</TabsTrigger>
        </TabsList>

        <TabsContent value="itens" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[70px]">Unid.</TableHead>
                    <TableHead className="text-right w-[80px]">Qtd. reg.</TableHead>
                    <TableHead className="text-right w-[80px]">Consumido órgão</TableHead>
                    {arp.aceitaAdesao && <TableHead className="text-right w-[80px]">Qtd. carona</TableHead>}
                    {arp.aceitaAdesao && <TableHead className="text-right w-[80px]">Consumido carona</TableHead>}
                    <TableHead className="text-right w-[100px]">Valor unit.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arp.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.descricao}</TableCell>
                      <TableCell className="text-sm">{item.unidadeMedida}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{item.qtdRegistrada}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">{item.qtdConsumidaOrgao}</TableCell>
                      {arp.aceitaAdesao && <TableCell className="text-right tabular-nums text-sm">{item.qtdParaCarona ?? 0}</TableCell>}
                      {arp.aceitaAdesao && <TableCell className="text-right tabular-nums text-sm">{item.qtdConsumidaCarona ?? 0}</TableCell>}
                      <TableCell className="text-right tabular-nums text-sm">{formatCurrency(item.valorUnitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contratos" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem do saldo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arp.contratos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.numeroInstrumento}</TableCell>
                      <TableCell>{c.tipo}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.origemSaldo}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.valor)}</TableCell>
                      <TableCell><Badge className="bg-[#0050FF] text-white">{c.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
