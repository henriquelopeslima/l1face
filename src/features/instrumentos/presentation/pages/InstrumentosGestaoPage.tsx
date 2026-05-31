import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Search, Plus, Page, NavArrowDown, NavArrowUp, Cart } from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';
import { useListarInstrumentos } from '../hooks/useListarInstrumentos';
import type { TipoInstrumento, StatusInstrumento, InstrumentoListagem } from '@/features/instrumentos/domain/entities/instrumentoContratual';

type FiltroSegmento = 'todos' | 'CONTRATO' | 'EMPENHO';

function calcularDiasRestantes(dataAlvo: string): number {
  if (!dataAlvo) return Infinity;
  const hoje = new Date();
  const fim = new Date(dataAlvo);
  return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function badgeTipo(t: TipoInstrumento) {
  if (t === 'CONTRATO') return <Badge className="border-0 bg-[#0050FF] text-white hover:bg-[#0050FF]/90">Contrato</Badge>;
  return <Badge className="border-0 bg-[#4B5563] text-white hover:bg-[#4B5563]/90">Empenho</Badge>;
}

function getStatusBadge(status: StatusInstrumento) {
  switch (status) {
    case 'ATIVA': return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em execução</Badge>;
    case 'PROXIMA_AO_VENCIMENTO': return <Badge className="bg-[#F39C12] text-white border-[#F39C12]">Próx. vencimento</Badge>;
    case 'ENCERRADA': return <Badge className="bg-gray-500 text-white border-gray-500">Encerrado</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export function InstrumentosGestaoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('tipo');
  const segmento: FiltroSegmento = raw === 'CONTRATO' || raw === 'EMPENHO' ? (raw as FiltroSegmento) : 'todos';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { instrumentos, isLoading, error } = useListarInstrumentos();

  const setSegmento = (s: FiltroSegmento) => {
    const next = new URLSearchParams(searchParams);
    if (s === 'todos') next.delete('tipo');
    else next.set('tipo', s);
    setSearchParams(next, { replace: true });
  };

  const filtrados = useMemo(() => {
    return instrumentos.filter((row) => {
      if (segmento === 'CONTRATO' && row.tipo !== 'CONTRATO') return false;
      if (segmento === 'EMPENHO' && row.tipo !== 'EMPENHO') return false;
      const q = searchTerm.toLowerCase();
      return !q || row.objeto.toLowerCase().includes(q) || (row.numero ?? '').toLowerCase().includes(q) || row.orgao.toLowerCase().includes(q) || row.unidade.toLowerCase().includes(q);
    });
  }, [segmento, searchTerm, instrumentos]);

  const stats = useMemo(() => ({
    total: instrumentos.length,
    contratos: instrumentos.filter((r) => r.tipo === 'CONTRATO').length,
    empenhos: instrumentos.filter((r) => r.tipo === 'EMPENHO').length,
  }), [instrumentos]);

  const segmentButtons: { id: FiltroSegmento; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'CONTRATO', label: 'Contratos' },
    { id: 'EMPENHO', label: 'Empenhos' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Instrumentos' }, { label: 'Gestão' }]} />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm">Carregando instrumentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Instrumentos' }, { label: 'Gestão' }]} />
        <Card>
          <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Instrumentos' }, { label: 'Gestão' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold sm:text-xl lg:text-4xl">Instrumentos contratuais</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            Listagem unificada de contratos e notas de empenho.
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/instrumentos/cadastrar')}>
          <Plus className="h-4 w-4" />
          Cadastrar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {segmentButtons.map((b) => (
          <Button
            key={b.id}
            type="button"
            variant={segmento === b.id ? 'default' : 'outline'}
            size="sm"
            className={cn(segmento === b.id && 'bg-[#0050FF] hover:bg-[#0050FF]/90')}
            onClick={() => setSegmento(b.id)}
          >
            {b.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total na base</p><p className="text-2xl font-semibold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Contratos</p><p className="text-2xl font-semibold text-[#0050FF]">{stats.contratos}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Notas de empenho</p><p className="text-2xl font-semibold text-[#4B5563]">{stats.empenhos}</p></CardContent></Card>
      </div>

      {/* Desktop table */}
      <Card className="hidden lg:block">
        <CardHeader className="space-y-4 pb-4">
          <div className="max-w-sm">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Número, objeto, órgão..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <CardTitle>Instrumentos cadastrados</CardTitle>
            <span className="text-sm text-muted-foreground">{filtrados.length} resultado(s)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px] pl-6">Tipo</TableHead>
                <TableHead className="w-[100px]">Nº</TableHead>
                <TableHead className="min-w-[140px]">Cliente / Unidade</TableHead>
                <TableHead className="min-w-[120px]">Objeto</TableHead>
                <TableHead className="w-[110px]">Prazo final</TableHead>
                <TableHead className="w-[100px] text-right">Valor</TableHead>
                <TableHead className="w-[100px] text-right">Saldo</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    {instrumentos.length === 0
                      ? 'Nenhum instrumento cadastrado. Clique em "Cadastrar" para começar.'
                      : 'Nenhum instrumento encontrado para os filtros aplicados.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.flatMap((row) => {
                  const dias = row.prazoFinal ? calcularDiasRestantes(row.prazoFinal) : Infinity;
                  const expanded = expandedRow === row.id;

                  return [
                    <TableRow key={row.id} className="cursor-pointer border-b hover:bg-accent/50" onClick={() => setExpandedRow(expanded ? null : row.id)}>
                      <TableCell className="pl-6">{badgeTipo(row.tipo)}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        {row.numero ?? '—'}
                      </TableCell>
                      <TableCell>
                        <p className="truncate text-xs font-medium">{row.orgao}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{row.unidade}</p>
                      </TableCell>
                      <TableCell><p className="line-clamp-2 text-xs">{row.objeto}</p></TableCell>
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs">{formatDate(row.prazoFinal)}</p>
                          {row.prazoFinal && <p className="text-[10px] text-muted-foreground">Fim vigência</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">{formatCurrency(row.valor)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">{formatCurrency(row.saldo)}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>
                        {expanded ? <NavArrowUp className="h-4 w-4 text-muted-foreground" /> : <NavArrowDown className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>,
                    expanded && (
                      <TableRow key={`${row.id}-ex`} className="border-b bg-muted/20">
                        <TableCell colSpan={9} className="py-4">
                          <div className="grid gap-3 px-2 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Prazo final</p>
                              <p className="font-mono text-sm">{formatDate(row.prazoFinal)}</p>
                              {row.prazoFinal && dias !== Infinity && (
                                <p className="mt-1 text-xs text-muted-foreground">{dias} dias em relação a hoje.</p>
                              )}
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (row.tipo === 'CONTRATO') navigate(`/contratos/detalhes/${row.id}`);
                                  else navigate(`/notas-empenho/detalhes/${row.id}`);
                                }}
                              >
                                <Page className="h-4 w-4" />
                                Detalhes
                              </Button>
                              <Button size="sm" className="gap-2" onClick={(e) => e.stopPropagation()}>
                                <Cart className="h-4 w-4" />
                                OFs
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  ].filter(Boolean);
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {filtrados.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {instrumentos.length === 0
              ? 'Nenhum instrumento cadastrado. Clique em "Cadastrar" para começar.'
              : 'Nenhum instrumento encontrado.'}
          </p>
        )}
        {filtrados.map((row: InstrumentoListagem) => (
          <Card key={row.id}>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                {badgeTipo(row.tipo)}
                {getStatusBadge(row.status)}
              </div>
              <p className="font-mono font-semibold">{row.numero ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{row.orgao}</p>
              <p className="text-xs">{row.objeto}</p>
              <div className="flex justify-between border-t pt-2 text-xs">
                <span className="text-muted-foreground">Prazo final</span>
                <span className="font-mono">{formatDate(row.prazoFinal)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (row.tipo === 'CONTRATO') navigate(`/contratos/detalhes/${row.id}`);
                  else navigate(`/notas-empenho/detalhes/${row.id}`);
                }}
              >
                Abrir detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
