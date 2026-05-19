import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Page,
  Notes,
  Settings,
  NavArrowDown,
  NavArrowRight,
  NavArrowLeft,
  PlusCircle,
  List,
  HelpCircle,
  Menu,
  User,
  HalfMoon,
  Bell,
  DollarCircle,
  Lock,
  Group,
  Wallet,
} from 'iconoir-react';
import { cn } from '@/shared/components/ui/utils';
import { LogoLicitaOne } from '@/shared/components/icons/LogoLicitaOne';
import { LicitaOneIcon } from '@/shared/components/icons/LicitaOneIcon';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  groupPathPrefix?: string;
  submenu?: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }[];
}

const MENU_ITEMS: MenuItem[] = [
  { title: 'Página inicial', icon: LicitaOneIcon, path: '/' },
  {
    title: 'Instrumentos',
    icon: Page,
    groupPathPrefix: '/instrumentos',
    submenu: [
      { title: 'Cadastrar', icon: PlusCircle, path: '/instrumentos/cadastrar' },
      { title: 'Contratos', icon: Page, path: '/instrumentos/gestao?tipo=contrato' },
      { title: 'Notas de Empenho', icon: Wallet, path: '/instrumentos/gestao?tipo=empenho' },
    ],
  },
  {
    title: 'Atas de Registro de Preços',
    icon: Notes,
    submenu: [
      { title: 'Cadastrar', icon: PlusCircle, path: '/atas/cadastrar' },
      { title: 'Gestão', icon: List, path: '/atas/gestao' },
    ],
  },
  { title: 'Suporte', icon: HelpCircle, path: '/suporte' },
  {
    title: 'Configurações',
    icon: Settings,
    submenu: [
      { title: 'Visão geral', icon: List, path: '/configuracoes' },
      { title: 'Meu perfil', icon: User, path: '/configuracoes#meu-perfil' },
      { title: 'Aparência', icon: HalfMoon, path: '/configuracoes#aparencia' },
      { title: 'Notificações', icon: Bell, path: '/configuracoes#notificacoes' },
      { title: 'Assinatura e cobrança', icon: DollarCircle, path: '/configuracoes#assinatura' },
      { title: 'Segurança', icon: Lock, path: '/configuracoes#seguranca' },
      { title: 'Gestão de acessos', icon: Group, path: '/configuracoes#gestao-acessos' },
    ],
  },
];

function isPathActive(pathname: string, hash: string, search: string, path: string) {
  if (path.includes('#')) {
    const [base, fragment] = path.split('#');
    return pathname === base && hash === `#${fragment}`;
  }
  const q = path.indexOf('?');
  if (q !== -1) {
    const base = path.slice(0, q);
    if (pathname !== base) return false;
    const want = new URLSearchParams(path.slice(q + 1));
    const have = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    for (const [k, v] of want.entries()) {
      if (have.get(k) !== v) return false;
    }
    return true;
  }
  return pathname === path && hash === '' && search === '';
}

function isSubmenuActive(pathname: string, hash: string, search: string, submenu?: MenuItem['submenu']) {
  if (!submenu) return false;
  return submenu.some((s) => isPathActive(pathname, hash, search, s.path));
}

export function AppSidebar() {
  const { pathname, hash, search } = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(true);

  const expanded = !collapsed;

  useEffect(() => {
    if (pathname === '/configuracoes' && expanded) {
      setOpenMenus((prev) => (prev.includes('Configurações') ? prev : [...prev, 'Configurações']));
    }
  }, [pathname, expanded]);

  useEffect(() => {
    if (pathname.startsWith('/instrumentos') && expanded) {
      setOpenMenus((prev) => (prev.includes('Instrumentos') ? prev : [...prev, 'Instrumentos']));
    }
  }, [pathname, expanded]);

  const toggleMenu = (title: string) => {
    if (collapsed) setCollapsed(false);
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      if (next) setOpenMenus([]);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full min-h-0 sticky top-0 shrink-0 border-r border-border bg-card',
        'min-w-0 overflow-x-hidden overflow-y-hidden transition-[width] duration-300 ease-out',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      <header
        className={cn(
          'shrink-0 flex h-14 min-w-0 items-center border-b border-border lg:h-20',
          collapsed
            ? 'justify-center gap-1 px-1.5'
            : 'justify-between gap-1 pl-4 lg:pl-8 pr-[12px]'
        )}
      >
        {!collapsed && (
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center justify-start overflow-hidden"
            aria-label="Ir para página inicial"
          >
            <div className="min-w-0 max-w-full overflow-hidden">
              <LogoLicitaOne variant="light" className="h-7 w-auto max-w-full dark:hidden" />
              <LogoLicitaOne variant="dark" className="h-7 w-auto max-w-full hidden dark:block" />
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-expanded={expanded}
          aria-label={expanded ? 'Recolher menu lateral' : 'Expandir menu lateral'}
        >
          {expanded ? <NavArrowLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <nav className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-[20px]">
        <div className={cn('min-w-0 space-y-0.5', expanded && 'space-y-1')}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = Boolean(item.submenu?.length);
            const menuOpen = openMenus.includes(item.title);
            const submenuActive = item.submenu
              ? isSubmenuActive(pathname, hash, search, item.submenu)
              : false;
            const prefixActive = item.groupPathPrefix ? pathname.startsWith(item.groupPathPrefix) : false;
            const itemActive = item.path
              ? isPathActive(pathname, hash, search, item.path)
              : submenuActive || prefixActive;

            if (hasSubmenu && item.submenu) {
              return (
                <div key={item.title} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      'flex w-full min-w-0 items-center rounded-md text-[15px] leading-snug transition-colors',
                      collapsed ? 'justify-center px-1 py-[10px]' : 'justify-between gap-1 px-2 py-[10px]',
                      itemActive
                        ? 'bg-[#EDF4FF] text-[#0050FF]'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-1.5')}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate font-medium">{item.title}</span>}
                    </div>
                    {!collapsed && (
                      <span className="shrink-0">
                        {menuOpen ? <NavArrowDown className="h-3.5 w-3.5" /> : <NavArrowRight className="h-3.5 w-3.5" />}
                      </span>
                    )}
                  </button>

                  {!collapsed && menuOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l-2 border-border py-0.5 pl-2 ml-1.5">
                      {item.submenu.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = isPathActive(pathname, hash, search, sub.path);
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={cn(
                              'flex min-w-0 items-center gap-1.5 rounded-md px-2 py-[10px] text-sm leading-snug transition-colors',
                              subActive
                                ? 'bg-[#0050FF] font-medium text-white'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <SubIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.path!}
                className={cn(
                  'flex min-w-0 items-center rounded-md text-[15px] leading-snug font-medium transition-colors',
                  collapsed ? 'justify-center px-1 py-[10px]' : 'gap-1.5 px-2 py-[10px]',
                  itemActive
                    ? 'bg-[#0050FF] text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
