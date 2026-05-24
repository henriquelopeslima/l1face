# Plano de Implementação: Listagem de Atas com API Real

**Branch**: `004-atas-api-integration` | **Data**: 2026-05-23 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/004-atas-api-integration/spec.md`

## Resumo

Integrar a página de gestão de atas (`ArpGestaoPage`) com o endpoint real `GET /api/atas`, substituindo os dados estáticos (`ARPS`) por dados dinâmicos do servidor. O header `X-Licitante-Id` já é injetado automaticamente pelo `apiClient` existente. A implementação completa a vertical slice da feature `atas` com as camadas `domain/` e `data/` ausentes, seguindo o padrão Clean Architecture já estabelecido pela feature `auth`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0 / React ^19  
**Dependências Principais**: React Router DOM, Vitest ^4, Tailwind CSS / shadcn-ui  
**Armazenamento**: N/A (sem persistência no frontend; dados vindos da API via `apiFetch`)  
**Testes**: Vitest (unitários puros para Use Cases, sem DOM)  
**Plataforma Alvo**: SPA web (desktop + mobile responsivo)  
**Tipo de Projeto**: web-app (frontend SPA)  
**Metas de Performance**: Dados visíveis em < 3s em conexões normais; indicador de carregamento durante a busca  
**Restrições**: Nenhum token salvo em localStorage/sessionStorage; o `X-Licitante-Id` é enviado via header HTTP pelo `apiClient`, não via path ou query string  
**Escala/Scope**: Feature auto-contida dentro de `src/features/atas/`; sem impacto em outras features

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture / Vertical Slices | ✅ PASS | Camadas `domain/` e `data/` são criadas dentro de `src/features/atas/`; nenhum impacto externo |
| I. Isolamento domain → data/presentation | ✅ PASS | `ListarAtasUseCase` depende apenas de `IAtasRepository` (interface); `AtasRepository` (data) implementa a interface |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Todos os tipos explícitos; mapper tipado com interface privada para resposta da API |
| III. Hooks customizados para lógica de estado | ✅ PASS | `useListarAtas` encapsula `useEffect`, estado de carregamento, erro e dados |
| IV. Tokens não em localStorage/sessionStorage | ✅ PASS | N/A — sem mudanças de autenticação; cookie HttpOnly gerido pelo servidor |
| IV. Mascaramento de erros de infraestrutura | ✅ PASS | `AtasRepository` lança `AtaError` com mensagens em português; stack traces não chegam à UI |
| V. 100% cobertura de Use Cases | ✅ PASS | `ListarAtasUseCase.test.ts` obrigatório |

**Resultado**: Nenhuma violação. Sem necessidade de Rastreamento de Complexidade.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/004-atas-api-integration/
├── plan.md              ← este arquivo
├── research.md          ← Fase 0
├── data-model.md        ← Fase 1
├── contracts/
│   └── IAtasRepository.md  ← Fase 1
└── tasks.md             ← gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/atas/
├── domain/                                    [NOVA CAMADA]
│   ├── entities/
│   │   └── ata.ts                             [NOVO] — entidade Ata com campos camelCase
│   ├── errors/
│   │   └── ataErrors.ts                       [NOVO] — AtaError
│   ├── repositories/
│   │   └── IAtasRepository.ts                 [NOVO] — interface IAtasRepository
│   └── usecases/
│       ├── ListarAtasUseCase.ts               [NOVO]
│       └── ListarAtasUseCase.test.ts          [NOVO — 100% cobertura obrigatória]
├── data/                                      [NOVA CAMADA]
│   ├── mappers/
│   │   └── atasMappers.ts                     [NOVO] — mapApiAtaToAta
│   └── repositories/
│       └── AtasRepository.ts                  [NOVO] — chama GET /api/atas
└── presentation/
    ├── hooks/
    │   └── useListarAtas.ts                   [NOVO] — { atas, isLoading, error, refetch }
    └── pages/
        └── ArpGestaoPage.tsx                  [ATUALIZADO] — substitui ARPS por useListarAtas()
```

**Decisão de Estrutura**: Extensão da feature `atas` existente, completando as camadas domain e data ausentes. A apresentação permanece na mesma estrutura — apenas a fonte de dados muda.

---

## Fase 0: Pesquisa

*Ver [research.md](./research.md) para detalhes completos.*

### Decisões-chave

**D-01: Criar camadas domain/ e data/ na feature atas**
- **Decisão**: Completar a vertical slice com domain/entities, domain/errors, domain/repositories, domain/usecases, data/mappers e data/repositories.
- **Rationale**: Exigência constitucional. A feature não pode chamar a API diretamente da apresentação.
- **Alternativa rejeitada**: `apiFetch` direto em hook ou página — viola Princípios I e D.

**D-02: Entidade Ata com campos camelCase + mapper**
- **Decisão**: `Ata` em camelCase no domínio; `mapApiAtaToAta` converte do snake_case da API.
- **Rationale**: Agnóstico de infraestrutura; mudança de contrato da API afeta apenas o mapper.
- **Alternativa rejeitada**: Usar tipos da API diretamente no domínio.

**D-03: Status como union type no domínio**
- **Decisão**: `'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'` no domínio; rótulos em português na apresentação.
- **Rationale**: Filtragens programáticas são mais seguras com o valor canônico da API.
- **Alternativa rejeitada**: Rótulos em português diretamente na entidade.

**D-04: Hook useListarAtas com { atas, isLoading, error, refetch }**
- **Decisão**: Hook customizado obrigatório (constituição Princípio III). Instancia repositório e use case internamente.
- **Rationale**: `ArpGestaoPage` deve ser puramente apresentacional.
- **Alternativa rejeitada**: Lógica inline na página.

**D-05: AtaError para falhas de infraestrutura**
- **Decisão**: Repositório lança `AtaError` com mensagem em português; hook expõe `error: string | null`.
- **Rationale**: Isola erros de infraestrutura; segue padrão de `AuthError`.
- **Alternativa rejeitada**: Expor `Error` bruto na UI.

---

## Fase 1: Design e Contratos

*Ver [data-model.md](./data-model.md) e [contracts/IAtasRepository.md](./contracts/IAtasRepository.md) para detalhes completos.*

### Sumário de Artefatos

- **Entidade nova**: `Ata` — representa uma ata de registro de preços com campos em camelCase
- **Erro de domínio novo**: `AtaError` — encapsula falhas de comunicação com a API
- **Interface nova**: `IAtasRepository` com método `listarAtas(): Promise<Ata[]>`
- **Implementação nova**: `AtasRepository` — chama `GET /api/atas` via `apiFetch`, mapeia resposta
- **Mapper novo**: `mapApiAtaToAta` — converte snake_case da API para entidade de domínio
- **Use Case novo**: `ListarAtasUseCase` — orquestra a busca via repositório
- **Hook novo**: `useListarAtas` — expõe `{ atas, isLoading, error, refetch }` para a página
- **Página atualizada**: `ArpGestaoPage` — consome `useListarAtas`, exibe estados de carregamento/erro/vazio, mapeia status para rótulos de exibição, mantém filtros existentes
