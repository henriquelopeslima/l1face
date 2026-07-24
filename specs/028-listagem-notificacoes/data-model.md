# Modelo de Dados: Tela de Todas as Notificações

Esta funcionalidade não introduz uma nova entidade de negócio — reaproveita `Notificacao` já
definida em `src/features/notificacoes/domain/entities/Notificacao.ts` (027-central-notificacoes).
As mudanças abaixo são extensões pontuais e novos tipos puramente de apresentação/paginação.

## `ListaNotificacoes` (estendida)

| Campo         | Tipo       | Status | Descrição |
|---------------|------------|--------|-----------|
| `itens`       | `Notificacao[]` | existente | Notificações da página retornada. |
| `total`       | `number`   | existente | Total de notificações do usuário no licitante ativo. |
| `paginaAtual` | `number`   | **novo** | Número da página retornada (`meta.page` da API). |
| `totalPaginas`| `number`   | **novo** | Total de páginas disponíveis (`meta.totalPages` da API) — usado para saber se "Carregar mais" deve continuar habilitado. |

## Parâmetros de listagem (`INotificacaoRepository.listar`)

| Campo   | Tipo                | Obrigatório | Descrição |
|---------|---------------------|-------------|-----------|
| `page`  | `number`             | Não (default 1) | Página a buscar. |
| `limit` | `number`             | Não (default 20) | Itens por página. |

`ListarNotificacoesUseCase.execute(params?)` repassa esses parâmetros ao repositório sem lógica
adicional (mesmo padrão de delegação já usado nos demais Use Cases da feature).

## Estado do hook `useListagemNotificacoes` (novo, presentation)

| Campo                | Tipo                                          | Descrição |
|-----------------------|-----------------------------------------------|-----------|
| `notificacoes`         | `Notificacao[]`                               | Acumulado de todas as páginas já buscadas (sem filtro aplicado). |
| `notificacoesFiltradas`| `Notificacao[]`                               | `notificacoes` após aplicar `filtroLeitura` e `filtroOrigem`. |
| `gruposPorPeriodo`     | `{ titulo: string; itens: Notificacao[] }[]`  | `notificacoesFiltradas` agrupadas via `agruparPorPeriodo` (ver research.md #5). |
| `filtroLeitura`        | `'todas' \| 'nao_lidas'`                      | Filtro ativo de status de leitura. |
| `filtroOrigem`         | `TipoOrigemNotificacao \| 'todas'`             | Filtro ativo de tipo de origem. |
| `temMaisPaginas`       | `boolean`                                      | Derivado de `paginaAtual < totalPaginas` da última resposta. |
| `isLoading`            | `boolean`                                      | Carregamento da página inicial ou de "Carregar mais". |
| `error`                | `string \| null`                              | Mensagem amigável em caso de falha de rede. |
| `carregarMais`         | `() => void`                                   | Busca a próxima página e acumula. |
| `definirFiltroLeitura` | `(f: 'todas' \| 'nao_lidas') => void`          | Atualiza o filtro de leitura. |
| `definirFiltroOrigem`  | `(f: TipoOrigemNotificacao \| 'todas') => void`| Atualiza o filtro de origem. |
| `marcarComoLida`       | `(id: string) => Promise<void>`               | Delega a `useNotificacoes().marcarComoLida` e espelha localmente (research.md #3). |
| `marcarTodasComoLidas` | `() => Promise<void>`                         | Delega a `useNotificacoes().marcarTodasComoLidas` e espelha localmente. |

## Relação com entidades já existentes

- `Notificacao`, `ConteudoNotificacao`, `NotificacaoClicavel` (todas em
  `notificacoes/domain/entities/Notificacao.ts`) são reaproveitadas sem alteração de forma.
- `NotificacaoItem` (presentation) é reaproveitado sem alteração — já aceita `NotificacaoClicavel` e
  já suporta clique independente do estado de leitura (ver 027, adendo pós-implementação).
- `useAbrirNotificacao` é reaproveitado sem alteração — a navegação ao clicar em uma notificação de
  instrumento/ata funciona da mesma forma nesta tela.
