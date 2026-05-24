# Pesquisa: Testes E2E de Autenticação

## D-01: Framework E2E — Playwright

**Decisão**: Usar **Playwright** como framework de testes E2E.

**Rationale**:
- Suporte nativo a TypeScript sem configuração adicional — alinhado com o padrão estrito do projeto
- Integração direta com Vite via configuração `webServer` no `playwright.config.ts` (sobe o servidor de desenvolvimento automaticamente durante os testes)
- Suporte a múltiplos navegadores (Chromium, Firefox, WebKit) a partir de uma única suíte
- Isolamento por contexto de browser — cada teste recebe um contexto limpo (cookies, storage) sem interferência
- API declarativa e ergonômica para interação com formulários, navegação e asserções
- Gerador de código integrado e relatório de testes HTML built-in

**Alternativas consideradas**:
- **Cypress**: Boa DX, mas não suporta múltiplos navegadores natively, é mais lento e não tem suporte a múltiplas abas — limitações desnecessárias para este projeto
- **Selenium/WebDriver**: Mais complexo de configurar, não é TypeScript-first, overhead de manutenção maior — não justificado para uma SPA moderna

---

## D-02: Padrão Page Object Model (POM)

**Decisão**: Organizar os testes com o padrão **Page Object Model** — uma classe por página (`LoginPage`, `RegisterPage`) que encapsula seletores e ações.

**Rationale**: Centraliza seletores em um único lugar. Se a UI mudar (ex: ID de um campo), apenas a classe da página é atualizada, sem tocar nos arquivos de teste. Torna os testes legíveis como especificações de comportamento.

**Alternativa rejeitada**: Seletores inline nos testes — duplicação, fragilidade e baixa legibilidade.

---

## D-03: Estratégia de seletores — atributo `data-testid`

**Decisão**: Usar atributos `data-testid` nos elementos interativos das páginas de login e cadastro como seletores primários nos testes E2E.

**Rationale**: Seletores por `data-testid` são imunes a mudanças de estilo (classes CSS), de estrutura HTML e de texto de label. São a prática recomendada pelo Playwright e pelo Testing Library para testes E2E resilientes.

**Implicações**: Requer adição de `data-testid` nos elementos de `LoginPage.tsx` e `RegisterPage.tsx` (campos de input, botão de submit, link de navegação, e container de mensagem de erro).

**Alternativa rejeitada**: Seletores por `label`, `placeholder` ou classe CSS — frágeis a refatorações de UI.

---

## D-04: Estratégia de dados de teste

**Decisão**: Adotar dois mecanismos complementares:

1. **Fixture de conta existente** (para testes de login): Credenciais de uma conta pré-existente no banco de teste, definidas via variáveis de ambiente (`.env.test`). Nunca hardcoded nos arquivos de teste.

2. **Geração de dados únicos por execução** (para testes de cadastro): O e-mail e CNPJ usados no cenário de sucesso são gerados com sufixo timestamp/randômico em cada execução, garantindo unicidade sem depender de cleanup.

3. **Dados de conflito pré-existentes** (para testes de duplicidade): Uma conta com e-mail e CNPJ conhecidos é criada no `globalSetup` do Playwright (antes de qualquer teste), garantindo que os cenários de 409 sempre tenham o conflito disponível.

**Rationale**: Combina previsibilidade (conta de login estável) com independência de execução (dados únicos para cadastro). Evita flakiness causada por estado residual de execuções anteriores.

**Alternativa rejeitada**: Banco de dados limpo por execução (requer infraestrutura adicional de reset do banco) — complexidade desnecessária para o escopo atual.

---

## D-05: Localização dos arquivos de teste

**Decisão**: Estrutura dedicada `e2e/` na raiz do projeto, separada de `src/` e de `vitest`:

```
e2e/
├── fixtures/
│   └── auth.fixtures.ts     — dados de teste e helpers de setup
├── pages/
│   ├── LoginPage.ts         — POM para /login
│   └── RegisterPage.ts      — POM para /cadastro
└── tests/
    ├── login.spec.ts
    └── register.spec.ts
playwright.config.ts         — raiz do projeto
```

**Rationale**: Separação clara entre testes unitários (Vitest em `src/`) e testes E2E (Playwright em `e2e/`). O `playwright.config.ts` na raiz segue o padrão oficial do Playwright.

**Alternativa rejeitada**: Misturar testes E2E em `src/` — confunde os dois runners e complica a configuração de ambos.

---

## D-06: Configuração do servidor de desenvolvimento

**Decisão**: Usar a opção `webServer` do Playwright para subir o Vite dev server automaticamente antes dos testes, e derrubá-lo ao término.

**Rationale**: Os testes E2E precisam de um servidor frontend rodando. A integração `webServer` do Playwright torna isso transparente — não é necessário subir o servidor manualmente antes de executar `playwright test`.

**Configuração base**:
- Comando: `npm run dev`
- URL: `http://localhost:5173` (porta padrão do Vite)
- `reuseExistingServer`: `true` em desenvolvimento local (não resubir se já estiver rodando)
