import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
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
import { CadastroSucesso } from '@/shared/components/feedback/CadastroSucesso';
import {
  Plus,
  Trash,
  WarningTriangle,
  InfoCircle,
  CloudUpload,
  Download,
  Check,
  NavArrowLeft,
  NavArrowRight,
  Page,
} from 'iconoir-react';
import { useCriarAta } from '../hooks/useCriarAta';
import { useConsultarAtaPncp } from '../hooks/useConsultarAtaPncp';
import type { CriarAtaInput, ItemAtaInput } from '../../domain/entities/criarAta';

interface ItemArp {
  id: string;
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  qtdRegistrada: number;
  qtdParaCarona: number;
  valorEstimado: number;
  valorTotal: number;
  valorPotencialCarona: number;
}

interface DadosArp {
  modoEntrada: 'automatico' | 'manual';
  codigoPncp: string;
  cnpjOrgaoGerenciador: string;
  nomeOrgaoGerenciador: string;
  numero: string;
  descricao: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  aceitaAdesao: boolean;
  renovavel: boolean;
  numeroPncp: string | null;
  anexoUrl: string;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const progressWidths = ['33%', '66%', '100%'];
const stepLabels = ['Dados da ARP', 'Itens Registrados', 'Revisão e Confirmação'];
const stepDescriptions = [
  'Preencha as informações básicas da Ata de Registro',
  'Adicione os itens que fazem parte da ARP',
  'Revise todas as informações antes de finalizar',
];

export function CadastrarArp() {
  const navigate = useNavigate();
  const { criarAta, isLoading: isSaving, error: saveError } = useCriarAta();
  const { consultar: consultarPncp, isLoading: isBuscandoPNCP, error: pncpError, dados: dadosPncp } = useConsultarAtaPncp();

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  const [dadosArp, setDadosArp] = useState<DadosArp>({
    modoEntrada: 'automatico',
    codigoPncp: '',
    cnpjOrgaoGerenciador: '',
    nomeOrgaoGerenciador: '',
    numero: '',
    descricao: '',
    dataInicioVigencia: '',
    dataFimVigencia: '',
    aceitaAdesao: false,
    renovavel: false,
    numeroPncp: null,
    anexoUrl: '',
  });

  const [modoItens, setModoItens] = useState<'manual' | 'planilha'>('manual');
  const [itensArp, setItensArp] = useState<ItemArp[]>([]);
  const [arquivoPlanilha, setArquivoPlanilha] = useState<File | null>(null);
  const [processandoPlanilha, setProcessandoPlanilha] = useState(false);

  useEffect(() => {
    if (!dadosPncp) return;
    setDadosArp((prev) => ({
      ...prev,
      nomeOrgaoGerenciador: dadosPncp.orgaoNome,
      cnpjOrgaoGerenciador: dadosPncp.orgaoCnpj,
      numero: dadosPncp.titulo,
      descricao: dadosPncp.descricao,
      dataInicioVigencia: dadosPncp.dataInicioVigencia,
      dataFimVigencia: dadosPncp.dataFimVigencia,
      numeroPncp: dadosPncp.numeroControlePncp,
    }));
  }, [dadosPncp]);

  useEffect(() => {
    if (!dadosArp.aceitaAdesao) {
      setItensArp((prev) => prev.map((item) => ({ ...item, qtdParaCarona: 0, valorPotencialCarona: 0 })));
    }
  }, [dadosArp.aceitaAdesao]);

  const buscarPNCP = useCallback(() => {
    if (!dadosArp.codigoPncp.trim()) return;
    void consultarPncp(dadosArp.codigoPncp.trim());
  }, [dadosArp.codigoPncp, consultarPncp]);

  const adicionarItem = () => {
    const proximoNumero = itensArp.length > 0 ? Math.max(...itensArp.map((i) => i.numeroItem)) + 1 : 1;
    setItensArp((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        numeroItem: proximoNumero,
        descricao: '',
        unidadeMedida: '',
        qtdRegistrada: 0,
        qtdParaCarona: 0,
        valorEstimado: 0,
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
        if (campo === 'qtdRegistrada' || campo === 'valorEstimado') {
          updated.valorTotal = Number(updated.qtdRegistrada) * Number(updated.valorEstimado);
        }
        if ((campo === 'qtdParaCarona' || campo === 'valorEstimado') && dadosArp.aceitaAdesao) {
          updated.valorPotencialCarona = Number(updated.qtdParaCarona) * Number(updated.valorEstimado);
        }
        return updated;
      })
    );
  };

