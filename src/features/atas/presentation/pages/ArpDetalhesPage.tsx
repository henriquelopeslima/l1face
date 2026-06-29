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
  WarningTriangle,
  Plus,
  OpenInBrowser,
  RefreshDouble,
} from 'iconoir-react';
import { LoadingLogo } from '@/shared/components/feedback/LoadingLogo';
import type { AtaStatus } from '../../domain/entities/ata';
import type { ItemAta } from '../../domain/entities/ataDetalhes';
import { useGetAta } from '../hooks/useGetAta';

const STATUS_LABELS: Record<AtaStatus, string> = {
  ATIVA: 'Ativa',
  PROXIMA_AO_VENCIMENTO: 'Próxima ao Vencimento',
  ENCERRADA: 'Encerrada',
};

function getBadgeVariant(status: AtaStatus): 'success' | 'warning' | 'outline' {
  if (status === 'ATIVA') return 'success';
  if (status === 'PROXIMA_AO_VENCIMENTO') return 'warning';
  return 'outline';
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

function calcularDiasRestantes(dataFim: string): number {
  const hoje = new Date();
  const fim = new Date(dataFim);
  return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function calcularSaldoOrgaoItem(item: ItemAta): number {
  return item.qtdSaldoOrgao;
}

function calcularSaldoCaronaItem(item: ItemAta): number {
  return item.qtdSaldoCarona;
}

export function ArpDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ata, isLoading, error, refetch } = useGetAta(id ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/atas/gestao')} className="gap-2 h-9">
          <NavArrowLeft className="h-4 w-4" />
          Voltar para Listagem
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <WarningTriangle className="h-8 w-8 text-[var(--danger)]" />
              <p className="text-[var(--danger)]">{error}</p>
              <Button variant="outline" onClick={refetch}>
                <RefreshDouble className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ata) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">ARP não encontrada</p>
        <Button onClick={() => navigate('/atas/gestao')}>Voltar para Listagem</Button>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes(ata.dataFimVigencia);

  const saldoOrgao = ata.itens.reduce(
    (acc, i) => acc + calcularSaldoOrgaoItem(i) * i.valorEstimado,
    0,
  );
  const saldoCarona = ata.aceitaAdesao
    ? ata.itens.reduce((acc, i) => acc + calcularSaldoCaronaItem(i) * i.valorEstimado, 0)
    : 0;
  const valorTotalRegistrado = ata.itens.reduce(
    (acc, i) => acc + i.qtdOrgao * i.valorEstimado,
    0,
  );

  const mostrarAlertaRenovacao = ata.renovavel && diasRestantes < 90;
  const mostrarAlertaCarona = ata.aceitaAdesao && saldoCarona > 0 && diasRestantes < 90;

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-4xl">{ata.numero}</h1>
              <Badge variant={getBadgeVariant(ata.status)}>{STATUS_LABELS[ata.status]}</Badge>
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">{ata.nomeOrgaoGerenciador}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/atas/${id}/gerar-contrato`)}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar Contrato
          </Button>
          {ata.aceitaAdesao && (
            <Button variant="outline" onClick={() => navigate(`/atas/${id}/registrar-adesao`)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Adesão
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados">
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
                <p className="text-sm text-muted-foreground">Nº da Ata</p>
                <p className="font-medium text-primary">{ata.numero}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Órgão gerenciador</p>
                <p className="font-medium">{ata.nomeOrgaoGerenciador}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ do Órgão</p>
                <p className="font-medium">{ata.cnpjOrgaoGerenciador}</p>
              </div>
              <div className="lg:col-span-2">
                <p className="text-sm text-muted-foreground">Objeto da ARP</p>
                <p className="font-medium">{ata.descricao}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vigência Inicial</p>
                <p className="font-medium">{formatDate(ata.dataInicioVigencia)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vigência Final</p>
                <p className={`font-medium ${diasRestantes < 90 ? 'text-[var(--warning)]' : ''}`}>
                  {formatDate(ata.dataFimVigencia)}
                  {diasRestantes > 0 && diasRestantes < 90 && (
                    <span className="text-sm ml-2">({diasRestantes} dias restantes)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aceita Adesão (Carona)?</p>
                <p className="font-medium">{ata.aceitaAdesao ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renovável?</p>
                <p className="font-medium">{ata.renovavel ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Número PNCP</p>
                <p className="font-medium">{ata.numeroPncp ?? 'Não informado'}</p>
              </div>
              {ata.anexoUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Anexo da ARP</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={ata.anexoUrl} target="_blank" rel="noopener noreferrer">
                      <OpenInBrowser className="h-4 w-4 mr-2" />
                      Abrir anexo
                    </a>
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
              <WarningTriangle className="h-4 w-4" />
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
                      <TableHead>Nº</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Qtd. Registrada</TableHead>
                      <TableHead className="text-right">Consumido (Órgão)</TableHead>
                      <TableHead className="text-right">Saldo Órgão</TableHead>
                      {ata.aceitaAdesao && (
                        <>
                          <TableHead className="text-right">Qtd. Carona</TableHead>
                          <TableHead className="text-right">Consumido (Carona)</TableHead>
                          <TableHead className="text-right">Saldo Carona</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ata.itens.map((item) => {
                      const saldoOrgaoItem = calcularSaldoOrgaoItem(item);
                      const saldoCaronaItem = calcularSaldoCaronaItem(item);
                      const consumoOrgaoPct =
                        item.qtdOrgao > 0
                          ? ((item.qtdOrgao - item.qtdSaldoOrgao) / item.qtdOrgao) * 100
                          : 0;
                      const consumoCaronaPct =
                        item.qtdCarona > 0
                          ? ((item.qtdCarona - item.qtdSaldoCarona) / item.qtdCarona) * 100
                          : 0;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.numeroItem}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>{item.unidadeMedida}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.valorEstimado)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.qtdOrgao}</TableCell>
                          <TableCell className="text-right">{item.qtdOrgao - item.qtdSaldoOrgao}</TableCell>
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
                                      Saldo do órgão esgotado — novos contratos serão bloqueados para este item.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          {ata.aceitaAdesao && (
                            <>
                              <TableCell className="text-right text-muted-foreground">
                                {item.qtdCarona}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.qtdCarona - item.qtdSaldoCarona}
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
                                          Saldo de carona esgotado — novas adesões serão bloqueadas para este item.
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
                {ata.aceitaAdesao && (
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
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-12 text-center text-muted-foreground">
                <p>Visualização de contratos gerados em breve.</p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate(`/atas/${id}/gerar-contrato`)} disabled={saldoOrgao === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerar Contrato
                  </Button>
                  {ata.aceitaAdesao && (
                    <Button variant="outline" onClick={() => navigate(`/atas/${id}/registrar-adesao`)} disabled={saldoCarona === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Adesão
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
