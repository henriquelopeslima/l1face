import { Link, useLocation } from 'react-router';
import { Page, Notes, HelpCircle, Settings } from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';
import { LicitaOneIcon } from '@/shared/components/icons/LicitaOneIcon';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { title: 'Instrumentos', icon: Page, path: '/instrumentos/gestao' },
  { title: 'Atas', icon: Notes, path: '/atas/gestao' },
  { title: 'Suporte', icon: HelpCircle, path: '/suporte' },
  { title: 'Config', icon: Settings, path: '/configuracoes' },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors',
            isActive('/') ? 'text-[#0050FF]' : 'text-muted-foreground active:bg-accent'
          )}
        >
          <LicitaOneIcon className={cn('h-6 w-6', isActive('/') && 'stroke-[2.5]')} />
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-[#0050FF]' : 'text-muted-foreground active:bg-accent'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
