# Modelo de Dados: Paginação em Gestão de Instrumentos e Gestão de Atas

Esta funcionalidade não introduz novas entidades de negócio — reaproveita `InstrumentoListagem`
(`src/features/instrumentos/domain/entities/instrumentoContratual.ts`) e `Ata`
(`src/features/atas/domain/entities/ata.ts`) já existentes. As mudanças abaixo são extensões
pontuais e novos tipos de envelope/paginação, seguindo o mesmo formato já usado por
`ListaNotificacoes` (028).

## `ListaInstrumentos` (nova, em `instrumentos/domain/entities/instrumentoContratual.ts`)

| Campo         | Tipo                    | Descrição |
|---------------|-------------------------|-----------|
| `itens`       | `InstrumentoListagem[]` | Instrumentos da página retornada. |
| `total`       | `number`                | Total real de instrumentos do licitante (`meta.total` da API). |
| `paginaAtual` | `number`                | Número da página retornada (`meta.page`). |
| `totalPaginas`| `number`                | Total de páginas disponíveis (`meta.totalPages`) — usado para saber se "Carregar mais" continua habilitado. |

## `ListaAtas` (nova, em `atas/domain/entities/ata.ts`)

| Campo         | Tipo    | Descrição |
|---------------|---------|-----------|
| `itens`       | `Ata[]` | Atas da página retornada. |
| `total`       | `number`| Total real de atas do licitante (`meta.total` da API). |
| `paginaAtual` | `number`| Número da página retornada (`meta.page`). |
| `totalPaginas`| `number`| Total de páginas disponíveis (`meta.totalPages`). |

## Parâmetros de listagem paginada

| Campo   | Tipo     | Obrigatório | Default | Descrição |
|---------|----------|-------------|---------|-----------|
| `page`  | `number` | Não         | 1       | Página a buscar. |
| `limit` | `number` | Não         | 20      | Itens por página (ver research.md #3). |

- **Instrumentos**: `IInstrumentosRepository.listarInstrumentos(params?: ListarInstrumentosParams): Promise<ListaInstrumentos>`
  — substitui a assinatura atual (`(): Promise<InstrumentoListagem[]>`); único consumidor
  (`InstrumentosGestaoPage`, via hook) é atualizado junto.
- **Atas**: `IAtasRepository.listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>`
  — **método novo**, adicionado ao lado de `listarAtas(): Promise<Ata[]>`, que permanece **sem
  alteração** (consumido por `CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx`, que precisam da
  lista completa — ver research.md #4).

`ListarInstrumentosUseCase.execute(params?)` e `ListarAtasPaginadoUseCase.execute(params?)` apenas
repassam os parâmetros ao repositório, sem lógica adicional (mesmo padrão de delegação de
`ListarNotificacoesUseCase`).

## Estado do hook `useListagemInstrumentos` (novo/renomeado, presentation)

| Campo                  | Tipo                                   | Descrição |
|------------------------|-----------------------------------------|-----------|
| `instrumentos`          | `InstrumentoListagem[]`                | Acumulado de todos os lotes já buscados (sem filtro aplicado). |
| `instrumentosFiltrados` | `InstrumentoListagem[]`                | `instrumentos` após aplicar `segmento` (tipo) e `searchTerm`. |
| `totalNaBase`           | `number`                                | `meta.total` da última resposta — total real, sempre exato. |
| `temMaisPaginas`        | `boolean`                               | Derivado de `paginaAtual < totalPaginas` da última resposta. |
| `isLoading`             | `boolean`                               | Carregamento do primeiro lote ou de "Carregar mais". |
| `isLoadingMais`         | `boolean`                               | Especificamente durante "Carregar mais" (para desabilitar o botão sem re-exibir o estado de loading de tela cheia). |
| `error`                 | `string \| null`                       | Mensagem amigável em caso de falha de rede. |
| `carregarMais`          | `() => void`                            | Busca o próximo lote e acumula. |
| `refetch`               | `() => void`                            | Reinicia do primeiro lote (ex.: após criar um instrumento). |

`segmento` (tipo) e `searchTerm` continuam como estado local da página (`InstrumentosGestaoPage`),
como hoje — o hook expõe `instrumentos` acumulado e a página aplica os mesmos filtros client-side já
existentes (`useMemo`) sobre o array acumulado, agora reavaliado a cada novo lote carregado.

## Estado do hook `useListagemAtas` (novo, presentation)

| Campo             | Tipo             | Descrição |
|-------------------|------------------|-----------|
| `atas`             | `Ata[]`         | Acumulado de todos os lotes já buscados. |
| `temMaisPaginas`   | `boolean`        | Derivado de `paginaAtual < totalPaginas` da última resposta. |
| `isLoading`        | `boolean`        | Carregamento do primeiro lote ou de "Carregar mais". |
| `isLoadingMais`    | `boolean`        | Especificamente durante "Carregar mais". |
| `error`            | `string \| null`| Mensagem amigável em caso de falha de rede. |
| `carregarMais`     | `() => void`     | Busca o próximo lote e acumula. |
| `refetch`          | `() => void`     | Reinicia do primeiro lote (ex.: após criar uma ata). |

`searchTerm` e `statusFilter` continuam como estado local de `ArpGestaoPage`, filtrando
client-side sobre `atas` acumulado, como hoje.

## Relação com entidades já existentes

- `InstrumentoListagem` (`instrumentos/domain/entities/instrumentoContratual.ts`) e `Ata`
  (`atas/domain/entities/ata.ts`) são reaproveitadas sem alteração de forma.
- `useListarAtas()` (hook existente, lista completa) permanece intocado para
  `CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx`.
