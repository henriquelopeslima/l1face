import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { CadastroSucesso } from '@/shared/components/feedback/CadastroSucesso';
import {
  Plus,
  Trash,
  WarningTriangle,
  InfoCircle,
  CloudUpload,
  Check,
  NavArrowLeft,
  NavArrowRight,
} from 'iconoir-react';

interface ItemArp {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeRegistrada: number;
  quantidadeCarona: number;
  valorUnitario: number;
  valorTotal: number;
  valorPotencialCarona: number;
}

interface DadosArp {
  modoEntrada: 'automatico' | 'manual';
  numeroPNCP?: string;
  cnpjContratante?: string;
  orgaoGerenciador?: string;
  objeto: string;
  numeroAta: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  aceitaAdesao: boolean;
  renovavel: boolean;
  anexoArp?: File;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CadastrarArp() {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);

  const [dadosArp, setDadosArp] = useState<DadosArp>({
    modoEntrada: 'automatico',
    numeroPNCP: 'ARP 012/2025',
    objeto: '',
    numeroAta: '',
    vigenciaInicial: '',
    vigenciaFinal: '',
    aceitaAdesao: false,
    renovavel: false,
  });

  const [buscandoPNCP, setBuscandoPNCP] = useState(false);
  const [cabecalhoPncpCarregado, setCabecalhoPncpCarregado] = useState(false);
  const [modoItens, setModoItens] = useState<'manual' | 'planilha'>('manual');
  const [itensArp, setItensArp] = useState<ItemArp[]>([]);
  const [arquivoPlanilhaItens, setArquivoPlanilhaItens] = useState<File | null>(null);
  const [processandoCadastro, setProcessandoCadastro] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [progressoCadastro, setProgressoCadastro] = useState(0);
  const [etapaProcessamento, setEtapaProcessamento] = useState('Preparando informações da ata...');

  useEffect(() => {
    setCabecalhoPncpCarregado(false);
  }, [dadosArp.numeroPNCP]);

  const buscarPNCP = async () => {
    if (!dadosArp.numeroPNCP) return;
    setBuscandoPNCP(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setDadosArp((prev) => ({
        ...prev,
        orgaoGerenciador: 'Prefeitura Municipal de Russas',
        objeto: 'Aquisição de Material de Escritório',
        numeroAta: prev.numeroPNCP ?? '',
        vigenciaInicial: '2025-01-15',
        vigenciaFinal: '2027-01-14',
        aceitaAdesao: true,
        renovavel: true,
      }));
      setCabecalhoPncpCarregado(true);
    } finally {
      setBuscandoPNCP(false);
    }
  };

  useEffect(() => {
    if (!dadosArp.numeroPNCP || cabecalhoPncpCarregado || buscandoPNCP) return;
    buscarPNCP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dadosArp.numeroPNCP, cabecalhoPncpCarregado]);

