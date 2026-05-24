# Tarefas: Testes E2E de Autenticação

**Entrada**: Documentos de design em `specs/005-e2e-auth-tests/`  
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Organização**: As tarefas são agrupadas por história de usuário para implementação e teste independentes.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

---

## Fase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Instalar o Playwright, criar a estrutura de diretórios e configurar o runner de testes. DEVE estar concluída antes de qualquer trabalho de Page Object ou spec file.

- [x] T001 Instalar `@playwright/test` como devDependency via `npm install -D @playwright/test` e em seguida instalar os browsers via `npx playwright install --with-deps chromium` no diretório `/home/henriquelima/Workspace/company/licita-one/l1face`

- [x] T002 Criar `playwright.config.ts` na raiz do projeto com: `testDir: 'e2e/tests'`, projeto Chromium, `baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173'`, `webServer` configurado com `command: 'npm run dev'` e `url: 'http://localhost:5173'` e `reuseExistingServer: true`, timeout de 30s por teste (depende de T001)

- [x] T003 [P] Adicionar scripts ao `package.json`: `"test:e2e": "playwright test"` e `"test:e2e:ui": "playwright test --ui"` (depende de T001)

- [x] T004 [P] Criar estrutura de diretórios: `e2e/fixtures/`, `e2e/pages/`, `e2e/tests/`

- [x] T005 [P] Criar `.env.test.example` na raiz do projeto documentando as variáveis necessárias: `E2E_BASE_URL=http://localhost:5173`, `E2E_TEST_EMAIL=` (e-mail de conta existente), `E2E_TEST_PASSWORD=` (senha da conta), `E2E_CONFLICT_EMAIL=conflito@e2e.licita.one`, `E2E_CONFLICT_CNPJ=` (CNPJ reservado para testes de duplicidade)

**Checkpoint**: Setup completo — `npx playwright test --list` deve executar sem erro (zero testes listados, mas configuração válida).

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Adicionar `data-testid` nas páginas de auth e criar as fixtures de dados. Estes artefatos bloqueiam todos os Page Objects e specs — nenhum teste pode ser escrito antes desta fase.

**⚠️ CRÍTICO**: Nenhum Page Object ou spec file pode ser iniciado até que esta fase esteja completa.

- [x] T006 [P] Adicionar atributos `data-testid` em `src/features/auth/presentation/pages/LoginPage.tsx`:
  - `data-testid="login-email"` no `<Input id="email">`
  - `data-testid="login-password"` no `<Input id="password">`
  - `data-testid="login-submit"` no `<Button type="submit">`
  - `data-testid="login-error"` no `<p role="alert">` que exibe `displayError`
  - `data-testid="login-link-cadastro"` no `<button>` "Criar conta" que navega para `/cadastro`

- [x] T007 [P] Adicionar atributos `data-testid` em `src/features/auth/presentation/pages/RegisterPage.tsx`:
  - `data-testid="register-nome"` no `<Input>` do campo nome
  - `data-testid="register-email"` no `<Input>` do campo e-mail
  - `data-testid="register-password"` no `<Input>` do campo senha
  - `data-testid="register-cnpj"` no `<Input>` do campo CNPJ
  - `data-testid="register-razao-social"` no `<Input>` do campo razão social
  - `data-testid="register-submit"` no `<Button type="submit">`
  - `data-testid="register-error"` no `<p role="alert">` que exibe `error`
  - `data-testid="register-link-login"` no `<button>` "Entrar" que navega para `/login`

- [x] T008 Criar `e2e/fixtures/auth.fixtures.ts` com:
  - Interface `ExistingUserFixture { email: string; password: string }` lida de `process.env`
  - Função `getExistingUser(): ExistingUserFixture` que lê `E2E_TEST_EMAIL` e `E2E_TEST_PASSWORD` do ambiente e lança erro descritivo se ausentes
  - Interface `NewUserFixture { nome: string; email: string; password: string; cnpj: string; razaoSocial: string }`
  - Função `generateNewUser(): NewUserFixture` que gera e-mail único com timestamp (`teste+<Date.now()>@e2e.licita.one`) e CNPJ numérico único de 14 dígitos
  - Interface `DuplicateConflictFixture { email: string; cnpj: string; password: string; nome: string; razaoSocial: string }`
  - Função `getDuplicateConflict(): DuplicateConflictFixture` que lê `E2E_CONFLICT_EMAIL` e `E2E_CONFLICT_CNPJ` do ambiente
  (depende de T004)

