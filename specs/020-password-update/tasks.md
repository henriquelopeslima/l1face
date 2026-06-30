# Tarefas de Implementação: Atualização de Senha na Tela de Configurações

**Feature**: Atualização de Senha na Tela de Configurações  
**Branch**: `020-password-update`  
**Data**: 2026-06-30  
**Total de Tarefas**: 28  
**Prioridade Principal**: P1 (Alterar senha com sucesso)

---

## Resumo Executivo

Esta feature implementa um formulário de alteração de senha integrado às Configurações usando Clean Architecture. Dividida em **3 user stories independentes** (P1, P2, P2) que podem ser desenvolvidas em paralelo após a fase foundational.

**MVP Scope**: User Story 1 (P1) — alterar senha com sucesso  
**Time Box**: 2-4 horas (core) + 1-2 horas (P2 stories)  
**Parallelização**: Sim — P2 stories podem ser implementadas em paralelo após domain layer

---

## Estratégia de Implementação

1. **Phase 1 (Setup)**: Criar estrutura de diretórios
2. **Phase 2 (Foundational)**: Domain layer (entities, use cases, interfaces)
3. **Phase 3 (US1 - P1)**: Change password success path (MVP)
4. **Phase 4 (US2 - P2)**: Real-time validation [CAN RUN PARALLEL WITH US1]
5. **Phase 5 (US3 - P2)**: Error handling [CAN RUN PARALLEL WITH US1]
6. **Phase 6 (Polish)**: Integration, testes, otimizações

**Recomendação**: Implementar Phase 1-3 sequencialmente. Fases 4-5 podem rodar em paralelo depois que Phase 2 termina.

---

## PHASE 1: Setup (Project Structure)

- [x] T001 Create directory structure for feature `src/features/configuracoes/domain/entities`
- [x] T002 Create directory structure for feature `src/features/configuracoes/domain/usecases`
- [x] T003 Create directory structure for feature `src/features/configuracoes/domain/repositories`
- [x] T004 Create directory structure for feature `src/features/configuracoes/data/repositories`
- [x] T005 Create directory structure for feature `src/features/configuracoes/data/datasources`
- [x] T006 Create directory structure for feature `src/features/configuracoes/data/mappers`
- [x] T007 Create directory structure for feature `src/features/configuracoes/presentation/hooks`
- [x] T008 Create directory structure for feature `src/features/configuracoes/presentation/components`
- [x] T009 Create __tests__ directory for feature `src/features/configuracoes/__tests__/domain`

---

## PHASE 2: Foundational (Domain & Contracts)

**Gate**: Todos os requisitos desta fase DEVEM ser completos antes de iniciar qualquer user story.

### Domain Entities

- [x] T010 [P] Create TypeScript type definitions in `src/features/configuracoes/domain/entities/ChangePasswordRequest.ts`
  - Export interface: `ChangePasswordRequest { currentPassword: string; newPassword: string }`
  - Type-safe, no `any`

- [x] T011 [P] Create TypeScript type definitions in `src/features/configuracoes/domain/entities/ChangePasswordResponse.ts`
  - Export interface: `ChangePasswordResponse { success: boolean; error: string | null }`
  - Export type: `PasswordValidationError`
  - Export interface: `ValidationResult { isValid: boolean; errors: PasswordValidationError[]; message: string }`

### Domain Use Cases

- [x] T012 [P] Implement ValidarForcaSenhaUseCase in `src/features/configuracoes/domain/usecases/ValidarForcaSenhaUseCase.ts`
  - Method: `execute(password: string): ValidationResult`
  - Validate: 8-20 chars, contains letter, contains number
  - Return structured errors + friendly message
  - Pure function, no dependencies

- [x] T013 [P] Implement AlterarSenhaUseCase in `src/features/configuracoes/domain/usecases/AlterarSenhaUseCase.ts`
  - Constructor: inject `IChangePasswordRepository` + `ValidarForcaSenhaUseCase`
  - Method: `execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse>`
  - Call repository after validating request

