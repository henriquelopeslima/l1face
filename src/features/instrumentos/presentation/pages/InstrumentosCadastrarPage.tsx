import { useNavigate } from 'react-router';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { CardTitle } from '@/shared/components/ui/card';
import { Page, Wallet, Plus } from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';

const OPCOES = [
  {
    id: 'contrato' as const,
    titulo: 'Contrato',
    subtitulo: 'Instrumento clássico',
    descricao: 'Vigência por datas, renovação quando aplicável, anexos em PDF e vínculo opcional com ARP de origem. Use para instrumentos com ciclo de vida por calendário.',
    href: '/instrumentos/cadastrar/contrato',
    icon: Page,
    destaque: 'border-[#0050FF]/40 bg-[#EDF4FF]/40 dark:bg-[#0050FF]/10',
  },
  {
    id: 'nota-empenho' as const,
    titulo: 'Nota de empenho',
    subtitulo: 'Sem vigência por data de término',
    descricao: 'O prazo operacional é o da entrega do objeto (ex.: OF em aberto). Não é renovável como contrato; admite reforço, acréscimo, supressão e anulação.',
    href: '/instrumentos/cadastrar/nota-empenho',
    icon: Wallet,
    destaque: 'border-border bg-card',
  },
];

export function InstrumentosCadastrarPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Instrumentos', href: '/instrumentos/gestao' }, { label: 'Cadastrar' }]} />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2 text-left">
          <h1 className="text-xl font-semibold sm:text-2xl lg:text-4xl">Que instrumento você está cadastrando?</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Escolha abaixo <strong>antes</strong> de preencher o formulário. Cada tipo tem campos e regras diferentes — trocar depois pode exigir recomeçar.
          </p>
        </div>
        <Button onClick={() => navigate('/instrumentos/gestao')}>
          <Plus className="h-4 w-4 mr-2" />
          Ver gestão
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {OPCOES.map((op) => {
          const Icon = op.icon;
          return (
            <button
              key={op.id}
              type="button"
              onClick={() => navigate(op.href)}
              className={cn(
                'rounded-xl border-2 p-5 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050FF]',
                op.destaque
              )}
            >
              <Icon className="mb-3 h-8 w-8 text-[#0050FF]" />
              <CardTitle className="text-lg">{op.titulo}</CardTitle>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{op.subtitulo}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{op.descricao}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