**Checkpoint**: Fundação pronta — `npx tsc --noEmit` deve passar sem erros nos arquivos de `src/` modificados e em `e2e/fixtures/auth.fixtures.ts`.

---

## Fase 3: História de Usuário 1 — Cobertura E2E do Fluxo de Login (Prioridade: P1) 🎯 MVP

**Objetivo**: Suíte automatizada validando os 6 cenários de login: sucesso com redirecionamento, credenciais inválidas, e validações de campo client-side.

**Teste Independente**: Executar `npx playwright test login.spec.ts` com servidor l1core rodando e `.env.test` configurado — todos os 6 cenários devem passar.

- [x] T009 [US1] Criar `e2e/pages/LoginPage.ts` como classe Playwright Page Object com:
  - Propriedades para cada locator: `emailInput = page.getByTestId('login-email')`, `passwordInput = page.getByTestId('login-password')`, `submitButton = page.getByTestId('login-submit')`, `errorMessage = page.getByTestId('login-error')`, `linkCadastro = page.getByTestId('login-link-cadastro')`
  - Método `goto()` que navega para `/login`
  - Método `fillAndSubmit(email: string, password: string)` que preenche os campos e clica em submit
  - Método `getErrorText(): Promise<string>` que retorna o `textContent()` da mensagem de erro
  - Método `navigateToCadastro()` que clica no link de cadastro
  (depende de T006)

- [x] T010 [US1] Criar `e2e/tests/login.spec.ts` com os 6 cenários de aceite da US1:
  1. Login com credenciais válidas (de `getExistingUser()`) → URL final é `/` ou `/selecionar-vinculo`
  2. Login com e-mail válido e senha errada → `errorMessage` visível com texto indicando credenciais inválidas
  3. Submit com campo e-mail vazio → `errorMessage` visível; verificar que URL não mudou (sem chamada ao servidor)
  4. Submit com e-mail sem `@` → `errorMessage` visível antes de qualquer redirect
  5. Submit com senha de 7 caracteres → `errorMessage` visível antes de qualquer redirect
  6. Clique em "Criar conta" → URL muda para `/cadastro`
  (depende de T008, T009)

**Checkpoint**: Neste ponto, US1 é totalmente testável. `npx playwright test login.spec.ts` deve passar com 6 testes.

---

## Fase 4: Histórias de Usuário 2 e 3 — Cobertura E2E do Fluxo de Cadastro e Navegação (Prioridade: P1/P2)

**Objetivo**: Suíte validando os 6 cenários de cadastro (dados válidos, validações, duplicatas, formatação de CNPJ) e os 2 cenários de navegação cruzada.

**Teste Independente**: Executar `npx playwright test register.spec.ts` — todos os 8 cenários devem passar. Os cenários de duplicidade requerem `E2E_CONFLICT_EMAIL` e `E2E_CONFLICT_CNPJ` cadastrados no backend de teste.

- [x] T011 [US2] Criar `e2e/pages/RegisterPage.ts` como classe Playwright Page Object com:
  - Locators para cada campo: `nomeInput`, `emailInput`, `passwordInput`, `cnpjInput`, `razaoSocialInput`, `submitButton`, `errorMessage`, `linkLogin`
  - Método `goto()` que navega para `/cadastro`
  - Método `fillAndSubmit(fixture: NewUserFixture)` que preenche todos os campos e submete
  - Método `fillField(testId: string, value: string)` que preenche um campo específico pelo `data-testid`
  - Método `getErrorText(): Promise<string>` que retorna o texto da mensagem de erro global
  - Método `getFieldErrorText(fieldName: string): Promise<string>` que retorna o texto do erro de validação inline de um campo usando `page.locator('[data-testid="' + fieldName + '"] ~ p')`
  - Método `getCnpjValue(): Promise<string>` que retorna o `inputValue()` do campo CNPJ
  - Método `navigateToLogin()` que clica no link "Entrar"
  (depende de T007)

