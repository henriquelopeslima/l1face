import { Outlet, useNavigate } from 'react-router';
import { NavArrowDown, LogOut } from 'iconoir-react';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import fotoPerfil from '@/shared/assets/foto-perfil-placeholder.jpg';

export function SelecionarVinculoLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-full min-h-0 flex flex-col bg-background overflow-hidden">
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-4 lg:px-8 lg:py-5 border-b border-border bg-card">
        <div className="min-w-0 flex-shrink-0">
          <LogoLicitaOne variant="light" className="h-8 w-auto lg:h-9 dark:hidden" />
          <LogoLicitaOne variant="dark" className="h-8 w-auto lg:h-9 hidden dark:block" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 sm:gap-3 h-11 px-2 sm:px-3 max-w-[min(100%,280px)]">
              <img
                src={fotoPerfil}
                alt="Foto de perfil de Lisvalder Paz"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <div className="hidden sm:flex flex-col items-start min-w-0 text-left">
                <span className="text-sm font-medium truncate w-full">Lisvalder Paz</span>
                <span className="text-xs text-muted-foreground truncate w-full max-w-[160px] lg:max-w-[200px]">
                  LP Soluções em Licitações
                </span>
              </div>
              <NavArrowDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal sm:hidden">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">Lisvalder Paz</p>
                <p className="text-xs text-muted-foreground truncate">LP Soluções em Licitações</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => navigate('/login')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-6 lg:px-8 lg:py-8">
        <div className="w-full max-w-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