### Domain Repository Interface

- [x] T014 [P] Create repository interface in `src/features/configuracoes/domain/repositories/IChangePasswordRepository.ts`
  - Export interface: `IChangePasswordRepository { changePassword(request): Promise<ChangePasswordResponse> }`

### Domain Tests

- [x] T015 [P] Unit test ValidarForcaSenhaUseCase in `src/features/configuracoes/__tests__/domain/ValidarForcaSenhaUseCase.test.ts`
  - Test valid password (8-20 chars, letters, numbers): should pass
  - Test password < 8 chars: should fail with MIN_LENGTH
  - Test password > 20 chars: should fail with MAX_LENGTH
  - Test no letters: should fail with NO_LETTERS
  - Test no numbers: should fail with NO_NUMBERS
  - Coverage: 100%

- [x] T016 [P] Unit test AlterarSenhaUseCase in `src/features/configuracoes/__tests__/domain/AlterarSenhaUseCase.test.ts`
  - Mock repository
  - Test successful call to repository
  - Coverage: 100%

---

## PHASE 3: User Story 1 - Alterar Senha com Sucesso [P1]

**Goal**: Usuário autenticado consegue alterar sua senha e receber confirmação de sucesso.

**Independent Test Criteria**: 
- Form renders correctly in SegurancaSection
- Valid form data submits to API
- API success response shows toast/message "Senha alterada com sucesso"
- Form clears after success
- User remains authenticated

### Data Layer

- [x] T017 [US1] Create HTTP datasource in `src/features/configuracoes/data/datasources/ChangePasswordAPI.ts`
  - Inject HTTP client (axios instance or equivalent)
  - Method: `changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>`
  - POST to `/api/auth/alterar-senha`
  - Headers: `Content-Type: application/json`
  - Handle axios errors (convert to ChangePasswordResponse)

- [x] T018 [US1] Implement repository in `src/features/configuracoes/data/repositories/ChangePasswordRepository.ts`
  - Implements `IChangePasswordRepository`
  - Inject `ChangePasswordAPI`
  - Handle HTTP 401 (redirect to login)
  - Handle HTTP 5xx (show generic error)
  - Retry logic for network errors (1x automatic)
  - Map API response to domain entity

### Presentation Layer

- [x] T019 [US1] Create custom hook in `src/features/configuracoes/presentation/hooks/useChangePassword.ts`
  - State: `formData`, `isLoading`, `error`, `success`, `validationErrors`
  - Inject: `AlterarSenhaUseCase`, `ValidarForcaSenhaUseCase`
  - Methods: `updateCurrentPassword()`, `updateNewPassword()`, `submit()`, `reset()`
  - Real-time validation on newPassword change
  - Manage loading state during submit
  - Clear form on success

- [x] T020 [P] [US1] Create presentational component in `src/features/configuracoes/presentation/components/AlterarSenhaForm.tsx`
  - Props: form data, handlers, loading state, errors, validation errors
  - Render: 2 inputs (current password, new password)
  - Render: submit button (disabled while loading)
  - Render: success/error messages
  - Reuse existing UI components (Input, Button, Card)
  - No business logic, only presentation

- [x] T021 [P] [US1] Create password strength indicator in `src/features/configuracoes/presentation/components/PasswordStrengthIndicator.tsx`
  - Props: password value, validation errors
  - Display: visual feedback (color/bar) based on strength
  - Display: list of failed requirements
  - Pure presentational component

- [x] T022 [US1] Integrate form into SegurancaSection in `src/features/configuracoes/presentation/components/SegurancaSection.tsx`
  - Import `AlterarSenhaForm` component
  - Create hook instance: `useChangePassword(useCase, validarForcaSenha)`
  - Pass hook state/actions to component
  - Test component renders without error

