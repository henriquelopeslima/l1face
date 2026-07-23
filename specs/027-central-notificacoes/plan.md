# Plano de Implementação: Central de Notificações no Frontend

**Branch**: `homolog` | **Data**: 2026-07-23 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/027-central-notificacoes/spec.md`

## Resumo

O backend já expõe a API de notificações (`GET /api/notificacoes`, `PATCH /api/notificacoes/{id}/lida`,
`PATCH /api/notificacoes/lidas`) e a dashboard já a consome. Falta integrar as duas outras superfícies que hoje
mostram dados fixos/fictícios: o sino de notificações do cabeçalho (`AppHeader`) e a seção "Alertas recentes" da
tela de Configurações (`NotificacoesSection`).

Abordagem técnica: criar uma nova vertical slice `src/features/notificacoes` (domain/data/presentation), seguindo
exatamente o padrão já usado em `src/features/dashboard` (Repository + UseCase + Hook, usando `apiFetch` do
`shared/infrastructure/apiClient`). O estado (lista de notificações + contagem de não lidas) é centralizado em um
`NotificacoesProvider` (Context, no mesmo espírito do `AuthProvider`) montado dentro da árvore autenticada
(`ProtectedRoute` → `RootLayout`), com polling em intervalo fixo. Tanto `AppHeader` quanto `NotificacoesSection`
passam a consumir o mesmo hook (`useNotificacoes`), garantindo consistência de estado (RF-006) sem duplicar
chamadas de rede.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0.2, React 19.2.6
**Dependências Principais**: react-router 7.15.1 (já usado para navegação), iconoir-react (ícones, já usado no
`AppHeader`/`NotificacoesSection`), componentes shadcn/ui existentes em `@/shared/components/ui` (Badge,
DropdownMenu, Card, Button), `apiFetch` de `@/shared/infrastructure/apiClient` para chamadas HTTP com
credenciais/licitante ativo.
**Armazenamento**: N/A — nenhum dado é persistido localmente; o estado de notificações vive em memória (Context
React) e é resincronizado com o backend via polling e após ações do usuário.
**Testes**: Vitest (`test:watch`) + padrão de teste unitário de Use Cases já usado em
`ObterDashboardUseCase.test.ts` (mock do contrato de repositório via `vi.fn()`).
**Plataforma Alvo**: SPA web responsiva (desktop e mobile), mesmas telas onde `AppHeader` e `ConfiguracoesPage` já
são renderizados.
**Tipo de Projeto**: Projeto único frontend (`l1face`), consumindo API já existente do backend (`l1core`) — não há
alteração de backend nesta funcionalidade.
**Metas de Performance**: Nenhuma meta específica além do padrão de UX de SPA (indicador de não lidas percebido
como "imediato" ao carregar qualquer tela; ver CS-001).
**Restrições**: Backend não expõe WebSocket/push para notificações — a atualização "quase em tempo real" (RF-009)
é feita via polling em intervalo fixo enquanto o usuário está com o sistema aberto. Estrutura de pastas e regras de
isolamento `domain`/`data`/`presentation` são obrigatórias (constituição, Princípio I).
**Escala/Scope**: Duas superfícies de UI a integrar (sino do cabeçalho + seção "Alertas recentes" em
Configurações); dashboard já integrada e fora de escopo.

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|----------------|
| I. Arquitetura e Estrutura de Pastas | PASS | Nova slice `src/features/notificacoes` com `domain/`, `data/`, `presentation/` estritamente isolados, espelhando `src/features/dashboard`. `AppHeader` (em `shared/`) consome apenas o hook público da camada `presentation` (`useNotificacoes`), nunca `data` diretamente — mesmo padrão já usado por `AppHeader` com `useAuth`. |
| II. SOLID e TypeScript | PASS | `INotificacaoRepository` (contrato) inverte a dependência entre Use Cases e a implementação HTTP; nenhum `any`/`as unknown` necessário — schemas de API são conhecidos e tipáveis. |
| III. Boas Práticas React | PASS | Toda lógica de polling, fetch e mutação fica em hook customizado (`useNotificacoes`) dentro de um Provider; componentes (`AppHeader`, `NotificacoesSection`) permanecem apresentacionais, apenas consumindo o hook e disparando callbacks. |
| IV. Segurança | PASS | Nenhum token/dado sensível novo é persistido em `localStorage`/`sessionStorage`; chamadas usam `apiFetch` (cookie HttpOnly + header de licitante já centralizados); nenhuma entrada de usuário livre é renderizada via `dangerouslySetInnerHTML` (conteúdo da notificação é texto simples vindo do backend). |
| V. Testes e Qualidade | PASS | Use Cases (`ListarNotificacoesUseCase`, `MarcarNotificacaoLidaUseCase`, `MarcarTodasNotificacoesLidasUseCase`) recebem cobertura unitária pura, seguindo o padrão de `ObterDashboardUseCase.test.ts`. |

Nenhuma violação identificada — Rastreamento de Complexidade não se aplica.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/027-central-notificacoes/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0
├── data-model.md        # Saída da Fase 1
├── quickstart.md        # Saída da Fase 1
├── contracts/           # Saída da Fase 1
│   ├── api-notificacoes.md
│   └── INotificacaoRepository.md
└── tasks.md             # Saída da Fase 2 (/speckit-tasks — não criado por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
├── shared/
│   ├── infrastructure/apiClient.ts        # Reutilizado sem alterações (apiFetch, setActiveLicitanteId)
│   └── components/layout/
│       ├── AppHeader.tsx                  # MODIFICADO: sino consome useNotificacoes()
│       └── RootLayout.tsx                 # MODIFICADO: envolvido por NotificacoesProvider
│
├── features/
│   ├── auth/…                             # Sem alterações (referência de padrão de Context)
│   ├── dashboard/…                        # Sem alterações (referência de padrão Repository/UseCase/Hook)
│   ├── configuracoes/
│   │   └── presentation/components/
│   │       └── NotificacoesSection.tsx    # MODIFICADO: consome useNotificacoes(), toggles desabilitados
│   └── notificacoes/                      # NOVA feature (vertical slice)
│       ├── domain/
│       │   ├── entities/Notificacao.ts
│       │   ├── contracts/INotificacaoRepository.ts
│       │   └── useCases/
│       │       ├── ListarNotificacoesUseCase.ts
│       │       ├── ListarNotificacoesUseCase.test.ts
│       │       ├── MarcarNotificacaoLidaUseCase.ts
│       │       ├── MarcarNotificacaoLidaUseCase.test.ts
│       │       ├── MarcarTodasNotificacoesLidasUseCase.ts
│       │       └── MarcarTodasNotificacoesLidasUseCase.test.ts
│       ├── data/
│       │   ├── mappers/notificacaoMappers.ts
│       │   └── repositories/NotificacaoRepository.ts
│       └── presentation/
│           ├── context/NotificacoesContext.tsx  # NotificacoesProvider + useNotificacoes()
│           └── components/NotificacaoItem.tsx   # item de lista reutilizado por header e Configurações
```

**Decisão de Estrutura**: Projeto único (frontend `l1face`), sem necessidade da Opção 2 (backend+frontend
separados) pois o backend já existe e não é tocado por esta funcionalidade. Nova feature `src/features/notificacoes`
segue a mesma Vertical Slice das features existentes (`dashboard`, `auth`); o estado compartilhado entre `AppHeader`
e a tela de Configurações é resolvido via Context Provider dentro da própria feature (`presentation/context`), não
via estado global genérico, respeitando o Princípio I (isolamento) e III (hooks customizados) da constituição.

## Rastreamento de Complexidade

*Sem violações a justificar — tabela omitida.*
