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
import { Plus, Search, NavArrowDown, NavArrowUp } from 'iconoir-react';

interface Arp {
  id: string;
  orgaoGerenciador: string;
  objeto: string;
  numeroAta: string;
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
  { id: '1', orgaoGerenciador: 'Prefeitura de Fortaleza', objeto: 'Material de TI', numeroAta: 'ARP 012/2025', vigenciaFinal: '2026-06-30', valorTotalRegistrado: 600000, saldoOrgao: 320000, aceitaAdesao: true, saldoCarona: 480000, quantidadeContratos: 2, renovavel: true, status: 'Ativa' },
  { id: '2', orgaoGerenciador: 'Governo do Estado do Ceará', objeto: 'Merenda Escolar', numeroAta: 'ARP 007/2025', vigenciaFinal: '2026-04-15', valorTotalRegistrado: 180000, saldoOrgao: 45000, aceitaAdesao: false, quantidadeContratos: 3, renovavel: false, status: 'Próxima ao Vencimento' },
  { id: '3', orgaoGerenciador: 'Exército Brasileiro', objeto: 'Gêneros Alimentícios', numeroAta: 'ARP 003/2025', vigenciaFinal: '2026-10-20', valorTotalRegistrado: 300000, saldoOrgao: 180000, aceitaAdesao: true, saldoCarona: 0, quantidadeContratos: 4, renovavel: true, status: 'Ativa' },
  { id: '4', orgaoGerenciador: 'Prefeitura de Russas', objeto: 'Serviços de TI', numeroAta: 'ARP 001/2024', vigenciaFinal: '2025-12-31', valorTotalRegistrado: 90000, saldoOrgao: 0, aceitaAdesao: false, quantidadeContratos: 2, renovavel: false, status: 'Encerrada' },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR');
}

const statusVariants: Record<Arp['status'], string> = {
  'Ativa': 'bg-[#06D6A0] text-white',
  'Próxima ao Vencimento': 'bg-[#F39C12] text-white',
  'Encerrada': 'bg-gray-500 text-white',
};

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
                    const expanded = expandedRow === arp.id;
                    return [
                      <TableRow key={arp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedRow(expanded ? null : arp.id)}>
                        <TableCell className="font-medium">{arp.numeroAta}</TableCell>
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
                          <Badge className={statusVariants[arp.status]}>{arp.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {expanded ? <NavArrowUp className="h-4 w-4" /> : <NavArrowDown className="h-4 w-4" />}
                        </TableCell>
                      </TableRow>,
                      expanded && (
                        <TableRow key={`${arp.id}-ex`} className="bg-muted/20">
                          <TableCell colSpan={9} className="py-4">
                            <div className="flex flex-wrap gap-2 px-2">
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}`); }}>Ver detalhes</Button>
                              {arp.aceitaAdesao && (
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}/registrar-adesao`); }}>Registrar adesão</Button>
                              )}
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}/gerar-contrato`); }}>Gerar contrato</Button>
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/atas/${arp.id}/visualizar`); }}>Visualizar</Button>
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
