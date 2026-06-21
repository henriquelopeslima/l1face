import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Eye, EyeClosed, Page, EditPencil, GraphUp, Bell, Mail } from 'iconoir-react';
import { useRegister } from '../hooks/useRegister';

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

const schema = z.object({
  nome: z.string()
    .min(3, 'Informe seu nome completo (ao menos 3 caracteres).')
    .max(255, 'O nome deve ter no máximo 255 caracteres.'),
  email: z.string()
    .min(1, 'Informe seu e-mail.')
    .email('Informe um e-mail válido.'),
  password: z.string()
    .min(8, 'A senha deve ter ao menos 8 caracteres.'),
  cnpj: z.string()
    .refine(val => /^\d{14}$/.test(val.replace(/[.\-/]/g, '')), {
      message: 'Informe um CNPJ válido (14 dígitos).',
    }),
  razaoSocial: z.string()
    .min(10, 'A razão social deve ter ao menos 10 caracteres.')
    .max(255, 'A razão social deve ter no máximo 255 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

function VerificarEmailView({ message, email, onVoltar }: { message: string; email: string; onVoltar: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Verifique seu e-mail</h2>
        <p className="text-muted-foreground text-sm" data-testid="register-verification-message">{message}</p>
      </div>
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground text-left w-full space-y-1">
        <p>Enviamos um link de confirmação para:</p>
        <p className="font-medium text-foreground">{email}</p>
        <p className="mt-2">Não encontrou o e-mail? Verifique também a pasta de <strong>spam</strong> ou lixo eletrônico.</p>
      </div>
      <button
        type="button"
        onClick={onVoltar}
        className="text-sm text-primary hover:underline"
        data-testid="register-voltar-login"
      >
        Voltar para o login
      </button>
    </div>
  );
}

export function RegisterPage() {
  const { register, isLoading, error, registrationMessage } = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { nome: '', email: '', password: '', cnpj: '', razaoSocial: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setSubmittedEmail(data.email.trim());
      await register({
        nome: data.nome.trim(),
        email: data.email.trim(),
        password: data.password,
        cnpj: data.cnpj.replace(/[.\-/]/g, ''),
        razaoSocial: data.razaoSocial.trim(),
      });
    } catch {
      // error is surfaced via the `error` field from useRegister
    }
  });

  const leftPanel = (
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
  );

  return (
    <div className="h-full min-h-0 w-full flex items-center justify-center bg-background overflow-hidden">
      <div className="w-full h-full grid lg:grid-cols-2 gap-0 bg-card">
        {leftPanel}

        <div className="flex flex-col justify-center p-6 lg:p-12 bg-card overflow-y-auto">
          <div className="lg:hidden flex justify-start mb-8">
            <LogoLicitaOne variant="light" className="h-10 w-auto mr-auto dark:hidden" />
            <LogoLicitaOne variant="dark" className="h-10 w-auto mr-auto hidden dark:block" />
          </div>

          <div className="w-full max-w-md mx-auto">
            {registrationMessage ? (
              <VerificarEmailView
                message={registrationMessage}
                email={submittedEmail}
                onVoltar={() => navigate('/login')}
              />
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl lg:text-[64px] font-medium mb-2 text-primary">Criar conta</h2>
                  <p className="text-muted-foreground text-sm lg:text-base">Preencha os dados para começar</p>
                </div>

                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" className="h-11" data-testid="register-nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" className="h-11" data-testid="register-email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="•••••••••"
                                className="h-11 pr-10"
                                data-testid="register-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00.000.000/0000-00"
                              className="h-11"
                              data-testid="register-cnpj"
                              {...field}
                              onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="razaoSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão social</FormLabel>
                          <FormControl>
                            <Input placeholder="Empresa Exemplo Ltda" className="h-11" data-testid="register-razao-social" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <p role="alert" data-testid="register-error" className="text-sm text-destructive">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full h-11 text-base" disabled={isLoading} data-testid="register-submit">
                      {isLoading ? 'Criando conta...' : 'Criar conta'}
                    </Button>

                    <p className="text-center text-base text-muted-foreground">
                      Já tem uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-primary hover:underline font-semibold"
                        data-testid="register-link-login"
                      >
                        Entrar
                      </button>
                    </p>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
