import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { CriarOrdemFornecimento } from '../components/CriarOrdemFornecimento';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  NavArrowLeft,
  Download,
  WarningTriangle,
  Page,
  Building,
  Package,
  BoxIso,
  DeliveryTruck,
  Link as LinkIcon,
  NavArrowDown,
  NavArrowUp,
} from 'iconoir-react';
import { useBuscarInstrumento } from '../hooks/useBuscarInstrumento';
import { useListarOrdensFornecimento } from '../hooks/useListarOrdensFornecimento';
import { useAvancarStatusOrdemFornecimento } from '../hooks/useAvancarStatusOrdemFornecimento';
import type { StatusInstrumento, StatusOrdemFornecimento } from '../../domain/entities/instrumentoContratual';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

function getStatusOFBadge(status: StatusOrdemFornecimento) {
  const labels: Record<StatusOrdemFornecimento, string> = {
    pedido_recebido: 'Pedido Recebido',
    em_separacao: 'Em Separação',
    despachado: 'Despachado',
    entregue: 'Entregue',
    pago: 'Pago',
  };
  const colors: Record<StatusOrdemFornecimento, string> = {
    pedido_recebido: 'bg-gray-100 text-gray-700 border-gray-200',
    em_separacao: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    despachado: 'bg-blue-50 text-blue-700 border-blue-200',
    entregue: 'bg-green-50 text-green-700 border-green-200',
    pago: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <Badge className={`text-xs border ${colors[status]}`}>
      {labels[status]}
    </Badge>
  );
}

function getStatusBadge(status: StatusInstrumento) {
  switch (status) {
    case 'ATIVA':
      return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em Execução</Badge>;
    case 'PROXIMA_AO_VENCIMENTO':
      return <Badge className="bg-[#F39C12] text-white border-[#F39C12]">Próximo ao Vencimento</Badge>;
    case 'ENCERRADA':
      return <Badge className="bg-gray-500 text-white border-gray-500">Encerrado</Badge>;
  }
}

function getProximoStatus(status: StatusOrdemFornecimento): 'em_separacao' | 'despachado' | 'entregue' | null {
  const transitions: Partial<Record<StatusOrdemFornecimento, 'em_separacao' | 'despachado' | 'entregue'>> = {
    pedido_recebido: 'em_separacao',
    em_separacao: 'despachado',
    despachado: 'entregue',
  };
  return transitions[status] ?? null;
}

function getLabelProximoStatus(status: 'em_separacao' | 'despachado' | 'entregue'): string {
  const labels = {
    em_separacao: 'Em Separação',
    despachado: 'Despachado',
    entregue: 'Entregue',
  };
  return labels[status];
}

export function NotaEmpenhoDetalhesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { instrumento, isLoading, error, refetch } = useBuscarInstrumento(id ?? '');
  const { dados: ordensData, isLoading: isLoadingOrdens, refetch: refetchOrdens } = useListarOrdensFornecimento(id ?? '');
  const { avancar, isLoading: isAvancarLoading, error: avancarError } = useAvancarStatusOrdemFornecimento();
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(true);
  const [paginaItens, setPaginaItens] = useState(1);
  const [emitirOFOpen, setEmitirOFOpen] = useState(false);
  const [avancarLoadingId, setAvancarLoadingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-accent animate-pulse rounded" />
        <div className="h-64 bg-accent animate-pulse rounded-lg" />
        <div className="h-48 bg-accent animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !instrumento || instrumento.tipo !== 'EMPENHO') {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">
              {error ?? 'Nota de Empenho não encontrada.'}
            </p>
            {error && (
              <Button variant="outline" onClick={refetch} className="mr-2">
                Tentar novamente
              </Button>
            )}
            <Button onClick={() => navigate('/instrumentos/gestao')} className="mt-2">
              Voltar para gestão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { empenho, itens, ataId } = instrumento;
  const titulo = empenho.numeroPncp ?? 'Número PNCP não informado';
  const valorTotal = itens.reduce((s, i) => s + i.valorTotal, 0);

  const itensPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(itens.length / itensPorPagina));
  const paginaAtual = Math.min(Math.max(1, paginaItens), totalPaginas);
  const itensPaginados = itens.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: titulo },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/instrumentos/gestao')}
            className="h-9 w-9 p-0 lg:h-10 lg:w-10"
          >
            <NavArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl lg:text-4xl">{titulo}</h1>
              {ataId !== null && <Badge variant="outline" className="text-xs">ARP</Badge>}
              {getStatusBadge(empenho.status)}
            </div>
            <p className="text-muted-foreground text-sm lg:text-base">{empenho.objeto}</p>
          </div>
        </div>
        {empenho.anexoUrl && (
          <Button variant="outline" className="gap-2 h-9 lg:h-10" asChild>
            <a href={empenho.anexoUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Baixar Nota
            </a>
          </Button>
        )}
      </div>

      {/* Alerta de vigência próxima */}
      {empenho.status === 'PROXIMA_AO_VENCIMENTO' && (
        <div className="bg-[#F39C12]/10 border border-[#F39C12]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningTriangle className="h-5 w-5 text-[#F39C12] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#F39C12] mb-1">
                Vigência da ARP Próxima ao Fim
              </h3>
              <p className="text-sm">
                A Ata de Registro de Preços vinculada está próxima ao vencimento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Detalhes do Empenho</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetalhesExpandidos(!detalhesExpandidos)}
              className="h-8 w-8 p-0"
            >
              {detalhesExpandidos ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {detalhesExpandidos && (
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:divide-x">
              {/* Informações Gerais */}
              <div className="flex-1 lg:pr-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Building className="h-4 w-4" />
                  Informações Gerais
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Órgão Contratante</p>
                    <p className="text-sm font-medium">{empenho.orgaoContratante}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Unidade</p>
                    <p className="text-sm">{empenho.unidade}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Objeto</p>
                    <p className="text-sm leading-relaxed">{empenho.objeto}</p>
                  </div>
                  {empenho.numeroPncp && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Nº PNCP</p>
                      <p className="text-sm font-mono">{empenho.numeroPncp}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos */}
              <div className="flex-1 lg:pl-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Page className="h-4 w-4" />
                  Documentos
                </h3>
                {empenho.anexoUrl ? (
                  <a
                    href={empenho.anexoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#DD4B39]/10 flex items-center justify-center flex-shrink-0">
                        <Page className="h-4 w-4 text-[#DD4B39]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nota de Empenho</p>
                        <p className="text-xs text-muted-foreground">{titulo}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" tabIndex={-1}>
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum anexo disponível</p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ARP de Origem */}
      {ataId !== null && (
        <Card className="border-[#06D6A0]/20 bg-[#06D6A0]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <LinkIcon className="h-5 w-5 text-[#06D6A0]" />
              ARP de Origem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border border-[#06D6A0]/20 rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#06D6A0]" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ata de Registro de Preços</p>
                  <p className="text-xs text-muted-foreground font-mono">{ataId}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate(`/atas/detalhes/${ataId}`)}
              >
                Ver ARP
                <NavArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Este empenho foi originado a partir desta Ata de Registro de Preços
            </p>
          </CardContent>
        </Card>
      )}

      {/* Itens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <BoxIso className="h-5 w-5" />
            Itens do Empenho
            {itens.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                Valor total: {formatCurrency(valorTotal)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {itens.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BoxIso className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item registrado.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Descrição</TableHead>
                      <TableHead className="text-xs">Unid. Med.</TableHead>
                      <TableHead className="text-right text-xs">Qtd. Total</TableHead>
                      <TableHead className="text-right text-xs">Valor Unitário</TableHead>
                      <TableHead className="text-right text-xs">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensPaginados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell className="font-mono text-sm">{item.unidadeMedida}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{item.quantidadeTotal}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-sm">
                          {formatCurrency(item.valorUnitario)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Exibindo {itensPaginados.length} de {itens.length} itens
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={paginaAtual <= 1}
                      onClick={() => setPaginaItens(paginaAtual - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">{paginaAtual} / {totalPaginas}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={paginaAtual >= totalPaginas}
                      onClick={() => setPaginaItens(paginaAtual + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ordens de Fornecimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <DeliveryTruck className="h-5 w-5" />
            Ordens de Fornecimento
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setEmitirOFOpen(true)}
            disabled={itens.length === 0}
          >
            Emitir OF
          </Button>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoadingOrdens && (
            <div className="space-y-2">
              <div className="h-12 bg-accent animate-pulse rounded" />
              <div className="h-12 bg-accent animate-pulse rounded" />
            </div>
          )}

          {/* Empty state */}
          {!isLoadingOrdens && (!ordensData || ordensData.ordensFornecimento.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <DeliveryTruck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Nenhuma ordem de fornecimento</p>
              <p className="text-xs">Emita a primeira OF usando o botão acima.</p>
            </div>
          )}

          {/* Saldo remanescente */}
          {!isLoadingOrdens && ordensData && ordensData.ordensFornecimento.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm font-medium">Saldo remanescente</p>
                <p className="text-sm font-mono font-semibold text-[#0050FF]">
                  {formatCurrency(ordensData.saldoRemanescente)}
                </p>
              </div>

              {/* OF list */}
              <div className="space-y-2">
                {ordensData.ordensFornecimento.map((of) => {
                  const proximoStatus = getProximoStatus(of.status);
                  return (
                    <div key={of.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-semibold text-muted-foreground">
                          OF #{of.codigo}
                        </span>
                        {getStatusOFBadge(of.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(of.dataRecebimento)}</span>
                        <span className="font-mono font-semibold text-foreground">
                          {formatCurrency(of.valorTotal)}
                        </span>
                        {proximoStatus && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={avancarLoadingId === of.id}
                            onClick={async () => {
                              setAvancarLoadingId(of.id);
                              try {
                                await avancar({ id: of.id, status: proximoStatus });
                                refetchOrdens();
                              } catch {
                                // error displayed via avancarError
                              } finally {
                                setAvancarLoadingId(null);
                              }
                            }}
                            className="text-xs h-7"
                          >
                            {avancarLoadingId === of.id ? '...' : `→ ${getLabelProximoStatus(proximoStatus)}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {avancarError && (
                <p className="text-xs text-destructive mt-2">{avancarError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CriarOrdemFornecimento Dialog */}
      <CriarOrdemFornecimento
        open={emitirOFOpen}
        onOpenChange={setEmitirOFOpen}
        instrumentoId={instrumento.instrumentoId}
        itensContrato={itens}
        onSuccess={refetchOrdens}
      />
    </div>
  );
}
