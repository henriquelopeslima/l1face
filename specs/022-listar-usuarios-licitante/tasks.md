# Tarefas: Listar e Revogar Usuários do Licitante

**Entrada**: Documentos de design em `specs/022-listar-usuarios-licitante/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: Testes de Use Case são **obrigatórios** pela constituição (Princípio V — 100% de cobertura de Use Cases em domain).

**Organização**: 2 histórias de usuário (US1: listar, US2: revogar), organizadas por prioridade.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História de usuário correspondente (US1, US2)

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Entidade de domínio e interface de repositório dos quais US1 e US2 dependem.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [x] T001 Criar entidade `UsuarioLicitante` em `src/features/configuracoes/domain/entities/UsuarioLicitante.ts` com campos: `id`, `userId`, `nomeCompleto`, `email`, `licitanteId`, `papel: 'ADMIN' | 'COLABORADOR'`, `criadoEm`; re-exportar em `src/features/configuracoes/domain/entities/index.ts`
- [x] T00X Criar interface `IUsuarioLicitanteRepository` em `src/features/configuracoes/domain/repositories/IUsuarioLicitanteRepository.ts` com métodos `listar(licitanteId: string): Promise<UsuarioLicitante[]>` e `revogar(licitanteId: string, userId: string): Promise<void>`; re-exportar em `src/features/configuracoes/domain/repositories/index.ts`

**Checkpoint**: Fundação pronta — implementação das histórias pode começar.

---

## Fase 3: História de Usuário 1 — Visualizar Usuários (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir os dados mock do `GestaoAcessosSection` pela lista real de usuários do licitante ativo, com estados de carregamento e erro.

**Teste Independente**: Abrir Configurações → seção "Gestão de acessos" → lista real carregada da API, com nome, e-mail, papel legível e data de ingresso. Se a API falhar, mensagem de erro é exibida.

### Testes para História de Usuário 1 (mandatório pela constituição)

- [x] T00X [US1] Criar testes unitários para `ListarUsuariosLicitanteUseCase` em `src/features/configuracoes/__tests__/domain/ListarUsuariosLicitanteUseCase.test.ts` — cobrir: sucesso retorna array, repositório é chamado com licitanteId correto, repositório lançando erro propaga exceção

### Implementação para História de Usuário 1

- [x] T00X [US1] Criar `ListarUsuariosLicitanteUseCase` em `src/features/configuracoes/domain/usecases/ListarUsuariosLicitanteUseCase.ts` (recebe `IUsuarioLicitanteRepository`, método `execute(licitanteId)`); re-exportar em `src/features/configuracoes/domain/usecases/index.ts`; verificar que T003 passa
- [x] T00X [P] [US1] Criar `UsuarioLicitanteAPI` em `src/features/configuracoes/data/datasources/UsuarioLicitanteAPI.ts` com método `listar(licitanteId)` chamando `GET /api/licitantes/{licitanteId}/usuarios` via `apiFetch`; lança `JWT_EXPIRED` em 401; re-exportar em `src/features/configuracoes/data/datasources/index.ts`
- [x] T00X [US1] Criar `UsuarioLicitanteRepository` em `src/features/configuracoes/data/repositories/UsuarioLicitanteRepository.ts` implementando `IUsuarioLicitanteRepository.listar` (delega para `UsuarioLicitanteAPI`; trata `JWT_EXPIRED` → `window.location.href = '/login'`; stub de `revogar` lançando `Not implemented`); re-exportar em `src/features/configuracoes/data/repositories/index.ts`
- [x] T00X [US1] Criar hook `useGestaoAcessos` em `src/features/configuracoes/presentation/hooks/useGestaoAcessos.ts` — obtém `licitanteId` via `useAuth().session?.licitante.id` e `currentUserId` via `useAuth().user?.id`; chama `ListarUsuariosLicitanteUseCase` em `useEffect`; expõe `{ usuarios, isLoading, error, currentUserId }`; re-exportar em `src/features/configuracoes/presentation/hooks/index.ts`
- [x] T00X [US1] Refatorar `src/features/configuracoes/presentation/components/GestaoAcessosSection.tsx` — remover todo o estado e lógica mock, Drawer de criar/editar e função `gerarSenhaAleatoria`; usar `useGestaoAcessos()`; exibir skeleton (3 linhas) durante `isLoading`; exibir mensagem de erro durante `error`; manter tabela com colunas Nome, E-mail, Papel (badge "Administrador"/"Colaborador") e Ações; manter AlertDialog de confirmação (sem ação real por ora)

**Checkpoint**: US1 totalmente funcional — lista real carregada, skeleton e erro exibidos corretamente.

---

## Fase 4: História de Usuário 2 — Revogar Acesso (Prioridade: P2)

**Objetivo**: Permitir que um ADMIN remova o acesso de outro usuário com confirmação, ocultando a ação para o próprio usuário logado e tratando erros de API.

**Teste Independente**: Clicar em "Remover" ao lado de um colaborador → AlertDialog com nome do usuário → confirmar → usuário desaparece da lista. Botão "Remover" ausente na própria linha do ADMIN logado. Erro 409 exibe mensagem "Não é possível remover o último administrador."

### Testes para História de Usuário 2 (mandatório pela constituição)

- [x] T00X [US2] Criar testes unitários para `RevogarAcessoUseCase` em `src/features/configuracoes/__tests__/domain/RevogarAcessoUseCase.test.ts` — cobrir: sucesso (repositório chamado com args corretos), repositório lançando erro 403/404/409 propaga exceção corretamente

### Implementação para História de Usuário 2

- [x] T01X [US2] Criar `RevogarAcessoUseCase` em `src/features/configuracoes/domain/usecases/RevogarAcessoUseCase.ts` (recebe `IUsuarioLicitanteRepository`, método `execute(licitanteId, userId)`); re-exportar em `src/features/configuracoes/domain/usecases/index.ts`; verificar que T009 passa
- [x] T01X [P] [US2] Adicionar método `revogar(licitanteId, userId)` em `src/features/configuracoes/data/datasources/UsuarioLicitanteAPI.ts` — chama `DELETE /api/licitantes/{licitanteId}/usuarios/{userId}`; mapeia status → mensagem: 403 → `"Apenas administradores podem revogar acessos."`, 404 → `"Vínculo não encontrado."`, 409 → `"Não é possível remover o último administrador."`, 5xx → `"Erro ao revogar acesso. Tente novamente."`
- [x] T01X [US2] Implementar `revogar` em `src/features/configuracoes/data/repositories/UsuarioLicitanteRepository.ts` (substituir stub por implementação real via `UsuarioLicitanteAPI.revogar`; tratar `JWT_EXPIRED` → redirect)
- [x] T01X [US2] Adicionar ação `revogarAcesso(userId: string): Promise<void>` e estados `removendoId: string | null` e `removeError: string | null` ao hook `src/features/configuracoes/presentation/hooks/useGestaoAcessos.ts`; após sucesso, remover o usuário de `usuarios` via `setUsuarios(prev => prev.filter(...))`
- [x] T01X [US2] Atualizar `src/features/configuracoes/presentation/components/GestaoAcessosSection.tsx` — ligar botão "Remover" à ação de abrir AlertDialog; ocultar botão quando `usuario.userId === currentUserId`; ao confirmar no AlertDialog chamar `revogarAcesso`; exibir `removeError` como mensagem de erro inline abaixo da tabela; limpar `removeError` ao fechar o AlertDialog

**Checkpoint**: US1 + US2 totalmente funcionais. Revogação funciona com confirmação, auto-exclusão bloqueada na UI.

---

## Fase 5: Polimento & Verificação Final

- [x] T01X [P] Criar `useGestaoAcessos.test.ts` em `src/features/configuracoes/__tests__/presentation/useGestaoAcessos.test.ts` — cobrir estados de loading, sucesso e erro de `revogarAcesso` com mocks dos use cases
- [x] T01X Executar `tsc --noEmit` e `vitest run --reporter=verbose` e confirmar zero erros de tipo e todos os testes passando

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências — pode começar imediatamente. **BLOQUEIA** US1 e US2.
- **US1 (Fase 3)**: Depende da conclusão de T001 e T002.
- **US2 (Fase 4)**: Depende da conclusão de US1 (T008 deve existir para receber as ações de remoção).
- **Polimento (Fase 5)**: Depende da conclusão de US1 e US2.

### Dependências dentro de US1

```
T001, T002 (Fundação)
  └─ T003 (teste → escrever antes da impl)
       └─ T004 (impl use case, verifica T003 verde)
            ├─ T005 [P] (datasource)
            └─ T006 (repository, depende de T005)
                 └─ T007 (hook)
                      └─ T008 (componente)
