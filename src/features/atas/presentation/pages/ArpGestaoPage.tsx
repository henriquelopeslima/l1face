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
import { Plus, Search, NavArrowDown, NavArrowUp, WarningTriangle } from 'iconoir-react';

interface Arp {
  id: string;
  orgaoGerenciador: string;
  objeto: string;
  numeroAta: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  valorTotalRegistrado: number;
  saldoOrgao: number;
  aceitaAdesao: boolean;
  saldoCarona?: number;
  quantidadeContratos: number;
  renovavel: boolean;
  status: 'Ativa' | 'Próxima ao Vencimento' | 'Encerrada';
}

type StatusType = 'todas' | 'Ativa' | 'Próxima ao Vencimento' | 'Encerrada';

const ARPS: Arp[] = [
  { id: '1', orgaoGerenciador: 'Prefeitura de Fortaleza', objeto: 'Material de TI', numeroAta: 'ARP 012/2025', vigenciaInicial: '2025-01-15', vigenciaFinal: '2026-06-30', valorTotalRegistrado: 600000, saldoOrgao: 320000, aceitaAdesao: true, saldoCarona: 480000, quantidadeContratos: 2, renovavel: true, status: 'Ativa' },
  { id: '2', orgaoGerenciador: 'Governo do Estado do Ceará', objeto: 'Merenda Escolar', numeroAta: 'ARP 007/2025', vigenciaInicial: '2025-02-10', vigenciaFinal: '2026-04-15', valorTotalRegistrado: 180000, saldoOrgao: 45000, aceitaAdesao: false, quantidadeContratos: 3, renovavel: false, status: 'Próxima ao Vencimento' },
  { id: '3', orgaoGerenciador: 'Exército Brasileiro', objeto: 'Gêneros Alimentícios', numeroAta: 'ARP 003/2025', vigenciaInicial: '2025-03-01', vigenciaFinal: '2026-10-20', valorTotalRegistrado: 300000, saldoOrgao: 180000, aceitaAdesao: true, saldoCarona: 0, quantidadeContratos: 4, renovavel: true, status: 'Ativa' },
  { id: '4', orgaoGerenciador: 'Prefeitura de Russas', objeto: 'Serviços de TI', numeroAta: 'ARP 001/2024', vigenciaInicial: '2024-01-01', vigenciaFinal: '2025-12-31', valorTotalRegistrado: 90000, saldoOrgao: 0, aceitaAdesao: false, quantidadeContratos: 2, renovavel: false, status: 'Encerrada' },
];

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

function getAlertaVencimento(vigenciaFim: string, status: string) {
  if (status === 'Encerrada') return null;
  const dias = calcularDiasRestantes(vigenciaFim);
  if (dias < 30) return { cor: 'bg-[var(--danger)]', label: '< 30 dias' };
  if (dias <= 90) return { cor: 'bg-[var(--warning)]', label: '30-90 dias' };
  if (dias <= 180) return { cor: 'bg-primary', label: '90-180 dias' };
  return null;
}

export function ArpGestaoPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType>('todas');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtradas = ARPS.filter((arp) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || arp.numeroAta.toLowerCase().includes(q) || arp.orgaoGerenciador.toLowerCase().includes(q) || arp.objeto.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'todas' || arp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleExpand = (id: string) => setExpandedRow(expandedRow === id ? null : id);

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
              <Input placeholder="Buscar por número, órgão ou objeto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusType)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Ativa">Ativas</SelectItem>
                <SelectItem value="Próxima ao Vencimento">Próximas ao Vencimento</SelectItem>
                <SelectItem value="Encerrada">Encerradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>ARPs Cadastradas ({filtradas.length})</CardTitle></CardHeader>
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
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhuma ARP encontrada</TableCell>
                  </TableRow>
                ) : (
                  filtradas.flatMap((arp) => {
                    const alerta = getAlertaVencimento(arp.vigenciaFinal, arp.status);
                    const isExpanded = expandedRow === arp.id;
                    const percentualConsumo = ((arp.valorTotalRegistrado - arp.saldoOrgao) / arp.valorTotalRegistrado) * 100;

                    return [
                      <TableRow key={arp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(arp.id)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {alerta && (
                              <div
                                className={`h-2 w-2 rounded-full shrink-0 ${alerta.cor}`}
                                title={`Vencimento em ${alerta.label}`}
                              />
                            )}
                            {arp.numeroAta}
                          </div>
                        </TableCell>
                        <TableCell>{arp.orgaoGerenciador}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{arp.objeto}</TableCell>
                        <TableCell>{formatDate(arp.vigenciaFinal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(arp.valorTotalRegistrado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(arp.saldoOrgao)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/instrumentos/gestao?arp=${arp.id}`); }}>
                            {arp.quantidadeContratos}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              arp.status === 'Ativa' ? 'success'
                              : arp.status === 'Próxima ao Vencimento' ? 'warning'
                              : 'outline'
                            }
                          >
                            {arp.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isExpanded ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
                        </TableCell>
                      </TableRow>,
                      isExpanded && (
                        <TableRow key={`${arp.id}-expanded`}>
                          <TableCell colSpan={9} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Objeto completo</p>
                                  <p className="font-medium">{arp.objeto}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Vigência</p>
                                  <p className="font-medium">
                                    {formatDate(arp.vigenciaInicial)} até {formatDate(arp.vigenciaFinal)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Consumo do Saldo do Órgão</p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>{formatCurrency(arp.valorTotalRegistrado - arp.saldoOrgao)}</span>
                                      <span>{formatCurrency(arp.valorTotalRegistrado)}</span>
                                    </div>
                                    <div className="h-2 bg-border rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          percentualConsumo < 80 ? 'bg-[var(--success)]'
                                          : percentualConsumo < 95 ? 'bg-[var(--warning)]'
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
                                  <p className="font-medium">{arp.aceitaAdesao ? 'Sim' : 'Não'}</p>
                                  {arp.aceitaAdesao && arp.saldoCarona !== undefined && (
                                    <p className="text-sm mt-1">
                                      Saldo de Carona:{' '}
                                      <span className={arp.saldoCarona === 0 ? 'text-danger font-medium' : 'text-success font-medium'}>
                                        {formatCurrency(arp.saldoCarona)}
                                      </span>
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Renovável</p>
                                  <p className="font-medium">{arp.renovavel ? 'Sim' : 'Não'}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}`); }}
                                >
                                  Abrir Detalhes Completos
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}/gerar-contrato`); }}
                                  disabled={arp.saldoOrgao === 0}
                                >
                                  Gerar Contrato
                                </Button>
                                {arp.aceitaAdesao && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}/registrar-adesao`); }}
                                    disabled={arp.saldoCarona === 0}
                                  >
                                    Registrar Adesão
                                  </Button>
                                )}
                              </div>

                              {arp.saldoOrgao === 0 && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--danger-light)] border border-[var(--danger)]/20">
                                  <WarningTriangle className="h-4 w-4 text-[var(--danger)] mt-0.5 shrink-0" />
                                  <p className="text-sm text-[var(--danger)]">
                                    Saldo do órgão esgotado. Não é possível gerar novos contratos para o órgão gerenciador.
                                  </p>
                                </div>
                              )}

                              {arp.aceitaAdesao && arp.saldoCarona === 0 && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--warning-light)] border border-[var(--warning)]/20">
                                  <WarningTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 shrink-0" />
                                  <p className="text-sm text-[var(--warning)]">
                                    Saldo de carona esgotado. Não é possível registrar novas adesões.
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
