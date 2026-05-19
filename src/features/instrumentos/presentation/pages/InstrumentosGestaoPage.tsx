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
import type { InstrumentoListagem, TipoInstrumentoContratual } from '@/features/instrumentos/domain/entities/instrumentoContratual';

type FiltroSegmento = 'todos' | 'contrato' | 'empenho';

const INSTRUMENTOS_MOCK: InstrumentoListagem[] = [
  { id: 'CT-001', tipo: 'contrato', numeroInstrumento: '042/2024', isARP: false, orgaoContratante: 'Prefeitura Municipal de Russas', secretaria: 'SEMED', objeto: 'Merenda Escolar', vigenciaInicio: '2024-04-01', vigenciaFim: '2026-03-31', valorGlobal: 250000, saldoAtual: 28000, status: 'proximo-vencimento' },
  { id: 'CT-002', tipo: 'contrato', numeroInstrumento: '118/2025', isARP: false, orgaoContratante: 'Governo do Estado do Ceará', secretaria: 'SEDUC', objeto: 'Material de Expediente', vigenciaInicio: '2025-01-15', vigenciaFim: '2026-06-15', valorGlobal: 80000, saldoAtual: 52000, status: 'em-execucao' },
  { id: 'NE-001', tipo: 'nota-empenho', numeroInstrumento: 'NE 88442/2025', isARP: false, orgaoContratante: 'Prefeitura de Fortaleza', secretaria: 'SMS', objeto: 'Medicamentos diversos', vigenciaInicio: '2025-03-01', vigenciaFim: '', prazoEntregaOF: '2026-02-15', valorGlobal: 120000, saldoAtual: 88000, status: 'em-execucao' },
  { id: 'OU-001', tipo: 'outro', numeroInstrumento: 'ACT-03/2025', isARP: false, orgaoContratante: 'Câmara Municipal de Aquiraz', secretaria: 'Administrativo', objeto: 'Termo de cooperação técnica', vigenciaInicio: '2025-06-01', vigenciaFim: '2027-05-31', valorGlobal: 45000, saldoAtual: 45000, status: 'em-execucao' },
  { id: 'CT-003', tipo: 'contrato', numeroInstrumento: '203/2025', isARP: true, orgaoContratante: 'Prefeitura de Fortaleza', secretaria: 'SMS', objeto: 'Material Hospitalar', vigenciaInicio: '2025-02-10', vigenciaFim: '2026-09-10', valorGlobal: 420000, saldoAtual: 310000, status: 'em-execucao' },
  { id: 'NE-002', tipo: 'nota-empenho', numeroInstrumento: 'NE 55223/2025', isARP: false, orgaoContratante: 'Secretaria de Educação de Fortaleza', secretaria: 'SEDFOR', objeto: 'Equipamentos de informática e impressoras', vigenciaInicio: '2025-04-15', vigenciaFim: '', prazoEntregaOF: '2025-12-20', valorGlobal: 95000, saldoAtual: 72500, status: 'em-execucao' },
];

function dataReferenciaAlerta(row: InstrumentoListagem): string {
  if (row.tipo === 'nota-empenho' && row.prazoEntregaOF) return row.prazoEntregaOF;
  return row.vigenciaFim;
}

