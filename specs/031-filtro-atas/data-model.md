# Modelo de Dados: Filtros na Gestão de Atas

Esta funcionalidade não introduz novas entidades de negócio — reaproveita `Ata`/`ListaAtas`
(`src/features/atas/domain/entities/ata.ts`, já existentes desde 029-paginacao-instrumentos-atas).
As mudanças abaixo estendem parâmetros e o estado do hook de listagem.

## `ListarAtasParams` (estendido, em `atas/domain/repositories/IAtasRepository.ts`)

| Campo    | Tipo         | Obrigatório | Descrição |
|----------|--------------|-------------|-----------|
| `page`   | `number`     | Não         | Página a buscar (sem alteração, já existia). |
| `limit`  | `number`     | Não         | Itens por página, fixo em 10 (sem alteração, já existia). |
| `geral`  | `string`     | Não         | **Novo.** Termo de busca livre — repassado como está para `GET /api/atas?geral=...`. String vazia/ausente é tratada como "sem filtro" (não enviada). |
| `status` | `AtaStatus`  | Não         | **Novo.** Um dos três valores de `AtaStatus` (`ATIVA`, `PROXIMA_AO_VENCIMENTO`, `ENCERRADA`). O sentinel de UI `'todas'` nunca chega até aqui — é resolvido para `undefined` antes de montar os parâmetros (ver `AtaStatusFilter` abaixo). |

`ListarAtasPaginadoUseCase.execute(params?)` continua apenas repassando os parâmetros ao
repositório, sem lógica adicional (sem alteração de código, já suporta `params` genéricos).

## `AtaStatusFilter` (novo tipo, em `atas/presentation/hooks/useListagemAtas.ts`)

```typescript
export type AtaStatusFilter = 'todas' | AtaStatus;
```

Tipo de apresentação (não de domínio) — `'todas'` é um sentinel de UI para "sem filtro de status",
nunca enviado à API. Movido de `ArpGestaoPage.tsx` (onde vivia como `type StatusFilter` local) para
o hook, já que o hook passa a possuir o estado do filtro.

## Estado do hook `useListagemAtas` (modificado, presentation)

| Campo             | Tipo                                    | Descrição |
|-------------------|------------------------------------------|-----------|
| `atas`             | `Ata[]`                                 | Acumulado de todos os lotes já buscados **para o filtro atual**. Reiniciado sempre que `searchTerm` (após debounce) ou `statusFilter` mudam. |
| `searchTerm`       | `string`                                | **Novo.** Valor bruto digitado pelo usuário (sem debounce) — controla o `Input` imediatamente, para não travar a digitação. |
| `setSearchTerm`    | `(value: string) => void`               | **Novo.** Atualiza `searchTerm`; o efeito de busca só dispara após o debounce interno. |
| `statusFilter`     | `AtaStatusFilter`                       | **Novo.** Status selecionado (`'todas'` por padrão). |
| `setStatusFilter`  | `(value: AtaStatusFilter) => void`      | **Novo.** Atualiza `statusFilter` e dispara nova busca imediatamente (sem debounce — seleção discreta, não digitação). |
| `limparFiltros`    | `() => void`                            | **Novo.** Atalho equivalente a `setSearchTerm('') + setStatusFilter('todas')`, usado pelo estado vazio ("nenhum resultado encontrado"). |
| `temMaisPaginas`   | `boolean`                               | Derivado de `paginaAtual < totalPaginas` da última resposta **filtrada** (sem alteração de forma). |
| `isLoading`        | `boolean`                               | **Comportamento restrito**: só `true` durante o carregamento inicial (primeiro lote, ao montar a tela) — mostra o `LoadingLogo` de tela cheia, como hoje. |
| `isFiltering`      | `boolean`                               | **Novo.** `true` enquanto uma busca disparada por mudança de `searchTerm`/`statusFilter` está em andamento (após o debounce). A tabela permanece visível com os dados antigos; a UI usa este campo para um indicador leve (não a tela cheia de `isLoading`). |
| `isLoadingMais`    | `boolean`                               | Especificamente durante "Carregar mais" (sem alteração). |
| `error`            | `string \| null`                        | Mensagem amigável em caso de falha de rede (sem alteração de forma). |
| `carregarMais`     | `() => void`                             | Busca o próximo lote **dentro do filtro atual** e acumula (sem alteração de assinatura). |
| `refetch`          | `() => void`                             | Reinicia do primeiro lote, mantendo o filtro atual (ex.: após criar uma ata) (sem alteração de assinatura). |

Internamente, o hook usa um `requestIdRef` (contador monotônico, não exposto) para descartar
respostas desatualizadas quando uma nova busca é disparada antes da anterior responder (ver
research.md #4).

## Relação com entidades já existentes

- `Ata`/`ListaAtas` (`atas/domain/entities/ata.ts`) são reaproveitadas sem alteração de forma.
- `AtaStatus` (mesmo arquivo) é reaproveitado sem alteração — `AtaStatusFilter` é um tipo novo e
  estritamente maior (`'todas' | AtaStatus`), não uma modificação do enum existente.
- `useListarAtas()` (lista completa, sem paginação/filtro, usada por `CadastrarContrato.tsx`/
  `CadastrarNotaEmpenho.tsx`) permanece intocado — ver research.md #6.
