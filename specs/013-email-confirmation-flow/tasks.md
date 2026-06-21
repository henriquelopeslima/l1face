# Tarefas: Fluxo de Confirmação de E-mail

**Entrada**: Documentos de design em `/specs/013-email-confirmation-flow/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅

**Organização**: Tarefas agrupadas por história de usuário. As fases 3 e 4 são P1 e podem iniciar em paralelo (arquivos distintos) após a Fundação.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: US1–US4 conforme spec.md

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Tipos de erro, contratos de repositório e implementações de infraestrutura que TODAS as histórias dependem. Nenhuma história de usuário pode iniciar antes desta fase.

**⚠️ CRÍTICO**: Completar estas 4 tarefas antes de qualquer fase de US.

- [x] T001 [P] Adicionar 5 novas classes de erro de domínio (`EmailNaoConfirmadoError`, `TokenInvalidoError`, `TokenExpiradoError`, `ContaJaConfirmadaError`, `RateLimitReenvioError`) como subclasses de `AuthError` em `src/features/auth/domain/errors/authErrors.ts`
- [x] T002 [P] Atualizar interface `IAuthRepository` em `src/features/auth/domain/repositories/IAuthRepository.ts`: alterar `register()` para retornar `Promise<{ message: string }>`, adicionar `confirmarEmail(token: string): Promise<void>` e `reenviarConfirmacao(email: string): Promise<void>`
- [x] T003 [P] Adicionar campo `message: string` ao tipo `ApiRegisterResponse` em `src/features/auth/data/mappers/authMappers.ts`
- [x] T004 Implementar todas as mudanças em `src/features/auth/data/repositories/AuthRepository.ts`: (a) `register()` retorna `{ message }` do body 201; (b) `login()` lança `EmailNaoConfirmadoError` quando `body.message === 'email_nao_confirmado'`; (c) implementar `confirmarEmail(token)` com tratamento de 400/409/410; (d) implementar `reenviarConfirmacao(email)` com tratamento de 429 — depende de T001, T002, T003

**Checkpoint**: Tipos e repositório prontos — implementação das histórias pode iniciar.

---

## Fase 3: História de Usuário 1 — Cadastro com Instrução de Verificação (Prioridade: P1) 🎯 MVP

**Objetivo**: Após cadastro bem-sucedido, exibir tela de instrução de verificação de e-mail com a mensagem retornada pelo servidor. Nenhum redirecionamento para o dashboard.

**Teste Independente**: Preencher e enviar o formulário de cadastro com dados válidos; verificar que a tela "Verifique seu e-mail" aparece com a mensagem do servidor e que o dashboard não é acessado.

- [x] T005 [US1] Atualizar `src/features/auth/domain/usecases/RegisterUseCase.ts` para propagar e retornar `{ message: string }` retornado pelo repositório — depende de T002
- [x] T006 [P] [US1] Atualizar `src/features/auth/domain/usecases/RegisterUseCase.test.ts`: adicionar asserções para o valor de retorno `{ message }` e manter cobertura 100% — depende de T005
- [x] T007 [US1] Atualizar `src/features/auth/presentation/context/AuthContext.tsx`: método `register()` passa a retornar `Promise<{ message: string }>` — depende de T005
- [x] T008 [US1] Atualizar `src/features/auth/presentation/hooks/useRegister.ts`: expor `registrationMessage: string | null` no objeto de retorno do hook — depende de T007
- [x] T009 [US1] Atualizar `src/features/auth/presentation/pages/RegisterPage.tsx`: após cadastro bem-sucedido, exibir view inline "Verifique seu e-mail" com `registrationMessage` e sugestão de verificar spam (sem redirecionar para dashboard) — depende de T008

**Checkpoint**: US1 completa e testável independentemente.

---

## Fase 4: História de Usuário 2 — Confirmação de E-mail via Link (Prioridade: P1)

**Objetivo**: Página pública `/confirmar-email` extrai `?token=` da URL, chama a API, autentica o usuário e redireciona para o dashboard. Exibe estados diferenciados para token expirado, já utilizado e inválido.

**Teste Independente**: Acessar `/confirmar-email?token=<token-válido>` e verificar redirecionamento autenticado para `/`. Acessar com tokens inválidos/expirados/usados e verificar mensagens e CTAs corretos.

- [x] T010 [US2] Criar `src/features/auth/domain/usecases/ConfirmarEmailUseCase.ts`: valida que o token não está vazio (lança `AuthError`), delega para `repository.confirmarEmail(token)` — depende de T001, T002
- [x] T011 [P] [US2] Criar `src/features/auth/domain/usecases/ConfirmarEmailUseCase.test.ts`: cobrir token vazio, sucesso (resolve), TokenInvalidoError, TokenExpiradoError, ContaJaConfirmadaError — 100% de cobertura obrigatória pela constituição §V — depende de T010
- [x] T012 [US2] Atualizar `src/features/auth/presentation/context/AuthContext.tsx`: adicionar ação `confirmarEmail(token: string): Promise<void>` que executa `ConfirmarEmailUseCase` e depois chama `getMeUseCase.execute()` para hidratar o estado autenticado — depende de T007 (arquivo já modificado em US1), T010
- [x] T013 [US2] Criar `src/features/auth/presentation/hooks/useConfirmarEmail.ts`: gerenciar `status: 'loading' | 'success' | 'invalid' | 'expired' | 'already_confirmed'` com base nos tipos de erro discriminados; usar `AuthContext.confirmarEmail` — depende de T012
- [x] T014 [US2] Criar `src/features/auth/presentation/pages/ConfirmarEmailPage.tsx`: extrair `token` de `useSearchParams`; renderizar estados: loading spinner, success (redireciona para `/`), token expirado (mensagem + botão → `/login`), conta já confirmada (mensagem + link → `/login`), token inválido (mensagem de erro + link → `/login`) — depende de T013
- [x] T015 [US2] Adicionar rota pública `{ path: '/confirmar-email', Component: ConfirmarEmailPage }` em `src/app/routes.tsx` fora do bloco `ProtectedRoute` — depende de T014

**Checkpoint**: US2 completa. Usuário pode confirmar conta via link e ser autenticado automaticamente.

---

## Fase 5: Histórias de Usuário 3 e 4 — Login com Conta Não Confirmada + Reenvio de E-mail (Prioridade: P2)

**Objetivo**: Na tela de login, detectar o erro `email_nao_confirmado`, exibir aviso e botão de reenvio inline. O botão chama o endpoint de reenvio com o e-mail digitado. Rate limit (429) desabilita o botão.

**Teste Independente (US3)**: Tentar login com conta não confirmada e verificar que a mensagem e o botão "Reenviar e-mail" aparecem sem navegação para outra página. Tentar com credenciais inválidas e verificar que o botão NÃO aparece.

**Teste Independente (US4)**: Com o botão de reenvio visível, clicar nele e verificar feedback de sucesso. Simular 429 e verificar que o botão é desabilitado com mensagem de rate limit.

- [x] T016 [US3] [US4] Criar `src/features/auth/domain/usecases/ReenviarConfirmacaoEmailUseCase.ts`: valida que email não está vazio (lança `AuthError`), delega para `repository.reenviarConfirmacao(email)` — depende de T001, T002
- [x] T017 [P] [US3] [US4] Criar `src/features/auth/domain/usecases/ReenviarConfirmacaoEmailUseCase.test.ts`: cobrir email vazio, sucesso (resolve sem retorno), RateLimitReenvioError — 100% de cobertura obrigatória pela constituição §V — depende de T016
- [x] T018 [US3] [US4] Criar `src/features/auth/presentation/hooks/useReenviarConfirmacao.ts`: instanciar `ReenviarConfirmacaoEmailUseCase` e `AuthRepository`; expor `{ reenviar, isLoading, isSent, isDisabled, error }`; ao receber `RateLimitReenvioError` definir `isDisabled = true` — depende de T016
- [x] T019 [P] [US3] Atualizar `src/features/auth/domain/usecases/LoginUseCase.test.ts`: adicionar teste de propagação de `EmailNaoConfirmadoError` lançado pelo repositório — depende de T001
- [x] T020 [US3] Atualizar `src/features/auth/presentation/hooks/useLogin.ts`: capturar `EmailNaoConfirmadoError` por `instanceof` e retornar `emailNaoConfirmado: boolean` para a view (sem re-lançar) — depende de T001, T018
- [x] T021 [US3] [US4] Atualizar `src/features/auth/presentation/pages/LoginPage.tsx`: quando `emailNaoConfirmado === true`, exibir aviso "Seu e-mail ainda não foi confirmado." e botão inline "Reenviar e-mail de confirmação" que chama `useReenviarConfirmacao.reenviar(email)` com o e-mail do formulário; exibir feedback de sucesso e estado desabilitado pós-429 — depende de T018, T020

**Checkpoint**: US3 e US4 completas. Fluxo completo de email confirmation implementado.

---

## Fase 6: Polimento & Validação

**Propósito**: Verificação de qualidade e conformidade com a constituição.

- [x] T022 Executar `npx vitest run` e confirmar que todos os testes dos novos use cases passam com 100% de cobertura: `ConfirmarEmailUseCase.test.ts`, `ReenviarConfirmacaoEmailUseCase.test.ts`, `RegisterUseCase.test.ts` (atualizado), `LoginUseCase.test.ts` (atualizado)
- [x] T023 [P] Executar `npx tsc --noEmit` e resolver quaisquer erros de tipo — confirmar TypeScript strict mode em todos os arquivos novos e modificados

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências externas — iniciar imediatamente
- **US1 (Fase 3)** e **US2 (Fase 4)**: Ambas dependem da conclusão da Fase 2; podem rodar em paralelo entre si pois tocam arquivos diferentes (exceto `AuthContext.tsx` — ver nota abaixo)
- **US3+US4 (Fase 5)**: Depende da Fase 2; pode iniciar em paralelo com US1/US2 exceto pela dependência em `LoginPage.tsx` que não toca US1 ou US2
- **Polimento (Fase 6)**: Depende da conclusão de todas as fases anteriores

### Nota sobre `AuthContext.tsx`

T007 (US1) e T012 (US2) modificam o mesmo arquivo `AuthContext.tsx`. Se executados em paralelo por desenvolvedores diferentes, T012 deve ser aplicado após T007. Sequencialmente, T012 já encontrará o arquivo no estado correto.

### Dependências entre Histórias de Usuário

- **US1**: Pode iniciar após Fundação — sem dependências de outras histórias
- **US2**: Pode iniciar após Fundação — pode começar em paralelo com US1 exceto por `AuthContext.tsx`
- **US3+US4**: Pode iniciar após Fundação — independentes de US1 e US2

### Oportunidades de Paralelismo

Dentro da Fundação (Fase 2): T001, T002, T003 em paralelo → depois T004.

Dentro de US1 (Fase 3): T006 em paralelo com T007+ após T005.

Dentro de US2 (Fase 4): T011 em paralelo com T012+ após T010.

Dentro de US3+US4 (Fase 5): T017 e T019 em paralelo com T018+ após T016.

---

## Exemplo de Paralelismo: Fundação

```bash
# Iniciar em paralelo:
Task T001: "Adicionar 5 novas classes de erro em authErrors.ts"
Task T002: "Atualizar IAuthRepository.ts com novos métodos"
Task T003: "Adicionar message ao ApiRegisterResponse em authMappers.ts"

