import { Bell, HalfMoon, SunLight, User, NavArrowDown } from 'iconoir-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import fotoPerfil from '@/shared/assets/foto-perfil-placeholder.jpg';
import { useAuth } from '@/features/auth/presentation/context/AuthContext';

interface AppHeaderProps {
  breadcrumb?: string[];
}

export function AppHeader({ breadcrumb = ['LicitaOne'] }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { session, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="flex h-14 lg:h-20 items-center justify-between px-4 lg:px-8">
        <Link
          to="/"
          className="lg:hidden absolute left-1/2 -translate-x-1/2"
          aria-label="Ir para página inicial"
        >
          <LogoLicitaOne variant="light" className="h-7 w-auto dark:hidden" />
          <LogoLicitaOne variant="dark" className="h-7 w-auto hidden dark:block" />
        </Link>

        <div className="hidden lg:block">
          <h2 className="text-2xl font-semibold tracking-tight">
            {breadcrumb.length > 1 ? breadcrumb[1] : breadcrumb[0]}
          </h2>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-11 w-11">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#EF4444] text-white text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <div className="p-3 hover:bg-accent cursor-pointer border-b">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Contrato 042/2024 próximo ao vencimento</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Vence em 15 dias</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-accent cursor-pointer border-b">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Ata de registro precisa de renovação</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Vence em 45 dias</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-accent cursor-pointer">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Pagamento processado com sucesso</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Há 2 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <SunLight className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <HalfMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 h-11 px-3">
                <img
                  src={fotoPerfil}
                  alt={`Foto de perfil de ${session?.user.nomeCompleto ?? '—'}`}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{session?.user.nomeCompleto ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">{session?.licitante.nomeEmpresa ?? '—'}</span>
                </div>
                <NavArrowDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
