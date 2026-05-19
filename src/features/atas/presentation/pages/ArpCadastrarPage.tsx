import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { CadastrarArp } from '@/features/atas/presentation/components/CadastrarArp';

export function ArpCadastrarPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Atas de registro de preços', href: '/atas/gestao' },
          { label: 'Cadastrar' },
        ]}
      />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl lg:text-4xl">Cadastrar Ata de Registro de Preços</h1>
        <p className="text-muted-foreground text-sm lg:text-base">Preencha os dados da ata de registro de preços.</p>
      </div>
      <CadastrarArp />
    </div>
  );
}