### Integration & Testing

- [x] T023 [P] [US1] Integration test in `src/features/configuracoes/__tests__/presentation/useChangePassword.test.ts`
  - Mock AlterarSenhaUseCase to return success
  - Test form submission flow
  - Test state transitions (initial → loading → success)
  - Test form clears after success

- [ ] T024 [US1] Manual testing checklist
  - [ ] Navigate to Configurações > Segurança
  - [ ] Form renders correctly
  - [ ] Fill with valid current + new password
  - [ ] Click "Alterar Senha"
  - [ ] Wait for API response (< 2 seconds)
  - [ ] Verify success message appears
  - [ ] Verify form clears
  - [ ] Verify user remains logged in

**US1 Complete**: User can successfully change password ✅

---

## PHASE 4: User Story 2 - Validação em Tempo Real [P2] (CAN RUN PARALLEL)

**Goal**: Usuário vê feedback imediato sobre força de senha enquanto digita.

**Independent Test Criteria**:
- ValidarForcaSenhaUseCase validates correctly
- Hook calls validator on password change
- PasswordStrengthIndicator displays feedback
- User sees all requirement checks in real-time

### Testing

- [ ] T025 [P] [US2] Comprehensive validation test in `src/features/configuracoes/__tests__/domain/ValidarForcaSenhaUseCase.test.ts`
  - (Already in T015 but expand if needed)
  - Test boundary: 7 chars, 8 chars, 20 chars, 21 chars
  - Test character combinations

- [ ] T026 [P] [US2] Component test for PasswordStrengthIndicator in `src/features/configuracoes/__tests__/presentation/PasswordStrengthIndicator.test.ts`
  - Test with empty password: shows empty state
  - Test with short password: shows MIN_LENGTH error
  - Test with missing letters: shows NO_LETTERS error
  - Test with missing numbers: shows NO_NUMBERS error
  - Test with valid password: shows all checks passed
  - Render with React Testing Library

- [ ] T027 [P] [US2] Integration test for real-time validation in `src/features/configuracoes/__tests__/presentation/useChangePassword.test.ts`
  - Test onChange triggers validation
  - Test hook updates validationErrors state
  - Test component re-renders with new feedback

### Manual Testing

- [ ] T028 [US2] Verify real-time validation feedback
  - Navigate to Configurações > Segurança
  - Type in "Nova Senha" field: "a" → shows multiple errors
  - Type: "abcdefgh" (8 chars, no numbers) → shows NO_NUMBERS
  - Type: "abcdefgh1" (valid) → shows all checks passed
  - Verify feedback appears < 200ms after typing

**US2 Complete**: Real-time validation feedback working ✅

---

## PHASE 5: User Story 3 - Tratamento de Erros [P2] (CAN RUN PARALLEL)

**Goal**: Sistema mostra erros claros sem revelar informações sensíveis.

**Independent Test Criteria**:
- Incorrect current password shows generic error
- API validation errors are displayed
- No system details leaked in error messages
- Form state preserved on error
- User can retry

### Data Layer (Error Handling)

(Covered in T018 but verify):
- [ ] T029 [P] [US3] Verify error mapping in ChangePasswordRepository
  - Map API `success: false` + `error` field to meaningful messages
  - Verify no stack traces or internal details leak

### Presentation Layer (Error Display)

(T020 covers basic error display but enhance):
- [ ] T030 [P] [US3] Enhance AlterarSenhaForm for error states in `src/features/configuracoes/presentation/components/AlterarSenhaForm.tsx`
  - Display error message in Alert component
  - Preserve form data on error (user can retry)
  - Show error for 5 seconds or until dismissed
  - Disable submit button only while loading, enable after error

### Testing

- [ ] T031 [P] [US3] Test incorrect password error in `src/features/configuracoes/__tests__/presentation/useChangePassword.test.ts`
  - Mock useCase to return `success: false, error: "Senha atual incorreta"`
  - Verify hook updates error state
  - Verify form data is preserved
  - Verify loading state is cleared

