# Plano de Implementação: Migração do Protótipo React para l1face

**Branch**: `001-migrate-react-proto` | **Data**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `specs/001-migrate-react-proto/spec.md`

## Resumo

Migração completa do protótipo `react-proto` (exportado de ferramenta de prototipação) para o projeto `l1face`, mantendo fidelidade visual exata. O código será reestruturado seguindo Clean Architecture com Vertical Slices, TypeScript estrito e boas práticas React — contrastando com a estrutura flat e ad-hoc do protótipo original. Dados permanecem mockados nesta fase; nenhuma integração com API é realizada.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x / React 19
**Dependências Principais**: React Router 7, Tailwind CSS 4, Radix UI, next-themes, lucide-react, iconoir-react, recharts, react-hook-form, Zod, sonner
**Armazenamento**: N/A — dados mockados em memória (sem persistência nesta fase)
**Testes**: Vitest + React Testing Library
**Plataforma Alvo**: Web SPA (desktop e mobile — breakpoints Tailwind: `lg` = desktop, abaixo = mobile)
**Tipo de Projeto**: Single Page Application (web-app)
**Metas de Performance**: Carregamento inicial da aplicação similar ao protótipo original (< 3s em conexão padrão)
**Restrições**: Fidelidade visual ao protótipo; responsividade desktop/mobile; TypeScript estrito (sem `any`)
**Escala/Scope**: 18 rotas, 6 features verticais, ~24 componentes de UI, ~12 componentes de layout/shared

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Gate | Princípio | Status | Observação |
|------|-----------|--------|------------|
| G1 | Clean Architecture / Vertical Slices | ✅ Passa | Features organizadas em `domain/`, `data/`, `presentation/`. Camada `domain` conterá interfaces TypeScript e Use Cases mockados; `data` terá repositórios mock; `presentation` terá componentes React. |
| G2 | SOLID + TypeScript Estrito | ✅ Passa | Migração reescreve o protótipo com strict mode ativo. Sem `any`. Componentes seguirão ISP com props granulares. |
| G3 | React Best Practices | ✅ Passa | Lógica de estado e Use Cases extraídos para custom hooks por feature. Componentes visuais serão presentacionais. |
| G4 | Security by Design | ✅ Passa | Formulários validados via Zod antes de qualquer submissão. Auth mockada não persiste tokens. Sem `dangerouslySetInnerHTML`. |
| G5 | Testes e Qualidade | ✅ Passa | Use Cases em `domain/` terão 100% de cobertura unitária. Para esta fase (dados mockados), os Use Cases são: filtrar listas, calcular status, transformar dados para exibição. |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/001-migrate-react-proto/
├── plan.md              ← Este arquivo
├── research.md          ← Decisões de bibliotecas e padrões (Fase 0)
├── data-model.md        ← Modelo de dados e entidades (Fase 1)
├── quickstart.md        ← Como rodar o projeto (Fase 1)
├── contracts/           ← Contratos de componentes UI (Fase 1)
└── tasks.md             ← Gerado pelo /speckit-tasks (não por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   │   ├── entities/VinculoInstitucional.ts
│   │   │   └── contracts/IAuthRepository.ts
│   │   ├── data/
│   │   │   └── MockAuthRepository.ts
│   │   └── presentation/
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx
│   │       │   └── SelecionarVinculoPage.tsx
│   │       └── hooks/
│   │           └── useAuth.ts
│   ├── dashboard/
│   │   ├── domain/
│   │   │   ├── entities/DashboardSummary.ts
│   │   │   └── contracts/IDashboardRepository.ts
│   │   ├── data/
│   │   │   └── MockDashboardRepository.ts
│   │   └── presentation/
│   │       ├── pages/DashboardPage.tsx
│   │       └── hooks/useDashboard.ts
│   ├── instrumentos/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── InstrumentoContratual.ts
│   │   │   ├── contracts/
│   │   │   │   └── IInstrumentosRepository.ts
│   │   │   └── useCases/
│   │   │       ├── ListarInstrumentos.ts
│   │   │       └── CadastrarInstrumento.ts
│   │   ├── data/
│   │   │   └── MockInstrumentosRepository.ts
│   │   └── presentation/
│   │       ├── pages/
│   │       │   ├── InstrumentosGestaoPage.tsx
│   │       │   ├── InstrumentosCadastrarPage.tsx
│   │       │   ├── InstrumentosContratoCadastrarPage.tsx
│   │       │   ├── NotaEmpenhoCadastrarPage.tsx
│   │       │   ├── OutroInstrumentoCadastrarPage.tsx
│   │       │   ├── ContratoDetalhesPage.tsx
│   │       │   └── NotaEmpenhoDetalhesPage.tsx
│   │       ├── components/
│   │       │   └── InstrumentoStatusBadge.tsx
│   │       └── hooks/
│   │           └── useInstrumentos.ts
│   ├── atas/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── AtaRegistroPrecos.ts
│   │   │   ├── contracts/
│   │   │   │   └── IAtasRepository.ts
│   │   │   └── useCases/
│   │   │       ├── ListarArps.ts
│   │   │       └── CadastrarArp.ts
│   │   ├── data/
│   │   │   └── MockAtasRepository.ts
│   │   └── presentation/
│   │       ├── pages/
│   │       │   ├── ArpGestaoPage.tsx
│   │       │   ├── ArpCadastrarPage.tsx
│   │       │   ├── ArpDetalhesPage.tsx
│   │       │   ├── ArpGerarContratoPage.tsx
│   │       │   ├── ArpRegistrarAdesaoPage.tsx
│   │       │   └── ArpVisualizarPage.tsx
│   │       └── hooks/
│   │           └── useArps.ts
│   ├── suporte/
│   │   └── presentation/
│   │       └── pages/SuportePage.tsx
│   └── configuracoes/
│       └── presentation/
│           └── pages/ConfiguracoesPage.tsx
├── shared/
│   ├── components/
│   │   ├── ui/                    ← Apenas componentes usados nas páginas
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── utils.ts           ← Função cn()
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx
│   │   │   ├── SelecionarVinculoLayout.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   └── SupportChatbot.tsx
│   │   ├── icons/
│   │   │   ├── LicitaOneIcon.tsx
│   │   │   └── LogoLicitaOne.tsx
│   │   └── feedback/
│   │       └── CadastroSucesso.tsx
│   ├── hooks/
│   │   └── useMobile.ts
│   └── assets/
│       ├── logo-licita-one-dark.svg
│       ├── logo-licita-one-light.svg
│       ├── icon-licita-one.svg
│       └── foto-perfil-placeholder.jpg
├── app/
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   ├── routes.tsx
│   └── App.tsx
└── main.tsx

tests/
├── features/
│   ├── instrumentos/domain/useCases/
│   │   ├── ListarInstrumentos.test.ts
│   │   └── CadastrarInstrumento.test.ts
│   └── atas/domain/useCases/
│       ├── ListarArps.test.ts
│       └── CadastrarArp.test.ts
└── shared/
```

**Decisão de Estrutura**: SPA com Vertical Slices. Cada feature (`auth`, `dashboard`, `instrumentos`, `atas`, `suporte`, `configuracoes`) é auto-contida seguindo as três camadas da constituição. Componentes de UI genéricos e layout vivem em `shared/` pois são transversais a múltiplas features.

## Rastreamento de Complexidade

> Nenhuma violação de constituição identificada. Seção não aplicável para esta feature.
