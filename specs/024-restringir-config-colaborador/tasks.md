# Tarefas: Restringir Configurações para Colaborador

**Entrada**: Documentos de design em `specs/024-restringir-config-colaborador/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: Teste unitário do novo hook `useIsAdminLicitante` segue o precedente já estabelecido em `022-listar-usuarios-licitante`/`023-convidar-colaborador` para hooks de `presentation`. Não há Use Case novo em `domain` nesta funcionalidade (reaproveita `ListarUsuariosLicitanteUseCase` já 100% coberto), então a exigência da Constituição (Princípio V) já está satisfeita sem tarefas adicionais.

**Organização**: 3 histórias de usuário (US1: ocultar para colaborador, US2: manter para administrador, US3: bloquear acesso via link/âncora direta). As 3 compartilham a mesma implementação (renderização condicional em `ConfiguracoesPage.tsx` a partir do hook criado na Fundação) — US2 e US3 são majoritariamente verificação sobre a base construída em US1, conforme `plan.md`/`research.md`.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História de usuário correspondente (US1, US2, US3)

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Hook que determina o papel do usuário no licitante ativo, do qual todas as histórias dependem.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [X] T001 [P] Criar testes unitários para `useIsAdminLicitante` em `src/features/configuracoes/__tests__/presentation/useIsAdminLicitante.test.ts` — cobrir: `isAdmin` retorna `true` quando o `userId` autenticado aparece no roster com `papel: 'ADMIN'`; `isAdmin` retorna `false` quando o papel é `'COLABORADOR'`; `isLoading` inicia `true` e vira `false` após a consulta resolver; `isAdmin` permanece `false` (fail-closed) quando a consulta ao repositório rejeita
- [X] T002 Criar `useIsAdminLicitante` em `src/features/configuracoes/presentation/hooks/useIsAdminLicitante.ts` — mesmo padrão de instanciação em nível de módulo de `useGestaoAcessos.ts` (`UsuarioLicitanteRepository` + `ListarUsuariosLicitanteUseCase` como singletons do módulo); obtém `licitanteId`/`currentUserId` via `useAuth()`; em `useEffect` chama `listarUseCase.execute(licitanteId)`, calcula `isAdmin = usuarios.find(u => u.userId === currentUserId)?.papel === 'ADMIN'` e controla `isLoading`; em caso de erro mantém `isAdmin = false`; reexportar em `src/features/configuracoes/presentation/hooks/index.ts`; verificar que T001 passa

**Checkpoint**: hook de papel pronto e testado — as histórias de usuário podem consumi-lo.

---

## Fase 3: História de Usuário 1 — Colaborador não vê seções restritas (Prioridade: P1) 🎯 MVP

**Objetivo**: Ocultar as seções "Assinatura e cobrança" e "Gestão de acessos" da tela de Configurações quando o usuário autenticado for Colaborador no licitante ativo, sem nenhum "flash" de conteúdo restrito.

**Teste Independente**: Como colaborador de um licitante, abrir a tela de Configurações e confirmar que as seções "Assinatura e cobrança" e "Gestão de acessos" não aparecem em nenhum momento, enquanto as demais seções continuam visíveis.

### Implementação para História de Usuário 1

- [X] T003 [US1] Modificar `src/features/configuracoes/presentation/pages/ConfiguracoesPage.tsx`: usar `useIsAdminLicitante()`; enquanto `isLoading === true`, não renderizar `<AssinaturaSection />` nem `<GestaoAcessosSection />`; após carregar, renderizar essas duas seções somente quando `isAdmin === true` (renderização condicional real — os componentes não devem ser montados no DOM quando ocultos, não apenas escondidos via CSS); manter `PerfilSection`, `AparenciaSection`, `NotificacoesSection`, `SegurancaSection` e o card "Sair da conta" sempre visíveis para qualquer papel
- [X] T004 [US1] Verificação manual via `/run`: autenticar como usuário com papel COLABORADOR no licitante ativo, abrir Configurações e confirmar que "Assinatura e cobrança" e "Gestão de acessos" nunca aparecem (nem brevemente durante o carregamento), e que as demais seções e "Sair da conta" continuam normais

**Checkpoint**: Neste ponto, a História de Usuário 1 deve estar totalmente funcional — colaboradores não veem mais as seções restritas.

---

## Fase 4: História de Usuário 2 — Administrador continua vendo todas as seções (Prioridade: P2)

**Objetivo**: Garantir que a restrição introduzida para colaboradores não afete administradores.

**Teste Independente**: Como administrador de um licitante, abrir a tela de Configurações e confirmar que todas as seções, incluindo as duas restritas, continuam aparecendo normalmente.

### Implementação para História de Usuário 2

> A branch `isAdmin === true` de T003 já implementa este comportamento — não há código de produção novo, apenas a verificação abaixo.

- [X] T005 [US2] Verificação manual via `/run`: autenticar como usuário com papel ADMIN no licitante ativo, abrir Configurações e confirmar que todas as seções aparecem, incluindo "Assinatura e cobrança" e "Gestão de acessos", sem nenhuma regressão em relação ao comportamento anterior

**Checkpoint**: US1 + US2 funcionais — a visibilidade das seções está correta para os dois papéis.

---

## Fase 5: História de Usuário 3 — Acesso direto a uma seção restrita não a expõe (Prioridade: P3)

**Objetivo**: Confirmar que um link ou âncora apontando diretamente para uma seção restrita não a exibe para um Colaborador.

**Teste Independente**: Como colaborador, navegar diretamente para a URL de Configurações com âncora de uma seção restrita (`#assinatura` ou `#gestao-acessos`) e confirmar que ela permanece oculta.

