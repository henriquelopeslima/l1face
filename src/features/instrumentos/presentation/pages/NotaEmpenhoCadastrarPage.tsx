import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { CadastrarNotaEmpenho } from '@/features/instrumentos/presentation/components/CadastrarNotaEmpenho';

export function NotaEmpenhoCadastrarPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: 'Cadastrar', href: '/instrumentos/cadastrar' },
          { label: 'Nota de empenho' },
        ]}
      />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl lg:text-4xl">Cadastrar nota de empenho</h1>
        <p className="text-muted-foreground text-sm lg:text-base">Preencha os dados da nota de empenho.</p>
      </div>
      <CadastrarNotaEmpenho />
    </div>
  );
}
