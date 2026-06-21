import { useNavigate, useSearchParams } from 'react-router';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle, WarningCircle, Mail, Clock } from 'iconoir-react';
import { useConfirmarEmail } from '../hooks/useConfirmarEmail';

export function ConfirmarEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { status, errorMessage } = useConfirmarEmail(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <LogoLicitaOne variant="light" className="h-10 w-auto dark:hidden" />
          <LogoLicitaOne variant="dark" className="h-10 w-auto hidden dark:block" />
        </div>

        {status === 'loading' && (
          <div className="space-y-4" data-testid="confirmar-email-loading">
            <div className="flex justify-center">
              <Mail className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Confirmando seu e-mail...</h1>
            <p className="text-muted-foreground">Aguarde um momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4" data-testid="confirmar-email-success">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">E-mail confirmado!</h1>
            <p className="text-muted-foreground">Redirecionando para o sistema...</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="space-y-4" data-testid="confirmar-email-expired">
            <div className="flex justify-center">
              <Clock className="h-16 w-16 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Link expirado</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button
              className="w-full"
              onClick={() => navigate('/login')}
              data-testid="confirmar-email-btn-reenvio"
            >
              Solicitar novo link
            </Button>
          </div>
        )}

        {status === 'already_confirmed' && (
          <div className="space-y-4" data-testid="confirmar-email-already-confirmed">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Conta já confirmada</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button
              className="w-full"
              onClick={() => navigate('/login')}
              data-testid="confirmar-email-btn-login"
            >
              Fazer login
            </Button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4" data-testid="confirmar-email-invalid">
            <div className="flex justify-center">
              <WarningCircle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Link inválido</h1>
            <p className="text-muted-foreground">
              {errorMessage ?? 'Este link de confirmação não é válido.'}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
              data-testid="confirmar-email-btn-login-invalido"
            >
              Ir para o login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
