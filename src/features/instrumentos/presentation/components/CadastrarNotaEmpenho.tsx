import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
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
import { InfoCircle, Plus, Trash, CloudUpload, Wallet, WarningTriangle } from 'iconoir-react';
import { useCriarEmpenho } from '../hooks/useCriarEmpenho';
import { useListarAtas } from '@/features/atas/presentation/hooks/useListarAtas';
import type { CriarEmpenhoInput, ItemInstrumentoInput } from '../../domain/entities/criarContrato';

interface ItemLinha {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidade: string;
  valorUnitario: string;
}

function parseBRL(s: string): number {
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatBRLInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const n = Number(digits) / 100;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CadastrarNotaEmpenho() {
  const navigate = useNavigate();
  const { criar: criarEmpenho, isLoading: isSalvando, error: erroSalvar } = useCriarEmpenho();
  const { atas } = useListarAtas();

  const [numeroPncp, setNumeroPncp] = useState('');
  const [codigoEmpenho, setCodigoEmpenho] = useState('');
  const [ataId, setAtaId] = useState('');
  const [isAdesao, setIsAdesao] = useState<boolean | undefined>();
  const [orgao, setOrgao] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [objeto, setObjeto] = useState('');
  const [itens, setItens] = useState<ItemLinha[]>([]);
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

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!orgao.trim() || !secretaria.trim() || !objeto.trim()) {
      setErro('Preencha órgão, unidade e objeto.');
      return;
    }

    const itensInput: ItemInstrumentoInput[] = itens
      .filter((i) => i.descricao && i.unidadeMedida)
      .map((i) => {
        const qtd = parseBRL(i.quantidade);
        const val = parseBRL(i.valorUnitario);
        return {
          descricao: i.descricao,
          unidadeMedida: i.unidadeMedida,
          quantidadeTotal: qtd,
          valorUnitario: val,
          valorTotal: qtd * val,
        };
      });

    const input: CriarEmpenhoInput = {
      orgaoContratante: orgao.trim(),
      unidade: secretaria.trim(),
      objeto: objeto.trim(),
      ...(numeroPncp.trim() ? { numeroPncp: numeroPncp.trim() } : {}),
      ...(ataId ? { ataId } : {}),
      ...(isAdesao !== undefined && ataId ? { isAdesao } : {}),
      ...(itensInput.length > 0 ? { itens: itensInput } : {}),
    };

    const instrumentoId = await criarEmpenho(input);
    if (instrumentoId) {
      navigate('/instrumentos/gestao');
    }
  };

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Alert className="border-[#0050FF]/30 bg-[#EDF4FF]/50 py-2.5 dark:bg-[#0050FF]/10 [&>svg]:size-3.5">
        <InfoCircle className="h-3.5 w-3.5 text-[#0050FF]" />
        <AlertTitle className="text-xs font-semibold leading-tight text-[#0050FF]">
          Sobre as notas de empenho
        </AlertTitle>
        <AlertDescription className="!block w-full min-w-0 text-pretty text-xs leading-normal text-muted-foreground">
          Informe órgão, unidade e objeto. Os itens são opcionais no cadastro inicial.
        </AlertDescription>
      </Alert>

      {(erro ?? erroSalvar) && (
        <Alert variant="destructive">
          <WarningTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>{erro ?? erroSalvar}</AlertDescription>
        </Alert>
      )}

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
            <Label htmlFor="ne-numero-pncp">Código PNCP (opcional)</Label>
            <Input
              id="ne-numero-pncp"
              placeholder="Ex.: 12345678000195-2-000001/2026"
              value={numeroPncp}
              onChange={(e) => setNumeroPncp(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="ne-codigo-empenho">Código do Empenho (opcional)</Label>
            <Input
              id="ne-codigo-empenho"
              placeholder="Ex.: 2024.000001"
              value={codigoEmpenho}
              onChange={(e) => setCodigoEmpenho(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="ne-secretaria">Unidade / secretaria <span className="text-destructive">*</span></Label>
            <Input
              id="ne-secretaria"
              placeholder="Ex.: Secretaria Municipal de Saúde"
              value={secretaria}
              onChange={(e) => setSecretaria(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="ne-orgao">Órgão / entidade <span className="text-destructive">*</span></Label>
            <Input
              id="ne-orgao"
              placeholder="Órgão contratante"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              required
            />
          </div> 
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ne-objeto">Objeto do empenho <span className="text-destructive">*</span></Label>
            <Textarea
              id="ne-objeto"
              rows={4}
              placeholder="Descreva o objeto contratual (o que será entregue / executado)."
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ne-ata">ARP de Origem (opcional)</Label>
            <Select value={ataId || 'none'} onValueChange={(v) => {
              const newAtaId = v === 'none' ? '' : v;
              setAtaId(newAtaId);
              if (!newAtaId) {
                setIsAdesao(undefined);
              }
            }}>
              <SelectTrigger id="ne-ata"><SelectValue placeholder="Selecione uma ARP (opcional)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma ARP</SelectItem>
                {atas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.numero} — {a.orgaoGerenciador.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ataId && atas.find(a => a.id === ataId) && (
              <div className="flex gap-4 border rounded-lg p-4">
                {/* Coluna esquerda - Informações da ARP */}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Informações da ARP</p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>{atas.find(a => a.id === ataId)?.numero}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {atas.find(a => a.id === ataId)?.orgaoGerenciador.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(atas.find(a => a.id === ataId)?.saldo ?? 0)}
                    </p>
                    {atas.find(a => a.id === ataId)?.aceitaAdesao && (
                      <p className="text-sm text-muted-foreground">
                        Saldo Carona: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(atas.find(a => a.id === ataId)?.saldoCarona ?? 0)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Separador vertical */}
                <div className="border-l border-border"></div>
                
                {/* Coluna direita - Pergunta de adesão */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <InfoCircle className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-muted-foreground">É uma adesão?</p>
                  </div>
                  <RadioGroup value={isAdesao === undefined ? '' : isAdesao ? 'sim' : 'nao'} onValueChange={(v) => setIsAdesao(v === 'sim')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="adesao-ne-sim" />
                      <Label htmlFor="adesao-ne-sim" className="cursor-pointer font-normal text-sm">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="adesao-ne-nao" />
                      <Label htmlFor="adesao-ne-nao" className="cursor-pointer font-normal text-sm">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>
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
          {anexo && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nota: o upload de arquivo ainda não está disponível. O anexo não será enviado.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" asChild>
          <Link to="/instrumentos/cadastrar">Voltar</Link>
        </Button>
        <Button type="submit" disabled={isSalvando}>
          {isSalvando ? 'Cadastrando...' : 'Cadastrar nota de empenho'}
        </Button>
      </div>
    </form>
  );
}
