import { Link } from 'react-router';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { CadastrarNotaEmpenho } from '@/features/instrumentos/presentation/components/CadastrarNotaEmpenho';

export function NotaEmpenhoCadastrarPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: 'Cadastrar', href: '/instrumentos/cadastrar' },
          { label: 'Nota de empenho' },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl lg:text-4xl">Cadastrar nota de empenho</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Prazo de entrega do objeto, valores e movimentações (reforço, acréscimo, supressão, anulação). Sem
            vigência por término como contrato.
          </p>
        </div>
        <Button variant="outline" asChild className="shrink-0">
          <Link to="/instrumentos/cadastrar">Trocar tipo</Link>
        </Button>
      </div>
      <CadastrarNotaEmpenho />
    </div>
  );
}