- [ ] T032 [P] [US3] Test edge cases for error handling
  - API timeout (axios timeout): show "Verifique sua conexão"
  - 500 error: show "Erro ao alterar senha. Tente novamente."
  - 401 (JWT expired): redirect to /login
  - Network error: show retry option or automatic retry

### Manual Testing

- [ ] T033 [US3] Test incorrect password flow
  - Fill form with wrong current password
  - Click "Alterar Senha"
  - Verify error message "Senha atual incorreta" appears
  - Verify form data is preserved
  - Verify user can edit and retry

- [ ] T034 [US3] Test API error handling
  - Use browser DevTools to throttle network (simulate 500 error)
  - Submit form
  - Verify appropriate error message
  - Verify user can retry

**US3 Complete**: Error handling and validation working ✅

---

## PHASE 6: Polish & Cross-Cutting Concerns

### Code Quality

- [ ] T035 [P] Review TypeScript types for strictness
  - No `any` types
  - All domain entities fully typed
  - Verify `tsconfig.json` strict mode

- [ ] T036 [P] Review component prop types
  - All React component props have TypeScript interfaces
  - No prop drilling; use hooks where appropriate

- [ ] T037 [P] Code review for security
  - No `dangerouslySetInnerHTML` usage
  - Passwords not logged or exposed in console
  - Error messages don't reveal system details
  - JWT handling delegates to HTTP client

### Performance

- [ ] T038 [P] Verify validation performance (< 200ms feedback)
  - Use React DevTools Profiler
  - Measure ValidarForcaSenhaUseCase execution
  - Measure re-render time for PasswordStrengthIndicator

- [ ] T039 [P] Prevent unnecessary re-renders
  - Use `useCallback` for event handlers in hook (if needed)
  - Use `useMemo` for validation result (if complex)
  - Verify no prop drilling causes parent re-renders

### Documentation

- [ ] T040 [P] Add JSDoc comments to domain use cases
  - Document ValidarForcaSenhaUseCase
  - Document AlterarSenhaUseCase
  - Document repository interface

- [ ] T041 [P] Add inline comments for complex logic
  - Validation regex or logic
  - Retry/timeout handling in data layer
  - State machine transitions in hook (if complex)

### Final Integration

- [ ] T042 [P] Verify feature integrates without breaking other features
  - Run full test suite: `npm test`
  - Run TypeScript check: `tsc --noEmit`
  - Verify no console errors/warnings in browser
  - Test other Configurações sections still work

- [ ] T043 [US1] Final end-to-end test of complete flow
  - Login to app
  - Navigate to Configurações > Segurança
  - Verify AlterarSenhaForm renders
  - Fill with valid data (all P2 validations passing)
  - Submit
  - Verify success message
  - Logout
  - Login with new password
  - Verify login succeeds

**Polish Complete**: Feature fully integrated and polished ✅

---

## Dependency Graph & Parallelization

```
PHASE 1: Setup (sequential)
    ↓
PHASE 2: Foundational (sequential, blocks all stories)
    ├─ T010-T016: Domain layer + tests
    └─ GATE: Must complete before Phase 3+
    
PHASE 3 (US1 - P1): Sequential (MVP path)
├─ T017-T018: Data layer
├─ T019-T021: Presentation layer
├─ T022: Integration
└─ T023-T024: Testing

    ↓ [GATE: Phase 2 complete]
    
PHASE 4 (US2 - P2): [CAN RUN PARALLEL WITH PHASE 5]
├─ T025-T027: Enhance validation + testing
└─ T028: Manual testing

PHASE 5 (US3 - P2): [CAN RUN PARALLEL WITH PHASE 4]
├─ T029-T034: Error handling + testing
└─ T034: Manual testing

    ↓ [All parallel tasks done]
    
PHASE 6: Polish (sequential, final touches)
├─ T035-T041: Code quality + docs
└─ T042-T043: Final integration testing
```

