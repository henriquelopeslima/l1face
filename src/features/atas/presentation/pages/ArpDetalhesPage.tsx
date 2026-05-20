import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import {
  NavArrowLeft,
  Download,
  WarningTriangle,
  InfoCircle,
  Plus,
  Eye,
  OpenInBrowser,
} from 'iconoir-react';

interface ItemArp {
  id: string;
  descricao: string;
  unidadeMedida: string;
  valorUnitario: number;
  qtdRegistrada: number;
  qtdConsumidaOrgao: number;
  qtdParaCarona?: number;
  qtdConsumidaCarona?: number;
}

interface ContratoGerado {
  id: string;
  numeroInstrumento: string;
  tipo: 'Contrato' | 'Empenho';
  origemSaldo: 'Órgão gerenciador' | 'Adesão (Carona)';
  valor: number;
  status: 'Em Execução' | 'Encerrado' | 'Pago';
}

const arpsDetalhadas = {
  '1': {
    id: '1',
    numeroAta: 'ARP 012/2025',
    orgaoGerenciador: 'Prefeitura de Fortaleza',
    objeto: 'Aquisição de Material de Tecnologia da Informação para todas as secretarias',
    vigenciaInicial: '2025-01-15',
    vigenciaFinal: '2026-06-30',
    aceitaAdesao: true,
    renovavel: true,
    anexo: 'arp-012-2025.pdf',
    itens: [
      { id: '1', descricao: 'Notebook i7 16GB RAM', unidadeMedida: 'un', valorUnitario: 6000, qtdRegistrada: 60, qtdConsumidaOrgao: 35, qtdParaCarona: 120, qtdConsumidaCarona: 70 },
      { id: '2', descricao: 'Monitor 27" 4K', unidadeMedida: 'un', valorUnitario: 3500, qtdRegistrada: 40, qtdConsumidaOrgao: 37, qtdParaCarona: 80, qtdConsumidaCarona: 80 },
      { id: '3', descricao: 'Switch 24 portas', unidadeMedida: 'un', valorUnitario: 2200, qtdRegistrada: 20, qtdConsumidaOrgao: 20, qtdParaCarona: 40, qtdConsumidaCarona: 15 },
    ] as ItemArp[],
    contratos: [
      { id: '1', numeroInstrumento: '042/2024', tipo: 'Contrato' as const, origemSaldo: 'Órgão gerenciador' as const, valor: 150000, status: 'Em Execução' as const },
      { id: '2', numeroInstrumento: 'EMP 2026NE000142', tipo: 'Empenho' as const, origemSaldo: 'Órgão gerenciador' as const, valor: 80000, status: 'Pago' as const },
      { id: '3', numeroInstrumento: '015/2025', tipo: 'Contrato' as const, origemSaldo: 'Adesão (Carona)' as const, valor: 120000, status: 'Em Execução' as const },
      { id: '4', numeroInstrumento: '021/2025', tipo: 'Contrato' as const, origemSaldo: 'Adesão (Carona)' as const, valor: 300000, status: 'Em Execução' as const },
    ] as ContratoGerado[],
  },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function ArpDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('dados');

  const arp = id ? arpsDetalhadas[id as keyof typeof arpsDetalhadas] : null;

  if (!arp) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">ARP não encontrada</p>
        <Button onClick={() => navigate('/atas/gestao')}>Voltar para Listagem</Button>
      </div>
    );
  }

  const calcularDiasRestantes = (vigenciaFim: string): number => {
    const hoje = new Date();
    const dataFim = new Date(vigenciaFim);
    return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  };

  const saldoOrgao = arp.itens.reduce((acc, i) => acc + (i.qtdRegistrada - i.qtdConsumidaOrgao) * i.valorUnitario, 0);
  const saldoCarona = arp.aceitaAdesao
    ? arp.itens.reduce((acc, i) => acc + ((i.qtdParaCarona ?? 0) - (i.qtdConsumidaCarona ?? 0)) * i.valorUnitario, 0)
    : 0;
  const valorTotalRegistrado = arp.itens.reduce((acc, i) => acc + i.qtdRegistrada * i.valorUnitario, 0);
  const diasRestantes = calcularDiasRestantes(arp.vigenciaFinal);

  const mostrarAlertaRenovacao = arp.renovavel && diasRestantes < 90;
  const mostrarAlertaCarona = arp.aceitaAdesao && saldoCarona > 0 && diasRestantes < 90;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/atas/gestao')} className="gap-2 h-9">
            <NavArrowLeft className="h-4 w-4" />
            Voltar para Listagem
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl lg:text-4xl">{arp.numeroAta}</h1>
            <p className="text-muted-foreground text-sm lg:text-base">{arp.orgaoGerenciador}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/atas/${id}/visualizar`)}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Ata
          </Button>
          <Button variant="outline" onClick={() => navigate(`/atas/${id}/gerar-contrato`)}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar Contrato
          </Button>
          {arp.aceitaAdesao && (
            <Button variant="outline" onClick={() => navigate(`/atas/${id}/registrar-adesao`)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Adesão
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados">Dados Mestres</TabsTrigger>
          <TabsTrigger value="itens">Itens e Saldo</TabsTrigger>
          <TabsTrigger value="contratos">Contratos Gerados</TabsTrigger>
        </TabsList>

        {/* ABA 1 - DADOS MESTRES */}
        <TabsContent value="dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da ARP</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Órgão gerenciador</p>
                <p className="font-medium">{arp.orgaoGerenciador}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nº da Ata</p>
                <p className="font-medium text-primary">{arp.numeroAta}</p>
              </div>
              <div className="lg:col-span-2">
                <p className="text-sm text-muted-foreground">Objeto da ARP</p>
                <p className="font-medium">{arp.objeto}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vigência Inicial</p>
                <p className="font-medium">{new Date(arp.vigenciaInicial).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vigência Final</p>
                <p className={`font-medium ${diasRestantes < 90 ? 'text-[var(--warning)]' : ''}`}>
                  {new Date(arp.vigenciaFinal).toLocaleDateString('pt-BR')}
                  {diasRestantes < 90 && (
                    <span className="text-sm ml-2">({diasRestantes} dias restantes)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aceita Adesão (Carona)?</p>
                <p className="font-medium">{arp.aceitaAdesao ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renovável?</p>
                <p className="font-medium">{arp.renovavel ? 'Sim' : 'Não'}</p>
              </div>
              {arp.anexo && (
                <div className="lg:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Anexo da ARP</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {arp.anexo}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {mostrarAlertaRenovacao && (
            <Alert>
              <WarningTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Esta ARP é renovável.</strong> A vigência se encerra em {diasRestantes} dias.
                Considere negociar a renovação com o órgão gerenciador.
              </AlertDescription>
            </Alert>
          )}

          {mostrarAlertaCarona && (
            <Alert>
              <InfoCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Oportunidade comercial:</strong> Esta ARP ainda tem{' '}
                {formatCurrency(saldoCarona)} disponível em saldo de carona. Considere oferecer
                para órgãos interessados antes do vencimento.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ABA 2 - ITENS E SALDO */}
        <TabsContent value="itens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens Registrados e Controle de Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Qtd. Registrada</TableHead>
                      <TableHead className="text-right">Consumido (Órgão)</TableHead>
                      <TableHead className="text-right">Saldo Órgão</TableHead>
                      {arp.aceitaAdesao && (
                        <>
                          <TableHead className="text-right">Qtd. Carona</TableHead>
                          <TableHead className="text-right">Consumido (Carona)</TableHead>
                          <TableHead className="text-right">Saldo Carona</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arp.itens.map((item) => {
                      const saldoOrgaoItem = item.qtdRegistrada - item.qtdConsumidaOrgao;
                      const saldoCaronaItem = (item.qtdParaCarona ?? 0) - (item.qtdConsumidaCarona ?? 0);
                      const consumoOrgaoPct = (item.qtdConsumidaOrgao / item.qtdRegistrada) * 100;
                      const consumoCaronaPct = item.qtdParaCarona
                        ? ((item.qtdConsumidaCarona ?? 0) / item.qtdParaCarona) * 100
                        : 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell>{item.unidadeMedida}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.qtdRegistrada}</TableCell>
                          <TableCell className="text-right">{item.qtdConsumidaOrgao}</TableCell>
                          <TableCell className="text-right">
                            <div className="space-y-1 items-end flex flex-col">
                              <p className={saldoOrgaoItem === 0 ? 'text-[var(--danger)] font-medium' : ''}>
                                {saldoOrgaoItem}
                              </p>
                              <div className="h-1.5 bg-border rounded-full overflow-hidden w-16">
                                <div
                                  className={`h-full rounded-full ${
                                    consumoOrgaoPct < 80
                                      ? 'bg-[var(--success)]'
                                      : consumoOrgaoPct < 95
                                      ? 'bg-[var(--warning)]'
                                      : 'bg-[var(--danger)]'
                                  }`}
                                  style={{ width: `${consumoOrgaoPct}%` }}
                                />
                              </div>
                              {saldoOrgaoItem === 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <WarningTriangle className="h-3 w-3 text-[var(--danger)]" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-xs">
                                      Saldo do órgão esgotado — novos contratos para o órgão
                                      gerenciador serão bloqueados para este item.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          {arp.aceitaAdesao && (
                            <>
                              <TableCell className="text-right text-muted-foreground">
                                {item.qtdParaCarona ?? 0}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.qtdConsumidaCarona ?? 0}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="space-y-1 items-end flex flex-col">
                                  <p className={saldoCaronaItem === 0 ? 'text-[var(--danger)] font-medium' : ''}>
                                    {saldoCaronaItem}
                                  </p>
                                  <div className="h-1.5 bg-border rounded-full overflow-hidden w-16">
                                    <div
                                      className={`h-full rounded-full ${
                                        consumoCaronaPct < 80
                                          ? 'bg-[var(--success)]'
                                          : consumoCaronaPct < 95
                                          ? 'bg-[var(--warning)]'
                                          : 'bg-[var(--danger)]'
                                      }`}
                                      style={{ width: `${consumoCaronaPct}%` }}
                                    />
                                  </div>
                                  {saldoCaronaItem === 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <WarningTriangle className="h-3 w-3 text-[var(--danger)]" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs text-xs">
                                          Saldo de carona esgotado — novas adesões serão bloqueadas
                                          para este item.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Valor Total Registrado:</span>
                  <span className="text-lg font-medium">{formatCurrency(valorTotalRegistrado)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo do Órgão:</span>
                  <span className="text-lg font-medium text-primary">{formatCurrency(saldoOrgao)}</span>
                </div>
                {arp.aceitaAdesao && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Saldo de Carona:</span>
                    <span className="text-lg font-medium text-[var(--success)]">{formatCurrency(saldoCarona)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3 - CONTRATOS GERADOS */}
        <TabsContent value="contratos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldos Consolidados</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Valor Total Registrado</p>
                <p className="text-xl font-bold">{formatCurrency(valorTotalRegistrado)}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Saldo do Órgão</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(saldoOrgao)}</p>
              </div>
              {arp.aceitaAdesao && (
                <div className="p-4 rounded-lg bg-[var(--success)]/10">
                  <p className="text-sm text-muted-foreground mb-1">Saldo de Carona</p>
                  <p className="text-xl font-bold text-[var(--success)]">{formatCurrency(saldoCarona)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contratos e Empenhos Gerados ({arp.contratos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº do Instrumento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Origem do Saldo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arp.contratos.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell className="font-medium">{contrato.numeroInstrumento}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contrato.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={contrato.origemSaldo === 'Adesão (Carona)' ? 'success' : 'default'}
                          >
                            {contrato.origemSaldo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(contrato.valor)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contrato.status === 'Em Execução' ? 'default'
                              : contrato.status === 'Pago' ? 'success'
                              : 'outline'
                            }
                          >
                            {contrato.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/instrumentos/${contrato.id}`)}>
                            <OpenInBrowser className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                <Button onClick={() => navigate(`/atas/${id}/gerar-contrato`)} disabled={saldoOrgao === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Contrato a partir desta ARP
                </Button>
                {arp.aceitaAdesao && (
                  <Button variant="outline" onClick={() => navigate(`/atas/${id}/registrar-adesao`)} disabled={saldoCarona === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Adesão
                  </Button>
                )}
              </div>

              {saldoOrgao === 0 && (
                <Alert className="mt-4">
                  <WarningTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Saldo do órgão gerenciador esgotado para todos os itens.
                  </AlertDescription>
                </Alert>
              )}

              {arp.aceitaAdesao && saldoCarona === 0 && (
                <Alert className="mt-4">
                  <WarningTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Saldo de carona esgotado para todos os itens.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
