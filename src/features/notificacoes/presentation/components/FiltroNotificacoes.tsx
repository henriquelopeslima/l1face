import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/components/ui/utils';
import type { FiltroLeitura, FiltroOrigem } from '../hooks/useListagemNotificacoes';

interface FiltroNotificacoesProps {
  filtroLeitura: FiltroLeitura;
  onChangeFiltroLeitura: (filtro: FiltroLeitura) => void;
  filtroOrigem: FiltroOrigem;
  onChangeFiltroOrigem: (filtro: FiltroOrigem) => void;
}

const OPCOES_LEITURA: { id: FiltroLeitura; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao_lidas', label: 'Não lidas' },
];

const OPCOES_ORIGEM: { id: FiltroOrigem; label: string }[] = [
  { id: 'todas', label: 'Todos' },
  { id: 'instrumento', label: 'Instrumento' },
  { id: 'ata', label: 'Ata' },
  { id: 'of', label: 'Ordem de fornecimento' },
];

export function FiltroNotificacoes({
  filtroLeitura,
  onChangeFiltroLeitura,
  filtroOrigem,
  onChangeFiltroOrigem,
}: FiltroNotificacoesProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <div className="flex flex-wrap gap-2">
        {OPCOES_LEITURA.map((opcao) => (
          <Button
            key={opcao.id}
            type="button"
            variant={filtroLeitura === opcao.id ? 'default' : 'outline'}
            size="sm"
            className={cn(filtroLeitura === opcao.id && 'bg-[#0050FF] hover:bg-[#0050FF]/90')}
            onClick={() => onChangeFiltroLeitura(opcao.id)}
          >
            {opcao.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {OPCOES_ORIGEM.map((opcao) => (
          <Button
            key={opcao.id}
            type="button"
            variant={filtroOrigem === opcao.id ? 'default' : 'outline'}
            size="sm"
            className={cn(filtroOrigem === opcao.id && 'bg-[#0050FF] hover:bg-[#0050FF]/90')}
            onClick={() => onChangeFiltroOrigem(opcao.id)}
          >
            {opcao.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
