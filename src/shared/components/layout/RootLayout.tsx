import { Outlet, useLocation } from 'react-router';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { SupportChatbot } from './SupportChatbot';

function getBreadcrumb(pathname: string): string[] {
  if (pathname.startsWith('/contratos/') && pathname !== '/contratos/cadastrar' && pathname !== '/contratos/gestao') {
    return ['Contratos', 'Gestão', 'Visão de contrato'];
  }

  if (pathname.includes('/atas/') && pathname.includes('/gerar-contrato')) {
    return ['Atas de Registro de Preços', 'Gerar Contrato'];
  }
  if (pathname.includes('/atas/') && pathname.includes('/registrar-adesao')) {
    return ['Atas de Registro de Preços', 'Registrar Adesão'];
  }
  if (pathname.startsWith('/atas/') && pathname !== '/atas/cadastrar' && pathname !== '/atas/gestao') {
    return ['Atas de Registro de Preços', 'Visão de ata'];
  }

  const breadcrumbMap: Record<string, string[]> = {
    '/': ['Página inicial'],
    '/instrumentos/gestao': ['Instrumentos', 'Gestão'],
    '/instrumentos/cadastrar': ['Instrumentos', 'Cadastrar'],
    '/instrumentos/cadastrar/contrato': ['Instrumentos', 'Cadastrar', 'Contrato'],
    '/instrumentos/cadastrar/nota-empenho': ['Instrumentos', 'Cadastrar', 'Nota de empenho'],
    '/instrumentos/cadastrar/outro': ['Instrumentos', 'Cadastrar', 'Outro'],
    '/contratos/cadastrar': ['Contratos', 'Cadastrar contrato'],
    '/contratos/gestao': ['Contratos', 'Gestão'],
    '/atas/cadastrar': ['Atas de Registro de Preços', 'Cadastrar ata de registro de preços'],
    '/atas/gestao': ['Atas de Registro de Preços', 'Gestão'],
    '/suporte': ['Suporte'],
    '/configuracoes': ['Configurações'],
  };

  return breadcrumbMap[pathname] ?? ['LicitaOne'];
}

export function RootLayout() {
  const location = useLocation();
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <AppSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader breadcrumb={breadcrumb} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background pb-20 lg:pb-0">
          <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-5 xl:px-8 xl:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
      <SupportChatbot />
    </div>
  );
}
