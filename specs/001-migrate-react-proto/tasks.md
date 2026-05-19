# Tarefas: Migração do Protótipo React para l1face

**Entrada**: Documentos de design em `specs/001-migrate-react-proto/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

## Formato: `[ID] [P?] [Story?] Descrição — caminho`

- **[P]**: Pode ser executado em paralelo (arquivos distintos, sem dependências bloqueantes)
- **[Story]**: História de usuário correspondente do spec.md

---

## Fase 1: Setup (Infraestrutura do Projeto)

**Propósito**: Preparar o projeto l1face com todas as dependências e configurações necessárias para a migração.

- [X] T001 Instalar todas as dependências listadas em research.md — `package.json`
- [X] T002 [P] Configurar Vite com plugin React e alias de paths — `vite.config.ts`
- [X] T003 [P] Configurar TypeScript strict mode (sem `any`, strict: true) — `tsconfig.json` + `tsconfig.app.json`
- [X] T004 [P] Configurar Tailwind CSS v4 com tema customizado e variáveis CSS do protótipo — `src/styles/index.css` + `src/styles/theme.css`
- [ ] T005 [P] Configurar Vitest com jsdom e cobertura obrigatória de Use Cases — `vitest.config.ts` + `tests/setup.ts`
- [X] T006 Criar estrutura de diretórios conforme plan.md — `src/features/`, `src/shared/`, `src/app/`, `tests/`

---

## Fase 2: Fundação (Shared — Pré-requisito para Todas as Histórias)

**Propósito**: Infraestrutura compartilhada que DEVE estar completa antes de qualquer feature slice.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

### Assets e Utilitários

- [X] T007 [P] Renomear e migrar assets do protótipo para `src/shared/assets/` (logo-licita-one-dark.svg, logo-licita-one-light.svg, icon-licita-one.svg, foto-perfil-placeholder.jpg)
- [X] T008 [P] Migrar função utilitária `cn()` (clsx + tailwind-merge) — `src/shared/components/ui/utils.ts`

### Componentes de UI Genéricos (apenas os usados nas páginas)

- [X] T009 [P] Migrar componentes de formulário: `form`, `input`, `label`, `checkbox`, `textarea` — `src/shared/components/ui/`
- [X] T010 [P] Migrar componentes de exibição: `card`, `badge`, `table`, `separator`, `skeleton` — `src/shared/components/ui/`
- [X] T011 [P] Migrar componentes interativos: `button`, `select`, `switch`, `tabs`, `dropdown-menu` — `src/shared/components/ui/`
- [X] T012 [P] Migrar componentes de overlay e feedback: `dialog`, `accordion`, `alert`, `tooltip`, `sonner` — `src/shared/components/ui/`

### Ícones e Identidade Visual

- [X] T013 [P] Migrar componente `LicitaOneIcon` — `src/shared/components/icons/LicitaOneIcon.tsx`
- [X] T014 [P] Migrar componente `LogoLicitaOne` com variantes claro/escuro — `src/shared/components/icons/LogoLicitaOne.tsx`

### Hooks Compartilhados

- [X] T015 [P] Migrar hook `useMobile` — `src/shared/hooks/useMobile.ts`

### Layout

- [X] T016 Migrar `AppSidebar` com menu de navegação e submenus — `src/shared/components/layout/AppSidebar.tsx`
- [X] T017 Migrar `AppHeader` com breadcrumb dinâmico, notificações e menu de usuário — `src/shared/components/layout/AppHeader.tsx`
- [X] T018 [P] Migrar `MobileBottomNav` — `src/shared/components/layout/MobileBottomNav.tsx`
- [X] T019 [P] Migrar `SupportChatbot` (botão flutuante) — `src/shared/components/layout/SupportChatbot.tsx`
- [X] T020 Migrar `RootLayout` compondo Sidebar + Header + Outlet + MobileBottomNav + SupportChatbot — `src/shared/components/layout/RootLayout.tsx`
- [X] T021 [P] Migrar `SelecionarVinculoLayout` — `src/shared/components/layout/SelecionarVinculoLayout.tsx`
- [X] T022 [P] Migrar `CadastroSucesso` (tela de confirmação pós-cadastro) — `src/shared/components/feedback/CadastroSucesso.tsx`

### App Shell

- [X] T023 Criar `ThemeProvider` wrapper com next-themes — `src/app/providers/ThemeProvider.tsx`
- [X] T024 Configurar todas as 18 rotas + 2 redirects legados em `createBrowserRouter` — `src/app/routes.tsx`
- [X] T025 Criar `App.tsx` compondo ThemeProvider + RouterProvider — `src/app/App.tsx`
- [X] T026 Atualizar ponto de entrada — `src/main.tsx`

**Checkpoint**: Aplicação inicia, navega entre rotas (páginas vazias ok) e aplica tema claro/escuro.

---

## Fase 3: História de Usuário 1 — Autenticação e Seleção de Entidade (P1) 🎯 MVP

**Objetivo**: Usuário consegue fazer login e selecionar um vínculo institucional para acessar o sistema.

**Teste Independente**: Abrir `/login`, preencher credenciais + aceitar termos → clicar "Entrar" → tela de seleção de vínculo → selecionar vínculo → acessar Dashboard.

### Domínio

- [ ] T027 [P] [US1] Criar entidade `VinculoInstitucional` — `src/features/auth/domain/entities/VinculoInstitucional.ts`
- [ ] T028 [P] [US1] Criar interface `IAuthRepository` — `src/features/auth/domain/contracts/IAuthRepository.ts`

### Dados

- [ ] T029 [P] [US1] Implementar `MockAuthRepository` com vínculos institucionais mockados — `src/features/auth/data/MockAuthRepository.ts`

### Apresentação

- [ ] T030 [US1] Criar hook `useAuth` consumindo `IAuthRepository` via contexto — `src/features/auth/presentation/hooks/useAuth.ts`
- [X] T031 [US1] Migrar página de Login com validação visual (email obrigatório, senha obrigatória, termos aceitos) e navegação para `/selecionar-vinculo` — `src/features/auth/presentation/pages/LoginPage.tsx`
- [X] T032 [US1] Migrar página SelecionarVinculo com lista de vínculos e navegação para `/` — `src/features/auth/presentation/pages/SelecionarVinculoPage.tsx`

**Checkpoint**: Fluxo Login → SelecionarVinculo → Dashboard funciona completamente.

---

## Fase 4: História de Usuário 2 — Dashboard e Navegação Principal (P1)

**Objetivo**: Usuário visualiza painel de resumo e navega pelo sistema via sidebar (desktop) ou bottom nav (mobile).

**Teste Independente**: Acessar `/` autenticado → ver cards de resumo, gráficos e alertas → clicar itens do menu → breadcrumb atualiza.

### Domínio

- [ ] T033 [P] [US2] Criar entidades `DashboardSummary`, `EvolucaoMensal`, `StatusDistribuicao`, `Alerta` — `src/features/dashboard/domain/entities/DashboardSummary.ts`
- [ ] T034 [P] [US2] Criar interface `IDashboardRepository` — `src/features/dashboard/domain/contracts/IDashboardRepository.ts`

### Dados

- [ ] T035 [P] [US2] Implementar `MockDashboardRepository` com dados do Dashboard do protótipo — `src/features/dashboard/data/MockDashboardRepository.ts`

### Apresentação

- [ ] T036 [US2] Criar hook `useDashboard` consumindo `IDashboardRepository` — `src/features/dashboard/presentation/hooks/useDashboard.ts`
- [X] T037 [US2] Migrar Dashboard com cards de resumo, gráficos de evolução mensal (AreaChart), distribuição de status (PieChart) e alertas — `src/features/dashboard/presentation/pages/DashboardPage.tsx`

**Checkpoint**: Dashboard exibe todos os dados mockados; sidebar e bottom nav funcionam; breadcrumb reflete rota atual.

---

## Fase 5: História de Usuário 3 — Gestão de Instrumentos Contratuais (P1)

**Objetivo**: Usuário lista, cadastra (contrato, nota de empenho, outro) e visualiza detalhes de instrumentos contratuais.

**Teste Independente**: Navegar para `/instrumentos/gestao` → ver lista → acessar `/instrumentos/cadastrar` → selecionar tipo → preencher formulário → ver tela de sucesso → acessar detalhes de um item da lista.

### Domínio

- [ ] T038 [P] [US3] Criar entidade `InstrumentoContratual` com tipos discriminados — `src/features/instrumentos/domain/entities/InstrumentoContratual.ts`
- [ ] T039 [P] [US3] Criar interface `IInstrumentosRepository` — `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`
- [ ] T040 [P] [US3] Implementar Use Case `ListarInstrumentos` (filtragem por tipo e status) — `src/features/instrumentos/domain/useCases/ListarInstrumentos.ts`
- [ ] T041 [P] [US3] Implementar Use Case `CadastrarInstrumento` (valida dados e persiste no repositório) — `src/features/instrumentos/domain/useCases/CadastrarInstrumento.ts`
- [ ] T042 [P] [US3] Escrever testes unitários para `ListarInstrumentos` (100% cobertura) — `tests/features/instrumentos/domain/useCases/ListarInstrumentos.test.ts`
- [ ] T043 [P] [US3] Escrever testes unitários para `CadastrarInstrumento` (100% cobertura) — `tests/features/instrumentos/domain/useCases/CadastrarInstrumento.test.ts`

### Dados

- [ ] T044 [US3] Implementar `MockInstrumentosRepository` com dados mockados do protótipo — `src/features/instrumentos/data/MockInstrumentosRepository.ts`
- [ ] T045 [US3] Criar `InstrumentosContext` e provider para injeção do repositório — `src/features/instrumentos/data/InstrumentosContext.tsx`

### Apresentação

- [ ] T046 [US3] Criar hook `useInstrumentos` consumindo Use Cases via contexto — `src/features/instrumentos/presentation/hooks/useInstrumentos.ts`
- [ ] T047 [P] [US3] Criar componente `InstrumentoStatusBadge` (badge colorido por status) — `src/features/instrumentos/presentation/components/InstrumentoStatusBadge.tsx`
- [X] T048 [US3] Migrar página `InstrumentosGestao` com listagem, filtros por tipo e busca — `src/features/instrumentos/presentation/pages/InstrumentosGestaoPage.tsx`
- [X] T049 [US3] Migrar página `InstrumentosCadastrar` com seleção de tipo de instrumento — `src/features/instrumentos/presentation/pages/InstrumentosCadastrarPage.tsx`
- [X] T050 [US3] Migrar formulário de Contrato com Zod schema e react-hook-form, navegando para CadastroSucesso ao submeter — `src/features/instrumentos/presentation/pages/InstrumentosContratoCadastrarPage.tsx`
- [X] T051 [US3] Migrar formulário de Nota de Empenho com Zod schema e navegação para CadastroSucesso — `src/features/instrumentos/presentation/pages/NotaEmpenhoCadastrarPage.tsx`
- [X] T052 [US3] Migrar formulário de Outro Instrumento com Zod schema e navegação para CadastroSucesso — `src/features/instrumentos/presentation/pages/OutroInstrumentoCadastrarPage.tsx`
- [X] T053 [US3] Migrar tela de detalhes do Contrato — `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`
- [X] T054 [US3] Migrar tela de detalhes da Nota de Empenho — `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`

**Checkpoint**: Fluxo completo de instrumentos funciona — listagem → cadastro → sucesso → detalhes.

---

## Fase 6: História de Usuário 4 — Gestão de Atas de Registro de Preços (P2)

**Objetivo**: Usuário lista, cadastra e gerencia ARPs com todas as sub-ações: gerar contrato, registrar adesão e visualizar.

**Teste Independente**: Navegar `/atas/gestao` → ver lista → `/atas/cadastrar` → preencher → sucesso → detalhes de uma ARP → testar cada sub-ação (gerar contrato, registrar adesão, visualizar).

### Domínio

- [ ] T055 [P] [US4] Criar entidade `AtaRegistroPrecos` com status discriminado — `src/features/atas/domain/entities/AtaRegistroPrecos.ts`
- [ ] T056 [P] [US4] Criar interface `IAtasRepository` — `src/features/atas/domain/contracts/IAtasRepository.ts`
- [ ] T057 [P] [US4] Implementar Use Case `ListarArps` (filtragem por status e busca) — `src/features/atas/domain/useCases/ListarArps.ts`
- [ ] T058 [P] [US4] Implementar Use Case `CadastrarArp` (valida dados e persiste no repositório) — `src/features/atas/domain/useCases/CadastrarArp.ts`
- [ ] T059 [P] [US4] Escrever testes unitários para `ListarArps` (100% cobertura) — `tests/features/atas/domain/useCases/ListarArps.test.ts`
- [ ] T060 [P] [US4] Escrever testes unitários para `CadastrarArp` (100% cobertura) — `tests/features/atas/domain/useCases/CadastrarArp.test.ts`

### Dados

- [ ] T061 [US4] Implementar `MockAtasRepository` com dados mockados do protótipo — `src/features/atas/data/MockAtasRepository.ts`
- [ ] T062 [US4] Criar `AtasContext` e provider para injeção do repositório — `src/features/atas/data/AtasContext.tsx`

### Apresentação

- [ ] T063 [US4] Criar hook `useArps` consumindo Use Cases via contexto — `src/features/atas/presentation/hooks/useArps.ts`
- [X] T064 [US4] Migrar página `ArpGestao` com listagem, filtros e busca — `src/features/atas/presentation/pages/ArpGestaoPage.tsx`
- [X] T065 [US4] Migrar formulário `ArpCadastrar` com Zod schema (arpSchema) e react-hook-form, navegando para CadastroSucesso — `src/features/atas/presentation/pages/ArpCadastrarPage.tsx`
- [X] T066 [US4] Migrar página `ArpDetalhes` com dados da ARP e links para sub-ações — `src/features/atas/presentation/pages/ArpDetalhesPage.tsx`
- [X] T067 [US4] Migrar página `ArpGerarContrato` com fluxo de geração de instrumento vinculado à ARP — `src/features/atas/presentation/pages/ArpGerarContratoPage.tsx`
- [X] T068 [US4] Migrar página `ArpRegistrarAdesao` com formulário de adesão — `src/features/atas/presentation/pages/ArpRegistrarAdesaoPage.tsx`
- [X] T069 [US4] Migrar página `ArpVisualizar` com visualização completa da ata — `src/features/atas/presentation/pages/ArpVisualizarPage.tsx`

**Checkpoint**: Fluxo completo de ARPs funciona — listagem → cadastro → detalhes → todas as sub-ações.

---

## Fase 7: História de Usuário 5 — Suporte e Configurações (P3)

**Objetivo**: Usuário acessa páginas de suporte e configurações; chatbot flutuante disponível em todas as telas.

**Teste Independente**: Acessar `/suporte` e `/configuracoes` → verificar que as telas renderizam com conteúdo correto; clicar no botão flutuante de suporte em qualquer página autenticada.

- [X] T070 [US5] Migrar página Suporte — `src/features/suporte/presentation/pages/SuportePage.tsx`
- [X] T071 [US5] Migrar página Configurações com seções (perfil, aparência, notificações, segurança, acessos) — `src/features/configuracoes/presentation/pages/ConfiguracoesPage.tsx`

**Checkpoint**: Suporte e Configurações renderizam corretamente; SupportChatbot (já migrado na Fase 2) aparece em todas as telas autenticadas.

---

## Fase Final: Polimento e Validação

**Propósito**: Verificações de qualidade e fidelidade visual transversais a todas as histórias.

- [X] T072 Verificar que todas as 18 rotas e os 2 redirects legados estão corretos em `src/app/routes.tsx`
- [ ] T073 [P] Executar auditoria visual rodando `npm run dev` e comparar cada rota com o protótipo original (`react-proto`)
- [ ] T074 [P] Verificar comportamento responsivo — sidebar visível em desktop (≥lg), bottom nav visível em mobile (<lg) em todas as páginas
- [ ] T075 Executar `npm run test:coverage` e confirmar 100% de cobertura dos Use Cases (T042, T043, T059, T060)
- [X] T076 Executar `npm run build` e confirmar build sem erros TypeScript (modo strict)

---

## Dependências & Ordem de Execução

### Entre Fases

- **Fase 1 (Setup)**: Sem dependências — iniciar imediatamente
- **Fase 2 (Fundação)**: Depende da Fase 1 — BLOQUEIA todas as histórias
- **Fases 3–7 (Histórias P1, P1, P1, P2, P3)**: Dependem da Fase 2
  - US1, US2, US3 têm prioridade P1 — podem ser trabalhadas em paralelo por equipes distintas
  - US4 (P2) pode iniciar assim que a Fase 2 estiver completa (não depende de US3)
  - US5 (P3) pode ser trabalhada a qualquer momento após a Fase 2
- **Fase Final**: Depende de todas as histórias desejadas estarem completas

### Dentro de Cada História

- Domínio (entidades + contratos + use cases + testes) → pode ser paralelo entre si
- Dados (repositório mock + contexto) → depende das entidades e contratos
- Apresentação (hook + componentes + páginas) → depende do contexto

### Dependências entre Histórias

- **US1** (Auth): Independente — pode iniciar após Fase 2
- **US2** (Dashboard): Independente — pode iniciar após Fase 2; usa `RootLayout` da Fase 2
- **US3** (Instrumentos): Independente — pode iniciar após Fase 2
- **US4** (ARPs): Independente — pode iniciar após Fase 2; `ArpGerarContrato` pode reusar lógica de US3
- **US5** (Suporte/Config): Independente — apenas renderização estática

---

## Exemplo de Paralelismo: História de Usuário 3 (Instrumentos)

```bash
# Paralelo — iniciar simultaneamente após T045:
T046: useInstrumentos hook
T047: InstrumentoStatusBadge component

