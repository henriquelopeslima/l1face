# Contrato Interno: `IInstrumentosRepository.listarInstrumentos` (alterado)

Diferente de `INotificacaoRepository.listar` (028), esta mudança **não é retrocompatível** por
opção deliberada — `listarInstrumentos()` tem um único consumidor no código hoje
(`InstrumentosGestaoPage`, via `useListarInstrumentos`), então a assinatura é atualizada
diretamente em vez de manter um modo "sem parâmetros" morto. Ver research.md #1 e #4.

```typescript
// src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts
export interface ListarInstrumentosParams {
  page?: number;
  limit?: number;
}

export interface IInstrumentosRepository {
  // ANTES: listarInstrumentos(): Promise<InstrumentoListagem[]>;
  listarInstrumentos(params?: ListarInstrumentosParams): Promise<ListaInstrumentos>;
  // ...demais métodos inalterados (criarContrato, criarEmpenho, buscarInstrumento, etc.)
}
```

## Contrato externo reaproveitado (l1core)

`GET /api/instrumentos` já documenta `page`/`limit` opcionais em
`l1core/docs/openapi.yaml` (linhas ~3341-3390). Passando ambos os parâmetros, a resposta muda do
array simples para o envelope paginado:

```json
{
  "data": [ /* InstrumentoListagemResponse[] */ ],
  "meta": { "page": 1, "limit": 10, "total": 22, "totalPages": 3 }
}
```

- **Query params usados por esta feature**: `page` (incrementado a cada "Carregar mais"), `limit`
  (fixo em 10 — ver research.md #3).
- Não existe filtro por `tipo` (Contrato/Empenho), `status` ou busca textual na API — ver
  research.md #2. Esses filtros continuam resolvidos no cliente, sobre os itens já acumulados.
- Nenhum novo endpoint é necessário.

## `ListarInstrumentosUseCase` (alterado)

```typescript
export class ListarInstrumentosUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(params?: ListarInstrumentosParams): Promise<ListaInstrumentos> {
    return this.repository.listarInstrumentos(params);
  }
}
```

## Consumo pelo hook renomeado (`useListagemInstrumentos`)

O hook chama `listarInstrumentosUseCase.execute({ page, limit: 10 })`, incrementando `page` a cada
"Carregar mais", acumulando `itens` no estado local e usando `totalPaginas` para habilitar/
desabilitar o botão. `total` (do envelope) alimenta diretamente o cartão "Total na base". Os
filtros de tipo/busca continuam aplicados em memória sobre o acumulado, nunca enviados ao backend.
