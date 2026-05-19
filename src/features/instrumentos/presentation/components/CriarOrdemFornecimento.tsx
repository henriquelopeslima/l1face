import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { InfoCircle } from 'iconoir-react';

interface ItemContrato {
  id: string;
  descricao: string;
  unidadeMedida: string;
  qtdContratada: number;
  qtdEntregue: number;
  qtdReservada: number;
  valorUnitario: number;
}

interface ItemOFFormulario {
  itemId: string;
  qtdSolicitada: number;
}

type TipoEmpenho = 'ordinario' | 'global' | 'estimativo';

interface CriarOrdemFornecimentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: string;
  itensContrato: ItemContrato[];
  prazoEntrega: number;
  onSubmit: (data: {
    dataRecebimento: string;
    numeroEmpenho: string;
    tipoEmpenho: TipoEmpenho;
    itens: { itemId: string; quantidade: number }[];
    vencimento?: string;
    dataCriacao?: string;
  }) => void;
}

const orientacaoTipoEmpenho: Record<TipoEmpenho, string> = {
  ordinario: 'Ordinário: indicado para despesa pontual e específica desta OF.',
  global: 'Global: indicado para execução continuada, com consumo em múltiplas OFs até o limite do empenho.',
  estimativo: 'Estimativo: indicado para consumo variável; ajuste as OFs conforme a necessidade real ao longo da vigência.',
};

export function CriarOrdemFornecimento({
  open,
  onOpenChange,
  itensContrato,
  prazoEntrega,
  onSubmit,
}: CriarOrdemFornecimentoProps) {
  const [dataRecebimento, setDataRecebimento] = useState('');
  const [numeroEmpenho, setNumeroEmpenho] = useState('');
  const [tipoEmpenho, setTipoEmpenho] = useState<TipoEmpenho>('ordinario');
  const [itensSelecionados, setItensSelecionados] = useState<ItemOFFormulario[]>([]);
  const [selectStep, setSelectStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setDataRecebimento('');
      setNumeroEmpenho('');
      setTipoEmpenho('ordinario');
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
    setItensSelecionados(selectedIds.map((id) => ({ itemId: id, qtdSolicitada: 1 })));
    setSelectStep(2);
  };

  const atualizarQtd = (itemId: string, qtd: number) => {
    setItensSelecionados((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, qtdSolicitada: qtd } : i)));
  };

  const calcularVencimento = () => {
    if (!dataRecebimento) return '';
    const d = new Date(dataRecebimento);
    d.setDate(d.getDate() + prazoEntrega);
    return d.toISOString().split('T')[0] ?? '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dataRecebimento,
      numeroEmpenho,
      tipoEmpenho,
      itens: itensSelecionados.map((i) => ({ itemId: i.itemId, quantidade: i.qtdSolicitada })),
      vencimento: calcularVencimento(),
      dataCriacao: new Date().toISOString().split('T')[0] ?? '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Ordem de Fornecimento</DialogTitle>
          <DialogDescription>
            {selectStep === 1 ? 'Passo 1: Preencha os dados e selecione os itens' : 'Passo 2: Informe as quantidades'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectStep === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="of-data">Data de recebimento</Label>
                  <Input id="of-data" type="date" value={dataRecebimento} onChange={(e) => setDataRecebimento(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="of-empenho">Número do empenho</Label>
                  <Input id="of-empenho" value={numeroEmpenho} onChange={(e) => setNumeroEmpenho(e.target.value)} placeholder="NE 001/2025" required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="of-tipo">Tipo de empenho</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">{orientacaoTipoEmpenho[tipoEmpenho]}</TooltipContent>
                  </Tooltip>
                </div>
                <select
                  id="of-tipo"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={tipoEmpenho}
                  onChange={(e) => setTipoEmpenho(e.target.value as TipoEmpenho)}
                >
                  <option value="ordinario">Ordinário</option>
                  <option value="global">Global</option>
                  <option value="estimativo">Estimativo</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Selecione os itens</Label>
                <Input placeholder="Buscar itens..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {filteredItens.map((item) => {
                    const selecionado = selectedIds.includes(item.id);
                    const disponivel = item.qtdContratada - item.qtdEntregue - item.qtdReservada;
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
                          <p className="text-xs text-muted-foreground">{item.unidadeMedida} · Disponível: {disponivel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
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
                      <Input
                        type="number"
                        min="1"
                        max={item.qtdContratada - item.qtdEntregue - item.qtdReservada}
                        value={sel.qtdSolicitada}
                        onChange={(e) => atualizarQtd(sel.itemId, Number(e.target.value))}
                        className="text-right"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
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
                <Button type="submit">Criar OF</Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
