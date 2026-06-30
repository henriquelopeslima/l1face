---
description: "Tarefas de implementação para a feature de recuperação de senha"
---

# Tarefas: Recuperação de Senha

**Entrada**: Documentos de design em `specs/019-recuperar-senha/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2)
- Testes de Use Case são **obrigatórios** pela Constituição §V (100% de cobertura)

---

## Fase 1: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Estender a infraestrutura existente do slice `auth` com suporte à recuperação de senha.
Estas tarefas DEVEM estar completas antes de qualquer história de usuário.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [x] T001 Adicionar método `recuperarSenha(email: string): Promise<void>` à interface em `src/features/auth/domain/repositories/IAuthRepository.ts`
- [x] T002 [P] Criar entidade `RecuperacaoSenhaRequest` em `src/features/auth/domain/entities/recuperacaoSenha.ts` com campo `email: string`
- [x] T003 Implementar método `recuperarSenha(email)` em `src/features/auth/data/repositories/AuthRepository.ts` — chamar `POST /api/auth/recuperar-senha`, lançar `AuthError` em falha de conexão/5xx, não lançar para 200

**Checkpoint**: `IAuthRepository` e `AuthRepository` compilam com o novo método; camada de dados pronta.

---

## Fase 2: História de Usuário 1 — Solicitar nova senha por e-mail (Prioridade: P1) 🎯 MVP

**Objetivo**: Fluxo completo de recuperação de senha — usuário informa e-mail na tela `/recuperar-senha`
e recebe confirmação genérica de envio.

**Teste Independente**: Acessar `/recuperar-senha` diretamente, preencher um e-mail válido, clicar em
"Enviar" e verificar que a mensagem de sucesso genérica é exibida e o formulário é bloqueado.

### Implementação

- [x] T004 [US1] Criar `RecuperarSenhaUseCase` em `src/features/auth/domain/usecases/RecuperarSenhaUseCase.ts` — injetar `IAuthRepository`, validar e-mail não vazio e formato válido antes de delegar, retornar `void`
- [x] T005 [US1] Criar testes unitários em `src/features/auth/domain/usecases/RecuperarSenhaUseCase.test.ts` — cobrir: e-mail válido com sucesso, e-mail vazio lança erro de validação, e-mail com formato inválido lança erro de validação, falha de repositório propaga `AuthError`
- [x] T006 [US1] Criar hook `useRecuperarSenha` em `src/features/auth/presentation/hooks/useRecuperarSenha.ts` — expor `{ submit, isLoading, isSent, error }`, desabilitar submit durante loading, capturar `AuthError` como string de erro legível
- [x] T007 [US1] Criar `RecuperarSenhaPage` em `src/features/auth/presentation/pages/RecuperarSenhaPage.tsx` — campo de e-mail com validação de formato no frontend (antes de chamar Use Case), botão desabilitado durante loading, exibir mensagem de sucesso genérica pós-envio, exibir mensagem de erro em falha de conexão
- [x] T008 [US1] Adicionar rota `{ path: '/recuperar-senha', Component: RecuperarSenhaPage }` em `src/app/routes.tsx` dentro do bloco `AuthRoot` (ao lado de `/login` e `/cadastro`)
- [x] T009 [US1] Atualizar `src/features/auth/presentation/pages/LoginPage.tsx` — substituir `onClick={() => alert('...')}` do botão "Esqueceu a senha?" (linha 117) por `onClick={() => navigate('/recuperar-senha')}`; importar `useNavigate` caso não esteja em uso no escopo do botão

**Checkpoint**: Fluxo completo — clicar em "Esqueceu a senha?" no login navega para `/recuperar-senha`,
o formulário valida o e-mail e exibe mensagem de sucesso genérica após envio.

---

## Fase 3: História de Usuário 2 — Navegar de volta ao login (Prioridade: P2)

**Objetivo**: O usuário que acessou `/recuperar-senha` por engano ou já se lembrou da senha consegue
retornar facilmente ao login.

**Teste Independente**: Acessar `/recuperar-senha`, clicar em "Voltar ao login" e verificar redirecionamento
para `/login`.

### Implementação

- [x] T010 [US2] Adicionar link "Voltar ao login" em `src/features/auth/presentation/pages/RecuperarSenhaPage.tsx` — botão ou link visível que chama `navigate('/login')`, posicionado abaixo do formulário ou no topo da página, sempre visível (inclusive após o estado `sent`)

**Checkpoint**: `RecuperarSenhaPage` possui navegação bidirecional — login → recuperar-senha → login.

---

## Fase 4: Polimento & Aspectos Transversais

**Propósito**: Qualidade, consistência visual e alinhamento com o design existente.

- [x] T011 [P] Garantir consistência visual de `RecuperarSenhaPage` com o layout de duas colunas de `LoginPage.tsx` — coluna esquerda com gradiente e branding, coluna direita com formulário; verificar responsividade mobile (coluna única)
- [x] T012 Verificar que `RecuperarSenhaUseCase.test.ts` atinge 100% de cobertura de linhas executando `npm run test -- --coverage`
- [x] T013 [P] Adicionar `data-testid` nos elementos interativos de `RecuperarSenhaPage.tsx` — mínimo: `recuperar-senha-email`, `recuperar-senha-submit`, `recuperar-senha-sucesso`, `recuperar-senha-erro`

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fase 1 (Fundação)**: Sem dependências — pode começar imediatamente
- **Fase 2 (US1)**: Depende da conclusão completa da Fase 1 — bloqueia US1
- **Fase 3 (US2)**: Depende de T007 (RecuperarSenhaPage já criada) — pode ser executada como extensão da Fase 2
- **Fase 4 (Polimento)**: Depende da conclusão de US1 e US2

### Dependências dentro da Fase 1

- T001 → T003 (T003 implementa o método adicionado em T001)
- T002 pode rodar em paralelo com T001

### Dependências dentro da Fase 2 (US1)

- T003 (Fase 1 concluída) → T004 → T006 → T007
- T004 → T005 (testes do Use Case criado)
- T007 → T008 (página deve existir antes de registrar rota)
- T007 → T009 (página deve existir antes de fazer LoginPage navegar para ela)
- T005 pode rodar em paralelo com T006 (arquivos diferentes)
- T008 pode rodar em paralelo com T009 (arquivos diferentes)

### Dentro da Fase 3 (US2)

- T007 (Fase 2) → T010 (edição do mesmo arquivo)

---

## Oportunidades de Paralelismo

```bash
# Fase 1 — T001 e T002 em paralelo:
Task: "Adicionar recuperarSenha() à IAuthRepository"
Task: "Criar entidade RecuperacaoSenhaRequest"
# → aguardar ambas → T003

