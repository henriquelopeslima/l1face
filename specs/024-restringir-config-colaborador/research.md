# Research: Restringir Configurações para Colaborador

## Fonte do papel do usuário no licitante ativo

**Decision**: Determinar o papel (`ADMIN` | `COLABORADOR`) via `GET /api/licitantes/{licitanteId}/usuarios` (já existente), localizando o registro cujo `userId` corresponde ao usuário autenticado.

**Rationale**: Investigação em `AuthContext`, `User` e `Licitante` (feature `auth`) confirmou que nenhuma dessas fontes carrega o papel do usuário por licitante — nem o login nem o `/me` retornam essa informação. O único lugar do sistema que hoje resolve esse papel é `useGestaoAcessos.isAdmin`, usando exatamente esse endpoint. Não há endpoint dedicado "meu papel neste licitante"; reaproveitar o roster completo é a única opção sem alterar o backend.

**Alternatives considered**:
- Adicionar papel ao payload de `/me` ou de seleção de licitante (backend l1core) — descartado por estar fora do escopo desta funcionalidade (mudança de contrato de API, feature puramente de frontend).
- Fazer `ConfiguracoesPage` importar e usar `useGestaoAcessos` diretamente — descartado porque esse hook também carrega estados de convite/remoção irrelevantes para a decisão de exibir/ocultar seções, acoplando responsabilidades que não pertencem à página.

---

## Extrair lógica de papel para um hook dedicado vs. reaproveitar `useGestaoAcessos`

**Decision**: Criar `useIsAdminLicitante`, um hook novo e isolado em `presentation/hooks/`, que replica apenas o cálculo de papel (busca do roster + verificação de `papel === 'ADMIN'` para o usuário autenticado), sem tocar em `useGestaoAcessos`/`GestaoAcessosSection`.

**Rationale**: `GestaoAcessosSection` e seu hook já estão implementados, testados e em produção (feature `023-convidar-colaborador`). Um hook novo e de responsabilidade única minimiza a superfície de mudança e o risco de regressão nessas telas já validadas, ao custo de uma chamada HTTP duplicada ao mesmo endpoint quando o usuário é Administrador (ver plan.md → "Trade-off assumido").

**Alternatives considered**:
- Elevar o estado de `useGestaoAcessos` para `ConfiguracoesPage` e passar `usuarios`/`isAdmin` via props para `GestaoAcessosSection` — eliminaria a chamada duplicada, mas exigiria refatorar um componente/hook já testado e usado por outras histórias de usuário (convidar, revogar), aumentando o raio de impacto da mudança sem necessidade real (a duplicação de uma única chamada GET é um custo aceitável).
- Introduzir uma camada de cache/compartilhamento de dados (ex.: contexto ou biblioteca de data-fetching) — descartado por ser uma mudança de infraestrutura desproporcional ao escopo (ocultar duas seções de UI).

---

## Estratégia "fail-closed" para papel desconhecido/erro

**Decision**: Enquanto o papel não for confirmado (`isLoading === true`) ou se a consulta falhar, `isAdmin` permanece `false` e as duas seções restritas não são renderizadas.

**Rationale**: Atende RF-007 e o caso de borda "falha ao determinar o papel do usuário" da spec — por segurança/UX, é preferível ocultar temporariamente uma seção que o Administrador tem direito de ver (ela reaparece após confirmação bem-sucedida) do que expor brevemente uma seção restrita a um Colaborador.

**Alternatives considered**: Exibir um estado de erro explícito nas seções restritas em caso de falha — descartado; a spec já define que a ausência das seções não precisa de explicação (ver Premissas), então tratar erro como "não exibir" é consistente e mais simples.

---

## Bloqueio de acesso via âncora/hash

**Decision**: Nenhuma mudança em `useHashScroll.ts`. A ocultação é feita via não-renderização condicional (JSX condicional), não via CSS.

**Rationale**: `useHashScroll` apenas chama `document.getElementById(id)?.scrollIntoView(...)`. Se a seção não está montada no DOM, `getElementById` retorna `null` e a chamada é um no-op seguro. Isso já satisfaz RF-004/História de Usuário 3 sem qualquer alteração nesse hook.

**Alternatives considered**: Esconder a seção via `display: none` mantendo-a montada — descartado explicitamente, pois não atenderia RF-004 (o conteúdo continuaria acessível via DOM/inspeção) e é inconsistente com o padrão já usado no botão "Convidar colaborador" (`isAdmin && <Button>`), que remove o elemento da árvore.

---

## Estrutura de arquivos

Todos os arquivos novos ficam dentro de `src/features/configuracoes/`, sem tocar em `domain`/`data` (nenhuma mudança de contrato ou entidade é necessária).

| Camada | Arquivos novos/alterados |
|--------|---------------------------|
| presentation/hooks | `useIsAdminLicitante.ts` [CRIAR], `index.ts` [ATUALIZAR] |
| presentation/pages | `ConfiguracoesPage.tsx` [MODIFICAR] |
| __tests__/presentation | `useIsAdminLicitante.test.ts` [CRIAR] |
