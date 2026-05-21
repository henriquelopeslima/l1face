import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { CadastrarContrato } from '@/features/instrumentos/presentation/components/CadastrarContrato';

export function InstrumentosContratoCadastrarPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: 'Cadastrar', href: '/instrumentos/cadastrar' },
          { label: 'Contrato' },
        ]}
      />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl lg:text-4xl">Cadastrar contrato</h1>
        <p className="text-muted-foreground text-sm lg:text-base">Instrumento clássico — vigência, renovação e anexos conforme o modelo acordado.</p>
      </div>
      <CadastrarContrato />
    </div>
  );
}
