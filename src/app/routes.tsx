import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from '@/shared/components/layout/RootLayout';
import { SelecionarVinculoLayout } from '@/shared/components/layout/SelecionarVinculoLayout';
import { LoginPage } from '@/features/auth/presentation/pages/LoginPage';
import { SelecionarVinculoPage } from '@/features/auth/presentation/pages/SelecionarVinculoPage';
import { DashboardPage } from '@/features/dashboard/presentation/pages/DashboardPage';
import { InstrumentosGestaoPage } from '@/features/instrumentos/presentation/pages/InstrumentosGestaoPage';
import { InstrumentosCadastrarPage } from '@/features/instrumentos/presentation/pages/InstrumentosCadastrarPage';
import { InstrumentosContratoCadastrarPage } from '@/features/instrumentos/presentation/pages/InstrumentosContratoCadastrarPage';
import { NotaEmpenhoCadastrarPage } from '@/features/instrumentos/presentation/pages/NotaEmpenhoCadastrarPage';
import { OutroInstrumentoCadastrarPage } from '@/features/instrumentos/presentation/pages/OutroInstrumentoCadastrarPage';
import { ContratoDetalhesPage } from '@/features/instrumentos/presentation/pages/ContratoDetalhesPage';
import { NotaEmpenhoDetalhesPage } from '@/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage';
import { ArpGestaoPage } from '@/features/atas/presentation/pages/ArpGestaoPage';
import { ArpCadastrarPage } from '@/features/atas/presentation/pages/ArpCadastrarPage';
import { ArpDetalhesPage } from '@/features/atas/presentation/pages/ArpDetalhesPage';
import { ArpGerarContratoPage } from '@/features/atas/presentation/pages/ArpGerarContratoPage';
import { ArpRegistrarAdesaoPage } from '@/features/atas/presentation/pages/ArpRegistrarAdesaoPage';
import { ArpVisualizarPage } from '@/features/atas/presentation/pages/ArpVisualizarPage';
import { SuportePage } from '@/features/suporte/presentation/pages/SuportePage';
import { ConfiguracoesPage } from '@/features/configuracoes/presentation/pages/ConfiguracoesPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/selecionar-vinculo',
    Component: SelecionarVinculoLayout,
    children: [{ index: true, Component: SelecionarVinculoPage }],
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'contratos/gestao', element: <Navigate to="/instrumentos/gestao" replace /> },
      { path: 'contratos/cadastrar', element: <Navigate to="/instrumentos/cadastrar" replace /> },
      { path: 'instrumentos/gestao', Component: InstrumentosGestaoPage },
      { path: 'instrumentos/cadastrar', Component: InstrumentosCadastrarPage },
      { path: 'instrumentos/cadastrar/contrato', Component: InstrumentosContratoCadastrarPage },
      { path: 'instrumentos/cadastrar/nota-empenho', Component: NotaEmpenhoCadastrarPage },
      { path: 'instrumentos/cadastrar/outro', Component: OutroInstrumentoCadastrarPage },
      { path: 'contratos/detalhes/:id', Component: ContratoDetalhesPage },
      { path: 'notas-empenho/detalhes/:id', Component: NotaEmpenhoDetalhesPage },
      { path: 'atas/gestao', Component: ArpGestaoPage },
      { path: 'atas/cadastrar', Component: ArpCadastrarPage },
      { path: 'atas/:id/gerar-contrato', Component: ArpGerarContratoPage },
      { path: 'atas/:id/registrar-adesao', Component: ArpRegistrarAdesaoPage },
      { path: 'atas/:id/visualizar', Component: ArpVisualizarPage },
      { path: 'atas/:id', Component: ArpDetalhesPage },
      { path: 'suporte', Component: SuportePage },
      { path: 'configuracoes', Component: ConfiguracoesPage },
    ],
  },
]);
