import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
    { id: '1', descricao: 'Notebook i7 16GB RAM', unidadeMedida: 'un', valorUnitario: 6000, saldoOrgao: 25, saldoCarona: 50 },
    { id: '2', descricao: 'Monitor 27" 4K', unidadeMedida: 'un', valorUnitario: 3500, saldoOrgao: 3, saldoCarona: 0 },
  ],
};

interface ItemSelecionado {
  itemId: string;
  quantidade: number;
  usarCarona: boolean;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ArpGerarContratoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const arp = MOCK_ARP;

  const [orgaoAderente, setOrgaoAderente] = useState('');
  const [tipoInstrumento, setTipoInstrumento] = useState('contrato');
  const [itens, setItens] = useState<ItemSelecionado[]>(arp.itens.map((i) => ({ itemId: i.id, quantidade: 0, usarCarona: false })));

  const updateItem = (itemId: string, patch: Partial<ItemSelecionado>) => {
    setItens((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, ...patch } : i)));
  };

  const calcTotal = () => {
    return itens.reduce((acc, sel) => {
      const item = arp.itens.find((i) => i.id === sel.itemId);
      return acc + sel.quantidade * (item?.valorUnitario ?? 0);
    }, 0);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Atas', href: '/atas/gestao' }, { label: arp.numeroAta, href: `/atas/${id}` }, { label: 'Gerar contrato' }]} />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <NavArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-xl font-semibold lg:text-3xl">Gerar instrumento da ARP</h1>
          <p className="text-muted-foreground text-sm">{arp.numeroAta} · {arp.orgaoGerenciador}</p>
        </div>
      </div>

      <Alert className="border-[#0050FF]/30 bg-[#EDF4FF]/50 dark:bg-[#0050FF]/10">
        <InfoCircle className="h-4 w-4 text-[#0050FF]" />
        <AlertDescription className="text-sm">
          Os saldos exibidos são referentes ao quantitativo restante disponível nesta ata. O instrumento gerado irá reservar a quantidade selecionada.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Dados do instrumento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="orgao">Órgão aderente</Label>
            <Input id="orgao" placeholder="Órgão que irá contratar" value={orgaoAderente} onChange={(e) => setOrgaoAderente(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de instrumento</Label>
            <Select value={tipoInstrumento} onValueChange={setTipoInstrumento}>
              <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="nota-empenho">Nota de empenho</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seleção de itens</CardTitle>
          <CardDescription>Informe a quantidade de cada item a ser contratada.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-[80px]">Saldo</TableHead>
                <TableHead className="w-[90px]">Quantidade</TableHead>
                <TableHead className="w-[100px] text-right">Valor unit.</TableHead>
                <TableHead className="w-[100px] text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arp.itens.map((item) => {
                const sel = itens.find((i) => i.itemId === item.id);
                if (!sel) return null;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.saldoOrgao} {item.unidadeMedida}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.saldoOrgao}
                        value={sel.quantidade}
                        onChange={(e) => updateItem(item.id, { quantidade: Number(e.target.value) })}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{formatCurrency(item.valorUnitario)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-sm">{formatCurrency(sel.quantidade * item.valorUnitario)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end pt-4 border-t mt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total do instrumento</p>
              <p className="text-lg font-semibold">{formatCurrency(calcTotal())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        <Button onClick={() => navigate('/instrumentos/gestao')}>Gerar instrumento</Button>
      </div>
    </div>
  );
}