- [x] T012 [US2] [US3] Criar `e2e/tests/register.spec.ts` com os 8 cenários (6 de US2 + 2 de US3):
  US2:
  1. Cadastro com dados únicos válidos (`generateNewUser()`) → URL final é `/` ou `/selecionar-vinculo`
  2. Submit com todos os campos vazios → pelo menos um erro de validação visível; URL não muda
  3. Cadastro com e-mail igual a `getDuplicateConflict().email` → `errorMessage` contém texto sobre e-mail duplicado
  4. Cadastro com CNPJ igual a `getDuplicateConflict().cnpj` → `errorMessage` contém texto sobre CNPJ duplicado
  5. Digitar `12345678000195` no campo CNPJ → verificar que `getCnpjValue()` retorna `12.345.678/0001-95`
  6. Clicar no link "Entrar" → URL muda para `/login`
  US3:
  7. Acessar `/login` → `page.getByTestId('login-link-cadastro')` está visível
  8. Acessar `/cadastro` → `page.getByTestId('register-link-login')` está visível
  (depende de T008, T011)

**Checkpoint**: Neste ponto, US1, US2 e US3 são funcionais. `npx playwright test` deve executar e passar nos 14 cenários totais.

---

## Fase 5: Polimento & Aspectos Transversais

- [x] T013 [P] Verificar TypeScript estrito: `npx tsc --noEmit` deve passar sem erros em todos os arquivos novos e modificados (`LoginPage.tsx`, `RegisterPage.tsx`, `playwright.config.ts`, `e2e/fixtures/auth.fixtures.ts`, `e2e/pages/LoginPage.ts`, `e2e/pages/RegisterPage.ts`, `e2e/tests/login.spec.ts`, `e2e/tests/register.spec.ts`)

- [ ] T014 Executar `npx playwright test` com o ambiente de teste configurado e confirmar que todos os testes passam; se algum falhar, ajustar seletores ou asserções conforme necessário

---

## Dependências & Ordem de Execução

### Dependências entre Fases

```
Fase 1 (Setup: Playwright + config)
    └── Fase 2 (Fundação: data-testid + fixtures)
            ├── Fase 3 (US1: LoginPage POM + login.spec.ts)
            │       └── Fase 4 (US2+US3: RegisterPage POM + register.spec.ts)
            │               └── Fase 5 (Polimento)
            └── [T006 e T007 podem ser paralelos entre si]
```

### Dependências dentro da Fase 1

- T001 → T002, T003 dependem de T001 (Playwright instalado)
- T003, T004, T005 → paralelos entre si após T001

### Dependências dentro da Fase 2

- T006 e T007 → paralelos entre si (arquivos distintos)
- T008 → depende de T004 (diretório `e2e/fixtures/` criado)

### Dependências dentro da Fase 3

- T009 → depende de T006 (data-testid em LoginPage.tsx)
- T010 → depende de T008 (fixtures) e T009 (POM)

### Dependências dentro da Fase 4

- T011 → depende de T007 (data-testid em RegisterPage.tsx)
- T012 → depende de T008 (fixtures) e T011 (POM)

### Oportunidades de Paralelismo

- T003, T004, T005 — paralelos entre si (após T001)
- T006 e T007 — paralelos entre si (arquivos distintos na Fase 2)
- T009 e T011 — paralelos entre si (após suas dependências de data-testid)

---

## Exemplo de Paralelismo: Fase 2 (Fundação)

```bash
# Após T001 concluído, iniciar simultaneamente:
Task T006: "Adicionar data-testid em LoginPage.tsx"
Task T007: "Adicionar data-testid em RegisterPage.tsx"
Task T008: "Criar auth.fixtures.ts"
```

---

## Estratégia de Implementação

### MVP First (US1 — Login E2E)

1. Concluir Fase 1: Setup (T001–T005)
2. Concluir Fase 2: Fundação — apenas T006 e T008 (data-testid do login + fixtures)
3. Concluir Fase 3: US1 (T009–T010)
4. **PARAR e VALIDAR**: `npx playwright test login.spec.ts` — 6 testes passando
5. Adicionar T007 + T011 + T012 para cadastro e navegação

### Entrega Incremental

- Após Fase 1 + 2 + 3: Regressões de login detectadas automaticamente (MVP)
- Após Fase 4: Regressões de cadastro e navegação também cobertas
- Após Fase 5: Suíte validada com TypeScript estrito; pronta para CI
