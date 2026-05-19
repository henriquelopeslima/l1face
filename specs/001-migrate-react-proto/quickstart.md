# Quickstart: l1face

**Feature**: `001-migrate-react-proto`
**Branch**: `001-migrate-react-proto`

## Pré-requisitos

- Node.js ≥ 20
- npm ≥ 10 (ou pnpm ≥ 9)

## Instalação

```bash
# Na raiz do projeto l1face
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
# → http://localhost:5173
```

## Build de produção

```bash
npm run build
# Saída em dist/
```

## Lint

```bash
npm run lint
```

## Testes

```bash
# Todos os testes
npm run test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

## Fluxo da aplicação (dados mockados)

1. Acesse `http://localhost:5173` → redireciona para `/login`
2. Preencha qualquer e-mail + senha + aceite os termos → clique "Entrar"
3. Selecione um vínculo institucional → acessa o Dashboard
4. Navegue pelas seções via sidebar (desktop) ou bottom nav (mobile)

## Estrutura de pastas relevante

```
src/
├── features/        ← Vertical slices de negócio
├── shared/          ← Componentes, hooks e assets transversais
└── app/             ← Rotas, App.tsx e providers
```

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária nesta fase. Todos os dados são mockados.

## Configuração de testes (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      include: ['src/features/**/domain/useCases/**'],
      thresholds: { lines: 100, functions: 100 },
    },
  },
});
```
