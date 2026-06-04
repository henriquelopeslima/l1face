import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { ItemInstrumentoDetalhe } from '../../domain/entities/instrumentoContratual';
import { useEmitirOrdemFornecimento } from '../hooks/useEmitirOrdemFornecimento';

interface ItemOFFormulario {
  itemId: string;
  qtdSolicitada: number;
  valorUnitario: number;
}

interface CriarOrdemFornecimentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrumentoId: string;
  itensContrato: ItemInstrumentoDetalhe[];
  onSuccess?: () => void;
}

export function CriarOrdemFornecimento({
  open,
  onOpenChange,
  instrumentoId,
  itensContrato,
  onSuccess,
}: CriarOrdemFornecimentoProps) {
  const { emitir, isLoading, error } = useEmitirOrdemFornecimento();
  const [itensSelecionados, setItensSelecionados] = useState<ItemOFFormulario[]>([]);
  const [selectStep, setSelectStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setItensSelecionados([]);
      setSelectStep(1);
      setSearchTerm('');
      setSelectedIds([]);
    }
  }, [open]);

  const filteredItens = itensContrato.filter(
    (i) =>
      !searchTerm ||
      i.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.unidadeMedida.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const avancarParaQuantidades = () => {
    if (selectedIds.length === 0) return;
    setItensSelecionados(
      selectedIds.map((id) => {
        const item = itensContrato.find((i) => i.id === id);
        return {
          itemId: id,
          qtdSolicitada: 1,
          valorUnitario: item?.valorUnitario ?? 0,
        };
      })
    );
    setSelectStep(2);
  };

  const atualizarQtd = (itemId: string, qtd: number) => {
    setItensSelecionados((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, qtdSolicitada: qtd } : i)));
  };

  const atualizarValorUnitario = (itemId: string, valor: number) => {
    setItensSelecionados((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, valorUnitario: valor } : i)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emitir({
        instrumentoId,
        itens: itensSelecionados.map((i) => ({
          itemInstrumentoId: i.itemId,
          quantidadeFornecida: i.qtdSolicitada,
          valorUnitario: i.valorUnitario,
        })),
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // error is captured by the hook state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Ordem de Fornecimento</DialogTitle>
          <DialogDescription>
            {selectStep === 1 ? 'Passo 1: Selecione os itens' : 'Passo 2: Informe as quantidades e valores unitários'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectStep === 1 && (
            <div className="space-y-2">
              <Label>Selecione os itens</Label>
              <Input placeholder="Buscar itens..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                {filteredItens.map((item) => {
                  const selecionado = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-0 transition-colors ${selecionado ? 'bg-[#EDF4FF] dark:bg-[#0050FF]/15' : 'hover:bg-accent'}`}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${selecionado ? 'bg-[#0050FF] border-[#0050FF]' : 'border-input'}`}>
                        {selecionado && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.descricao}</p>
                        <p className="text-xs text-muted-foreground">{item.unidadeMedida}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectStep === 2 && (
            <div className="space-y-3">
              {itensSelecionados.map((sel) => {
                const item = itensContrato.find((i) => i.id === sel.itemId);
                if (!item) return null;
                return (
                  <div key={sel.itemId} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.descricao}</p>
                      <p className="text-xs text-muted-foreground">{item.unidadeMedida}</p>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-muted-foreground mb-1 block">Qtd.</Label>
                      <Input
                        type="number"
                        min="1"
                        value={sel.qtdSolicitada}
                        onChange={(e) => atualizarQtd(sel.itemId, Number(e.target.value))}
                        className="text-right"
                      />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-muted-foreground mb-1 block">Valor unit. (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sel.valorUnitario}
                        onChange={(e) => atualizarValorUnitario(sel.itemId, Number(e.target.value))}
                        className="text-right"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {selectStep === 2 && (
              <Button type="button" variant="outline" onClick={() => setSelectStep(1)}>
                Voltar
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              {selectStep === 1 ? (
                <Button type="button" onClick={avancarParaQuantidades} disabled={selectedIds.length === 0}>
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Criando...' : 'Criar OF'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