function calcularDiasRestantes(dataAlvo: string): number {
  if (!dataAlvo) return Infinity;
  const hoje = new Date();
  const fim = new Date(dataAlvo);
  return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

function badgeTipo(t: TipoInstrumentoContratual) {
  if (t === 'contrato') return <Badge className="border-0 bg-[#0050FF] text-white hover:bg-[#0050FF]/90">Contrato</Badge>;
  if (t === 'nota-empenho') return <Badge className="border-0 bg-[#4B5563] text-white hover:bg-[#4B5563]/90">Empenho</Badge>;
  return <Badge variant="outline" className="border-border bg-muted/80 text-muted-foreground">Outro</Badge>;
}

function getStatusBadge(status: InstrumentoListagem['status']) {
  switch (status) {
    case 'em-execucao': return <Badge className="bg-[#0050FF] text-white border-[#0050FF]">Em execução</Badge>;
    case 'proximo-vencimento': return <Badge className="bg-[#F39C12] text-white border-[#F39C12]">Próx. vencimento</Badge>;
    case 'encerrado': return <Badge className="bg-gray-500 text-white border-gray-500">Encerrado</Badge>;
    case 'renovavel': return <Badge className="bg-[#06D6A0] text-white border-[#06D6A0]">Renovável</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export function InstrumentosGestaoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('tipo');
  const segmento: FiltroSegmento = raw === 'contrato' || raw === 'empenho' ? (raw as FiltroSegmento) : 'todos';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const setSegmento = (s: FiltroSegmento) => {
    const next = new URLSearchParams(searchParams);
    if (s === 'todos') next.delete('tipo');
    else next.set('tipo', s);
    setSearchParams(next, { replace: true });
  };

  const filtrados = useMemo(() => {
    return INSTRUMENTOS_MOCK.filter((row) => {
      if (segmento === 'contrato' && row.tipo !== 'contrato') return false;
      if (segmento === 'empenho' && row.tipo !== 'nota-empenho') return false;
      const q = searchTerm.toLowerCase();
      return !q || row.objeto.toLowerCase().includes(q) || row.numeroInstrumento.toLowerCase().includes(q) || row.orgaoContratante.toLowerCase().includes(q) || row.secretaria.toLowerCase().includes(q);
    });
  }, [segmento, searchTerm]);

  const stats = useMemo(() => ({
    total: INSTRUMENTOS_MOCK.length,
    contratos: INSTRUMENTOS_MOCK.filter((r) => r.tipo === 'contrato').length,
    empenhos: INSTRUMENTOS_MOCK.filter((r) => r.tipo === 'nota-empenho').length,
  }), []);

  const segmentButtons: { id: FiltroSegmento; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'contrato', label: 'Contratos' },
    { id: 'empenho', label: 'Empenhos' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Instrumentos' }, { label: 'Gestão' }]} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold sm:text-xl lg:text-4xl">Instrumentos contratuais</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            Listagem unificada de contratos, notas de empenho e demais instrumentos.
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
                <TableHead className="w-[110px]">Vigência / Prazo</TableHead>
                <TableHead className="w-[100px] text-right">Valor</TableHead>
                <TableHead className="w-[100px] text-right">Saldo</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Nenhum instrumento encontrado.</TableCell>
                </TableRow>
              ) : (
                filtrados.flatMap((row) => {
                  const ref = dataReferenciaAlerta(row);
                  const dias = calcularDiasRestantes(ref);
                  const expanded = expandedRow === row.id;
                  const colVig = row.tipo === 'nota-empenho' ? (
                    <div><p className="font-mono text-xs">{formatDate(row.prazoEntregaOF ?? '')}</p><p className="text-[10px] text-muted-foreground">Prazo entrega (OF)</p></div>
                  ) : (
                    <div><p className="font-mono text-xs">{formatDate(row.vigenciaFim)}</p><p className="text-[10px] text-muted-foreground">Fim vigência</p></div>
                  );

                  return [
                    <TableRow key={row.id} className="cursor-pointer border-b hover:bg-accent/50" onClick={() => setExpandedRow(expanded ? null : row.id)}>
                      <TableCell className="pl-6">{badgeTipo(row.tipo)}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        <div className="flex items-center gap-1">
                          {row.numeroInstrumento}
                          {row.isARP && <Badge variant="outline" className="h-4 px-1 text-[9px]">ARP</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="truncate text-xs font-medium">{row.orgaoContratante}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{row.secretaria}</p>
                      </TableCell>
                      <TableCell><p className="line-clamp-2 text-xs">{row.objeto}</p></TableCell>
                      <TableCell>{colVig}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">{formatCurrency(row.valorGlobal)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">{formatCurrency(row.saldoAtual)}</TableCell>
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
                              <p className="text-xs font-medium text-muted-foreground">Referência para alerta</p>
                              <p className="font-mono text-sm">{formatDate(ref)}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {row.tipo === 'nota-empenho' ? 'Empenhos: prazo da OF mais antiga em aberto.' : 'Contratos / outros: data fim de vigência.'}
                                {dias !== Infinity && <span className="mt-1 block">{dias} dias em relação a hoje (mock).</span>}
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={!row.id.startsWith('CT-') && !row.id.startsWith('NE-')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (row.id.startsWith('CT-')) navigate(`/contratos/detalhes/${row.id}`);
                                  else if (row.id.startsWith('NE-')) navigate(`/notas-empenho/detalhes/${row.id}`);
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
        {filtrados.map((row) => (
          <Card key={row.id}>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                {badgeTipo(row.tipo)}
                {getStatusBadge(row.status)}
              </div>
              <p className="font-mono font-semibold">{row.numeroInstrumento}</p>
              <p className="text-xs text-muted-foreground">{row.orgaoContratante}</p>
              <p className="text-xs">{row.objeto}</p>
              <div className="flex justify-between border-t pt-2 text-xs">
                <span className="text-muted-foreground">{row.tipo === 'nota-empenho' ? 'Prazo OF' : 'Vigência fim'}</span>
                <span className="font-mono">{formatDate(dataReferenciaAlerta(row))}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!row.id.startsWith('CT-') && !row.id.startsWith('NE-')}
                onClick={() => {
                  if (row.id.startsWith('CT-')) navigate(`/contratos/detalhes/${row.id}`);
                  else if (row.id.startsWith('NE-')) navigate(`/notas-empenho/detalhes/${row.id}`);
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
