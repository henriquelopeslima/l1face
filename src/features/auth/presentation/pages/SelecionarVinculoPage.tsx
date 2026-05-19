import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building, NavArrowRight } from 'iconoir-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { LoadingLogo } from '@/shared/components/feedback/LoadingLogo';
import { cn } from '@/shared/components/ui/utils';

function formatCnpj(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length !== 14) return digits;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

const VINCULOS = [
  { id: '1', nome: 'LP SOLUCOES EM LICITACAO', cnpj: '45892310000177' },
  { id: '2', nome: 'COMERCIAL NORDESTE DISTRIBUIDORA LTDA', cnpj: '32156984000142' },
  { id: '3', nome: 'INNOVACAO TECH SERVICOS EM INTELIGENCIA SA', cnpj: '61234567000089' },
  { id: '4', nome: 'GRUPO LOGISTICA ATLAS BRASIL EIRELI', cnpj: '08765432000111' },
] as const;

export function SelecionarVinculoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectVinculo = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-8 mx-auto w-full">
      <div className="space-y-2 text-center max-w-lg mx-auto">
        <h1 className="text-2xl lg:text-4xl font-semibold tracking-tight">Selecione o vínculo</h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Escolha o CNPJ com o qual deseja acessar a plataforma
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border overflow-hidden">
            {VINCULOS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={handleSelectVinculo}
                className={cn(
                  'w-full flex items-center gap-3 lg:gap-4 px-4 py-4 lg:px-6 lg:py-5 text-left',
                  'hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <Building className="h-5 w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base leading-snug">{v.nome}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 tabular-nums">
                    {formatCnpj(v.cnpj)}
                  </p>
                </div>
                <NavArrowRight className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
