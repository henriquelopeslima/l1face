import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { InfoCircle, Plus, Trash, CloudUpload, Wallet } from 'iconoir-react';

interface ItemLinha {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidade: string;
  valorUnitario: string;
}

interface OFLinha {
  id: string;
  numero: string;
  prazoEntrega: string;
  observacao: string;
}

function formatBRLInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits) / 100;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(s: string): number {
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function CadastrarNotaEmpenho() {
  const navigate = useNavigate();
  const [numeroNE, setNumeroNE] = useState('');
  const [orgao, setOrgao] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [objeto, setObjeto] = useState('');
  const [valorEmpenhadoStr, setValorEmpenhadoStr] = useState('');
  const [saldoInicialStr, setSaldoInicialStr] = useState('');
  const [prazoEntregaObjeto, setPrazoEntregaObjeto] = useState('');
  const [admiteReforco, setAdmiteReforco] = useState(true);
  const [admiteAcrescimo, setAdmiteAcrescimo] = useState(true);
  const [admiteSupressao, setAdmiteSupressao] = useState(true);
  const [admiteAnulacao, setAdmiteAnulacao] = useState(true);
  const [itens, setItens] = useState<ItemLinha[]>([]);
  const [ofs, setOfs] = useState<OFLinha[]>([]);
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const addItem = () => {
    setItens((prev) => [
      ...prev,
      { id: crypto.randomUUID(), descricao: '', unidadeMedida: '', quantidade: '', valorUnitario: '' },
    ]);
  };

  const removeItem = (id: string) => setItens((prev) => prev.filter((r) => r.id !== id));

  const updateItem = (id: string, patch: Partial<ItemLinha>) => {
    setItens((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addOF = () => {
    setOfs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), numero: '', prazoEntrega: '', observacao: '' },
    ]);
  };

  const removeOF = (id: string) => setOfs((prev) => prev.filter((r) => r.id !== id));

  const updateOF = (id: string, patch: Partial<OFLinha>) => {
    setOfs((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const valor = parseBRL(valorEmpenhadoStr);
    const saldo = saldoInicialStr ? parseBRL(saldoInicialStr) : valor;
    if (!numeroNE.trim() || !orgao.trim() || !objeto.trim()) {
      setErro('Preencha número da NE, órgão e objeto.');
      return;
    }
    if (!prazoEntregaObjeto) {
      setErro('Informe o prazo final para entrega do objeto.');
      return;
    }
    if (valor <= 0) {
      setErro('Informe o valor empenhado (valor maior que zero).');
      return;
    }
    if (saldo < 0 || saldo > valor) {
      setErro('O saldo inicial não pode ser negativo nem maior que o valor empenhado.');
      return;
    }
    navigate('/instrumentos/gestao?tipo=empenho');
  };

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Alert className="border-[#0050FF]/30 bg-[#EDF4FF]/50 py-2.5 dark:bg-[#0050FF]/10 [&>svg]:size-3.5">
        <InfoCircle className="h-3.5 w-3.5 text-[#0050FF]" />
        <AlertTitle className="text-xs font-semibold leading-tight text-[#0050FF]">
          Sobre as notas de empenho
        </AlertTitle>
        <AlertDescription className="!block w-full min-w-0 text-pretty text-xs leading-normal text-muted-foreground">
          Use o <span className="font-semibold text-foreground/85">prazo de entrega</span> e das OFs — não vigência por término. Não é renovável; alterações: reforço, acréscimo, supressão ou anulação.
        </AlertDescription>
      </Alert>

      {erro ? (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-[#0050FF]" />
            Identificação e objeto
          </CardTitle>
          <CardDescription>Dados cadastrais do instrumento e descrição do objeto empenhado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="ne-numero">Número da nota de empenho</Label>
            <Input
              id="ne-numero"
              placeholder="Ex.: NE 88442/2025"
              value={numeroNE}
              onChange={(e) => setNumeroNE(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="ne-orgao">Órgão / entidade</Label>
            <Input
              id="ne-orgao"
              placeholder="Órgão contratante"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ne-secretaria">Unidade / secretaria</Label>
            <Input
              id="ne-secretaria"
              placeholder="Ex.: Secretaria Municipal de Saúde"
              value={secretaria}
              onChange={(e) => setSecretaria(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ne-objeto">Objeto do empenho</Label>
            <Textarea
              id="ne-objeto"
              rows={4}
              placeholder="Descreva o objeto contratual (o que será entregue / executado)."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores e prazo de entrega</CardTitle>
          <CardDescription>
            O valor empenhado e o saldo; o prazo é a referência principal para alertas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ne-valor">Valor empenhado (R$)</Label>
            <Input
              id="ne-valor"
              inputMode="decimal"
              placeholder="0,00"
              value={valorEmpenhadoStr}
              onChange={(e) => setValorEmpenhadoStr(formatBRLInput(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ne-saldo">Saldo inicial (R$)</Label>
            <Input
              id="ne-saldo"
              inputMode="decimal"
              placeholder="Igual ao empenhado se vazio"
              value={saldoInicialStr}
              onChange={(e) => setSaldoInicialStr(formatBRLInput(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Deixe em branco para assumir o mesmo valor do empenho.</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ne-prazo">Prazo final para entrega do objeto</Label>
            <Input
              id="ne-prazo"
              type="date"
              value={prazoEntregaObjeto}
              onChange={(e) => setPrazoEntregaObjeto(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações admitidas</CardTitle>
          <CardDescription>
            Indique quais tipos de alteração este instrumento poderá receber após o cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {[
            { key: 'reforco', label: 'Reforço de empenho', desc: 'Ampliação do valor original', checked: admiteReforco, setter: setAdmiteReforco },
            { key: 'acrescimo', label: 'Acréscimo', desc: 'Aumento de quantidade / escopo contratado', checked: admiteAcrescimo, setter: setAdmiteAcrescimo },
            { key: 'supressao', label: 'Supressão', desc: 'Redução de valor ou quantidade', checked: admiteSupressao, setter: setAdmiteSupressao },
            { key: 'anulacao', label: 'Anulação', desc: 'Cancelamento do empenho', checked: admiteAnulacao, setter: setAdmiteAnulacao },
          ].map(({ key, label, desc, checked, setter }) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={checked} onCheckedChange={setter} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Itens empenhados</CardTitle>
            <CardDescription>Detalhamento do objeto por linha (opcional no cadastro inicial).</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {itens.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item. Use "Adicionar item" para incluir linhas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px]">Unidade</TableHead>
                  <TableHead className="w-[90px]">Qtd.</TableHead>
                  <TableHead className="w-[120px]">Valor unit. (R$)</TableHead>
                  <TableHead className="w-[48px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input value={row.descricao} onChange={(e) => updateItem(row.id, { descricao: e.target.value })} placeholder="Descrição" />
                    </TableCell>
                    <TableCell>
                      <Input value={row.unidadeMedida} onChange={(e) => updateItem(row.id, { unidadeMedida: e.target.value })} placeholder="UN" />
                    </TableCell>
                    <TableCell>
                      <Input value={row.quantidade} onChange={(e) => updateItem(row.id, { quantidade: e.target.value })} placeholder="0" />
                    </TableCell>
                    <TableCell>
                      <Input value={row.valorUnitario} onChange={(e) => updateItem(row.id, { valorUnitario: formatBRLInput(e.target.value) })} placeholder="0,00" />
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(row.id)} aria-label="Remover item">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ordens de fornecimento (OF)</CardTitle>
            <CardDescription>OFs vinculadas; o prazo de cada OF alimenta o acompanhamento de entrega.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" onClick={addOF}>
            <Plus className="h-4 w-4" />
            Adicionar OF
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {ofs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma OF. Inclua ao menos uma quando houver pedido em aberto.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº OF</TableHead>
                  <TableHead className="w-[140px]">Prazo entrega</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="w-[48px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {ofs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input value={row.numero} onChange={(e) => updateOF(row.id, { numero: e.target.value })} placeholder="OF 12/2025" />
                    </TableCell>
                    <TableCell>
                      <Input type="date" value={row.prazoEntrega} onChange={(e) => updateOF(row.id, { prazoEntrega: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.observacao} onChange={(e) => updateOF(row.id, { observacao: e.target.value })} placeholder="Opcional" />
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeOF(row.id)} aria-label="Remover OF">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexo</CardTitle>
          <CardDescription>Documento PDF da nota de empenho ou documento habilitador.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:bg-accent/50">
            <CloudUpload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {anexo ? anexo.name : 'Clique para selecionar ou arraste um arquivo PDF'}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => setAnexo(e.target.files?.[0] ?? null)}
            />
          </label>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" asChild>
          <Link to="/instrumentos/cadastrar">Voltar</Link>
        </Button>
        <Button type="submit">Cadastrar nota de empenho</Button>
      </div>
    </form>
  );
}
