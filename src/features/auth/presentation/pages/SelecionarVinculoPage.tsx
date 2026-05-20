import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building, NavArrowRight } from 'iconoir-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/components/ui/utils';
import { useAuth } from '../context/AuthContext';
import { useSelecionarLicitante } from '../hooks/useSelecionarLicitante';

function formatCnpj(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length !== 14) return digits;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function SelecionarVinculoPage() {
  const { user, session } = useAuth();
  const { selectLicitante } = useSelecionarLicitante();
  const navigate = useNavigate();

  const licitantes = user?.licitantes ?? [];

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  if (licitantes.length === 0) {
    return (
      <div className="space-y-5 lg:space-y-8 mx-auto w-full">
        <div className="space-y-2 text-center max-w-lg mx-auto">
          <h1 className="text-2xl lg:text-4xl font-semibold tracking-tight">Sem vínculo disponível</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Sua conta não está vinculada a nenhum licitante. Entre em contato com o administrador para solicitar acesso.
          </p>
        </div>
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
            {licitantes.map((licitante) => (
              <button
                key={licitante.id}
                type="button"
                onClick={() => selectLicitante(licitante)}
                className={cn(
                  'w-full flex items-center gap-3 lg:gap-4 px-4 py-4 lg:px-6 lg:py-5 text-left',
                  'hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <Building className="h-5 w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base leading-snug">{licitante.nomeEmpresa}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 tabular-nums">
                    {formatCnpj(licitante.cnpj)}
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