  const adicionarItem = () => {
    setItensArp((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        descricao: '',
        unidadeMedida: '',
        quantidadeRegistrada: 0,
        quantidadeCarona: 0,
        valorUnitario: 0,
        valorTotal: 0,
        valorPotencialCarona: 0,
      },
    ]);
  };

  const removerItem = (id: string) => setItensArp((prev) => prev.filter((i) => i.id !== id));

  const atualizarItem = (id: string, campo: keyof ItemArp, valor: number | string) => {
    setItensArp((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [campo]: valor };
        if (campo === 'quantidadeRegistrada' || campo === 'valorUnitario') {
          updated.valorTotal = Number(updated.quantidadeRegistrada) * Number(updated.valorUnitario);
        }
        if (campo === 'quantidadeCarona' || campo === 'valorUnitario') {
          updated.valorPotencialCarona = Number(updated.quantidadeCarona) * Number(updated.valorUnitario);
        }
        return updated;
      })
    );
  };

  const valorTotalRegistrado = itensArp.reduce((acc, i) => acc + i.valorTotal, 0);
  const valorPotencialCarona = dadosArp.aceitaAdesao ? itensArp.reduce((acc, i) => acc + i.valorPotencialCarona, 0) : 0;

  const validarEtapa1 = () =>
    dadosArp.modoEntrada === 'automatico'
      ? cabecalhoPncpCarregado && !!dadosArp.orgaoGerenciador && !!dadosArp.objeto && !!dadosArp.vigenciaInicial && !!dadosArp.vigenciaFinal
      : !!dadosArp.orgaoGerenciador && !!dadosArp.objeto && !!dadosArp.numeroAta && !!dadosArp.vigenciaInicial && !!dadosArp.vigenciaFinal;

  const validarEtapa2 = () => {
    if (modoItens === 'planilha') return arquivoPlanilhaItens !== null;
    return itensArp.length > 0 && itensArp.every((i) => i.descricao && i.unidadeMedida && i.quantidadeRegistrada > 0 && i.valorUnitario > 0);
  };

  const avancar = () => {
    if (etapaAtual === 1 && !validarEtapa1()) return;
    if (etapaAtual === 2 && !validarEtapa2()) return;
    if (etapaAtual < 3) setEtapaAtual((e) => e + 1);
  };

  const voltar = () => { if (etapaAtual > 1) setEtapaAtual((e) => e - 1); };

  const concluir = () => {
    setProcessandoCadastro(true);
    const msgs = [
      'Preparando informações da ata...',
      'Validando dados e itens da ARP...',
      'Registrando no sistema...',
      'Concluído!',
    ];
    let pct = 0;
    let msgIdx = 0;
    const timer = setInterval(() => {
      pct += 25 + Math.random() * 10;
      if (pct >= 100) {
        pct = 100;
        setProgressoCadastro(100);
        setEtapaProcessamento(msgs[3] ?? 'Concluído!');
        clearInterval(timer);
        setTimeout(() => setCadastroConcluido(true), 400);
        return;
      }
      setProgressoCadastro(Math.min(pct, 90));
      if (msgIdx < msgs.length - 2) {
        msgIdx++;
        setEtapaProcessamento(msgs[msgIdx] ?? '');
      }
    }, 600);
  };

  if (processandoCadastro || cadastroConcluido) {
    return (
      <CadastroSucesso
        processando={processandoCadastro && !cadastroConcluido}
        progresso={progressoCadastro}
        titulo="Cadastrando ARP..."
        descricao="Aguarde enquanto registramos a ata no sistema."
        tituloSucesso="Ata cadastrada com sucesso!"
        descricaoSucesso="A ARP foi registrada e está disponível na gestão de atas."
        etapaAtual={etapaProcessamento}
        onConcluir={() => navigate('/atas/gestao')}
      />
    );
  }

  const etapas = [
    { num: 1, label: 'Dados da ARP' },
    { num: 2, label: 'Itens registrados' },
    { num: 3, label: 'Revisão' },
  ];

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {etapas.map((etapa, idx) => (
          <div key={etapa.num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                etapaAtual > etapa.num
                  ? 'bg-[#0050FF] text-white'
                  : etapaAtual === etapa.num
                    ? 'bg-[#0050FF] text-white ring-4 ring-[#0050FF]/20'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {etapaAtual > etapa.num ? <Check className="h-4 w-4" /> : etapa.num}
            </div>
            <span className={`hidden sm:block text-sm ${etapaAtual === etapa.num ? 'font-medium' : 'text-muted-foreground'}`}>
              {etapa.label}
            </span>
            {idx < etapas.length - 1 && <NavArrowRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Etapa 1: Dados da ARP */}
      {etapaAtual === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modo de entrada</CardTitle>
              <CardDescription>Escolha como deseja informar os dados da ata.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={dadosArp.modoEntrada}
                onValueChange={(v) => setDadosArp((p) => ({ ...p, modoEntrada: v as 'automatico' | 'manual', cabecalhoPncpCarregado: false } as DadosArp))}
                className="gap-4"
              >
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="automatico" id="modo-auto" className="mt-0.5" />
                  <Label htmlFor="modo-auto" className="cursor-pointer space-y-1">
                    <p className="font-medium">Busca automática via PNCP</p>
                    <p className="text-sm text-muted-foreground">Informe o número da ARP no PNCP e preencheremos os dados automaticamente.</p>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="manual" id="modo-manual" className="mt-0.5" />
                  <Label htmlFor="modo-manual" className="cursor-pointer space-y-1">
                    <p className="font-medium">Preenchimento manual</p>
                    <p className="text-sm text-muted-foreground">Digite todos os dados diretamente no formulário.</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {dadosArp.modoEntrada === 'automatico' && (
            <Card>
              <CardHeader>
                <CardTitle>Número da ARP no PNCP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex.: ARP 012/2025"
                    value={dadosArp.numeroPNCP ?? ''}
                    onChange={(e) => setDadosArp((p) => ({ ...p, numeroPNCP: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={buscarPNCP} disabled={buscandoPNCP}>
                    {buscandoPNCP ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
                {cabecalhoPncpCarregado && (
                  <Alert className="border-[#0050FF]/30 bg-[#EDF4FF]/50 dark:bg-[#0050FF]/10">
                    <InfoCircle className="h-4 w-4 text-[#0050FF]" />
                    <AlertTitle className="text-[#0050FF]">Dados carregados do PNCP</AlertTitle>
                    <AlertDescription>
                      <p><strong>Órgão:</strong> {dadosArp.orgaoGerenciador}</p>
                      <p><strong>Objeto:</strong> {dadosArp.objeto}</p>
                      <p><strong>Vigência:</strong> {dadosArp.vigenciaInicial} até {dadosArp.vigenciaFinal}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {(dadosArp.modoEntrada === 'manual' || cabecalhoPncpCarregado) && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da ata</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="arp-orgao">Órgão gerenciador</Label>
                  <Input
                    id="arp-orgao"
                    value={dadosArp.orgaoGerenciador ?? ''}
                    onChange={(e) => setDadosArp((p) => ({ ...p, orgaoGerenciador: e.target.value }))}
                    placeholder="Órgão que gerencia a ata"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arp-numero">Número da ata</Label>
                  <Input
                    id="arp-numero"
                    value={dadosArp.numeroAta}
                    onChange={(e) => setDadosArp((p) => ({ ...p, numeroAta: e.target.value }))}
                    placeholder="Ex.: ARP 012/2025"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="arp-objeto">Objeto</Label>
                  <Textarea
                    id="arp-objeto"
                    rows={3}
                    value={dadosArp.objeto}
                    onChange={(e) => setDadosArp((p) => ({ ...p, objeto: e.target.value }))}
                    placeholder="Descreva o objeto da ata de registro de preços."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arp-vi">Vigência inicial</Label>
                  <Input id="arp-vi" type="date" value={dadosArp.vigenciaInicial} onChange={(e) => setDadosArp((p) => ({ ...p, vigenciaInicial: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arp-vf">Vigência final</Label>
                  <Input id="arp-vf" type="date" value={dadosArp.vigenciaFinal} onChange={(e) => setDadosArp((p) => ({ ...p, vigenciaFinal: e.target.value }))} required />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Aceita adesão (carona)</p>
                    <p className="text-xs text-muted-foreground">Permite que outros órgãos usem esta ata</p>
                  </div>
                  <Switch checked={dadosArp.aceitaAdesao} onCheckedChange={(v) => setDadosArp((p) => ({ ...p, aceitaAdesao: v }))} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Renovável</p>
                    <p className="text-xs text-muted-foreground">Pode ser renovada ao fim da vigência</p>
                  </div>
                  <Switch checked={dadosArp.renovavel} onCheckedChange={(v) => setDadosArp((p) => ({ ...p, renovavel: v }))} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Etapa 2: Itens */}
      {etapaAtual === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modo de inclusão de itens</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={modoItens} onValueChange={(v) => setModoItens(v as 'manual' | 'planilha')} className="gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="manual" id="modo-manual-itens" className="mt-0.5" />
                  <Label htmlFor="modo-manual-itens" className="cursor-pointer">
                    <p className="font-medium">Adicionar itens manualmente</p>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <RadioGroupItem value="planilha" id="modo-planilha-itens" className="mt-0.5" />
                  <Label htmlFor="modo-planilha-itens" className="cursor-pointer">
                    <p className="font-medium">Importar via planilha</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {modoItens === 'planilha' && (
            <Card>
              <CardHeader>
                <CardTitle>Upload da planilha</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:bg-accent/50">
                  <CloudUpload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {arquivoPlanilhaItens ? arquivoPlanilhaItens.name : 'Clique para selecionar a planilha (.xlsx, .csv)'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    className="sr-only"
                    onChange={(e) => setArquivoPlanilhaItens(e.target.files?.[0] ?? null)}
                  />
                </label>
              </CardContent>
            </Card>
          )}

          {modoItens === 'manual' && (
            <Card>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Itens da ARP</CardTitle>
                  <CardDescription>Adicione os itens com quantidades e valores registrados.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" onClick={adicionarItem}>
                  <Plus className="h-4 w-4" />
                  Adicionar item
                </Button>
              </CardHeader>
              <CardContent>
                {itensArp.length === 0 ? (
                  <Alert>
                    <WarningTriangle className="h-4 w-4" />
                    <AlertDescription>Nenhum item adicionado. Clique em "Adicionar item" para incluir.</AlertDescription>
                  </Alert>
                ) : (
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[90px]">Unidade</TableHead>
                        <TableHead className="w-[90px]">Qtd. Reg.</TableHead>
                        {dadosArp.aceitaAdesao && <TableHead className="w-[90px]">Qtd. Carona</TableHead>}
                        <TableHead className="w-[110px]">Valor unit. (R$)</TableHead>
                        <TableHead className="w-[110px]">Total (R$)</TableHead>
                        <TableHead className="w-[48px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensArp.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input value={item.descricao} onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)} placeholder="Descrição" />
                          </TableCell>
                          <TableCell>
                            <Input value={item.unidadeMedida} onChange={(e) => atualizarItem(item.id, 'unidadeMedida', e.target.value)} placeholder="UN" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" min="0" value={item.quantidadeRegistrada} onChange={(e) => atualizarItem(item.id, 'quantidadeRegistrada', Number(e.target.value))} placeholder="0" />
                          </TableCell>
                          {dadosArp.aceitaAdesao && (
                            <TableCell>
                              <Input type="number" min="0" value={item.quantidadeCarona} onChange={(e) => atualizarItem(item.id, 'quantidadeCarona', Number(e.target.value))} placeholder="0" />
                            </TableCell>
                          )}
                          <TableCell>
                            <Input type="number" min="0" step="0.01" value={item.valorUnitario} onChange={(e) => atualizarItem(item.id, 'valorUnitario', Number(e.target.value))} placeholder="0,00" />
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{formatCurrency(item.valorTotal)}</TableCell>
                          <TableCell>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removerItem(item.id)} aria-label="Remover item">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                )}

                {itensArp.length > 0 && (
                  <div className="mt-4 flex flex-col gap-1 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor total registrado</span>
                      <span className="font-semibold">{formatCurrency(valorTotalRegistrado)}</span>
                    </div>
                    {dadosArp.aceitaAdesao && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Potencial de carona</span>
                        <span className="font-semibold text-[#0050FF]">{formatCurrency(valorPotencialCarona)}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Etapa 3: Revisão */}
      {etapaAtual === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revisão da ARP</CardTitle>
              <CardDescription>Confira as informações antes de concluir o cadastro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Órgão gerenciador</p>
                  <p className="font-medium">{dadosArp.orgaoGerenciador || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Número da ata</p>
                  <p className="font-medium">{dadosArp.numeroAta || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Objeto</p>
                  <p className="font-medium">{dadosArp.objeto || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vigência</p>
                  <p className="font-medium">{dadosArp.vigenciaInicial} → {dadosArp.vigenciaFinal}</p>
                </div>
                <div className="flex gap-3">
                  {dadosArp.aceitaAdesao && <Badge className="bg-[#06D6A0] text-white">Aceita adesão</Badge>}
                  {dadosArp.renovavel && <Badge variant="outline">Renovável</Badge>}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">{itensArp.length} itens cadastrados · Total: {formatCurrency(valorTotalRegistrado)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-3">
        <Button type="button" variant="outline" onClick={voltar} disabled={etapaAtual === 1}>
          <NavArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        {etapaAtual < 3 ? (
          <Button type="button" onClick={avancar}>
            Próximo
            <NavArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={concluir}>
            Concluir cadastro
          </Button>
        )}
      </div>
    </div>
  );
}
