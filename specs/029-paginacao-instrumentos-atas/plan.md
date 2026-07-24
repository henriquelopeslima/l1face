# Plano de Implementação: Paginação em Gestão de Instrumentos e Gestão de Atas

**Branch**: `029-paginacao-instrumentos-atas` | **Data**: 2026-07-24 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/029-paginacao-instrumentos-atas/spec.md`

## Resumo

`GET /api/instrumentos` e `GET /api/atas` já suportam paginação opcional (`page`/`limit`) no
backend (`l1core/docs/openapi.yaml`), sem exigir nenhuma mudança de contrato — hoje o frontend
simplesmente não usa esses parâmetros e busca a coleção inteira de uma vez. Esta funcionalidade
estende as features já existentes `instrumentos` e `atas` para carregar os registros em lotes de
20 (mesmo padrão já validado em `notificacoes`/028), com um botão "Carregar mais" que acumula
páginas no cliente. Busca por texto e filtros (tipo/status) continuam sendo aplicados no cliente,
mas agora apenas sobre os itens já carregados — a mesma limitação já aceita e documentada em 028,
reaplicada aqui após confirmação explícita do usuário (nenhuma extensão de busca/filtro no backend
está no escopo desta feature). Como `useListarAtas()` também alimenta os seletores de Ata nas telas
de "Cadastrar Contrato"/"Cadastrar Nota de Empenho" (que precisam da lista completa, não paginada),
a Feature de Atas ganha um método/hook novo e paralelo em vez de substituir o existente; já em
Instrumentos, o hook de listagem só é usado pela tela de Gestão e é substituído diretamente.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0.2, React 19.2.6
**Dependências Principais**: react-router 7.15.1 (nenhuma rota nova), componentes shadcn/ui já
usados no projeto (`Card`, `Button`, `Badge`, `Input`, `Select`); reaproveita o padrão de hook
`useListagemNotificacoes` (028) como referência de estrutura para os dois novos hooks de listagem
paginada.
**Armazenamento**: N/A — nenhuma preferência de filtro/página é persistida entre sessões; estado
100% em memória nas páginas, mesma premissa de 028.
**Testes**: Vitest, seguindo o padrão de testes unitários de Use Cases/mappers já usado no projeto
(`ListarNotificacoesUseCase.test.ts`, mappers de `notificacaoMappers.test.ts`).
**Plataforma Alvo**: SPA web responsiva, mesmas páginas já existentes (`/instrumentos/gestao`,
`/atas/gestao` ou rota equivalente).
**Tipo de Projeto**: Projeto único frontend (`l1face`), sem alteração de backend — `page`/`limit`
já existem em `GET /api/instrumentos` e `GET /api/atas`; busca/filtro por texto ou tipo/status
continuam resolvidos inteiramente no cliente, sem novos parâmetros de API.
**Restrições**: Nem `/api/instrumentos` nem `/api/atas` expõem busca ou filtro por tipo/status via
query string — apenas `X-Licitante-Id`, `page` e `limit` (ver research.md #1). `useListarAtas()`
(sem paginação, retorna `Ata[]` completo) precisa continuar existindo sem alteração de assinatura
porque é consumido por `CadastrarContrato.tsx` e `CadastrarNotaEmpenho.tsx` para popular seletores
de Ata — não pode ser convertido para a versão paginada. Estrutura de pastas e isolamento
`domain`/`data`/`presentation` continuam obrigatórios (constituição, Princípio I); esta
funcionalidade estende as features `instrumentos` e `atas` já existentes em vez de criar features
novas.
**Escala/Scope**: Duas páginas existentes modificadas (`InstrumentosGestaoPage`, `ArpGestaoPage`),
extensão pontual das camadas `domain`/`data` de ambas as features (novo método de listagem paginada
+ tipos de envelope), dois novos hooks de apresentação.

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|----------------|
| I. Arquitetura e Estrutura de Pastas | PASS | Toda mudança vive dentro de `src/features/instrumentos` e `src/features/atas` já existentes (domain/data/presentation), sem nova feature nem dependência cruzada. Nenhuma regra de isolamento é violada. |
| II. SOLID e TypeScript | PASS | Para Instrumentos, o método único `listarInstrumentos()` passa a aceitar parâmetros opcionais e retornar o envelope paginado (compatível, único consumidor). Para Atas, em vez de sobrecarregar `listarAtas()` com um retorno ambíguo (`Ata[] \| ListaAtas`), a interface ganha um método novo e segregado (`listarAtasPaginado`) — Interface Segregation (Princípio II): cada consumidor depende só do formato que usa. Sem `any`/`as unknown`. |
| III. Boas Práticas React | PASS | Toda a lógica de acumulação de páginas e reaplicação de busca/filtro fica isolada em hooks customizados novos (`useListagemInstrumentos`, `useListagemAtas`); as páginas permanecem apresentacionais. |
| IV. Segurança | PASS | Nenhum dado novo em `localStorage`/`sessionStorage`; reaproveita `apiFetch` (cookie HttpOnly já centralizado). Nenhum conteúdo renderizado via `dangerouslySetInnerHTML`. |
| V. Testes e Qualidade | PASS | Os Use Cases estendidos (`ListarInstrumentosUseCase`, novo `ListarAtasPaginadoUseCase`) e os mappers de envelope recebem testes unitários, seguindo o padrão já estabelecido em 028. |

Nenhuma violação identificada — Rastreamento de Complexidade não se aplica.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/029-paginacao-instrumentos-atas/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0
├── data-model.md         # Saída da Fase 1
├── quickstart.md         # Saída da Fase 1
├── contracts/            # Saída da Fase 1
│   ├── IInstrumentosRepository-paginacao.md
│   └── IAtasRepository-paginacao.md
└── tasks.md              # Saída da Fase 2 (/speckit-tasks — não criado por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
└── features/
    ├── instrumentos/
    │   ├── domain/
    │   │   ├── entities/instrumentoContratual.ts        # MODIFICADO: nova entidade ListaInstrumentos
    │   │   ├── contracts/IInstrumentosRepository.ts      # MODIFICADO: listarInstrumentos(params?) → ListaInstrumentos
    │   │   └── useCases/ListarInstrumentosUseCase.ts     # MODIFICADO: repassa params opcionais
    │   ├── data/
    │   │   ├── mappers/instrumentosMappers.ts             # MODIFICADO: mapeia meta.page/meta.totalPages
    │   │   └── repositories/InstrumentosRepository.ts     # MODIFICADO: listarInstrumentos(params?) monta query string
    │   └── presentation/
    │       ├── hooks/
    │       │   └── useListagemInstrumentos.ts             # RENOMEADO de useListarInstrumentos.ts: acumula páginas + filtros
    │       └── pages/
    │           └── InstrumentosGestaoPage.tsx              # MODIFICADO: usa useListagemInstrumentos + botão "Carregar mais"
    │
    └── atas/
        ├── domain/
        │   ├── entities/ata.ts                             # MODIFICADO: nova entidade ListaAtas
        │   ├── repositories/IAtasRepository.ts             # MODIFICADO: novo método listarAtasPaginado(params)
        │   └── usecases/
        │       ├── ListarAtasUseCase.ts                     # SEM ALTERAÇÃO (continua usado pelos seletores de Cadastro)
        │       └── ListarAtasPaginadoUseCase.ts              # NOVO: delega a listarAtasPaginado
        ├── data/
        │   ├── mappers/atasMappers.ts                        # MODIFICADO: mapeia envelope paginado
        │   └── repositories/AtasRepository.ts                # MODIFICADO: novo método listarAtasPaginado(params)
        └── presentation/
            ├── hooks/
            │   ├── useListarAtas.ts                          # SEM ALTERAÇÃO (usado por CadastrarContrato/CadastrarNotaEmpenho)
            │   └── useListagemAtas.ts                         # NOVO: acumula páginas + filtros, só para ArpGestaoPage
            └── pages/
                └── ArpGestaoPage.tsx                          # MODIFICADO: usa useListagemAtas + botão "Carregar mais"
```

**Decisão de Estrutura**: Projeto único (frontend `l1face`); ambas as mudanças são extensões
naturais das features `instrumentos` e `atas` já existentes (mesmo domínio de dados), em vez de
features novas — evita duplicar entidades/contratos para o mesmo conceito de instrumento/ata,
respeitando a mesma Vertical Slice (Princípio I da constituição).

## Rastreamento de Complexidade

*Sem violações a justificar — tabela omitida.*