# Após T001+T002+T003:
Task T004: "Implementar todas as mudanças em AuthRepository.ts"
```

## Exemplo de Paralelismo: US1 e US2 (após Fundação)

```bash
# US1 - sequência:
T005 → T006[P] → T007 → T008 → T009

# US2 - pode iniciar T010 em paralelo com T005:
T010 → T011[P] → T012* → T013 → T014 → T015
# *T012 aguarda T007 (mesmo arquivo AuthContext.tsx)
```

---

## Estratégia de Implementação

### MVP (apenas US1)

1. Completar Fase 2: Fundação (T001–T004)
2. Completar Fase 3: US1 (T005–T009)
3. **PARAR e VALIDAR**: Testar cadastro → tela de verificação de e-mail
4. Prosseguir para US2 (confirmação via link) — necessária para o fluxo completo funcionar

### Entrega Incremental

1. Fundação (T001–T004) — base para tudo
2. US1 (T005–T009) — usuário vê instrução após cadastro
3. US2 (T010–T015) — usuário pode confirmar e acessar o sistema
4. US3+US4 (T016–T021) — usuário pode reenviar e-mail e receber feedback
5. Polimento (T022–T023) — qualidade e conformidade

### Execução Solo (Sequencial Recomendada)

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023

---

## Notas

- Tarefas marcadas **[P]** podem ser executadas em paralelo com outras tarefas do mesmo grupo
- Rótulo **[USn]** rastreia a tarefa à história de usuário para verificação de completude
- **Cobertura 100%** obrigatória para `ConfirmarEmailUseCase` e `ReenviarConfirmacaoEmailUseCase` (constituição §V)
- Proibido salvar JWT em `localStorage`/`sessionStorage` (constituição §IV) — o cookie HttpOnly é gerenciado exclusivamente pelo servidor
- Fazer commit após cada fase ou grupo lógico de tarefas