  const valorTotalRegistrado = itensArp.reduce((acc, i) => acc + i.valorTotal, 0);
  const valorPotencialCarona = dadosArp.aceitaAdesao ? itensArp.reduce((acc, i) => acc + i.valorPotencialCarona, 0) : 0;

  const numeroItemDuplicado = (): boolean => {
    const nums = itensArp.map((i) => i.numeroItem);
    return new Set(nums).size !== nums.length;
  };

  const validarEtapa1 = () =>
    !!dadosArp.nomeOrgaoGerenciador &&
    !!dadosArp.cnpjOrgaoGerenciador &&
    !!dadosArp.numero &&
    !!dadosArp.descricao &&
    !!dadosArp.dataInicioVigencia &&
    !!dadosArp.dataFimVigencia &&
    dadosArp.dataFimVigencia > dadosArp.dataInicioVigencia;

  const validarEtapa2 = () => {
    if (modoItens === 'planilha') return arquivoPlanilha !== null;
    return (
      itensArp.length > 0 &&
      !numeroItemDuplicado() &&
      itensArp.every((i) => i.descricao && i.unidadeMedida && i.qtdRegistrada > 0 && i.valorEstimado > 0)
    );
  };

  const avancar = () => {
    if (etapaAtual === 1 && !validarEtapa1()) return;
    if (etapaAtual === 2 && !validarEtapa2()) return;

    if (etapaAtual === 2 && modoItens === 'planilha' && arquivoPlanilha) {
      setProcessandoPlanilha(true);
      setTimeout(() => {
        setItensArp([
          {
            id: `item-${Date.now()}-1`,
            numeroItem: 1,
            descricao: 'Item importado via planilha',
            unidadeMedida: 'UN',
            qtdRegistrada: 100,
            qtdParaCarona: dadosArp.aceitaAdesao ? 200 : 0,
            valorEstimado: 45,
            valorTotal: 4500,
            valorPotencialCarona: dadosArp.aceitaAdesao ? 9000 : 0,
          },
          {
            id: `item-${Date.now()}-2`,
            numeroItem: 2,
            descricao: 'Segundo item importado',
            unidadeMedida: 'CX',
            qtdRegistrada: 40,
            qtdParaCarona: dadosArp.aceitaAdesao ? 80 : 0,
            valorEstimado: 120,
            valorTotal: 4800,
            valorPotencialCarona: dadosArp.aceitaAdesao ? 9600 : 0,
          },
        ]);
        setProcessandoPlanilha(false);
        setEtapaAtual(3);
      }, 1200);
      return;
    }

    if (etapaAtual < 3) setEtapaAtual((e) => e + 1);
  };

  const voltar = () => {
    if (etapaAtual > 1) setEtapaAtual((e) => e - 1);
  };

