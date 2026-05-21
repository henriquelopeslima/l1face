import { Link } from 'react-router';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function OutroInstrumentoCadastrarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: 'Cadastrar', href: '/instrumentos/cadastrar' },
          { label: 'Outro' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Outro instrumento</CardTitle>
          <CardDescription>
            Escape hatch para instrumentos atípicos da administração: descrição livre, campos abertos, vigência e
            renovação opcionais e anexo PDF. Visível na listagem unificada no segmento Todos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/instrumentos/cadastrar">Voltar à escolha do tipo</Link>
          </Button>
          <Button asChild>
            <Link to="/instrumentos/gestao">Ir para listagem</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
