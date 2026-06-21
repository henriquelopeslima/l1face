import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { User, Mail, Phone, Building, NavArrowRight } from 'iconoir-react';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
import { getInitials } from '@/shared/utils/getInitials';

export function PerfilSection() {
  const { user, session } = useAuth();

  return (
    <Card id="meu-perfil" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          <User className="h-4 w-4 lg:h-5 lg:w-5" />
          Meu Perfil
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">Informações da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-4 lg:gap-6">
          {user?.fotoPerfil ? (
            <img
              src={user.fotoPerfil}
              alt={`Foto de perfil de ${user.nomeCompleto}`}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-primary flex items-center justify-center flex-shrink-0 select-none"
              aria-label={`Iniciais de ${user?.nomeCompleto ?? 'usuário'}`}
            >
              <span className="text-primary-foreground font-semibold text-xl lg:text-2xl">
                {getInitials(user?.nomeCompleto)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg lg:text-xl font-semibold">{user?.nomeCompleto ?? '—'}</h3>
            <p className="text-muted-foreground text-sm lg:text-base">{session?.licitante?.nomeEmpresa ?? '—'}</p>
            <Button variant="outline" size="sm" className="mt-2 lg:mt-3 h-8 text-xs lg:h-9 lg:text-sm">
              Alterar foto
            </Button>
          </div>
        </div>

        <div className="space-y-2 lg:space-y-4 pt-3 lg:pt-4 border-t">
          {[
            { icon: Mail, label: 'E-mail', value: user?.email ?? '—' },
            { icon: Phone, label: 'Telefone', value: '—' },
            { icon: Building, label: 'Organização', value: session?.licitante?.nomeEmpresa ?? '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 lg:gap-4 p-2 lg:p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-sm lg:text-base truncate">{value}</p>
              </div>
              <NavArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
