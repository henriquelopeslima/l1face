---
description: "Tarefas de implementação para Autenticação e Seleção de Licitante"
---

# Tarefas: Autenticação e Seleção de Licitante

**Entrada**: Documentos de design em `specs/002-login-licitante/`
**Pré-requisitos**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Organização**: Tarefas agrupadas por história de usuário para implementação e teste independentes.

**Testes**: Tarefas de teste incluídas na fase de polimento conforme exigido pela Constituição (Use Cases em `domain/` devem ter 100% de cobertura).

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: História de usuário a que a tarefa pertence (US1–US4)

---

## Fase 1: Setup

**Propósito**: Preparar infraestrutura e configurações que desbloqueiam toda a implementação.

- [x] T001 Criar estrutura de diretórios da feature auth: `src/features/auth/domain/entities/`, `src/features/auth/domain/repositories/`, `src/features/auth/domain/usecases/`, `src/features/auth/domain/errors/`, `src/features/auth/data/repositories/`, `src/features/auth/data/mappers/`, `src/features/auth/presentation/context/`, `src/features/auth/presentation/hooks/`, `src/shared/components/guards/`
- [x] T00X Configurar proxy `/api` → `http://localhost:80` no Vite em `vite.config.ts` para evitar CORS em desenvolvimento

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Camada de domínio e dados — DEVE ser concluída antes de qualquer história de usuário.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [x] T00X Criar entidade `User` (id, email, nomeCompleto, licitantes) em `src/features/auth/domain/entities/user.ts`
- [x] T00X [P] Criar entidade `Licitante` (id, cnpj, nomeEmpresa) em `src/features/auth/domain/entities/licitante.ts`
- [x] T00X Criar tipos `LoginCredentials` e `AuthSession` em `src/features/auth/domain/entities/authSession.ts` (depende de T003, T004)
- [x] T00X Criar `AuthError` e `UnauthenticatedError` em `src/features/auth/domain/errors/authErrors.ts`
- [x] T00X Criar interface `IAuthRepository` (login, logout, getMe) em `src/features/auth/domain/repositories/IAuthRepository.ts` (depende de T003, T005, T006)
- [x] T00X Criar `authMappers` (mapeamento de resposta da API `/api/me` para entidade `User`) em `src/features/auth/data/mappers/authMappers.ts` (depende de T003, T004)
- [x] T00X Criar `LoginUseCase` em `src/features/auth/domain/usecases/LoginUseCase.ts` (depende de T005, T006, T007)
- [x] T01X [P] Criar `GetMeUseCase` em `src/features/auth/domain/usecases/GetMeUseCase.ts` (depende de T006, T007)
- [x] T01X [P] Criar `LogoutUseCase` em `src/features/auth/domain/usecases/LogoutUseCase.ts` (depende de T006, T007)
- [x] T01X Criar `AuthRepository` (implementação via `fetch` com `credentials: 'include'`) em `src/features/auth/data/repositories/AuthRepository.ts` (depende de T007, T008)

**Checkpoint**: Fundação pronta — implementação das histórias pode começar em sequência.

---

## Fase 3: História de Usuário 1 — Login com Credenciais (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir o fluxo de login simulado por chamada real à API. O usuário informa credenciais, o sistema autentica e persiste a sessão em React Context.

**Teste Independente**: Abrir `/login`, informar credenciais válidas — sistema deve avançar para `/selecionar-vinculo` com os dados reais do usuário carregados. Credenciais inválidas devem exibir mensagem de erro. Campos vazios devem exibir validação inline sem chamar a API.

### Implementação para US1

- [x] T01X [US1] Criar `AuthContext` com `AuthProvider` (useReducer: estados `unauthenticated` → `authenticated` → `licitante_selected`) e hook `useAuth` em `src/features/auth/presentation/context/AuthContext.tsx` — incluir restauração de sessão via `GetMeUseCase` na montagem do Provider (depende de T009, T010, T011, T012)
- [x] T01X [US1] Criar hook `useLogin` (orquestra `LoginUseCase` + `GetMeUseCase` + navegação para `/selecionar-vinculo`) em `src/features/auth/presentation/hooks/useLogin.ts` (depende de T013)
- [x] T01X [US1] Atualizar `LoginPage.tsx` em `src/features/auth/presentation/pages/LoginPage.tsx`: adicionar schema Zod para validação (e-mail válido, senha ≥ 8 chars), substituir `handleLogin` pelo hook `useLogin`, exibir erros da API com mensagem amigável (depende de T014)
- [x] T01X [US1] Criar `ProtectedRoute` (verifica `useAuth().isAuthenticated`; redireciona para `/login` se sem sessão) em `src/shared/components/guards/ProtectedRoute.tsx` (depende de T013)
- [x] T01X [US1] Atualizar `src/app/routes.tsx`: envolver a árvore de rotas com `AuthProvider` e proteger todas as rotas filhas de `/` com `ProtectedRoute` (depende de T013, T016)

