import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/components/ui/tooltip';
import { Lock, Settings } from 'iconoir-react';
import { AlterarSenhaForm } from './AlterarSenhaForm';
import { useChangePassword } from '../hooks/useChangePassword';
import { AlterarSenhaUseCase } from '../../domain/usecases/AlterarSenhaUseCase';
import { ValidarForcaSenhaUseCase } from '../../domain/usecases/ValidarForcaSenhaUseCase';
import { ChangePasswordRepository } from '../../data/repositories/ChangePasswordRepository';

export function SegurancaSection() {
  const [showForm, setShowForm] = useState(false);

  // Initialize use cases and repositories
  const repository = new ChangePasswordRepository();
  const changePasswordUseCase = new AlterarSenhaUseCase(
    repository,
    new ValidarForcaSenhaUseCase()
  );
  const validarForcaSenha = new ValidarForcaSenhaUseCase();

  const hook = useChangePassword(changePasswordUseCase, validarForcaSenha);

  useEffect(() => {
    if (!hook.success) return;
    const timer = setTimeout(() => {
      setShowForm(false);
      hook.reset();
    }, 5000);
    return () => clearTimeout(timer);
  }, [hook.success]);

  return (
    <Card id="seguranca" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
          Segurança
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">Gerencie a segurança da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6">
        {/* Password Change Form */}
        {showForm && (
          <div className="space-y-4">
            <AlterarSenhaForm
              formData={hook.formData}
              isLoading={hook.isLoading}
              error={hook.error}
              success={hook.success}
              validationErrors={hook.validationErrors}
              onCurrentPasswordChange={hook.updateCurrentPassword}
              onNewPasswordChange={hook.updateNewPassword}
              onSubmit={hook.submit}
            />
            {!hook.success && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowForm(false);
                  hook.reset();
                }}
                disabled={hook.isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        )}

        {/* Button to show form */}
        {!showForm && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base"
              onClick={() => setShowForm(true)}
            >
              <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
              Alterar senha
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base opacity-50 hover:opacity-70 transition-opacity cursor-not-allowed">
                  <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
                  Autenticação em duas etapas
                </Button>
              </TooltipTrigger>
              <TooltipContent>Em breve!</TooltipContent>
            </Tooltip>
          </>
        )}
      </CardContent>
    </Card>
  );
}
