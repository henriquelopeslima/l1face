import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { LogOut } from 'iconoir-react';
import { useNavigate } from 'react-router';
import { AparenciaSection } from '../components/AparenciaSection';
import { AssinaturaSection } from '../components/AssinaturaSection';
import { GestaoAcessosSection } from '../components/GestaoAcessosSection';
import { NotificacoesSection } from '../components/NotificacoesSection';
import { PerfilSection } from '../components/PerfilSection';
import { SegurancaSection } from '../components/SegurancaSection';
import { useHashScroll } from '../hooks/useHashScroll';

export function ConfiguracoesPage() {
  useHashScroll();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Configurações' }]} />

      <div className="space-y-1">
        <h1 className="text-xl lg:text-4xl">Configurações</h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Gerencie suas preferências <span className="hidden lg:inline">e informações da conta</span>
        </p>
      </div>

      <PerfilSection />
      <AparenciaSection />
      <NotificacoesSection />
      <AssinaturaSection />
      <SegurancaSection />
      <GestaoAcessosSection />

      <Card className="border-destructive/50">
        <CardContent className="pt-4 lg:pt-6">
          <Button
            variant="destructive"
            className="w-full gap-2 h-10 lg:h-11 text-sm lg:text-base"
            onClick={() => navigate('/login')}
          >
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
            Sair da conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