```

### Dependências dentro de US2

```
T008 concluído (US1)
  └─ T009 (teste → escrever antes da impl)
       └─ T010 (impl use case, verifica T009 verde)
            ├─ T011 [P] (datasource)
            └─ T012 (repository, depende de T011)
                 └─ T013 (hook)
                      └─ T014 (componente)
```

### Oportunidades de Paralelismo

- **T005 e T006**: datasource e repository de listar podem ser iniciados em paralelo após T004
- **T011 e T012**: datasource (revogar) pode ser iniciado junto ao início de T012 somente se T011 estiver concluído

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2: T001, T002
2. Concluir Fase 3: T003 → T004 → T005+T006 → T007 → T008
3. **PARAR e VALIDAR**: Abrir Configurações, confirmar lista real carregando
4. Avançar para US2 somente após validação

### Entrega Incremental

1. Setup + Fundação → entidades prontas
2. US1 completo → lista real visível (MVP!)
3. US2 completo → revogar funcionando
4. Polimento → testes de hook + verificação final de tipos

---

## Notas

- Testes de Use Case (T003, T009) são **mandatórios** pela constituição — escrever antes da implementação
- Proibido `any` em qualquer arquivo novo
- O Drawer de criar/editar presente no componente atual deve ser removido (está fora do escopo desta feature)
- `useAuth()` fornece `session.licitante.id` e `user.id` — não necessita de props drilling
