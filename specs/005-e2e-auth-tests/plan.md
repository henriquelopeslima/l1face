# Plano de Implementação: Testes E2E de Autenticação

**Branch**: `005-e2e-auth-tests` | **Data**: 2026-05-23 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/005-e2e-auth-tests/spec.md`

## Resumo

Implementar suíte de testes E2E com **Playwright** para os fluxos de login e cadastro. A suíte adota o padrão **Page Object Model** (POM) para resiliência a mudanças de UI, usa atributos `data-testid` como seletores estáveis, e integra com o servidor Vite via configuração `webServer`. Requer adição de `data-testid` nos elementos interativos de `LoginPage.tsx` e `RegisterPage.tsx`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0 / Playwright ^1.x  
**Dependências Principais**: `@playwright/test`, Vite dev server (porta 5173)  
**Armazenamento**: N/A (testes não persistem dados — usa banco de teste via `.env.test`)  
**Testes**: Playwright Test runner (separado do Vitest existente)  
**Plataforma Alvo**: Navegadores Chromium, Firefox, WebKit (headless em CI)  
**Tipo de Projeto**: Suíte E2E complementar ao projeto SPA existente  
**Metas de Performance**: Suíte completa em < 2 minutos em CI  
**Restrições**: Requer servidor backend (l1core) acessível; credenciais de conta de teste via `.env.test` (nunca hardcoded)  
**Escala/Scope**: 14 cenários de aceite cobrindo login (US1), cadastro (US2) e navegação (US3)

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture / Vertical Slices | ✅ PASS | Testes E2E vivem em `e2e/` fora de `src/` — não tocam na arquitetura da aplicação |
| I. Isolamento domain → data/presentation | ✅ PASS | N/A — testes são consumidores externos da UI, não alteram a arquitetura interna |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Page Objects e fixtures terão tipos explícitos; `data-testid` em JSX é `string` |
| III. Hooks customizados para lógica de estado | ✅ PASS | N/A — testes não envolvem hooks React |
| IV. Tokens não em localStorage/sessionStorage | ✅ PASS | Autenticação via cookie HttpOnly — os testes verificam comportamento, não inspecionam storage |
| IV. Mascaramento de erros de infraestrutura | ✅ PASS | Testes verificam mensagens de erro da UI (já mascaradas pela aplicação) |
| V. Cobertura de Use Cases | ✅ PASS | N/A — testes E2E complementam os testes unitários de Use Cases já existentes |

**Resultado**: Nenhuma violação. A única mudança nos arquivos de `src/` é a adição de atributos `data-testid` — sem impacto na lógica de negócio.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/005-e2e-auth-tests/
├── plan.md              ← este arquivo
├── research.md          ← Fase 0
├── data-model.md        ← Fase 1
└── tasks.md             ← gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
playwright.config.ts                              [NOVO] — configuração raiz do Playwright

e2e/
├── fixtures/
│   └── auth.fixtures.ts                          [NOVO] — tipos e helpers de fixtures
├── pages/
│   ├── LoginPage.ts                              [NOVO] — POM para /login
│   └── RegisterPage.ts                           [NOVO] — POM para /cadastro
└── tests/
    ├── login.spec.ts                             [NOVO] — cenários de login (US1)
    └── register.spec.ts                          [NOVO] — cenários de cadastro (US2 + US3)

src/features/auth/presentation/pages/
├── LoginPage.tsx                                 [ATUALIZADO] — adicionar data-testid
└── RegisterPage.tsx                              [ATUALIZADO] — adicionar data-testid

.env.test.example                                 [NOVO] — template de variáveis de ambiente
```

**Adições ao `package.json`**: `@playwright/test` em devDependencies; scripts `test:e2e` e `test:e2e:ui`.

**Decisão de Estrutura**: Separação total entre Vitest (unitários em `src/`) e Playwright (E2E em `e2e/`). O `playwright.config.ts` na raiz configura o `webServer` para subir o Vite automaticamente.

---

## Fase 0: Pesquisa

*Ver [research.md](./research.md) para detalhes completos.*

### Decisões-chave

**D-01: Playwright como framework E2E**
- **Decisão**: Playwright — TypeScript-first, multi-browser, integração nativa com Vite via `webServer`.
- **Rationale**: Alinhado ao TypeScript estrito da constituição; isola contextos por teste; zero config para dev server.
- **Alternativa rejeitada**: Cypress (sem multi-browser nativo), Selenium (complexidade desnecessária).

**D-02: Page Object Model**
- **Decisão**: Uma classe por página encapsulando seletores e ações.
- **Rationale**: Centraliza seletores — mudanças de UI afetam apenas a classe POM, não os testes.
- **Alternativa rejeitada**: Seletores inline nos arquivos `.spec.ts`.

**D-03: Seletores `data-testid`**
- **Decisão**: Atributos `data-testid` nos elementos interativos das páginas de auth.
- **Rationale**: Imunes a mudanças de estilo, texto e estrutura HTML.
- **Alternativa rejeitada**: Seletores por classe CSS ou texto de label.

**D-04: Estratégia de dados de teste**
- **Decisão**: Conta estável via `.env.test` + dados únicos por execução + conta de conflito criada no `globalSetup`.
- **Rationale**: Combina previsibilidade com independência de execução. Sem flakiness por estado residual.
- **Alternativa rejeitada**: Reset de banco por execução (infraestrutura complexa).

**D-05: Estrutura `e2e/` na raiz + `playwright.config.ts`**
- **Decisão**: Diretório `e2e/` dedicado separado de `src/`; config na raiz.
- **Rationale**: Convenção oficial do Playwright; isolamento entre Vitest e Playwright.

---

## Fase 1: Design e Contratos

*Ver [data-model.md](./data-model.md) para detalhes completos.*

### Sumário de Artefatos

- **Fixtures tipadas**: `ExistingUserFixture`, `NewUserFixture`, `DuplicateConflictFixture`
- **Page Object `LoginPage`**: métodos `fillAndSubmit`, `getErrorMessage`, `navigateToCadastro`
- **Page Object `RegisterPage`**: métodos `fillAndSubmit`, `fillField`, `getErrorMessage`, `getFieldError`, `navigateToLogin`
- **`data-testid` em `LoginPage.tsx`**: `login-email`, `login-password`, `login-submit`, `login-error`, `login-link-cadastro`
- **`data-testid` em `RegisterPage.tsx`**: `register-nome`, `register-email`, `register-password`, `register-cnpj`, `register-razao-social`, `register-submit`, `register-error`, `register-link-login`
- **Variáveis `.env.test`**: `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_CONFLICT_EMAIL`, `E2E_CONFLICT_CNPJ`, `E2E_BASE_URL`
