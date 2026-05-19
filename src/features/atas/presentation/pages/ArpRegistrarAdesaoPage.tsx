import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { InfoCircle, NavArrowLeft } from 'iconoir-react';

const MOCK_ARP = {
  id: '1',
  numeroAta: 'ARP 012/2025',
  orgaoGerenciador: 'Prefeitura de Fortaleza',
  itens: [
    { id: '1', descricao: 'Notebook i7 16GB RAM', unidadeMedida: 'un', valorUnitario: 6000, saldoCarona: 50 },
    { id: '2', descricao: 'Monitor 27" 4K', unidadeMedida: 'un', valorUnitario: 3500, saldoCarona: 0 },
  ],
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ArpRegistrarAdesaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const arp = MOCK_ARP;

  const [orgao, setOrgao] = useState('');
  const [processo, setProcesso] = useState('');
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const total = arp.itens.reduce((acc, item) => {
    return acc + (quantidades[item.id] ?? 0) * item.valorUnitario;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Atas', href: '/atas/gestao' }, { label: arp.numeroAta, href: `/atas/${id}` }, { label: 'Registrar adesão' }]} />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <NavArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-xl font-semibold lg:text-3xl">Registrar adesão (carona)</h1>
          <p className="text-muted-foreground text-sm">{arp.numeroAta} · {arp.orgaoGerenciador}</p>
        </div>
      </div>

      <Alert className="border-[#0050FF]/30 bg-[#EDF4FF]/50 dark:bg-[#0050FF]/10">
        <InfoCircle className="h-4 w-4 text-[#0050FF]" />
        <AlertDescription className="text-sm">
          A adesão à ata (carona) está sujeita aos limites legais e à aprovação do órgão gerenciador. Verifique os saldos disponíveis antes de prosseguir.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle>Dados da adesão</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="orgao">Órgão aderente</Label>
            <Input id="orgao" placeholder="Órgão que solicita adesão" value={orgao} onChange={(e) => setOrgao(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processo">Número do processo</Label>
            <Input id="processo" placeholder="Ex.: 2025/12345" value={processo} onChange={(e) => setProcesso(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens da adesão</CardTitle>
          <CardDescription>Informe a quantidade de cada item que deseja aderir.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-[80px]">Saldo carona</TableHead>
                <TableHead className="w-[90px]">Quantidade</TableHead>
                <TableHead className="w-[100px] text-right">Valor unit.</TableHead>
                <TableHead className="w-[100px] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arp.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={item.saldoCarona > 0 ? 'outline' : 'default'} className={item.saldoCarona === 0 ? 'bg-muted text-muted-foreground' : ''}>{item.saldoCarona} {item.unidadeMedida}</Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={item.saldoCarona}
                      disabled={item.saldoCarona === 0}
                      value={quantidades[item.id] ?? 0}
                      onChange={(e) => setQuantidades((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{formatCurrency(item.valorUnitario)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium text-sm">{formatCurrency((quantidades[item.id] ?? 0) * item.valorUnitario)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end pt-4 border-t mt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total da adesão</p>
              <p className="text-lg font-semibold">{formatCurrency(total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={() => navigate(`/atas/${id}`)}>Registrar adesão</Button>
      </div>
    </div>
  );
}
