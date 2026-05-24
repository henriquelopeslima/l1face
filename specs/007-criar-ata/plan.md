# Plano de Implementação: Criar Ata de Registro de Preços

**Branch**: `007-criar-ata` | **Data**: 2026-05-24 | **Spec**: [spec.md](spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/007-criar-ata/spec.md`

## Resumo

Integrar o wizard de cadastro de ARP (`CadastrarArp.tsx`) com a API real. O componente e a página já existem com UI completa (3 etapas), mas todas as chamadas são mockadas com `setTimeout`. A mudança é adicionar a cadeia de domínio completa (`CriarAtaInput`, `DadosAtaPncp`, `CriarAtaUseCase`, `ConsultarAtaPncpUseCase`, `criarAta()` e `consultarAtaPncp()` no repositório, hooks `useCriarAta` e `useConsultarAtaPncp`) e substituir os mocks pelos dados reais da API. O formulário também precisa de ajustes de state para alinhar nomes de campos com o contrato da API.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6 + React 19  
**Dependências Principais**: Vite 8, React Router 7, shadcn/ui (Radix), Tailwind CSS 4, Zod 4, Vitest 4, Playwright  
**Armazenamento**: N/A (frontend SPA)  
**Testes**: Vitest (unitários em Use Cases), Playwright (e2e — fora do escopo desta feature)  
**Plataforma Alvo**: Navegador web moderno (SPA)  
**Tipo de Projeto**: Web application (frontend SPA)  
**Metas de Performance**: Cadastro de ata concluído em < 5s em conexão normal  
**Restrições**: Sem `any` ou `as unknown` (TypeScript estrito); domínio não pode importar `data` ou `presentation`  
**Escala/Scope**: Feature multi-camada (domain + data + presentation) dentro de `src/features/atas/`

## Verificação de Constituição

*GATE: Deve passar antes da implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture (Vertical Slices) | ✅ | `CriarAtaInput`, `DadosAtaPncp` em `domain/entities/`; use cases em `domain/usecases/`; repositório em `data/`; hooks em `presentation/` |
| II. SOLID + TypeScript Estrito | ✅ | Sem `any`; `CriarAtaUseCase` e `ConsultarAtaPncpUseCase` com responsabilidade única; `presentation` depende de `IAtasRepository` (abstração) |
| III. Boas Práticas React | ✅ | Lógica de submit e busca PNCP extraídas para `useCriarAta` e `useConsultarAtaPncp`; `CadastrarArp` permanece presentacional |
| IV. Segurança | ✅ | Tokens via cookie HttpOnly (gerenciado por `apiFetch` com `credentials: 'include'`); sem `localStorage`; `X-Licitante-Id` injetado automaticamente |
| V. Testes | ✅ | `CriarAtaUseCase.test.ts` e `ConsultarAtaPncpUseCase.test.ts` com 100% de cobertura; mocks via interface `IAtasRepository` |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/007-criar-ata/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — entidades e mapeamento
├── quickstart.md        # Fase 1 — guia de início rápido
├── contracts/
│   ├── criar-ata.md     # Contrato POST /api/atas
│   └── consultar-pncp.md # Contrato GET /api/pncp/atas
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 — gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/atas/
├── domain/
│   ├── entities/
│   │   ├── ata.ts                          (existente — sem alteração)
│   │   ├── ataDetalhes.ts                  (existente — sem alteração)
│   │   └── criarAta.ts                     (NOVO — CriarAtaInput, ItemAtaInput, DadosAtaPncp)
│   ├── errors/
│   │   └── ataErrors.ts                    (existente — sem alteração)
│   ├── repositories/
│   │   └── IAtasRepository.ts              (ATUALIZAR — +criarAta, +consultarAtaPncp)
│   └── usecases/
│       ├── ListarAtasUseCase.ts            (existente — sem alteração)
│       ├── ListarAtasUseCase.test.ts       (existente — sem alteração)
│       ├── GetAtaUseCase.ts                (existente — sem alteração)
│       ├── GetAtaUseCase.test.ts           (existente — sem alteração)
│       ├── CriarAtaUseCase.ts              (NOVO)
│       ├── CriarAtaUseCase.test.ts         (NOVO)
│       ├── ConsultarAtaPncpUseCase.ts      (NOVO)
│       └── ConsultarAtaPncpUseCase.test.ts (NOVO)
├── data/
│   ├── mappers/
│   │   ├── atasMappers.ts                  (existente — sem alteração)
│   │   ├── ataDetalhesMappers.ts           (existente — sem alteração)
│   │   ├── criarAtaMappers.ts              (NOVO — input domain→API + response API→domain)
│   │   └── pncpMappers.ts                  (NOVO — API response → DadosAtaPncp)
│   └── repositories/
│       └── AtasRepository.ts               (ATUALIZAR — +criarAta, +consultarAtaPncp)
└── presentation/
    ├── hooks/
    │   ├── useListarAtas.ts                (existente — sem alteração)
    │   ├── useGetAta.ts                    (existente — sem alteração)
    │   ├── useCriarAta.ts                  (NOVO)
    │   └── useConsultarAtaPncp.ts          (NOVO)
    ├── components/
    │   └── CadastrarArp.tsx                (ATUALIZAR — substituir mocks pelos hooks reais; ajustar state)
    └── pages/
        └── ArpCadastrarPage.tsx            (existente — sem alteração)
```

**Decisão de Estrutura**: Opção de aplicação web SPA. Todos os novos artefatos ficam dentro de `src/features/atas/`, seguindo o padrão Vertical Slices existente.