**Checkpoint**: US1 completa — fluxo de login funcional com autenticação real. Testar independentemente antes de avançar.

---

## Fase 4: História de Usuário 2 — Seleção de Licitante (Prioridade: P1)

**Objetivo**: Substituir a lista estática `VINCULOS` por dados reais da API. Implementar seleção manual (múltiplos licitantes), automática (único licitante) e aviso (nenhum licitante).

**Teste Independente**: Após login com usuário de múltiplos licitantes — tela de seleção deve listar todos com nome e CNPJ reais. Selecionar um deve redirecionar para `/`. Usuário com um único licitante deve ir direto para `/` sem ver a tela de seleção. Usuário sem licitante deve ver mensagem orientativa.

### Implementação para US2

- [x] T01X [US2] Criar hook `useSelecionarLicitante` (chama `AuthContext.selectLicitante` e navega para `/`) em `src/features/auth/presentation/hooks/useSelecionarLicitante.ts` (depende de T013)
- [x] T01X [US2] Atualizar `SelecionarVinculoPage.tsx` em `src/features/auth/presentation/pages/SelecionarVinculoPage.tsx`: remover constante `VINCULOS` hardcoded, ler `useAuth().session?.user.licitantes`, usar `useSelecionarLicitante` no `onClick` de cada item (depende de T013, T018)
- [x] T02X [US2] Adicionar lógica de auto-seleção no `AuthContext` (`AuthProvider`): após `GetMeUseCase`, se `licitantes.length === 1`, chamar `selectLicitante` automaticamente sem exibir a tela de seleção em `src/features/auth/presentation/context/AuthContext.tsx` (depende de T013)
- [x] T02X [US2] Adicionar estado de aviso para zero licitantes na `SelecionarVinculoPage.tsx`: quando `licitantes.length === 0`, exibir mensagem orientativa no lugar da lista em `src/features/auth/presentation/pages/SelecionarVinculoPage.tsx` (depende de T019)

**Checkpoint**: US2 completa — seleção de licitante funcional com dados reais. Testar os três casos (0, 1, N licitantes) antes de avançar.

---

## Fase 5: História de Usuário 3 — Exibição de Nome e CNPJ (Prioridade: P2)

**Objetivo**: Substituir nome e empresa hardcoded ("Lisvalder Paz" / "LP Soluções em Licitações") no `AppHeader` pelos dados do usuário autenticado e licitante selecionado.

**Teste Independente**: Após login e seleção de licitante, o cabeçalho deve exibir o nome real do usuário e o nome real do licitante selecionado. Dois usuários diferentes devem ver seus respectivos nomes ao fazer login.

### Implementação para US3

- [x] T02X [US3] Atualizar `AppHeader.tsx` em `src/shared/components/layout/AppHeader.tsx`: substituir `"Lisvalder Paz"` por `useAuth().session?.user.nomeCompleto` e `"LP Soluções em Licitações"` por `useAuth().session?.licitante.nomeEmpresa`; exibir fallback visual (ex.: `"—"`) quando sessão não estiver disponível (depende de T013)

**Checkpoint**: US3 completa — AppHeader exibe dados reais.

---

## Fase 6: História de Usuário 4 — Logout (Prioridade: P3)

**Objetivo**: Conectar o botão "Sair" do `AppHeader` à API de logout real, limpando a sessão e redirecionando para `/login`.

**Teste Independente**: Clicar em "Sair" deve encerrar a sessão, limpar o cookie BEARER e redirecionar para `/login`. Tentar acessar rota protegida após logout deve redirecionar para login.

### Implementação para US4

