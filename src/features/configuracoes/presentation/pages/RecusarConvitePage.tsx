import { useNavigate, useSearchParams } from 'react-router';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle, WarningCircle, Mail, Clock } from 'iconoir-react';
import { useRecusarConvite } from '../hooks/useRecusarConvite';

export function RecusarConvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { status, message } = useRecusarConvite(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <LogoLicitaOne variant="light" className="h-10 w-auto dark:hidden" />
          <LogoLicitaOne variant="dark" className="h-10 w-auto hidden dark:block" />
        </div>

        {status === 'loading' && (
          <div className="space-y-4" data-testid="recusar-convite-loading">
            <div className="flex justify-center">
              <Mail className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Processando sua resposta...</h1>
            <p className="text-muted-foreground">Aguarde um momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4" data-testid="recusar-convite-success">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Convite recusado</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')} data-testid="recusar-convite-btn-login">
              Ir para o login
            </Button>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-4" data-testid="recusar-convite-expired">
            <div className="flex justify-center">
              <Clock className="h-16 w-16 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Convite expirado</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')} data-testid="recusar-convite-btn-login-expirado">
              Ir para o login
            </Button>
          </div>
        )}

        {status === 'already_responded' && (
          <div className="space-y-4" data-testid="recusar-convite-already-responded">
            <div className="flex justify-center">
              <WarningCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Convite já respondido</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button className="w-full" onClick={() => navigate('/login')} data-testid="recusar-convite-btn-login-respondido">
              Ir para o login
            </Button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4" data-testid="recusar-convite-invalid">
            <div className="flex justify-center">
              <WarningCircle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Link inválido</h1>
            <p className="text-muted-foreground">
              {message ?? 'Este link de convite não é válido.'}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')} data-testid="recusar-convite-btn-login-invalido">
              Ir para o login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
