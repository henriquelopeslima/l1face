# Plano de Implementação: Filtros na Gestão de Atas

**Branch**: `031-filtro-atas` | **Data**: 2026-07-24 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/031-filtro-atas/spec.md`

## Resumo

A tela de Gestão de Atas (`ArpGestaoPage`) já tem campos de busca textual e de filtro de status,
introduzidos junto com a paginação em lotes (029-paginacao-instrumentos-atas) — mas hoje eles só
filtram os itens já carregados no cliente, dando resultados incompletos quando existem mais atas
do que um lote. Desde então, `GET /api/atas` passou a documentar os parâmetros opcionais `geral`
(busca textual) e `status`, combináveis entre si e com `page`/`limit`, com `meta.total`/
`meta.totalPages` já refletindo a contagem pós-filtro. Esta funcionalidade estende
`listarAtasPaginado`/`useListagemAtas` para enviar esses filtros ao backend em vez de aplicá-los
em memória, movendo o estado de `searchTerm`/`statusFilter` (e um novo debounce da busca) para
dentro do hook, e ajusta `ArpGestaoPage` para consumir esse estado em vez de mantê-lo localmente.
`useListarAtas()` (lista completa, usada pelos seletores de Ata em `CadastrarContrato.tsx`/
`CadastrarNotaEmpenho.tsx`) e a tela de Gestão de Instrumentos não são afetados — fora do escopo.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0.2, React 19.2.6
**Dependências Principais**: Nenhuma dependência nova — reaproveita componentes shadcn/ui já
usados na tela (`Input`, `Select`, `Button`); um hook genérico novo (`useDebouncedValue`) é escrito
localmente em vez de adicionar uma lib de debounce (ver research.md #3).
**Armazenamento**: N/A — filtros vivem 100% em memória no hook durante a sessão de navegação
(sem persistência em URL/localStorage, conforme premissa da spec).
**Testes**: Vitest, seguindo o padrão já usado para `AtasRepository`/mappers/Use Cases da feature
`atas` (novos testes para a query string com filtros, `useDebouncedValue` e o comportamento de
reset/descarte de resposta desatualizada de `useListagemAtas`).
**Plataforma Alvo**: SPA web responsiva, mesma página já existente (`/atas/gestao`).
**Tipo de Projeto**: Projeto único frontend (`l1face`), sem alteração de backend — `geral`/`status`
já existem em `GET /api/atas` (ver research.md #1).
**Restrições**: `useListarAtas()` (sem paginação/filtro, retorna `Ata[]` completo) precisa
continuar existindo sem alteração de assinatura porque é consumido por `CadastrarContrato.tsx` e
`CadastrarNotaEmpenho.tsx` para popular seletores de Ata — os filtros desta feature só afetam
`listarAtasPaginado`/`useListagemAtas`. Estrutura de pastas e isolamento `domain`/`data`/
`presentation` continuam obrigatórios (constituição, Princípio I); esta funcionalidade estende a
feature `atas` já existente, sem criar feature nova. `apiFetch` não suporta `AbortSignal` hoje —
a proteção contra respostas desatualizadas usa um contador de requisição em vez de cancelamento
real (ver research.md #4).
**Escala/Scope**: Uma página existente modificada (`ArpGestaoPage`), extensão pontual das camadas
`domain`/`data` da feature `atas` (parâmetros de filtro + query string), um hook de apresentação
estendido (`useListagemAtas`) e um hook novo compartilhado (`useDebouncedValue`).

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|----------------|
| I. Arquitetura e Estrutura de Pastas | PASS | Toda mudança vive dentro de `src/features/atas` já existente (domain/data/presentation) mais um hook genérico em `src/shared/hooks/` (infraestrutura de UI reaproveitável, não uma feature de negócio). Nenhuma regra de isolamento é violada — `domain` continua sem importar de `data`/`presentation`. |
| II. SOLID e TypeScript | PASS | `ListarAtasParams` ganha campos opcionais (`geral`, `status`) sem quebrar consumidores existentes (Open/Closed — extensão aditiva). `listarAtas()` permanece intocado para os seletores de Cadastro (Interface Segregation, mesma decisão de 029). Sem `any`/`as unknown`; `AtaStatusFilter` é um tipo próprio e explícito para o sentinel `'todas'`. |
| III. Boas Práticas React | PASS | Todo o estado de filtro (searchTerm/statusFilter), debounce e a lógica de descarte de resposta desatualizada ficam isolados em `useListagemAtas` (hook customizado); `ArpGestaoPage` só consome o resultado do hook e permanece apresentacional. `useDebouncedValue` é puro e reaproveitável. |
| IV. Segurança | PASS | Nenhum dado novo em `localStorage`/`sessionStorage`; reaproveita `apiFetch` (cookie HttpOnly já centralizado). Termo de busca é enviado como query param comum (sem `dangerouslySetInnerHTML` em nenhum ponto do fluxo). |
| V. Testes e Qualidade | PASS | `AtasRepository.listarAtasPaginado` (nova lógica de query string), `useDebouncedValue` e o comportamento de reset/descarte de `useListagemAtas` recebem testes unitários, seguindo o padrão já estabelecido em 029. |

Nenhuma violação identificada — Rastreamento de Complexidade não se aplica.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/031-filtro-atas/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0
├── data-model.md         # Saída da Fase 1
├── quickstart.md         # Saída da Fase 1
├── contracts/            # Saída da Fase 1
│   ├── IAtasRepository-filtro.md
│   └── useDebouncedValue.md
└── tasks.md              # Saída da Fase 2 (/speckit-tasks — não criado por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
├── shared/
│   └── hooks/
│       └── useDebouncedValue.ts                    # NOVO: debounce genérico reaproveitável
│
└── features/
    └── atas/
        ├── domain/
        │   ├── entities/ata.ts                      # SEM ALTERAÇÃO (AtaStatus já existe)
        │   ├── repositories/IAtasRepository.ts       # MODIFICADO: ListarAtasParams ganha geral/status
        │   └── usecases/
        │       ├── ListarAtasUseCase.ts               # SEM ALTERAÇÃO (seletores de Cadastro)
        │       └── ListarAtasPaginadoUseCase.ts        # SEM ALTERAÇÃO (já repassa params genéricos)
        ├── data/
        │   ├── mappers/atasMappers.ts                  # SEM ALTERAÇÃO (mesmo envelope de 029)
        │   └── repositories/AtasRepository.ts          # MODIFICADO: listarAtasPaginado monta geral/status na query
        └── presentation/
            ├── hooks/
            │   ├── useListarAtas.ts                    # SEM ALTERAÇÃO (seletores de Cadastro)
            │   └── useListagemAtas.ts                   # MODIFICADO: estado de filtro + debounce + reset de página
            └── pages/
                └── ArpGestaoPage.tsx                    # MODIFICADO: consome searchTerm/statusFilter do hook
```

**Decisão de Estrutura**: Projeto único (frontend `l1face`); toda a mudança é uma extensão
pontual da feature `atas` já existente (mesma Vertical Slice, Princípio I) mais um hook genérico
em `shared/hooks/` — não introduz nenhuma feature nova nem toca em `instrumentos`.

## Rastreamento de Complexidade

*Sem violações a justificar — tabela omitida.*
