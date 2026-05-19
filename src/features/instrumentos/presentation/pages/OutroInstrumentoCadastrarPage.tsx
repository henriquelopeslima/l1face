import { useNavigate } from 'react-router';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { WarningTriangle } from 'iconoir-react';

export function OutroInstrumentoCadastrarPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Instrumentos', href: '/instrumentos/gestao' },
          { label: 'Cadastrar', href: '/instrumentos/cadastrar' },
          { label: 'Outro instrumento' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <WarningTriangle className="h-5 w-5 text-[#FFB800]" />
            Cadastro de outros instrumentos
          </CardTitle>
          <CardDescription>
            Este formulário está em desenvolvimento. Para contratos e notas de empenho, use as opções disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O formulário para "outros instrumentos" (atos, termos de cooperação, etc.) estará disponível em breve.
            Por enquanto, utilize esta área para registrar instrumentos que não se enquadram nas categorias padrão.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/instrumentos/cadastrar')}>
              Voltar
            </Button>
            <Button onClick={() => navigate('/instrumentos/gestao')}>
              Ver gestão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
