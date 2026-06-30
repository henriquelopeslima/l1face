import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Trash, Plus } from 'iconoir-react';
import type { ItemInstrumentoDetalhe, TipoPrazo } from '../../domain/entities/instrumentoContratual';
import { useEmitirOrdemFornecimento } from '../hooks/useEmitirOrdemFornecimento';

interface ItemOFFormulario {
  itemId: string;
  qtdSolicitada: number;
}

interface CriarOrdemFornecimentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrumentoId: string;
  itensContrato: ItemInstrumentoDetalhe[];
  prazoEntregaInstrumento?: number | null;
  tipoPrazoEntregaInstrumento?: TipoPrazo | null;
  onSuccess?: () => void;
}

function calcularDataSugerida(dataRecebimento: string, prazo: number, tipoPrazo: TipoPrazo | null): string {
  const data = new Date(`${dataRecebimento}T00:00:00`);
  if (tipoPrazo === 'UTEIS') {
    let adicionados = 0;
    while (adicionados < prazo) {
      data.setDate(data.getDate() + 1);
      const dia = data.getDay();
      if (dia !== 0 && dia !== 6) adicionados++;
    }
  } else {
    data.setDate(data.getDate() + prazo);
  }
  return data.toISOString().split('T')[0] ?? '';
}

export function CriarOrdemFornecimento({
  open,
  onOpenChange,
  instrumentoId,
  itensContrato,
  prazoEntregaInstrumento,
  tipoPrazoEntregaInstrumento,
  onSuccess,
}: CriarOrdemFornecimentoProps) {
  const { emitir, isLoading, error } = useEmitirOrdemFornecimento();

  const [itensSelecionados, setItensSelecionados] = useState<ItemOFFormulario[]>([]);
  const [selectStep, setSelectStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelecionados, setShowSelecionados] = useState(false);
  const [dataRecebimento, setDataRecebimento] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const hoje = new Date().toISOString().split('T')[0] ?? '';
      setDataRecebimento(hoje);
      if (prazoEntregaInstrumento && prazoEntregaInstrumento > 0) {
        setPrazoEntrega(calcularDataSugerida(hoje, prazoEntregaInstrumento, tipoPrazoEntregaInstrumento ?? null));
      } else {
        setPrazoEntrega('');
      }
    } else {
      setItensSelecionados([]);
      setSelectStep(1);
      setSearchTerm('');
      setSelectedIds([]);
      setShowSelecionados(false);
      setDateError(null);
    }
  }, [open, prazoEntregaInstrumento, tipoPrazoEntregaInstrumento]);

  const itensVisiveis = itensContrato.filter((i) => {
    if (showSelecionados) return selectedIds.includes(i.id);
    if (!searchTerm) return true;
    return (
      i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.unidadeMedida.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const removerItemSelecionado = (itemId: string) => {
    setItensSelecionados((prev) => prev.filter((i) => i.itemId !== itemId));
    setSelectedIds((prev) => prev.filter((id) => id !== itemId));
  };

  const avancarParaQuantidades = () => {
    if (selectedIds.length === 0) return;
    if (prazoEntrega && dataRecebimento && prazoEntrega < dataRecebimento) {
      setDateError('O prazo de entrega deve ser igual ou posterior à data de recebimento.');
      return;
    }
    setDateError(null);
    setItensSelecionados(
      selectedIds.map((id) => ({ itemId: id, qtdSolicitada: 1 }))
    );
    setSelectStep(2);
  };

  const atualizarQtd = (itemId: string, qtd: number) => {
    setItensSelecionados((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, qtdSolicitada: Math.max(1, qtd) } : i))
    );
  };

  const handleCriarOF = async () => {
    if (!dataRecebimento || !prazoEntrega) {
      setDateError('Preencha a data de recebimento e o prazo de entrega.');
      return;
    }
    if (prazoEntrega < dataRecebimento) {
      setDateError('O prazo de entrega deve ser igual ou posterior à data de recebimento.');
      return;
    }
    setDateError(null);
    try {
      await emitir({
        instrumentoId,
        dataRecebimento,
        prazoEntrega,
        itens: itensSelecionados.map((i) => ({
          itemInstrumentoId: i.itemId,
          quantidadeFornecida: i.qtdSolicitada,
        })),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // error captured by hook state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header com step indicator e progress bar */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>
                {selectStep === 1
                  ? 'Passo 1: Preencha os dados e selecione os itens'
                  : 'Passo 2: Informe as quantidades dos itens'}
              </DialogTitle>
              <DialogDescription>
                {selectStep === 1
                  ? 'Preencha os dados da OF e escolha os itens que serão incluídos'
                  : 'Revise os itens selecionados e informe a quantidade de cada um'}
              </DialogDescription>
            </div>
            <span className="text-sm font-semibold text-[#0050FF] shrink-0 mt-0.5">
              Passo {selectStep}/2
            </span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full mt-3">
            <div
              className="h-1 bg-[#0050FF] rounded-full transition-all duration-300"
              style={{ width: selectStep === 1 ? '50%' : '100%' }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* ── PASSO 1 ── */}
          {selectStep === 1 && (
            <>
              {/* Seção Identificação */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Identificação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="of-data">
                      Data de Recebimento da OF <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="of-data"
                      type="date"
                      value={dataRecebimento}
                      onChange={(e) => {
                        const novaData = e.target.value;
                        setDataRecebimento(novaData);
                        setDateError(null);
                        if (prazoEntregaInstrumento && prazoEntregaInstrumento > 0 && novaData) {
                          setPrazoEntrega(calcularDataSugerida(novaData, prazoEntregaInstrumento, tipoPrazoEntregaInstrumento ?? null));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="of-prazo">
                      Prazo de Entrega <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="of-prazo"
                      type="date"
                      value={prazoEntrega}
                      min={dataRecebimento}
                      onChange={(e) => { setPrazoEntrega(e.target.value); setDateError(null); }}
                    />
                    {prazoEntregaInstrumento && prazoEntregaInstrumento > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Sugestão baseada em {prazoEntregaInstrumento} dia{prazoEntregaInstrumento !== 1 ? 's' : ''}{' '}
                        {tipoPrazoEntregaInstrumento === 'UTEIS' ? 'úteis' : 'corridos'} após o recebimento
                      </p>
                    )}
                  </div>
                </div>
                {dateError && <p className="text-sm text-destructive">{dateError}</p>}
              </div>

              {/* Lista de itens */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Pesquisar itens (ex: arroz)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSelecionados(false);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant={!showSelecionados ? 'default' : 'outline'}
                    onClick={() => setShowSelecionados(false)}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={showSelecionados ? 'default' : 'outline'}
                    onClick={() => { setShowSelecionados(true); setSearchTerm(''); }}
                  >
                    Selecionados
                  </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="max-h-52 overflow-y-auto">
                    {itensVisiveis.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Nenhum item encontrado.
                      </p>
                    ) : (
                      itensVisiveis.map((item) => {
                        const selecionado = selectedIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-0 transition-colors ${
                              selecionado
                                ? 'bg-[#EDF4FF] dark:bg-[#0050FF]/15'
                                : 'hover:bg-accent'
                            }`}
                          >
                            <input
                              type="checkbox"
                              readOnly
                              checked={selecionado}
                              className="h-4 w-4 rounded border-input accent-[#0050FF] pointer-events-none shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.descricao}</p>
                              <p className="text-xs text-muted-foreground">
                                Qtd. disponível: {item.quantidadeTotal} {item.unidadeMedida}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                    <span>{itensVisiveis.length} resultado{itensVisiveis.length !== 1 ? 's' : ''}</span>
                    {selectedIds.length > 0 && (
                      <span className="text-[#0050FF] font-medium">
                        {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PASSO 2 ── */}
          {selectStep === 2 && (
            <div className="space-y-3">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[120px]">Qtd. Disponível</TableHead>
                      <TableHead className="w-[140px]">
                        Qtd. Solicitada <span className="text-destructive">*</span>
                      </TableHead>
                      <TableHead className="w-[80px]">Unidade</TableHead>
                      <TableHead className="w-[48px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensSelecionados.map((sel) => {
                      const item = itensContrato.find((i) => i.id === sel.itemId);
                      if (!item) return null;
                      return (
                        <TableRow key={sel.itemId}>
                          <TableCell className="font-medium">{item.descricao}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.quantidadeTotal}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={sel.qtdSolicitada}
                              onChange={(e) => atualizarQtd(sel.itemId, Number(e.target.value))}
                              className="h-8 text-right w-24"
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {item.unidadeMedida}
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => removerItemSelecionado(sel.itemId)}
                              className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {itensSelecionados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Todos os itens foram removidos. Volte para selecionar itens.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="flex-row justify-between pt-2">
            {selectStep === 2 ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setSelectStep(1)}>
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={() => { void handleCriarOF(); }}
                  disabled={isLoading || itensSelecionados.length === 0}
                >
                  {isLoading ? 'Criando...' : 'Confirmar ordem de fornecimento'}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={avancarParaQuantidades}
                  disabled={selectedIds.length === 0 || !dataRecebimento || !prazoEntrega}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Avançar para quantidades
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