# Paralelo — entidades e contratos:
T038: InstrumentoContratual entity
T039: IInstrumentosRepository
T040: ListarInstrumentos use case
T041: CadastrarInstrumento use case
T042: Testes ListarInstrumentos
T043: Testes CadastrarInstrumento

# Paralelo — páginas de formulário (após T044, T045, T046):
T050: InstrumentosContratoCadastrarPage
T051: NotaEmpenhoCadastrarPage
T052: OutroInstrumentoCadastrarPage
```

---

## Estratégia de Implementação

### MVP (Apenas US1 — Login + Seleção de Vínculo)

1. Concluir Fase 1 (Setup)
2. Concluir Fase 2 (Fundação)
3. Concluir Fase 3 (US1 — Auth)
4. **PARAR e VALIDAR**: testar fluxo Login → SelecionarVinculo → Dashboard (vazio ok)

### Entrega Incremental

1. Setup + Fundação → App shell funcional com navegação
2. + US1 → Login e seleção de vínculo funcionam ✅
3. + US2 → Dashboard com dados mockados ✅
4. + US3 → Gestão completa de instrumentos ✅ ← core do sistema
5. + US4 → Gestão completa de ARPs ✅
6. + US5 → Suporte e Configurações ✅
7. Polimento + validação final ✅

---

## Notas

- **[P]** = arquivos distintos, sem bloqueios — safe para executar em paralelo
- **[US?]** = rastreabilidade para a história de usuário do spec.md
- Testes de Use Cases (T042, T043, T059, T060) são OBRIGATÓRIOS pela constituição (100% cobertura)
- Assets migrados com nomes descritivos conforme clarificação Q3 da spec
- Componentes UI genéricos: apenas os auditados como usados nas páginas (clarificação Q1)
- Formulários: Zod + react-hook-form + navegação para CadastroSucesso (clarificação Q2)
