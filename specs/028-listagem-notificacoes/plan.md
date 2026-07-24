# Plano de Implementação: Tela de Todas as Notificações

**Branch**: `main` | **Data**: 2026-07-23 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/028-listagem-notificacoes/spec.md`

## Resumo

O backend já suporta paginação em `GET /api/notificacoes` (`page`/`limit`), mas não expõe filtros
por status de leitura ou por tipo de origem via query string. Esta funcionalidade adiciona uma nova
página (`/notificacoes`) dentro da feature já existente `src/features/notificacoes` (criada em
027-central-notificacoes), que acumula páginas carregadas sob demanda ("Carregar mais"), agrupa por
período (Hoje/Esta semana/Mais antigas) e filtra client-side por leitura e origem sobre o que já foi
carregado. Ações de marcar como lida/todas continuam delegadas ao `NotificacoesProvider`
compartilhado (para manter o sino e Configurações sincronizados), com espelhamento otimista no
estado local da nova página.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0.2, React 19.2.6
**Dependências Principais**: react-router 7.15.1 (nova rota `/notificacoes`), componentes shadcn/ui
já usados no projeto (`Card`, `Button`, `Badge`) e o padrão de segmented buttons já usado em
`InstrumentosGestaoPage` para os filtros; reaproveita `NotificacaoItem`, `useAbrirNotificacao` e
`NotificacoesProvider`/`useNotificacoes()` da feature `notificacoes` (027).
**Armazenamento**: N/A — nenhuma preferência de filtro é persistida entre sessões (Premissa da
spec); estado 100% em memória na página.
**Testes**: Vitest, seguindo o padrão de testes unitários de Use Cases/funções puras já usado no
projeto (`ObterDashboardUseCase.test.ts`, `ListarNotificacoesUseCase.test.ts`).
**Plataforma Alvo**: SPA web responsiva, mesma área autenticada onde `RootLayout` já é usado.
**Tipo de Projeto**: Projeto único frontend (`l1face`), sem alteração de backend — a paginação já
existe na API; filtros por leitura/origem são resolvidos inteiramente no cliente.
**Metas de Performance**: Nenhuma meta específica além de carregamento incremental por página (evita
buscar todo o histórico de uma vez).
**Restrições**: A API não expõe filtro por `lida` nem por `tipoOrigem` — os filtros desta tela
operam apenas sobre as páginas já buscadas (ver research.md #1 para a implicação de UX disso).
Estrutura de pastas e isolamento `domain`/`data`/`presentation` continuam obrigatórios (constituição,
Princípio I); esta funcionalidade estende a feature `notificacoes` já existente em vez de criar uma
nova.
**Escala/Scope**: Uma nova página + extensão pontual da camada `domain`/`data` de `notificacoes`
(parâmetro de paginação) e dois pontos de entrada (link "Ver todos" da dashboard, atalho no sino).

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|----------------|
| I. Arquitetura e Estrutura de Pastas | PASS | A nova página vive em `src/features/notificacoes/presentation/pages`, reaproveitando `domain`/`data` já existentes na mesma feature (extensão, não nova dependência cruzada). Nenhuma regra de isolamento é violada. |
| II. SOLID e TypeScript | PASS | A extensão de `INotificacaoRepository.listar()` para aceitar parâmetros de paginação é compatível (parâmetro opcional), preservando os consumidores existentes (`NotificacoesContext`) sem quebra. Sem `any`/`as unknown`. |
| III. Boas Práticas React | PASS | Toda a lógica de acumulação de páginas, agrupamento por data e filtros client-side fica isolada em um hook customizado (`useListagemNotificacoes`); a página em si permanece apresentacional, delegando estado a esse hook e ao `useNotificacoes()`/`useAbrirNotificacao()` já existentes. |
| IV. Segurança | PASS | Nenhum dado novo é persistido em `localStorage`/`sessionStorage`; reaproveita `apiFetch` (cookie HttpOnly + header de licitante já centralizados). Nenhum conteúdo de notificação é renderizado via `dangerouslySetInnerHTML`. |
| V. Testes e Qualidade | PASS | A função pura de agrupamento por período e a extensão do Use Case de listagem recebem testes unitários, seguindo o padrão já estabelecido na feature. |

Nenhuma violação identificada — Rastreamento de Complexidade não se aplica.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/028-listagem-notificacoes/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0
├── data-model.md        # Saída da Fase 1
├── quickstart.md        # Saída da Fase 1
├── contracts/           # Saída da Fase 1
│   └── INotificacaoRepository-paginacao.md
└── tasks.md             # Saída da Fase 2 (/speckit-tasks — não criado por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
├── app/routes.tsx                                   # MODIFICADO: nova rota `notificacoes`
├── shared/components/layout/
│   ├── RootLayout.tsx                                # Sem alterações (Provider já envolve a árvore)
│   └── AppHeader.tsx                                 # MODIFICADO: link "Ver todas" no dropdown do sino
│
└── features/
    ├── dashboard/presentation/pages/DashboardPage.tsx  # MODIFICADO: "Ver todos" aponta para `/notificacoes`
    └── notificacoes/                                   # Feature existente (027), estendida
        ├── domain/
        │   ├── entities/Notificacao.ts                 # MODIFICADO: ListaNotificacoes ganha `paginaAtual`/`totalPaginas`
        │   ├── contracts/INotificacaoRepository.ts     # MODIFICADO: listar(params?) aceita page/limit
        │   └── useCases/ListarNotificacoesUseCase.ts    # MODIFICADO: repassa params opcionais
        ├── data/
        │   ├── mappers/notificacaoMappers.ts            # MODIFICADO: mapeia meta.page/meta.totalPages
        │   └── repositories/NotificacaoRepository.ts    # MODIFICADO: listar(params?) monta query string
        └── presentation/
            ├── hooks/
            │   ├── useAbrirNotificacao.ts               # Sem alterações (reaproveitado)
            │   └── useListagemNotificacoes.ts            # NOVO: acumula páginas, filtros, agrupamento
            ├── utils/agruparPorPeriodo.ts                 # NOVO: função pura de agrupamento por data
            ├── components/
            │   ├── NotificacaoItem.tsx                   # Sem alterações (reaproveitado)
            │   └── FiltroNotificacoes.tsx                 # NOVO: segmented buttons (leitura + origem)
            └── pages/
                └── NotificacoesListagemPage.tsx           # NOVA: tela dedicada
```

**Decisão de Estrutura**: Projeto único (frontend `l1face`); a nova tela é tratada como uma extensão
natural da feature `notificacoes` já criada em 027-central-notificacoes (mesmo domínio de dados),
em vez de uma feature nova — evita duplicar entidades/contratos/Use Cases para o mesmo conceito de
notificação, respeitando a mesma Vertical Slice.

## Rastreamento de Complexidade

*Sem violações a justificar — tabela omitida.*
