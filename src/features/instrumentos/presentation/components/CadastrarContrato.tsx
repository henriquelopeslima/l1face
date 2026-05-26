import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { CadastroSucesso } from '@/shared/components/feedback/CadastroSucesso';
import { useConsultarContratoPncp } from '../hooks/useConsultarContratoPncp';
import {
  Page,
  Plus,
  Trash,
  WarningTriangle,
  InfoCircle,
  CloudUpload,
  Download,
  Check,
  NavArrowLeft,
  NavArrowRight,
  Edit,
  Table,
} from 'iconoir-react';

interface ItemContrato {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}

interface DadosContrato {
  modoEntrada: 'automatico' | 'manual';
  numeroPNCP?: string;
  cnpjContratante?: string;
  orgaoContratante?: string;
  secretaria?: string;
  objeto: string;
  numeroInstrumento: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  enderecoEntrega: string;
  prazoEntrega: number;
  tipoPrazoEntrega: 'corrido' | 'util';
  prazoPagamento: number;
  tipoPrazoPagamento: 'corrido' | 'util';
  renovavel: boolean;
  arpOrigem?: string;
  anexoContrato?: File;
}

const arpsDisponiveis = [
  { id: '1', numero: 'ARP 042/2024', orgaoGerenciador: 'Prefeitura de Fortaleza', saldo: 150000 },
  { id: '2', numero: 'ARP 118/2025', orgaoGerenciador: 'Governo do Estado', saldo: 320000 },
  { id: '3', numero: 'ARP 203/2025', orgaoGerenciador: 'Ministério da Saúde', saldo: 580000 },
];

const contratosExistentes = [
  { numeroInstrumento: '042/2024', orgaoContratante: 'Prefeitura Municipal de Russas' },
  { numeroInstrumento: '118/2025', orgaoContratante: 'Governo do Estado do Ceará' },
  { numeroInstrumento: '203/2025', orgaoContratante: 'Prefeitura de Fortaleza' },
];

