# Pesquisa: Autenticação e Seleção de Licitante

**Branch**: `002-login-licitante` | **Data**: 2026-05-19

## Decisão 1: Gerenciamento de Estado Global de Sessão

**Decisão**: React Context com `useReducer`

**Rationale**: A aplicação é uma SPA de escala média (~10 telas, 1 usuário simultâneo por sessão). React Context é suficiente para compartilhar estado de autenticação sem a complexidade de Zustand ou Redux. O `useReducer` garante transições de estado previsíveis (unauthenticated → authenticated → licitante_selected).

**Alternativas consideradas**:
- Zustand: Mais simples de usar, mas adiciona dependência externa desnecessária para este escopo
- Redux Toolkit: Excessivo para a escala atual; reservado para apps com múltiplos domínios de estado complexo
- URL state / localStorage: Descartado pelo princípio de segurança (sem tokens em storage)

---

## Decisão 2: Persistência de Sessão entre Reloads

**Decisão**: Re-fetch automático de `/api/me` na montagem do `AuthProvider`

**Rationale**: O cookie HttpOnly `BEARER` é persistido automaticamente pelo navegador entre reloads. Ao montar o `AuthProvider`, a aplicação chama `/api/me`; se o cookie ainda for válido, a sessão é restaurada. Se retornar 401, o usuário é redirecionado para login. Isso mantém a segurança sem expor o token no lado do cliente.

**Alternativas consideradas**:
- Armazenar dados do usuário em sessionStorage: Descartado por violar o Princípio IV da constituição
- Não restaurar sessão: Causaria logout a cada reload, UX inaceitável

---

## Decisão 3: Proteção de Rotas

**Decisão**: Componente `ProtectedRoute` wrapper no React Router

**Rationale**: React Router 7 suporta wrappers de rota (`Component` em children). Um `ProtectedRoute` verifica `useAuth().isAuthenticated` e redireciona para `/login` se necessário, sem duplicar lógica em cada página.

**Alternativas consideradas**:
- Verificação por página: Duplicação de código, violaria Single Responsibility
- Middleware de loader no React Router: Mais complexo, requer contexto fora do tree React

---

## Decisão 4: Validação de Formulário de Login

**Decisão**: Zod schema + react-hook-form

**Rationale**: Ambas as bibliotecas já estão nas dependências do projeto. O schema Zod define as regras de validação (e-mail válido, senha mínima de 8 caracteres) na camada de apresentação, conforme o Princípio IV (validação na borda). O react-hook-form gerencia o estado do formulário sem re-renders desnecessários.

**Alternativas consideradas**:
- Validação manual com `useState`: Mais verboso, sem integração nativa com React devtools
- Yup: Biblioteca alternativa, mas Zod já está no projeto

---

## Decisão 5: Comunicação com a API (fetch vs. biblioteca)

**Decisão**: `fetch` nativo com wrapper simples em `AuthRepository`

**Rationale**: A API usa cookies HttpOnly gerenciados automaticamente pelo navegador com `credentials: 'include'`. O `fetch` nativo com `credentials: 'include'` é suficiente. Não há necessidade de Axios ou React Query para este escopo inicial.

**Alternativas consideradas**:
- Axios: Adiciona dependência sem benefício claro para este caso
- React Query / TanStack Query: Adequado para cache de dados, mas a sessão de auth tem comportamento específico (estado global, não cache de dados)

---

## Decisão 6: Seleção Automática de Licitante Único

**Decisão**: No `AuthProvider`, após `GetMeUseCase`, se `licitantes.length === 1`, selecionar automaticamente e navegar para `/`

**Rationale**: Conforme RF-006 da spec: usuários com apenas um licitante não devem ser obrigados a passar pela tela de seleção. Esta lógica fica no Use Case `GetMeUseCase` para que seja testável independentemente da UI.

**Alternativas consideradas**:
- Lógica na `SelecionarVinculoPage`: Violaria Single Responsibility; a page não deveria tomar decisões de navegação baseadas em dados de negócio

---

## Resolução de Configuração de API

**Base URL**: `http://localhost:80` (conforme OpenAPI spec do l1core)

**CORS + Cookies**: Para que o navegador envie o cookie HttpOnly cross-origin (l1face em porta diferente do l1core), o servidor l1core deve ter `Access-Control-Allow-Origin` configurado para a origem do l1face e `Access-Control-Allow-Credentials: true`. Em desenvolvimento, o Vite proxy resolve isso sem CORS.

**Decisão de desenvolvimento**: Configurar proxy no `vite.config.ts` para `/api` → `http://localhost:80`, eliminando problemas de CORS em dev.