---

## Suggested Implementation Order (Sequential MVP)

1. **Commit 1** (Setup): T001-T009 — Diretórios
2. **Commit 2** (Domain): T010-T016 — Entities + Use Cases + Tests
3. **Commit 3** (Data): T017-T018 — Repository + API
4. **Commit 4** (Hook): T019 — useChangePassword Hook
5. **Commit 5** (Components): T020-T021 — Form + Strength Indicator
6. **Commit 6** (Integration): T022 — SegurancaSection import + T023-T024 tests
7. **Commit 7** (P2 - Optional): T025-T028 — Validation enhancements
8. **Commit 8** (P2 - Optional): T029-T034 — Error handling enhancements
9. **Commit 9** (Polish): T035-T043 — Code quality + final testing

---

## Task Summary by Category

| Categoria | Tarefas | Parallelizáveis |
|-----------|---------|-----------------|
| Setup | T001-T009 | Não (criar pastas) |
| Domain Entities | T010-T011 | Sim (2 arquivos) |
| Domain Use Cases | T012-T013 | Sim (2 arquivos) |
| Domain Tests | T015-T016 | Sim |
| Repository Interface | T014 | Não (bloqueador) |
| Data Layer (US1) | T017-T018 | Sim |
| Presentation (US1) | T019-T021 | Sim |
| Integration (US1) | T022-T024 | Não (pós T021) |
| Validation (US2) | T025-T028 | Sim (após Phase 2) |
| Error Handling (US3) | T029-T034 | Sim (após Phase 2) |
| Polish | T035-T043 | Sim (independentes) |

---

## Success Criteria per User Story

### US1 - P1 (Change Password Successfully)
- ✅ Form renders in SegurancaSection without errors
- ✅ Valid form submission calls API
- ✅ Success response shows "Senha alterada com sucesso"
- ✅ Form clears after success
- ✅ User remains authenticated
- ✅ E2E test: change password → logout → login with new password succeeds

### US2 - P2 (Real-Time Validation)
- ✅ ValidarForcaSenhaUseCase validates all requirements
- ✅ Feedback appears < 200ms after typing
- ✅ PasswordStrengthIndicator displays all checks
- ✅ User sees errors/passes for: length, letters, numbers

### US3 - P2 (Error Handling)
- ✅ Incorrect password shows "Senha atual incorreta" (generic)
- ✅ No system details leak in messages
- ✅ Form data preserved on error
- ✅ User can retry after error
- ✅ API errors (400/5xx/401) handled gracefully

---

## Time Estimates

| Phase | Estimate | Notes |
|-------|----------|-------|
| Phase 1 (Setup) | 15 min | Create directories |
| Phase 2 (Foundational) | 45 min | Domain layer + unit tests |
| Phase 3 (US1 - MVP) | 60-90 min | Data + Presentation + integration |
| Phase 4 (US2) | 30 min | Validation enhancements (parallel) |
| Phase 5 (US3) | 30 min | Error handling (parallel) |
| Phase 6 (Polish) | 30 min | Code quality + final testing |
| **Total** | **3-4 hours** | MVP (US1 only): 2 hours |

---

## Próximas Etapas

1. ✅ Specification (`/speckit-specify`) — COMPLETO
2. ✅ Planning (`/speckit-plan`) — COMPLETO  
3. ✅ Tasks (`/speckit-tasks`) — VOCÊ ESTÁ AQUI
4. → Implementation (`/speckit-implement`) — Próximo: executar tasks nesta ordem
5. → Verificação (`/speckit-verify`) — Opcional: validar após implementação

**Para começar a implementação**:
```bash
/speckit-implement
```

Isso executará os tasks sequencialmente (ou em paralelo onde indicado) e marcará progresso.