  const finalizarCadastro = async () => {
    const cnpjLimpo = dadosArp.cnpjOrgaoGerenciador.replace(/\D/g, '');

    const itensInput: ItemAtaInput[] = itensArp.map((item) => ({
      numeroItem: item.numeroItem,
      descricao: item.descricao,
      unidadeMedida: item.unidadeMedida,
      valorEstimado: item.valorEstimado,
      qtdRegistrada: item.qtdRegistrada,
      qtdParaCarona: dadosArp.aceitaAdesao ? item.qtdParaCarona : 0,
    }));

    const input: CriarAtaInput = {
      numero: dadosArp.numero,
      descricao: dadosArp.descricao,
      cnpjOrgaoGerenciador: cnpjLimpo,
      nomeOrgaoGerenciador: dadosArp.nomeOrgaoGerenciador,
      dataInicioVigencia: dadosArp.dataInicioVigencia,
      dataFimVigencia: dadosArp.dataFimVigencia,
      aceitaAdesao: dadosArp.aceitaAdesao,
      renovavel: dadosArp.renovavel,
      numeroPncp: dadosArp.numeroPncp,
      anexoUrl: dadosArp.anexoUrl || null,
      itens: itensInput,
    };

    const result = await criarAta(input);
    if (result) {
      setCadastroConcluido(true);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'template-itens-arp.xlsx';
    link.click();
  };

  if (isSaving || cadastroConcluido) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <CadastroSucesso
          processando={isSaving && !cadastroConcluido}
          progresso={isSaving ? 50 : 100}
          titulo="Processando cadastro de ata"
          descricao="Estamos validando os dados e finalizando o cadastro da ARP com segurança."
          tituloSucesso="Ata cadastrada com sucesso"
          descricaoSucesso="A ARP foi registrada e está pronta para gestão de saldo, consumo e adesões."
          etapaAtual={isSaving ? 'Enviando dados da ata...' : 'Concluído'}
          onConcluir={() => navigate('/atas/gestao')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ETAPA 1 - DADOS DA ARP */}
      {etapaAtual === 1 && (
        <Card>
          <div className="p-4 lg:p-6 pb-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg lg:text-2xl font-medium">{stepLabels[0]}</h2>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground text-sm lg:text-base">{stepDescriptions[0]}</p>
                <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 1/3</span>
              </div>
            </div>
            <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: progressWidths[0] }} />
            </div>
          </div>

          <CardContent className="space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="modoManual" className="cursor-pointer">Preencher manualmente</Label>
                <p className="text-muted-foreground text-xs lg:text-sm">Por padrão, os campos pré-preenchidos via PNCP ficam somente leitura.</p>
              </div>
              <Switch
                id="modoManual"
                checked={dadosArp.modoEntrada === 'manual'}
                onCheckedChange={(checked) => setDadosArp((p) => ({ ...p, modoEntrada: checked ? 'manual' : 'automatico' }))}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigoPncp">Código da Ata no PNCP</Label>
                <div className="flex gap-2">
                  <Input
                    id="codigoPncp"
                    placeholder="Ex: 19876424000142-1-000189/2025-000016"
                    value={dadosArp.codigoPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, codigoPncp: e.target.value }))}
                  />
                  <Button onClick={buscarPNCP} disabled={isBuscandoPNCP || !dadosArp.codigoPncp.trim()}>
                    {isBuscandoPNCP ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
                {pncpError && (
                  <Alert variant="destructive">
                    <WarningTriangle className="h-4 w-4" />
                    <AlertDescription>{pncpError}</AlertDescription>
                  </Alert>
                )}
                {dadosPncp && (
                  <Alert>
                    <InfoCircle className="h-4 w-4" />
                    <AlertDescription>Campos pré-preenchidos via PNCP. Ative o toggle para editá-los, se necessário.</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeOrgaoGerenciador">Órgão gerenciador <span className="text-danger">*</span></Label>
                  <Input
                    id="nomeOrgaoGerenciador"
                    placeholder="Nome do órgão gerenciador"
                    value={dadosArp.nomeOrgaoGerenciador}
                    readOnly={dadosArp.modoEntrada !== 'manual' && !!dadosPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, nomeOrgaoGerenciador: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpjOrgaoGerenciador">CNPJ do órgão gerenciador <span className="text-danger">*</span></Label>
                  <Input
                    id="cnpjOrgaoGerenciador"
                    placeholder="Ex: 12.345.678/0001-90"
                    value={dadosArp.cnpjOrgaoGerenciador}
                    readOnly={dadosArp.modoEntrada !== 'manual' && !!dadosPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, cnpjOrgaoGerenciador: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Nº da Ata <span className="text-danger">*</span></Label>
                  <Input
                    id="numero"
                    placeholder="Ex: 001/2026"
                    value={dadosArp.numero}
                    onChange={(e) => setDadosArp((p) => ({ ...p, numero: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="descricao">Objeto da ARP <span className="text-danger">*</span></Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva o objeto da ARP"
                    value={dadosArp.descricao}
                    readOnly={dadosArp.modoEntrada !== 'manual' && !!dadosPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, descricao: e.target.value }))}
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataInicioVigencia">Vigência inicial <span className="text-danger">*</span></Label>
                  <Input
                    id="dataInicioVigencia"
                    type="date"
                    value={dadosArp.dataInicioVigencia}
                    readOnly={dadosArp.modoEntrada !== 'manual' && !!dadosPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, dataInicioVigencia: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFimVigencia">Vigência final <span className="text-danger">*</span></Label>
                  <Input
                    id="dataFimVigencia"
                    type="date"
                    value={dadosArp.dataFimVigencia}
                    readOnly={dadosArp.modoEntrada !== 'manual' && !!dadosPncp}
                    onChange={(e) => setDadosArp((p) => ({ ...p, dataFimVigencia: e.target.value }))}
                  />
                  {dadosArp.dataInicioVigencia && dadosArp.dataFimVigencia && dadosArp.dataFimVigencia <= dadosArp.dataInicioVigencia && (
                    <p className="text-danger text-xs">A vigência final deve ser posterior à vigência inicial.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:gap-6">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="aceitaAdesao" className="cursor-pointer">Aceita Adesão (Carona)?</Label>
                    <p className="text-muted-foreground text-xs lg:text-sm">Permite que outros órgãos adiram aos preços desta ARP</p>
                  </div>
                  <Switch
                    id="aceitaAdesao"
                    checked={dadosArp.aceitaAdesao}
                    onCheckedChange={(v) => setDadosArp((p) => ({ ...p, aceitaAdesao: v }))}
                  />
                </div>

                {dadosArp.aceitaAdesao && (
                  <Alert>
                    <InfoCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Atenção:</strong> Ao ativar a adesão, informe a quantidade para carona em cada item.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="renovavel" className="cursor-pointer">ARP Renovável?</Label>
                    <p className="text-muted-foreground text-xs lg:text-sm">Indica se a ARP pode ser renovada após o vencimento</p>
                  </div>
                  <Switch
                    id="renovavel"
                    checked={dadosArp.renovavel}
                    onCheckedChange={(v) => setDadosArp((p) => ({ ...p, renovavel: v }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anexoUrl">URL do Anexo da ARP (opcional)</Label>
                  <Input
                    id="anexoUrl"
                    type="url"
                    placeholder="https://pncp.gov.br/atas/..."
                    value={dadosArp.anexoUrl}
                    onChange={(e) => setDadosArp((p) => ({ ...p, anexoUrl: e.target.value }))}
                  />
                  <p className="text-muted-foreground text-xs">Informe a URL do documento PDF da ARP assinada (opcional)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 2 - ITENS REGISTRADOS */}
      {etapaAtual === 2 && (
        <Card>
          <div className="p-4 lg:p-6 pb-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg lg:text-2xl font-medium">{stepLabels[1]}</h2>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground text-sm lg:text-base">{stepDescriptions[1]}</p>
                <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 2/3</span>
              </div>
            </div>
            <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: progressWidths[1] }} />
            </div>
          </div>

          <CardContent className="space-y-4 lg:space-y-6">
            <div className="space-y-3">
              <Label>Modo de Entrada</Label>
              <RadioGroup value={modoItens} onValueChange={(v) => setModoItens(v as 'manual' | 'planilha')} className="flex flex-col lg:flex-row lg:gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual-itens" />
                  <Label htmlFor="manual-itens" className="cursor-pointer">Adicionar Manualmente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planilha" id="planilha-itens" />
                  <Label htmlFor="planilha-itens" className="cursor-pointer">Importar via Planilha</Label>
                </div>
              </RadioGroup>
            </div>

            {modoItens === 'planilha' && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Modelo de Planilha
                  </Button>
                </div>

                {!arquivoPlanilha ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-3">
                    <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm lg:text-base">Arraste o arquivo aqui ou clique para selecionar</p>
                      <p className="text-muted-foreground text-xs lg:text-sm">Formato aceito: .xlsx, .xls</p>
                    </div>
                    <Input type="file" accept=".xlsx,.xls" className="hidden" id="upload-planilha" onChange={(e) => setArquivoPlanilha(e.target.files?.[0] || null)} />
                    <Button variant="outline" asChild>
                      <label htmlFor="upload-planilha" className="cursor-pointer">Selecionar Arquivo</label>
                    </Button>
                  </div>
                ) : (
                  <div className="border border-success bg-success/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Page className="h-8 w-8 text-success" />
                        <div>
                          <p className="font-medium text-sm">{arquivoPlanilha.name}</p>
                          <p className="text-muted-foreground text-xs">{(arquivoPlanilha.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setArquivoPlanilha(null)}>
                        <Trash className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                    <Alert>
                      <Check className="h-4 w-4 text-success" />
                      <AlertDescription className="text-sm">Arquivo pronto para processamento. Ao avançar, os itens serão importados.</AlertDescription>
                    </Alert>
                  </div>
                )}

                {processandoPlanilha && (
                  <Alert>
                    <InfoCircle className="h-4 w-4" />
                    <AlertDescription>Processando planilha e validando itens...</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {modoItens === 'manual' && (
              <div className="space-y-4">
                {numeroItemDuplicado() && (
                  <Alert variant="destructive">
                    <WarningTriangle className="h-4 w-4" />
                    <AlertDescription>Existem itens com o mesmo número. Cada item deve ter um número único.</AlertDescription>
                  </Alert>
                )}

                {itensArp.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <TableComponent>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Nº Item</TableHead>
                          <TableHead className="min-w-[200px]">Descrição</TableHead>
                          <TableHead className="min-w-[100px]">Unidade</TableHead>
                          <TableHead className="min-w-[100px]">Qtd. Registrada</TableHead>
                          {dadosArp.aceitaAdesao && <TableHead className="min-w-[100px]">Qtd. Carona</TableHead>}
                          <TableHead className="min-w-[120px]">Valor Unit.</TableHead>
                          <TableHead className="min-w-[120px]">Valor Total</TableHead>
                          {dadosArp.aceitaAdesao && <TableHead className="min-w-[120px]">Potencial Carona</TableHead>}
                          <TableHead className="w-[60px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensArp.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={item.numeroItem || ''}
                                onChange={(e) => atualizarItem(item.id, 'numeroItem', Number(e.target.value))}
                                className="w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="Ex: Notebook i7 16GB" value={item.descricao} onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="ex: UN, KG" value={item.unidadeMedida} onChange={(e) => atualizarItem(item.id, 'unidadeMedida', e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min="0" step="0.01" placeholder="0" value={item.qtdRegistrada || ''} onChange={(e) => atualizarItem(item.id, 'qtdRegistrada', Number(e.target.value))} />
                            </TableCell>
                            {dadosArp.aceitaAdesao && (
                              <TableCell>
                                <Input type="number" min="0" step="0.01" placeholder="0" value={item.qtdParaCarona || ''} onChange={(e) => atualizarItem(item.id, 'qtdParaCarona', Number(e.target.value))} />
                              </TableCell>
                            )}
                            <TableCell>
                              <Input type="number" min="0" step="0.01" placeholder="0,00" value={item.valorEstimado || ''} onChange={(e) => atualizarItem(item.id, 'valorEstimado', Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{formatCurrency(item.valorTotal)}</span>
                            </TableCell>
                            {dadosArp.aceitaAdesao && (
                              <TableCell>
                                <span className="text-sm text-success">{formatCurrency(item.valorPotencialCarona)}</span>
                              </TableCell>
                            )}
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removerItem(item.id)}>
                                <Trash className="h-4 w-4 text-danger" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Page className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm lg:text-base">Nenhum item adicionado ainda</p>
                  </div>
                )}

                <Button onClick={adicionarItem} variant="outline" className="w-full lg:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>

                {dadosArp.aceitaAdesao && itensArp.length > 0 && (
                  <Alert>
                    <InfoCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Informe a quantidade disponível para adesão (carona) em cada item.
                    </AlertDescription>
                  </Alert>
                )}

                {itensArp.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Valor Total Registrado:</span>
                      <span className="text-lg font-medium text-primary">{formatCurrency(valorTotalRegistrado)}</span>
                    </div>
                    {dadosArp.aceitaAdesao && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Valor Potencial de Carona:</span>
                          <span className="text-lg font-medium text-success">{formatCurrency(valorPotencialCarona)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                          <span className="font-medium">Potencial Total de Vendas:</span>
                          <span className="text-xl font-bold text-primary">{formatCurrency(valorTotalRegistrado + valorPotencialCarona)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ETAPA 3 - REVISÃO E CONFIRMAÇÃO */}
      {etapaAtual === 3 && (
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <div className="p-4 lg:p-6 pb-0 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg lg:text-2xl font-medium">{stepLabels[2]}</h2>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-muted-foreground text-sm lg:text-base">{stepDescriptions[2]}</p>
                  <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 3/3</span>
                </div>
              </div>
              <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: progressWidths[2] }} />
              </div>
            </div>

            <CardContent className="space-y-6">
              <Alert>
                <WarningTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  O Nº da Ata e os valores registrados <strong>não poderão ser alterados</strong> após a criação sem contato com o suporte.
                </AlertDescription>
              </Alert>

              {saveError && (
                <Alert variant="destructive">
                  <WarningTriangle className="h-4 w-4" />
                  <AlertTitle>Erro ao cadastrar ata</AlertTitle>
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Órgão gerenciador</p>
                  <p className="font-medium">{dadosArp.nomeOrgaoGerenciador}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ do órgão</p>
                  <p className="font-medium">{dadosArp.cnpjOrgaoGerenciador}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nº da Ata</p>
                  <p className="font-medium text-primary">{dadosArp.numero}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-sm text-muted-foreground">Objeto da ARP</p>
                  <p className="font-medium">{dadosArp.descricao}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vigência</p>
                  <p className="font-medium">
                    {dadosArp.dataInicioVigencia ? new Date(dadosArp.dataInicioVigencia + 'T00:00:00').toLocaleDateString('pt-BR') : '—'} até{' '}
                    {dadosArp.dataFimVigencia ? new Date(dadosArp.dataFimVigencia + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aceita Adesão (Carona)</p>
                  <p className="font-medium">{dadosArp.aceitaAdesao ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renovável</p>
                  <p className="font-medium">{dadosArp.renovavel ? 'Sim' : 'Não'}</p>
                </div>
                {dadosArp.anexoUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground">URL do Anexo</p>
                    <p className="font-medium text-sm break-all">{dadosArp.anexoUrl}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 lg:p-6 pb-0">
              <h3 className="text-base lg:text-lg font-medium">Itens Registrados</h3>
            </div>
            <CardContent className="pt-4">
              <div className="overflow-x-auto border rounded-lg">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Nº Item</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Qtd. Registrada</TableHead>
                      {dadosArp.aceitaAdesao && <TableHead className="text-right">Qtd. Carona</TableHead>}
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensArp.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.numeroItem}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.unidadeMedida}</TableCell>
                        <TableCell className="text-right">{item.qtdRegistrada.toLocaleString('pt-BR')}</TableCell>
                        {dadosArp.aceitaAdesao && <TableCell className="text-right">{item.qtdParaCarona.toLocaleString('pt-BR')}</TableCell>}
                        <TableCell className="text-right">{formatCurrency(item.valorEstimado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.valorTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableComponent>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor Total Registrado:</span>
                  <span className="text-lg font-medium">{formatCurrency(valorTotalRegistrado)}</span>
                </div>
                {dadosArp.aceitaAdesao && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Valor Potencial de Carona:</span>
                      <span className="text-lg font-medium text-success">{formatCurrency(valorPotencialCarona)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                      <span className="text-lg font-bold">Potencial Total de Vendas:</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(valorTotalRegistrado + valorPotencialCarona)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botões de Navegação */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        {etapaAtual > 1 ? (
          <Button variant="outline" onClick={voltar} size="lg">
            <NavArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/atas/gestao')} size="lg">
            Cancelar
          </Button>
        )}

        {etapaAtual < 3 ? (
          <Button
            onClick={avancar}
            disabled={
              processandoPlanilha ||
              (etapaAtual === 1 && !validarEtapa1()) ||
              (etapaAtual === 2 && !validarEtapa2())
            }
            size="lg"
          >
            Avançar
            <NavArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => void finalizarCadastro()} disabled={isSaving} size="lg">
            <Check className="h-4 w-4 mr-2" />
            {isSaving ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </Button>
        )}
      </div>
    </div>
  );
}
