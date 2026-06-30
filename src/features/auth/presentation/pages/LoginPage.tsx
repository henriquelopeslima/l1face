import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui/tooltip';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Eye, EyeClosed, Page, EditPencil, GraphUp, Bell } from 'iconoir-react';
import { useLogin } from '../hooks/useLogin';
import { useReenviarConfirmacao } from '../hooks/useReenviarConfirmacao';

export function LoginPage() {
  const { login, isLoading, error, emailNaoConfirmado } = useLogin();
  const { reenviar, isLoading: isReenviando, isSent, isDisabled: reenvioDesabilitado, error: reenvioError } = useReenviarConfirmacao();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
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
    if (!password || password.length < 8) {
      setValidationError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    try {
      await login({ email, password });
    } catch {
      // error is surfaced via the `error` field from useLogin
    }
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
              <h2 className="text-4xl lg:text-[64px] font-medium mb-2 text-primary">Entre agora</h2>
              <p className="text-muted-foreground text-sm lg:text-base">Faça login para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  data-testid="login-email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    onClick={() => navigate('/recuperar-senha')}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                    data-testid="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {emailNaoConfirmado ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-3" data-testid="login-email-nao-confirmado">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    Seu e-mail ainda não foi confirmado.
                  </p>
                  {isSent ? (
                    <p className="text-sm text-green-700 dark:text-green-400" data-testid="login-reenvio-sucesso">
                      E-mail reenviado! Verifique sua caixa de entrada e spam.
                    </p>
                  ) : (
                    <>
                      {reenvioError && (
                        <p className="text-sm text-destructive" data-testid="login-reenvio-erro">{reenvioError}</p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isReenviando || reenvioDesabilitado}
                        onClick={() => reenviar(email)}
                        data-testid="login-btn-reenvio"
                      >
                        {isReenviando ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                displayError && (
                  <p role="alert" data-testid="login-error" className="text-sm text-destructive">
                    {displayError}
                  </p>
                )
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} data-testid="login-submit">
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <p className="text-center text-base text-muted-foreground">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => navigate('/cadastro')} className="text-primary hover:underline font-semibold" data-testid="login-link-cadastro">
                  Criar conta
                </button>
              </p>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" className="h-11 gap-2 opacity-50 hover:opacity-70 transition-opacity cursor-not-allowed">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Em breve!</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" className="h-11 gap-2 opacity-50 hover:opacity-70 transition-opacity cursor-not-allowed">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M13 1h10v10H13z" />
                        <path fill="#05a6f0" d="M1 13h10v10H1z" />
                        <path fill="#ffba08" d="M13 13h10v10H13z" />
                      </svg>
                      Microsoft
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Em breve!</TooltipContent>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