### Implementação para História de Usuário 3

> Nenhum código de produção novo: como T003 deixa de montar os componentes restritos no DOM (em vez de apenas escondê-los via CSS), `useHashScroll` (`document.getElementById(id)?.scrollIntoView(...)`) já retorna `null` para esses IDs e o scroll é automaticamente ignorado — ver `research.md`.

- [X] T006 [US3] Verificação manual via `/run`: como colaborador, navegar diretamente para `/configuracoes#assinatura` e para `/configuracoes#gestao-acessos`, confirmando que nenhuma das seções aparece e que não há erro no console (o scroll para a âncora inexistente é silenciosamente ignorado)

**Checkpoint**: Todas as histórias de usuário (US1, US2, US3) devem agora estar funcionais.

---

## Fase 6: Polimento & Verificação Final

- [X] T007 [P] Executar `tsc --noEmit` e `vitest run --reporter=verbose` na raiz do projeto e confirmar zero erros de tipo e todos os testes passando
- [X] T008 Confirmar que `useIsAdminLicitante.ts` não introduz `any`, importa apenas de `domain` (via `ListarUsuariosLicitanteUseCase`) e `data` (via `UsuarioLicitanteRepository`, já usado do mesmo jeito em `useGestaoAcessos.ts`), e que `GestaoAcessosSection.tsx`/`useGestaoAcessos.ts` permanecem sem alterações — conforme Constituição Princípios I e II

---

## Fase 7: Correção pós-implementação — Links restritos no menu lateral

**Motivo**: verificação manual do usuário mostrou que `src/shared/components/layout/AppSidebar.tsx` tem sua própria lista fixa de links do submenu "Configurações" (`MENU_ITEMS`), independente da renderização condicional feita em `ConfiguracoesPage.tsx` (T003). Um Colaborador continuava vendo, no menu lateral, os links "Assinatura e cobrança" e "Gestão de acessos" — mesmo que a página em si já não renderizasse essas seções. RF-001/RF-002 (e a spec como um todo) tratam "seção" como toda superfície de navegação para ela, então essa lacuna precisava ser fechada.

- [X] T009 [P] Reaproveitar `useIsAdminLicitante` (T002) em `src/shared/components/layout/AppSidebar.tsx` — mesmo padrão já existente de `AppHeader.tsx` importando `useAuth` da feature `auth` (shared/layout já consome hooks de features). Filtrar, apenas para o item de menu "Configurações", os itens de submenu cujo título esteja em `{'Assinatura e cobrança', 'Gestão de acessos'}` quando `isLoading === true` ou `isAdmin === false`; "Segurança" e as demais entradas do submenu permanecem sempre visíveis, para todos os papéis
- [X] T010 Verificação manual via `/run`: com o mesmo par de contas ADMIN/COLABORADOR de T004/T005, expandir o menu lateral e abrir o submenu "Configurações" — confirmar que o Colaborador vê apenas Visão geral/Meu perfil/Aparência/Notificações/Segurança (sem Assinatura e cobrança/Gestão de acessos), e que o Administrador continua vendo todos os 7 itens

**Checkpoint**: nenhuma superfície de navegação (página ou menu lateral) expõe as duas seções restritas para um Colaborador.

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências — pode começar imediatamente. **BLOQUEIA** US1, US2 e US3.
- **US1 (Fase 3)**: Depende da conclusão de T001–T002.
- **US2 (Fase 4)**: Depende da conclusão de US1 (T003 já implementa o comportamento; T005 apenas verifica).
- **US3 (Fase 5)**: Depende da conclusão de US1 (T003 já implementa o comportamento; T006 apenas verifica).
- **Polimento (Fase 6)**: Depende da conclusão de US1, US2 e US3.

### Dependências dentro de US1

```
T001 (teste → escrever antes da implementação)
  └─ T002 (impl do hook, verifica T001 verde)
       └─ T003 (ConfiguracoesPage consome o hook)
            └─ T004 (verificação manual)
```

### Oportunidades de Paralelismo

- **T001**: pode começar assim que a Fundação é iniciada (arquivo de teste isolado, marcado `[P]`)
- **T005 e T006**: podem ser executadas em qualquer ordem entre si após o Checkpoint de US1 (ambas são apenas verificação manual, sem código de produção novo)

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2: T001 → T002
2. Concluir Fase 3: T003 → T004
3. **PARAR e VALIDAR**: Autenticar como colaborador, confirmar ausência das duas seções restritas e presença das demais
4. Avançar para US2/US3 somente após validação

### Entrega Incremental

1. Fundação → hook de papel pronto e testado
2. US1 completo → colaboradores deixam de ver as seções restritas (MVP!)
3. US2 completo → confirmado que administradores não sofrem regressão
4. US3 completo → confirmado que link/âncora direta não contorna a restrição
5. Polimento → verificação de tipos/testes e conformidade com a Constituição

---

## Notas

- Proibido `any` em qualquer arquivo novo ou modificado
- `GestaoAcessosSection.tsx` e `useGestaoAcessos.ts` permanecem intocados nesta funcionalidade (ver "Trade-off assumido" em `plan.md`)
- Nenhuma mudança é necessária em `useHashScroll.ts`, `domain/` ou `data/` — toda a funcionalidade se resume ao novo hook (Fundação) e à renderização condicional em `ConfiguracoesPage.tsx` (US1)
