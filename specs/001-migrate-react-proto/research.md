# Research: Migração do Protótipo React para l1face

**Feature**: `001-migrate-react-proto`
**Data**: 2026-05-18

## Decisões de Bibliotecas

### Roteamento

**Decisão**: React Router v7 (mesmo do protótipo)
**Rationale**: O protótipo já usa React Router 7 com `createBrowserRouter`. Manter a mesma versão elimina retrabalho de roteamento. O padrão de layouts aninhados (`RootLayout`, `SelecionarVinculoLayout`) é nativo da API do React Router 7.
**Alternativas consideradas**: TanStack Router — mais tipado, mas exigiria reescrita completa das rotas sem ganho para esta fase.

### Estilização

**Decisão**: Tailwind CSS v4 + CSS custom properties para tema
**Rationale**: O protótipo usa Tailwind v4 com variáveis CSS (`hsl(var(--primary))`, `hsl(var(--border))`, etc.) e `tw-animate-css`. Manter v4 preserva fidelidade visual sem conversão de sintaxe.
**Alternativas consideradas**: Tailwind v3 — incompatível com a sintaxe `@theme` usada no protótipo.

### Componentes de UI

**Decisão**: Shadcn/ui pattern (Radix UI + Tailwind CSS) — migrar apenas os usados
**Rationale**: O protótipo usa o padrão shadcn/ui com Radix UI como primitivos. Os componentes são copiados (não instalados como pacote), o que permite customização direta. Apenas os 20 componentes efetivamente usados nas páginas serão migrados (acordado na clarificação Q1).

**Componentes a migrar** (auditados por `grep` nas importações reais):
- `accordion`, `alert`, `badge`, `button`, `card`, `checkbox`, `dialog`
- `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`
- `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`
- `utils.ts` (função `cn`)

**Componentes NÃO migrados** (presentes no protótipo mas sem uso nas páginas):
- `aspect-ratio`, `avatar`, `breadcrumb`, `calendar`, `carousel`, `chart`
- `collapsible`, `command`, `context-menu`, `drawer`, `hover-card`
- `input-otp`, `menubar`, `navigation-menu`, `pagination`, `popover`
- `progress`, `radio-group`, `radix-select`, `resizable`, `scroll-area`
- `sheet`, `slider`, `toggle`, `toggle-group`, `use-mobile`, `input-otp`

### Validação de Formulários

**Decisão**: React Hook Form + Zod
**Rationale**: O protótipo já usa `react-hook-form`. Zod é adicionado para validação de schema, alinhando com o princípio IV da constituição ("Validação na Borda via Zod antes de atingir o domínio"). O protótipo usa validação nativa do HTML (`required`) que será mantida visualmente, mas complementada com Zod.
**Alternativas consideradas**: Apenas validação HTML nativa — insuficiente para cumprir a constituição.

### Notificações Toast

**Decisão**: Sonner
**Rationale**: O protótipo importa `sonner`. Mantido por consistência visual e comportamental.

### Ícones

**Decisão**: iconoir-react (primário) + lucide-react (fallback para componentes shadcn/ui)
**Rationale**: O protótipo usa ambas as bibliotecas. `iconoir-react` é usada nas páginas de negócio; `lucide-react` é usada internamente por alguns componentes shadcn. Manter ambas preserva fidelidade visual.

### Temas (Claro/Escuro)

**Decisão**: next-themes com `ThemeProvider`
**Rationale**: O protótipo usa `next-themes` com `attribute="class"`, compatível com Tailwind CSS dark mode via classe. Mantido integralmente.

### Gráficos

**Decisão**: Recharts
**Rationale**: Usado no Dashboard para gráficos de área e pizza. Mantido para fidelidade visual.

### Testes

**Decisão**: Vitest + React Testing Library + jsdom
**Rationale**: Stack padrão para projetos React + Vite. Vitest é configurado nativamente com Vite sem webpack/jest extra. RTL alinha com o princípio V da constituição ("se difícil de testar com RTL, refatorar").
**Alternativas consideradas**: Jest — mais overhead de configuração sem benefício.

## Padrões Arquiteturais

### Mock Data

**Decisão**: Repositórios mock na camada `data/`, injetados via contexto React
**Rationale**: A constituição exige que `presentation` não acesse `data` diretamente. Os repositórios mock implementam as interfaces definidas no `domain`. React Context é usado para injeção de dependência. Isso permite trocar por repositórios reais (API) no futuro sem modificar `presentation`.
**Estrutura**:
```
IRepository (domain/contracts/) ← implementado por → MockRepository (data/) ← provido por → React Context ← consumido por → Custom Hook (presentation/)
```

### Validação Zod (Constituição IV)

**Decisão**: Schemas Zod definidos na camada `presentation/` por formulário
**Rationale**: Validação visual pertence à apresentação, não ao domínio. O domínio recebe dados já validados via Use Cases.

### Assets

**Decisão**: Renomear todos os assets com nomes descritivos (acordado na clarificação Q3)

| Nome original (protótipo) | Nome migrado (l1face) |
|--------------------------|----------------------|
| `fe3adea47b8c18b80f49e48f0c0534f5f9bed4f2.png` | `foto-perfil-placeholder.jpg` |
| `foto_perfil.jpg` | `foto-perfil-placeholder.jpg` |
| `black_(background_claro).svg` | `logo-licita-one-light.svg` |
| `white(background_escuro).svg` | `logo-licita-one-dark.svg` |
| `vazada_white.svg` | `logo-licita-one-outline-white.svg` |
| `licitaOneIcon.svg` | `icon-licita-one.svg` |
| `svg-*.ts` (arquivos gerados) | SVG inline ou importações descritivas por uso |

## Dependências a Instalar no l1face

```bash
# Routing
npm install react-router@^7

# Styling
npm install tailwindcss@^4 @tailwindcss/vite tw-animate-css

# Radix UI (apenas os primitivos usados)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label \
  @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-slot @radix-ui/react-switch \
  @radix-ui/react-tabs @radix-ui/react-tooltip

# Utilities
npm install class-variance-authority clsx tailwind-merge

# Forms
npm install react-hook-form zod @hookform/resolvers

# Icons
npm install iconoir-react lucide-react

# Theme
npm install next-themes

# Charts
npm install recharts

# Notifications
npm install sonner

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
