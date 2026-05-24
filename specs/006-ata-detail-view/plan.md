# Plano de Implementação: Visualizar Detalhes de Ata

**Branch**: `006-ata-detail-view` | **Data**: 2026-05-24 | **Spec**: [spec.md](spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/006-ata-detail-view/spec.md`

## Resumo

Integrar `ArpDetalhesPage` com a API real de detalhes de uma Ata de Registro de Preços. A página (`/atas/:id`), a rota e o botão de acesso na listagem já existem — a mudança é adicionar a cadeia de domínio completa (`AtaDetalhes`, `GetAtaUseCase`, `getAta()` no repositório, `useGetAta` hook) e substituir os dados mockados hardcoded pelo dados reais da API.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6 + React 19  
**Dependências Principais**: Vite 8, React Router 7, shadcn/ui (Radix), Tailwind CSS 4, Zod 4, Vitest 4, Playwright  
**Armazenamento**: N/A (frontend SPA)  
**Testes**: Vitest (unitários em Use Cases), Playwright (e2e)  
**Plataforma Alvo**: Navegador web moderno (SPA)  
**Tipo de Projeto**: Web application (frontend SPA)  
**Metas de Performance**: Detalhes da ata exibidos em < 3s em conexão normal  
**Restrições**: Sem `any` ou `as unknown` (TypeScript estrito); domínio não pode importar `data` ou `presentation`  
**Escala/Scope**: Feature de uma tela (página de detalhes + camadas de domínio/data)

## Verificação de Constituição

*GATE: Deve passar antes da implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture (Vertical Slices) | ✅ | `AtaDetalhes` em `domain/`, repositório em `data/`, hook em `presentation/` |
| II. SOLID + TypeScript Estrito | ✅ | Sem `any`; `GetAtaUseCase` tem responsabilidade única; `presentation` depende de abstração `IAtasRepository` |
| III. Boas Práticas React | ✅ | Lógica de fetch extraída para `useGetAta`; `ArpDetalhesPage` permanece presentacional |
| IV. Segurança | ✅ | Tokens via cookie HttpOnly (gerenciado por `apiFetch` com `credentials: 'include'`); sem `localStorage` |
| V. Testes | ✅ | `GetAtaUseCase.test.ts` com 100% de cobertura; mock do repositório via interface |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/006-ata-detail-view/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — entidades e mapeamento
├── quickstart.md        # Fase 1 — guia de início rápido
├── contracts/
│   └── get-ata.md       # Contrato da chamada à API
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 — gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/atas/
├── domain/
│   ├── entities/
│   │   ├── ata.ts                    (existente — sem alteração)
│   │   └── ataDetalhes.ts            (NOVO)
│   ├── errors/
│   │   └── ataErrors.ts              (existente — sem alteração)
│   ├── repositories/
│   │   └── IAtasRepository.ts        (ATUALIZAR — +getAta)
│   └── usecases/
│       ├── ListarAtasUseCase.ts      (existente — sem alteração)
│       ├── GetAtaUseCase.ts          (NOVO)
│       └── GetAtaUseCase.test.ts     (NOVO)
├── data/
│   ├── mappers/
│   │   ├── atasMappers.ts            (existente — sem alteração)
│   │   └── ataDetalhesMappers.ts     (NOVO)
│   └── repositories/
│       └── AtasRepository.ts         (ATUALIZAR — +getAta)
└── presentation/
    ├── hooks/
    │   ├── useListarAtas.ts          (existente — sem alteração)
    │   └── useGetAta.ts              (NOVO)
    └── pages/
        └── ArpDetalhesPage.tsx       (ATUALIZAR — substituir mock por useGetAta)
```

**Decisão de Estrutura**: Opção de aplicação web SPA. Todos os novos artefatos ficam dentro de `src/features/atas/`, seguindo o padrão Vertical Slices existente.