# Fase 2 — após T004:
Task: "Criar RecuperarSenhaUseCase.test.ts"   # T005
Task: "Criar useRecuperarSenha hook"           # T006
# → aguardar T006 → T007 → em paralelo:
Task: "Adicionar rota /recuperar-senha"        # T008
Task: "Atualizar LoginPage.tsx"                # T009
```

---

## Estratégia de Implementação

### MVP (apenas US1 — Fases 1 e 2)

1. Concluir Fase 1: Fundação (T001 → T002 paralelo → T003)
2. Concluir Fase 2: US1 (T004 → T005/T006 paralelo → T007 → T008/T009 paralelo)
3. **PARAR e VALIDAR**: Testar fluxo completo — login → "Esqueceu a senha?" → recuperar-senha → mensagem de sucesso
4. Deploy/demo se estiver pronto

### Entrega Incremental

1. MVP (Fases 1 + 2) → fluxo de recuperação funcional
2. US2 (Fase 3) → link de volta ao login (mudança pequena)
3. Polimento (Fase 4) → consistência visual e cobertura de testes

---

## Notas

- `LoginPage.tsx` linha 117: `onClick={() => alert('Funcionalidade de recuperação de senha em breve!')}` → trocar por `navigate('/recuperar-senha')`
- O `useNavigate` já é importado em `LoginPage.tsx` — nenhuma nova importação necessária para T009
- Mensagem de sucesso genérica sugerida: _"Se o e-mail existir, você receberá uma nova senha em instantes."_ (mesma do backend)
- `RecuperarSenhaPage` deve ser rota pública (dentro de `AuthRoot`, fora de `ProtectedRoute`) — igual a `/login` e `/cadastro`
- Testes unitários do Use Case NÃO devem usar React/DOM — apenas lógica pura com mock do `IAuthRepository`
