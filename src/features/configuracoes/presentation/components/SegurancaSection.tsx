import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Lock, Settings } from 'iconoir-react';

export function SegurancaSection() {
  return (
    <Card id="seguranca" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
          Segurança
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">Gerencie a segurança da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 lg:space-y-3">
        <Button variant="outline" className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base">
          <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
          Alterar senha
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2 lg:gap-3 h-10 lg:h-11 text-sm lg:text-base">
          <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
          Autenticação em duas etapas
        </Button>
      </CardContent>
    </Card>
  );
}