export function CadastrarContrato() {
  const navigate = useNavigate();
  const { consultar: consultarPncp, isLoading: isBuscandoPNCP, error: pncpError, dados: dadosPncp } = useConsultarContratoPncp();
  const [etapaAtual, setEtapaAtual] = useState(1);

  const [metodoEntrada, setMetodoEntrada] = useState<'manual' | 'excel'>('manual');
  const [arquivoExcel, setArquivoExcel] = useState<File | null>(null);
  const [processandoExcel, setProcessandoExcel] = useState(false);

  const [dadosContrato, setDadosContrato] = useState<DadosContrato>({
    modoEntrada: 'automatico',
    numeroPNCP: '',
    objeto: '',
    numeroInstrumento: '',
    vigenciaInicial: '',
    vigenciaFinal: '',
    enderecoEntrega: '',
    prazoEntrega: 0,
    tipoPrazoEntrega: 'corrido',
    prazoPagamento: 0,
    tipoPrazoPagamento: 'corrido',
    renovavel: false,
  });

  const [erroNumeroInstrumento, setErroNumeroInstrumento] = useState('');
  const [buscandoCNPJContratante, setBuscandoCNPJContratante] = useState(false);
  const [cabecalhoPncpCarregado, setCabecalhoPncpCarregado] = useState(false);

  const [modoItens, setModoItens] = useState<'manual' | 'planilha'>('manual');
  const [itensContrato, setItensContrato] = useState<ItemContrato[]>([]);
  const [salvandoMock, setSalvandoMock] = useState(false);
  const [processandoCadastro, setProcessandoCadastro] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [progressoCadastro, setProgressoCadastro] = useState(0);
  const [etapaProcessamento, setEtapaProcessamento] = useState('Preparando informações do cadastro...');

  useEffect(() => {
    if (dadosContrato.numeroInstrumento && dadosContrato.orgaoContratante) {
      const existe = contratosExistentes.find(
        (c) =>
          c.numeroInstrumento === dadosContrato.numeroInstrumento &&
          c.orgaoContratante === dadosContrato.orgaoContratante
      );
      setErroNumeroInstrumento(existe ? 'Já existe um contrato com este número para este órgão.' : '');
    } else {
      setErroNumeroInstrumento('');
    }
  }, [dadosContrato.numeroInstrumento, dadosContrato.orgaoContratante]);

  const processarArquivoExcel = async (file: File) => {
    setProcessandoExcel(true);
    setArquivoExcel(file);
    setTimeout(() => {
      setDadosContrato({
        modoEntrada: 'manual',
        orgaoContratante: 'Prefeitura Municipal de Russas',
        secretaria: 'SEMED',
        objeto: 'Aquisição de gêneros alimentícios para merenda escolar',
        numeroInstrumento: '042/2024',
        vigenciaInicial: '2024-04-01',
        vigenciaFinal: '2026-03-31',
        enderecoEntrega: 'Av. Principal, 123 - Centro',
        prazoEntrega: 15,
        tipoPrazoEntrega: 'util',
        prazoPagamento: 30,
        tipoPrazoPagamento: 'corrido',
        renovavel: true,
      });
      setItensContrato([
        { id: 'item-1', descricao: 'Arroz tipo 1', unidadeMedida: 'kg', quantidadeTotal: 1000, valorUnitario: 5.50, valorTotal: 5500 },
        { id: 'item-2', descricao: 'Feijão carioca', unidadeMedida: 'kg', quantidadeTotal: 500, valorUnitario: 8.00, valorTotal: 4000 },
        { id: 'item-3', descricao: 'Óleo de soja', unidadeMedida: 'L', quantidadeTotal: 200, valorUnitario: 6.50, valorTotal: 1300 },
      ]);
      setProcessandoExcel(false);
      setEtapaAtual(2);
    }, 2000);
  };

  useEffect(() => {
    if (!dadosPncp) return;
    setDadosContrato((prev) => ({
      ...prev,
      cnpjContratante: dadosPncp.cnpjDoContratante,
      orgaoContratante: dadosPncp.orgaoDoContratante,
      secretaria: dadosPncp.unidade,
      objeto: dadosPncp.objeto,
      numeroInstrumento: dadosPncp.nDoInstrumento,
      vigenciaInicial: dadosPncp.vigenciaInicial,
      vigenciaFinal: dadosPncp.vigenciaFinal,
    }));
    setCabecalhoPncpCarregado(true);
  }, [dadosPncp]);

  useEffect(() => {
    if (pncpError) {
      setDadosContrato((prev) => ({ ...prev, modoEntrada: 'manual' }));
    }
  }, [pncpError]);

  const buscarPNCP = useCallback(() => {
    if (!dadosContrato.numeroPNCP?.trim()) return;
    setCabecalhoPncpCarregado(false);
    void consultarPncp(dadosContrato.numeroPNCP.trim());
  }, [dadosContrato.numeroPNCP, consultarPncp]);

  const buscarContratantePorCNPJ = async () => {
    const cnpjLimpo = (dadosContrato.cnpjContratante || '').replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) { window.alert('Informe um CNPJ válido com 14 dígitos.'); return; }
    setBuscandoCNPJContratante(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) throw new Error('Falha na consulta de CNPJ');
      const data = await response.json();
      setDadosContrato((prev) => ({ ...prev, orgaoContratante: data.razao_social || prev.orgaoContratante }));
    } catch {
      window.alert('Não foi possível consultar esse CNPJ agora. Tente novamente.');
    } finally {
      setBuscandoCNPJContratante(false);
    }
  };

  const adicionarItem = () => {
    setItensContrato([...itensContrato, { id: `item-${Date.now()}`, descricao: '', unidadeMedida: '', quantidadeTotal: 0, valorUnitario: 0, valorTotal: 0 }]);
  };

  const removerItem = (id: string) => setItensContrato(itensContrato.filter((i) => i.id !== id));

  const atualizarItem = (id: string, campo: keyof ItemContrato, valor: string | number) => {
    setItensContrato(itensContrato.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [campo]: valor };
      if (campo === 'quantidadeTotal' || campo === 'valorUnitario') {
        updated.valorTotal = updated.quantidadeTotal * updated.valorUnitario;
      }
      return updated;
    }));
  };

  const calcularValorTotal = () => itensContrato.reduce((acc, i) => acc + i.valorTotal, 0);

  const isManual = dadosContrato.modoEntrada === 'manual';
  const readonlyCls = !isManual ? 'bg-muted text-muted-foreground cursor-not-allowed select-none' : '';

  const validarEtapaDados = () => {
    if (!isManual && (!dadosContrato.numeroPNCP || (!cabecalhoPncpCarregado && !pncpError))) return false;
    return !!(dadosContrato.orgaoContratante && dadosContrato.secretaria && dadosContrato.objeto &&
      dadosContrato.numeroInstrumento &&
      dadosContrato.vigenciaInicial && dadosContrato.vigenciaFinal && dadosContrato.enderecoEntrega &&
      dadosContrato.prazoEntrega > 0 && dadosContrato.prazoPagamento > 0 && !erroNumeroInstrumento);
  };

  const validarEtapaItens = () =>
    itensContrato.length > 0 &&
    itensContrato.every((i) => i.descricao && i.unidadeMedida && i.quantidadeTotal > 0 && i.valorUnitario > 0);

  const avancar = () => {
    if (etapaAtual === 1) {
      if (metodoEntrada === 'excel' && arquivoExcel) { processarArquivoExcel(arquivoExcel); return; }
      setEtapaAtual(2); return;
    }
    if (etapaAtual === 2 && !validarEtapaDados()) return;
    if (etapaAtual === 3 && !validarEtapaItens()) return;
    setEtapaAtual(etapaAtual + 1);
  };

  const voltar = () => setEtapaAtual(etapaAtual - 1);

  const aguardar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const finalizarCadastro = async () => {
    setSalvandoMock(true);
    try {
      if (metodoEntrada === 'excel' || modoItens === 'planilha') {
        setProcessandoCadastro(true);
        setProgressoCadastro(0);
        setEtapaProcessamento('Validando estrutura do arquivo...');
        await aguardar(500);
        setProgressoCadastro(25);
        setEtapaProcessamento('Convertendo dados para o formato da plataforma...');
        await aguardar(650);
        setProgressoCadastro(65);
        setEtapaProcessamento('Finalizando cadastro e índices de consulta...');
        await aguardar(700);
        setProgressoCadastro(100);
      }
      setProcessandoCadastro(false);
      setCadastroConcluido(true);
    } catch {
      window.alert('Não foi possível salvar. Tente novamente.');
      setProcessandoCadastro(false);
      setProgressoCadastro(0);
    } finally {
      setSalvandoMock(false);
    }
  };

  const downloadTemplateExcel = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'modelo-cadastro-contrato-licitaone.xlsx';
    link.click();
  };

  const downloadTemplatePlanilhaItens = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'template-itens-contrato.xlsx';
    link.click();
  };

  const arpSelecionada = arpsDisponiveis.find((a) => a.id === dadosContrato.arpOrigem);

  if (processandoCadastro || cadastroConcluido) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <CadastroSucesso
          processando={processandoCadastro && !cadastroConcluido}
          progresso={progressoCadastro}
          titulo="Processando cadastro de contrato"
          descricao="Estamos processando o arquivo e validando os itens para garantir consistência dos dados."
          tituloSucesso="Contrato cadastrado com sucesso"
          descricaoSucesso="O contrato e seus itens foram registrados com sucesso. Você já pode acompanhar em Gestão de contratos."
          etapaAtual={etapaProcessamento}
          onConcluir={() => navigate('/instrumentos/gestao')}
        />
      </div>
    );
  }

  const progressoWidth = ['25%', '50%', '75%', '100%'][etapaAtual - 1] ?? '25%';

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* ETAPA 1 - MÉTODO DE CADASTRO */}
      {etapaAtual === 1 && (
        <Card>
          <div className="p-4 lg:p-6 pb-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg lg:text-2xl font-medium">Tipo de arquivo</h2>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground text-sm lg:text-base">Escolha como deseja cadastrar o contrato</p>
                <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 1/4</span>
              </div>
            </div>
            <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: progressoWidth }} />
            </div>
          </div>
          <CardContent className="space-y-4 lg:space-y-6">
            <RadioGroup
              value={metodoEntrada}
              onValueChange={(v) => setMetodoEntrada(v as 'manual' | 'excel')}
              className="grid gap-4 lg:grid-cols-2"
            >
              <label
                htmlFor="metodo-manual"
                className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${metodoEntrada === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
              >
                <RadioGroupItem value="manual" id="metodo-manual" className="sr-only" />
                <div className={`rounded-full p-3 ${metodoEntrada === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Edit className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">Preenchimento Manual</p>
                  <p className="text-muted-foreground text-xs lg:text-sm">Preencha o formulário passo a passo</p>
                </div>
              </label>
              <label
                htmlFor="metodo-excel"
                className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all ${metodoEntrada === 'excel' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
              >
                <RadioGroupItem value="excel" id="metodo-excel" className="sr-only" />
                <div className={`rounded-full p-3 ${metodoEntrada === 'excel' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Table className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">Importar via Excel</p>
                  <p className="text-muted-foreground text-xs lg:text-sm">Use nosso modelo de planilha</p>
                </div>
              </label>
            </RadioGroup>

            {metodoEntrada === 'excel' && (
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4 lg:p-6">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <InfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <p className="text-sm flex-1"><strong>Importante:</strong> Baixe nosso modelo Excel e preencha com os dados do contrato.</p>
                  <Button variant="outline" onClick={downloadTemplateExcel} className="flex-shrink-0">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Modelo Excel (.xlsx)
                  </Button>
                </div>
                <div className="space-y-3">
                  <Label>Upload do Arquivo</Label>
                  {!arquivoExcel ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-3">
                      <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm lg:text-base">Arraste o arquivo aqui ou clique para selecionar</p>
                        <p className="text-muted-foreground text-xs lg:text-sm mt-1">Formato aceito: .xlsx, .xls (máx. 5MB)</p>
                      </div>
                      <Input type="file" accept=".xlsx,.xls" className="hidden" id="upload-excel-contrato"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setArquivoExcel(f); }} />
                      <Button variant="outline" asChild>
                        <label htmlFor="upload-excel-contrato" className="cursor-pointer">
                          <CloudUpload className="h-4 w-4 mr-2" /> Selecionar Arquivo
                        </label>
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-success bg-success/10 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Page className="h-8 w-8 text-success" />
                          <div>
                            <p className="font-medium text-sm">{arquivoExcel.name}</p>
                            <p className="text-muted-foreground text-xs">{(arquivoExcel.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setArquivoExcel(null)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Alert>
                        <Check className="h-4 w-4 text-success" />
                        <AlertDescription className="text-sm">Arquivo carregado com sucesso! Clique em "Processar e Avançar".</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
                {processandoExcel && (
                  <Alert>
                    <InfoCircle className="h-4 w-4" />
                    <AlertDescription>Processando arquivo Excel...</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/instrumentos/gestao')} size="lg">Cancelar</Button>
              <Button onClick={avancar} disabled={(metodoEntrada === 'excel' && !arquivoExcel) || processandoExcel} size="lg">
                {metodoEntrada === 'excel' && arquivoExcel ? 'Processar e Avançar' : 'Avançar'}
                <NavArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 2 - DADOS DO CONTRATO */}
      {etapaAtual === 2 && (
        <Card>
          <div className="p-4 lg:p-6 pb-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg lg:text-2xl font-medium">Dados do Contrato</h2>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground text-sm lg:text-base">Preencha as informações básicas do contrato</p>
                <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 2/4</span>
              </div>
            </div>
            <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: '50%' }} />
            </div>
          </div>
          <CardContent className="space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="preencherManualContrato" className="cursor-pointer">Preencher manualmente</Label>
                <p className="text-muted-foreground text-xs lg:text-sm">Por padrão, os dados iniciais são carregados via API.</p>
              </div>
              <Switch
                id="preencherManualContrato"
                checked={dadosContrato.modoEntrada === 'manual'}
                onCheckedChange={(checked) => setDadosContrato({ ...dadosContrato, modoEntrada: checked ? 'manual' : 'automatico' })}
              />
            </div>

            <div className="space-y-4">
              {!isManual && (
                <div className="space-y-2">
                  <Label htmlFor="numeroPNCP">Número do Contrato no PNCP <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input id="numeroPNCP" placeholder="Ex: 24098477000110-2-000270/2026" value={dadosContrato.numeroPNCP || ''}
                      onChange={(e) => setDadosContrato({ ...dadosContrato, numeroPNCP: e.target.value, })} />
                    <Button onClick={buscarPNCP} disabled={isBuscandoPNCP || !dadosContrato.numeroPNCP?.trim()}>
                      {isBuscandoPNCP ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                </div>
              )}

              {!isManual && isBuscandoPNCP && (
                <Alert><InfoCircle className="h-4 w-4" /><AlertDescription>Buscando informações na base do PNCP...</AlertDescription></Alert>
              )}

              {!isManual && pncpError && (
                <Alert variant="destructive">
                  <WarningTriangle className="h-4 w-4" />
                  <AlertTitle>Erro ao buscar no PNCP</AlertTitle>
                  <AlertDescription>{pncpError} Os campos foram liberados para preenchimento manual.</AlertDescription>
                </Alert>
              )}

              {!isManual && (
                <h3 className="text-sm font-medium">Preenchidos automaticamente (somente leitura)</h3>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label>CNPJ do Contratante {isManual && <span className="text-destructive">*</span>}</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ex: 12.345.678/0001-90" value={dadosContrato.cnpjContratante || ''}
                      readOnly={!isManual}
                      className={readonlyCls}
                      onChange={(e) => setDadosContrato({ ...dadosContrato, cnpjContratante: e.target.value })} />
                    {isManual && (
                      <Button type="button" variant="outline" onClick={buscarContratantePorCNPJ} disabled={buscandoCNPJContratante}>
                        {buscandoCNPJContratante ? 'Consultando...' : 'Buscar CNPJ'}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Órgão Contratante</Label>
                  <Input value={dadosContrato.orgaoContratante || ''} readOnly={!isManual}
                    className={readonlyCls}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, orgaoContratante: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Secretaria / Unidade</Label>
                  <Input value={dadosContrato.secretaria || ''} readOnly={!isManual}
                    className={readonlyCls}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, secretaria: e.target.value })} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Objeto</Label>
                  <Textarea value={dadosContrato.objeto || ''} readOnly={!isManual}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, objeto: e.target.value })} className={`min-h-20 ${readonlyCls}`} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nº do Instrumento <span className="text-destructive">*</span></Label>
                  <Input placeholder="Ex: 042/2024" value={dadosContrato.numeroInstrumento}
                    readOnly={!isManual}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, numeroInstrumento: e.target.value })}
                    className={`${erroNumeroInstrumento ? 'border-destructive' : ''} ${readonlyCls}`} />
                  {erroNumeroInstrumento && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <WarningTriangle className="h-3 w-3" />{erroNumeroInstrumento}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Vigência Inicial <span className="text-destructive">*</span></Label>
                  <Input type="date" value={dadosContrato.vigenciaInicial} readOnly={!isManual}
                    className={readonlyCls}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, vigenciaInicial: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Vigência Final <span className="text-destructive">*</span></Label>
                  <Input type="date" value={dadosContrato.vigenciaFinal} readOnly={!isManual}
                    className={readonlyCls}
                    onChange={(e) => setDadosContrato({ ...dadosContrato, vigenciaFinal: e.target.value })} />
                </div>
              </div>

              <h3 className="text-sm font-medium pt-2">Preenchimento manual obrigatório</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prazo de Entrega <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input type="number" min="1" placeholder="Ex: 15" value={dadosContrato.prazoEntrega || ''}
                      onChange={(e) => setDadosContrato({ ...dadosContrato, prazoEntrega: Number(e.target.value) })} />
                    <Select value={dadosContrato.tipoPrazoEntrega} onValueChange={(v) => setDadosContrato({ ...dadosContrato, tipoPrazoEntrega: v as 'corrido' | 'util' })}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrido">Corrido</SelectItem>
                        <SelectItem value="util">Útil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Prazo de Pagamento <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <Input type="number" min="1" placeholder="Ex: 30" value={dadosContrato.prazoPagamento || ''}
                      onChange={(e) => setDadosContrato({ ...dadosContrato, prazoPagamento: Number(e.target.value) })} />
                    <Select value={dadosContrato.tipoPrazoPagamento} onValueChange={(v) => setDadosContrato({ ...dadosContrato, tipoPrazoPagamento: v as 'corrido' | 'util' })}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrido">Corrido</SelectItem>
                        <SelectItem value="util">Útil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:gap-6">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="renovavel" className="cursor-pointer">Contrato Renovável?</Label>
                    <p className="text-muted-foreground text-xs lg:text-sm">Indica se o contrato pode ser renovado após o vencimento</p>
                  </div>
                  <Switch id="renovavel" checked={dadosContrato.renovavel}
                    onCheckedChange={(checked) => setDadosContrato({ ...dadosContrato, renovavel: checked })} />
                </div>

                <div className="space-y-2">
                  <Label>ARP de Origem (opcional)</Label>
                  <Select value={dadosContrato.arpOrigem || 'none'}
                    onValueChange={(v) => setDadosContrato({ ...dadosContrato, arpOrigem: v === 'none' ? undefined : v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione uma ARP (opcional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma ARP</SelectItem>
                      {arpsDisponiveis.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.numero} - {a.orgaoGerenciador}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {arpSelecionada && (
                    <Alert>
                      <InfoCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{arpSelecionada.numero}</strong> — {arpSelecionada.orgaoGerenciador} — Saldo:{' '}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(arpSelecionada.saldo)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Anexo do Contrato (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept=".pdf"
                      onChange={(e) => setDadosContrato({ ...dadosContrato, anexoContrato: e.target.files?.[0] })}
                      className="cursor-pointer" />
                    {dadosContrato.anexoContrato && (
                      <Badge variant="outline" className="shrink-0">{dadosContrato.anexoContrato.name}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={voltar} size="lg"><NavArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
              <Button onClick={avancar} disabled={!validarEtapaDados()} size="lg">
                Avançar<NavArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 3 - ITENS DO CONTRATO */}
      {etapaAtual === 3 && (
        <Card>
          <div className="p-4 lg:p-6 pb-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg lg:text-2xl font-medium">Itens do Contrato</h2>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground text-sm lg:text-base">Adicione os itens que fazem parte do contrato</p>
                <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 3/4</span>
              </div>
            </div>
            <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: '75%' }} />
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
                <Button variant="outline" onClick={downloadTemplatePlanilhaItens}>
                  <Download className="h-4 w-4 mr-2" />Baixar Modelo de Planilha
                </Button>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-3">
                  <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm lg:text-base">Arraste o arquivo aqui ou clique para selecionar</p>
                  <Input type="file" accept=".xlsx,.xls" className="hidden" id="upload-planilha" />
                  <Button variant="outline" asChild>
                    <label htmlFor="upload-planilha" className="cursor-pointer">Selecionar Arquivo</label>
                  </Button>
                </div>
              </div>
            )}

            {modoItens === 'manual' && (
              <div className="space-y-4">
                {itensContrato.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <TableComponent>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[250px]">Descrição do Item</TableHead>
                          <TableHead className="min-w-[150px]">Unidade de Medida</TableHead>
                          <TableHead className="min-w-[120px]">Quantidade</TableHead>
                          <TableHead className="min-w-[120px]">Valor Unitário</TableHead>
                          <TableHead className="min-w-[120px]">Valor Total</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensContrato.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Input placeholder="Ex: Arroz tipo 1" value={item.descricao}
                                onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="ex: kg, un, fardo" value={item.unidadeMedida}
                                onChange={(e) => atualizarItem(item.id, 'unidadeMedida', e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min="0" step="0.01" placeholder="0" value={item.quantidadeTotal || ''}
                                onChange={(e) => atualizarItem(item.id, 'quantidadeTotal', Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min="0" step="0.01" placeholder="0,00" value={item.valorUnitario || ''}
                                onChange={(e) => atualizarItem(item.id, 'valorUnitario', Number(e.target.value))} />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removerItem(item.id)}>
                                <Trash className="h-4 w-4 text-destructive" />
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
                  <Plus className="h-4 w-4 mr-2" />Adicionar Item
                </Button>
                {itensContrato.length > 0 && (
                  <div className="flex justify-end">
                    <div className="space-y-2 min-w-[250px]">
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="font-medium">Valor Total do Contrato:</span>
                        <span className="text-lg font-medium text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularValorTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={voltar} size="lg"><NavArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
              <Button onClick={avancar} disabled={!validarEtapaItens()} size="lg">
                Avançar<NavArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 4 - REVISÃO */}
      {etapaAtual === 4 && (
        <div className="space-y-4 lg:space-y-6">
          <Card>
            <div className="p-4 lg:p-6 pb-0 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg lg:text-2xl font-medium">Revisão e Confirmação</h2>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-muted-foreground text-sm lg:text-base">Confira os dados antes de finalizar o cadastro do contrato</p>
                  <span className="text-primary font-bold text-base lg:text-lg shrink-0">Passo 4/4</span>
                </div>
              </div>
              <div className="relative h-2 bg-primary/15 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: '100%' }} />
              </div>
            </div>
            <CardContent className="space-y-6">
              <Alert>
                <WarningTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>O Nº do Instrumento <strong>não poderá ser alterado</strong> após a criação do contrato.</AlertDescription>
              </Alert>
              <div className="grid gap-4 lg:grid-cols-2">
                <div><p className="text-muted-foreground text-sm">Órgão Contratante</p><p className="font-medium">{dadosContrato.orgaoContratante}</p></div>
                <div><p className="text-muted-foreground text-sm">Secretaria / Unidade</p><p className="font-medium">{dadosContrato.secretaria}</p></div>
                <div className="lg:col-span-2"><p className="text-muted-foreground text-sm">Objeto do Contrato</p><p className="font-medium">{dadosContrato.objeto}</p></div>
                <div><p className="text-muted-foreground text-sm">Nº do Instrumento</p><p className="font-medium text-primary">{dadosContrato.numeroInstrumento}</p></div>
                <div>
                  <p className="text-muted-foreground text-sm">Vigência</p>
                  <p className="font-medium">
                    {new Date(dadosContrato.vigenciaInicial).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(dadosContrato.vigenciaFinal).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div><p className="text-muted-foreground text-sm">Endereço de Entrega</p><p className="font-medium">{dadosContrato.enderecoEntrega}</p></div>
                <div><p className="text-muted-foreground text-sm">Prazo de Entrega</p><p className="font-medium">{dadosContrato.prazoEntrega} dias {dadosContrato.tipoPrazoEntrega === 'util' ? 'úteis' : 'corridos'}</p></div>
                <div><p className="text-muted-foreground text-sm">Prazo de Pagamento</p><p className="font-medium">{dadosContrato.prazoPagamento} dias {dadosContrato.tipoPrazoPagamento === 'util' ? 'úteis' : 'corridos'}</p></div>
                <div><p className="text-muted-foreground text-sm">Renovável</p><p className="font-medium">{dadosContrato.renovavel ? 'Sim' : 'Não'}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="overflow-x-auto border rounded-lg">
                <TableComponent>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensContrato.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.unidadeMedida}</TableCell>
                        <TableCell className="text-right">{item.quantidadeTotal.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario)}</TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">Valor Total do Contrato:</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularValorTotal())}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </TableComponent>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                <Button variant="outline" onClick={voltar} size="lg"><NavArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
                <Button onClick={finalizarCadastro} disabled={salvandoMock} size="lg">
                  <Check className="h-4 w-4 mr-2" />
                  {salvandoMock ? 'Salvando...' : 'Finalizar Cadastro'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
