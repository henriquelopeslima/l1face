# Modelo de Dados: Testes E2E de Autenticação

Esta feature não envolve entidades de domínio da aplicação. Os "modelos" aqui são as **fixtures de dados de teste** e os **Page Objects** que encapsulam a estrutura das páginas.

---

## Fixtures de Dados de Teste

### `ExistingUserFixture` — conta pré-existente para login

Utilizada nos cenários de login com credenciais válidas. Carregada de variáveis de ambiente `.env.test`.

| Campo      | Tipo     | Fonte          | Descrição                        |
|------------|----------|----------------|----------------------------------|
| `email`    | `string` | `.env.test`    | E-mail de conta já cadastrada    |
| `password` | `string` | `.env.test`    | Senha da conta                   |

### `NewUserFixture` — dados únicos para cadastro bem-sucedido

Gerados dinamicamente por execução para garantir unicidade.

| Campo        | Tipo     | Geração                              | Descrição                          |
|--------------|----------|--------------------------------------|------------------------------------|
| `nome`       | `string` | Fixo: `"Teste E2E"`                  | Nome completo                      |
| `email`      | `string` | `teste+<timestamp>@e2e.licita.one`   | E-mail único por execução          |
| `password`   | `string` | Fixo: `"SenhaForte@123"`             | Senha válida (≥ 8 caracteres)      |
| `cnpj`       | `string` | Gerado com dígitos randômicos válidos | CNPJ único por execução (14 dígitos)|
| `razaoSocial`| `string` | Fixo: `"Empresa E2E Testes Ltda"`    | Razão social (≥ 10 caracteres)     |

### `DuplicateConflictFixture` — dados de conta pré-existente para testes de 409

Criados no `globalSetup` antes de qualquer teste. Garantem que os cenários de e-mail/CNPJ duplicados sempre encontrem conflito.

| Campo        | Tipo     | Valor                                       |
|--------------|----------|---------------------------------------------|
| `email`      | `string` | `conflito@e2e.licita.one`                   |
| `password`   | `string` | `SenhaForte@123`                            |
| `cnpj`       | `string` | CNPJ fixo reservado para testes de conflito |
| `razaoSocial`| `string` | `Empresa Conflito E2E Ltda`                 |

---

## Page Objects

### `LoginPage`

Arquivo: `e2e/pages/LoginPage.ts`

Encapsula os seletores e ações da página `/login`.

| Elemento              | `data-testid`           | Tipo de ação       |
|-----------------------|-------------------------|--------------------|
| Campo e-mail          | `login-email`           | `fill()`           |
| Campo senha           | `login-password`        | `fill()`           |
| Botão submeter        | `login-submit`          | `click()`          |
| Mensagem de erro      | `login-error`           | `textContent()`    |
| Link "Criar conta"    | `login-link-cadastro`   | `click()`          |

**Métodos expostos**:
- `fillAndSubmit(email, password)` — preenche e submete o formulário
- `getErrorMessage()` — retorna o texto da mensagem de erro exibida
- `navigateToCadastro()` — clica no link "Criar conta"

### `RegisterPage`

Arquivo: `e2e/pages/RegisterPage.ts`

Encapsula os seletores e ações da página `/cadastro`.

| Elemento              | `data-testid`              | Tipo de ação       |
|-----------------------|----------------------------|--------------------|
| Campo nome            | `register-nome`            | `fill()`           |
| Campo e-mail          | `register-email`           | `fill()`           |
| Campo senha           | `register-password`        | `fill()`           |
| Campo CNPJ            | `register-cnpj`            | `fill()`           |
| Campo razão social    | `register-razao-social`    | `fill()`           |
| Botão submeter        | `register-submit`          | `click()`          |
| Mensagem de erro      | `register-error`           | `textContent()`    |
| Link "Entrar"         | `register-link-login`      | `click()`          |

**Métodos expostos**:
- `fillAndSubmit(fixture)` — preenche todos os campos e submete
- `fillField(name, value)` — preenche um campo específico
- `getErrorMessage()` — retorna o texto da mensagem de erro exibida
- `getFieldError(fieldName)` — retorna mensagem de validação de um campo específico
- `navigateToLogin()` — clica no link "Entrar"