- [x] T02X [US4] Atualizar `AuthContext` em `src/features/auth/presentation/context/AuthContext.tsx`: adicionar action `logout` ao reducer que chama `LogoutUseCase`, limpa o estado da sessão e retorna ao estado `unauthenticated` (depende de T013)
- [x] T02X [US4] Atualizar handler `handleLogout` no `AppHeader.tsx` em `src/shared/components/layout/AppHeader.tsx`: substituir `navigate('/login')` por `useAuth().logout()` (depende de T022, T023)

**Checkpoint**: US4 completa — logout funcional com chamada real à API. Todas as histórias de usuário entregues.

---

## Fase 7: Polimento & Conformidade com a Constituição

**Propósito**: Garantir 100% de cobertura nos Use Cases do domínio (exigido pela Constituição, Princípio V).

- [x] T02X [P] Criar testes unitários para `LoginUseCase` em `src/features/auth/domain/usecases/LoginUseCase.test.ts` — cobrir: credenciais válidas, 401 inválido, falha de rede
- [x] T02X [P] Criar testes unitários para `GetMeUseCase` em `src/features/auth/domain/usecases/GetMeUseCase.test.ts` — cobrir: perfil retornado, 401 expirado
- [x] T02X [P] Criar testes unitários para `LogoutUseCase` em `src/features/auth/domain/usecases/LogoutUseCase.test.ts` — cobrir: logout bem-sucedido, falha de rede

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — começa imediatamente
- **Fundação (Fase 2)**: Depende do Setup — **bloqueia todas as histórias**
- **US1 (Fase 3)**: Depende da Fundação completa
- **US2 (Fase 4)**: Depende de US1 completa (usa `AuthContext` e `AuthProvider` criados em US1)
- **US3 (Fase 5)**: Depende de US1 completa (usa `AuthContext`)
- **US4 (Fase 6)**: Depende de US3 (ambos tocam `AppHeader.tsx`)
- **Polimento (Fase 7)**: Depende da Fundação (T009–T011 devem existir antes dos testes)

### Dependências entre Histórias de Usuário

- **US1** → bloqueia US2, US3, US4 (cria o `AuthContext` do qual todos dependem)
- **US2** → pode ser trabalhada após US1, independente de US3/US4
- **US3** → pode ser trabalhada após US1, independente de US2
- **US4** → deve vir após US3 (ambas tocam `AppHeader.tsx`)

### Oportunidades de Paralelismo

Na Fase 2, T003 e T004 podem ser executadas em paralelo, assim como T009, T010 e T011 (arquivos distintos sem dependência mútua).

Na Fase 7, T025, T026 e T027 podem ser executadas em paralelo.

---

## Exemplo de Paralelismo: Fundação (Fase 2)

```bash
# Executar em paralelo (arquivos independentes):
T003 Criar entidade User
T004 Criar entidade Licitante

# Após T003 e T004 concluídos, executar em paralelo:
T009 LoginUseCase
T010 GetMeUseCase
T011 LogoutUseCase
```

## Exemplo de Paralelismo: Polimento (Fase 7)

```bash
# Executar em paralelo (arquivos independentes):
T025 Testes de LoginUseCase
T026 Testes de GetMeUseCase
T027 Testes de LogoutUseCase
```

---

## Estratégia de Implementação

### MVP First (US1 apenas — Login funcional)

1. Concluir Fase 1: Setup
2. Concluir Fase 2: Fundação (**CRÍTICO** — bloqueia tudo)
3. Concluir Fase 3: US1 — Login
4. **PARAR e VALIDAR**: fluxo de login real funciona?
5. Demonstrar ou fazer deploy se estiver pronto

### Entrega Incremental

1. Setup + Fundação → base pronta
2. US1 → login real → MVP mínimo utilizável
3. US2 → seleção real de licitante
4. US3 → identidade visual correta no header
5. US4 → logout limpo
6. Polimento → cobertura de testes conforme Constituição

---

## Notas

- Tarefas `[P]` = arquivos diferentes, sem dependências entre si — podem rodar em paralelo
- Rótulo `[Story]` rastreia cada tarefa à sua história de usuário
- `AuthContext` (T013) é o hub central — US2, US3 e US4 dependem dele
- A regra de isolamento da Constituição é inviolável: `domain/` nunca importa de `data/` ou `presentation/`
- `AuthRepository` injeta `IAuthRepository` via instância; `AuthContext` constrói e passa ao Provider
- Fazer commit após cada fase ou checkpoint validado
