# Contrato Interno: `IAtasRepository.listarAtasPaginado` (estendido com filtros)

`listarAtas(): Promise<Ata[]>` continua **sem alteração** (usado pelos seletores de Ata em
`CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx` — ver research.md #6). Só `ListarAtasParams` e a
implementação de `listarAtasPaginado` mudam.

```typescript
// src/features/atas/domain/repositories/IAtasRepository.ts
import type { AtaStatus } from '../entities/ata';

export interface ListarAtasParams {
  page?: number;
  limit?: number;
  geral?: string;    // NOVO — busca textual (numero, orgao_gerenciador.nome, objeto)
  status?: AtaStatus; // NOVO — um único status
}

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>; // SEM ALTERAÇÃO
  listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>; // params estendidos
  // ...demais métodos inalterados
}
```

## Contrato externo reaproveitado (l1core)

`GET /api/atas` já documenta `geral` e `status` como query params opcionais em
`l1core/docs/openapi.yaml` (linhas ~2718-2774), combináveis entre si e com `page`/`limit`:

- `geral`: busca por trecho, case-insensitive, OR entre `numero`, `orgao_gerenciador.nome` e
  `objeto`. Vazio/ausente desativa o filtro. `%`/`_` são tratados como literais pelo servidor.
- `status`: restringe a um único valor de `AtaStatus` (`ATIVA`, `PROXIMA_AO_VENCIMENTO`,
  `ENCERRADA`). Valor fora do conjunto válido retorna `422` (o frontend nunca envia um valor
  inválido, pois o `Select` já restringe as opções — ver research.md #2).
- Quando paginado (`page`/`limit` informados, sempre o caso aqui), `meta.total`/`meta.totalPages`
  já refletem a contagem **pós-filtro**.

```
GET /api/atas?page=1&limit=10&geral=material%20hospitalar&status=ATIVA
```

```json
{
  "data": [ /* AtaListagemResponse[], já filtrado */ ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

## Implementação de `AtasRepository.listarAtasPaginado`

```typescript
async listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params?.page ?? 1));
  searchParams.set('limit', String(params?.limit ?? 10));
  if (params?.geral) searchParams.set('geral', params.geral);
  if (params?.status) searchParams.set('status', params.status);

  let response: Response;
  try {
    response = await apiFetch(`/api/atas?${searchParams.toString()}`, { method: 'GET' });
  } catch {
    throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
  }

  // 401/403/400 tratados como hoje...
  if (response.status === 422) {
    throw new AtaError('Filtro de status inválido.');
  }
  if (!response.ok) {
    throw new AtaError('Erro ao carregar atas. Tente novamente.');
  }

  const data = (await response.json()) as ApiListaAtasResponse;
  return mapApiListaAtasToListaAtas(data);
}
```

`mapApiListaAtasToListaAtas`/`ApiListaAtasResponse` (mappers) permanecem sem alteração — o
envelope de resposta já é o mesmo formato usado por 029, só o conteúdo de `data`/`meta` muda
conforme os filtros aplicados.

## `ListarAtasPaginadoUseCase` — sem alteração de código

```typescript
export class ListarAtasPaginadoUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(params?: ListarAtasParams): Promise<ListaAtas> {
    return this.repository.listarAtasPaginado(params);
  }
}
```

Já aceita `params` genéricos — `geral`/`status` fluem através dele sem mudança de assinatura.

## Consumo pelo hook (`useListagemAtas`, estendido)

O hook monta `{ page, limit: 10, geral: debouncedSearchTerm || undefined, status: statusFilter === 'todas' ? undefined : statusFilter }`
a cada chamada de `carregarPagina`, e reinicia a página para 1 sempre que `debouncedSearchTerm` ou
`statusFilter` mudam (ver data-model.md e research.md #5).
