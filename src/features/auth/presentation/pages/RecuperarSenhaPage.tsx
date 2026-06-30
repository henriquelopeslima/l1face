import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Mail, Page, EditPencil, GraphUp, Bell } from 'iconoir-react';
import { useRecuperarSenha } from '../hooks/useRecuperarSenha';

export function RecuperarSenhaPage() {
  const navigate = useNavigate();
  const { submit, isLoading, isSent, error } = useRecuperarSenha();
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email) {
      setValidationError('Informe seu e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Informe um e-mail válido.');
      return;
    }

    await submit(email);
  };

  const displayError = validationError ?? error;

  return (
    <div className="h-full min-h-0 w-full flex items-center justify-center bg-background overflow-hidden">
      <div className="w-full h-full grid lg:grid-cols-2 gap-0 bg-card">
        <div className="relative hidden lg:flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-primary via-primary to-[var(--blue-dark)] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,.9),rgba(255,255,255,.1)_45%,transparent_70%)]" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 flex justify-start">
              <LogoLicitaOne variant="dark" className="h-8 w-auto mr-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Gerencie suas licitações
              <br />
              com eficiência
            </h1>
            <p className="text-lg opacity-90">
              Controle total de contratos e atas de registro de preços em uma única plataforma
            </p>
          </div>

          <div className="relative z-10">
            <p className="text-sm font-medium opacity-75 mb-4">Recursos principais</p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Page, label: 'Gestão de Contratos' },
                { icon: EditPencil, label: 'Atas de Registro de Preços' },
                { icon: GraphUp, label: 'Relatórios' },
                { icon: Bell, label: 'Alertas' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 lg:p-12 bg-card">
          <div className="lg:hidden flex justify-center mb-8">
            <LogoLicitaOne variant="light" className="h-10 w-auto dark:hidden" />
            <LogoLicitaOne variant="dark" className="h-10 w-auto hidden dark:block" />
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-[64px] font-medium mb-2 text-primary">Recuperar senha</h2>
              <p className="text-muted-foreground text-sm lg:text-base">
                Informe seu e-mail e enviaremos uma nova senha temporária
              </p>
            </div>

            {isSent ? (
              <div className="space-y-6" data-testid="recuperar-senha-sucesso">
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-6 space-y-3 text-center">
                  <div className="flex justify-center">
                    <Mail className="h-12 w-12 text-green-500" />
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    Se o e-mail existir, você receberá uma nova senha em instantes.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifique sua caixa de entrada e a pasta de spam.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate('/login')}
                  data-testid="recuperar-senha-voltar-login"
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    data-testid="recuperar-senha-email"
                  />
                </div>

                {displayError && (
                  <p role="alert" data-testid="recuperar-senha-erro" className="text-sm text-destructive">
                    {displayError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                  data-testid="recuperar-senha-submit"
                >
                  {isLoading ? 'Enviando...' : 'Enviar nova senha'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11"
                  onClick={() => navigate('/login')}
                  data-testid="recuperar-senha-voltar-login"
                >
                  Voltar ao login
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
