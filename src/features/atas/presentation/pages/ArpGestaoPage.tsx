import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Plus, Search, NavArrowDown, NavArrowUp, WarningTriangle, RefreshDouble } from 'iconoir-react';
import { LoadingLogo } from '@/shared/components/feedback/LoadingLogo';
import type { Ata, AtaStatus } from '../../domain/entities/ata';
import { useListarAtas } from '../hooks/useListarAtas';

type StatusFilter = 'todas' | AtaStatus;

const STATUS_LABELS: Record<AtaStatus, string> = {
  ATIVA: 'Ativa',
  PROXIMA_AO_VENCIMENTO: 'Próxima ao Vencimento',
  ENCERRADA: 'Encerrada',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

function calcularDiasRestantes(vigenciaFim: string): number {
  const hoje = new Date();
  const dataFim = new Date(vigenciaFim);
  return Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function getAlertaVencimento(vigenciaFim: string, status: AtaStatus) {
  if (status === 'ENCERRADA') return null;
  const dias = calcularDiasRestantes(vigenciaFim);
  if (dias < 30) return { cor: 'bg-[var(--danger)]', label: '< 30 dias' };
  if (dias <= 90) return { cor: 'bg-[var(--warning)]', label: '30-90 dias' };
  if (dias <= 180) return { cor: 'bg-primary', label: '90-180 dias' };
  return null;
}

function getBadgeVariant(status: AtaStatus): 'success' | 'warning' | 'outline' {
  if (status === 'ATIVA') return 'success';
  if (status === 'PROXIMA_AO_VENCIMENTO') return 'warning';
  return 'outline';
}

export function ArpGestaoPage() {
  const navigate = useNavigate();
  const { atas, isLoading, error, refetch } = useListarAtas();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtradas = atas.filter((ata) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      ata.numero.toLowerCase().includes(q) ||
      ata.orgaoGerenciador.nome.toLowerCase().includes(q) ||
      ata.objeto.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'todas' || ata.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleExpand = (id: string) => setExpandedRow(expandedRow === id ? null : id);

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
        <div className="space-y-1">
          <h1 className="text-xl lg:text-4xl">Gestão de Atas de Registro de Preços</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Controle do potencial de vendas e saldos das ARPs</p>
        </div>
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl lg:text-4xl">Gestão de Atas de Registro de Preços</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Controle do potencial de vendas e saldos das ARPs</p>
        </div>
        <Button onClick={() => navigate('/atas/cadastrar')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova ARP
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, órgão ou objeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="ATIVA">Ativas</SelectItem>
                <SelectItem value="PROXIMA_AO_VENCIMENTO">Próximas ao Vencimento</SelectItem>
                <SelectItem value="ENCERRADA">Encerradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ARPs Cadastradas ({filtradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº da Ata</TableHead>
                  <TableHead>Órgão gerenciador</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Vigência final</TableHead>
                  <TableHead className="text-right">Valor registrado</TableHead>
                  <TableHead className="text-right">Saldo Órgão</TableHead>
                  <TableHead className="text-center">Contratos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {atas.length === 0 ? 'Nenhuma ARP cadastrada ainda.' : 'Nenhuma ARP encontrada para os filtros aplicados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtradas.flatMap((ata: Ata) => {
                    const alerta = getAlertaVencimento(ata.vigenciaFinal, ata.status);
                    const isExpanded = expandedRow === ata.id;
                    const valorConsumido = ata.valorRegistrado - ata.saldo;
                    const percentualConsumo = ata.valorRegistrado > 0
                      ? (valorConsumido / ata.valorRegistrado) * 100
                      : 0;

                    return [
                      <TableRow
                        key={ata.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(ata.id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {alerta && (
                              <div
                                className={`h-2 w-2 rounded-full shrink-0 ${alerta.cor}`}
                                title={`Vencimento em ${alerta.label}`}
                              />
                            )}
                            {ata.numero}
                          </div>
                        </TableCell>
                        <TableCell>{ata.orgaoGerenciador.nome}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ata.objeto}</TableCell>
                        <TableCell>{formatDate(ata.vigenciaFinal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(ata.valorRegistrado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(ata.saldo)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/instrumentos/gestao?arp=${ata.id}`);
                            }}
                          >
                            {ata.contratos}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(ata.status)}>
                            {STATUS_LABELS[ata.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isExpanded ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
                        </TableCell>
                      </TableRow>,
                      isExpanded && (
                        <TableRow key={`${ata.id}-expanded`}>
                          <TableCell colSpan={9} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Objeto completo</p>
                                  <p className="font-medium">{ata.objeto}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Vigência</p>
                                  <p className="font-medium">
                                    {formatDate(ata.vigenciaInicial)} até {formatDate(ata.vigenciaFinal)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Consumo do Saldo do Órgão</p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>{formatCurrency(valorConsumido)}</span>
                                      <span>{formatCurrency(ata.valorRegistrado)}</span>
                                    </div>
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          percentualConsumo < 80
                                            ? 'bg-[var(--success)]'
                                            : percentualConsumo < 95
                                              ? 'bg-[var(--warning)]'
                                              : 'bg-[var(--danger)]'
                                        }`}
                                        style={{ width: `${percentualConsumo}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{percentualConsumo.toFixed(1)}% consumido</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Aceita Adesão (Carona)</p>
                                  <p className="font-medium">{ata.aceitaAdesao ? 'Sim' : 'Não'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Renovável</p>
                                  <p className="font-medium">{ata.renovavel ? 'Sim' : 'Não'}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/atas/${ata.id}`);
                                  }}
                                >
                                  Abrir Detalhes Completos
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/atas/${ata.id}/gerar-contrato`);
                                  }}
                                  disabled={ata.saldo === 0}
                                >
                                  Gerar Contrato
                                </Button>
                                {ata.aceitaAdesao && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/atas/${ata.id}/registrar-adesao`);
                                    }}
                                  >
                                    Registrar Adesão
                                  </Button>
                                )}
                              </div>

                              {ata.saldo === 0 && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--danger-light)] border border-[var(--danger)]/20">
                                  <WarningTriangle className="h-4 w-4 text-[var(--danger)] mt-0.5 shrink-0" />
                                  <p className="text-sm text-[var(--danger)]">
                                    Saldo do órgão esgotado. Não é possível gerar novos contratos para o órgão gerenciador.
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                    ].filter(Boolean);
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
