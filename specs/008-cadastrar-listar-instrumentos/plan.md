# Plano de Implementação: Cadastrar e Listar Instrumentos

**Branch**: `008-cadastrar-listar-instrumentos` | **Data**: 2026-05-31 | **Spec**: [spec.md](spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/008-cadastrar-listar-instrumentos/spec.md`

## Resumo

Integrar a feature `instrumentos` com a API real. A UI já existe completa (listagem, wizard de
cadastro de contrato, formulário de empenho), mas toda a persistência e listagem são mockadas.
A mudança é adicionar a cadeia de domínio completa (`ListarInstrumentosUseCase`,
`CriarContratoUseCase`, `CriarEmpenhoUseCase`, entidades de input, mappers e hooks) e
substituir os mocks pelos dados reais. Inclui atualização do tipo `InstrumentoListagem` para
alinhar com o contrato da API e relaxamento de validações de formulário que estavam mais
restritivas que a API.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6 + React 19  
**Dependências Principais**: Vite 8, React Router 7, shadcn/ui (Radix), Tailwind CSS 4, Zod 4, Vitest 4  
**Armazenamento**: N/A (frontend SPA)  
**Testes**: Vitest (unitários em Use Cases); Playwright (e2e — fora do escopo desta feature)  
**Plataforma Alvo**: Navegador web moderno (SPA)  
**Tipo de Projeto**: Web application (frontend SPA)  
**Metas de Performance**: Listagem carregada em < 2s; cadastro concluído em < 5s  
**Restrições**: Sem `any` ou `as unknown`; domínio não importa de `data` ou `presentation`  
**Escala/Scope**: Feature multi-camada dentro de `src/features/instrumentos/`

## Verificação de Constituição

*GATE: Deve passar antes da implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture (Vertical Slices) | ✅ | Entidades e use cases em `domain/`; mappers e repositório em `data/`; hooks e pages em `presentation/` |
| II. SOLID + TypeScript Estrito | ✅ | Sem `any`; use cases com responsabilidade única; `presentation` depende de `IInstrumentosRepository` (abstração) |
| III. Boas Práticas React | ✅ | Lógica de listagem e cadastro extraída para `useListarInstrumentos`, `useCriarContrato`, `useCriarEmpenho`; pages permanecem apresentacionais |
| IV. Segurança | ✅ | Tokens via cookie HttpOnly; `X-Licitante-Id` injetado por `apiFetch`; sem localStorage |
| V. Testes | ✅ | `ListarInstrumentosUseCase`, `CriarContratoUseCase` e `CriarEmpenhoUseCase` com 100% de cobertura unitária |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/008-cadastrar-listar-instrumentos/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — entidades e mapeamento
├── contracts/
│   ├── listar-instrumentos.md   # GET /api/instrumentos
│   ├── criar-contrato.md        # POST /api/instrumentos/contratos
│   └── criar-empenho.md         # POST /api/instrumentos/empenhos
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 — gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   ├── instrumentoContratual.ts   (ATUALIZAR — novos tipos TipoInstrumento, StatusInstrumento, InstrumentoListagem alinhados à API)
│   │   └── criarContrato.ts           (ATUALIZAR — + ItemInstrumentoInput, CriarContratoInput, CriarEmpenhoInput)
│   ├── contracts/
│   │   └── IInstrumentosRepository.ts (ATUALIZAR — + listarInstrumentos, criarContrato, criarEmpenho)
│   └── useCases/
│       ├── ConsultarContratoPncpUseCase.ts      (existente — sem alteração)
│       ├── ListarInstrumentosUseCase.ts          (NOVO)
│       ├── ListarInstrumentosUseCase.test.ts     (NOVO)
│       ├── CriarContratoUseCase.ts               (NOVO)
│       ├── CriarContratoUseCase.test.ts          (NOVO)
│       ├── CriarEmpenhoUseCase.ts                (NOVO)
│       └── CriarEmpenhoUseCase.test.ts           (NOVO)
├── data/
│   ├── mappers/
│   │   ├── pncpContratosMappers.ts              (existente — sem alteração)
│   │   ├── instrumentosMappers.ts               (NOVO — API response → InstrumentoListagem)
│   │   ├── criarContratoMappers.ts              (NOVO — CriarContratoInput → API body)
│   │   └── criarEmpenhoMappers.ts               (NOVO — CriarEmpenhoInput → API body)
│   └── repositories/
│       └── InstrumentosRepository.ts            (ATUALIZAR — + listarInstrumentos, criarContrato, criarEmpenho)
└── presentation/
    ├── hooks/
    │   ├── useConsultarContratoPncp.ts          (existente — sem alteração)
    │   ├── useListarInstrumentos.ts              (NOVO)
    │   ├── useCriarContrato.ts                   (NOVO)
    │   └── useCriarEmpenho.ts                    (NOVO)
    ├── components/
    │   ├── CadastrarContrato.tsx                 (ATUALIZAR — substituir mock save por useCriarContrato; substituir mock ARPs por useListarAtas; relaxar validações)
    │   └── CadastrarNotaEmpenho.tsx              (ATUALIZAR — substituir mock save por useCriarEmpenho; adicionar seletor de ARP via useListarAtas)
    └── pages/
        └── InstrumentosGestaoPage.tsx            (ATUALIZAR — substituir INSTRUMENTOS_MOCK por useListarInstrumentos; ajustar tipos)
```

**Decisão de Estrutura**: Opção de aplicação web SPA. Todos os novos artefatos ficam dentro de `src/features/instrumentos/`, seguindo o padrão Vertical Slices existente.
