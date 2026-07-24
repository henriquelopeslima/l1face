# Contrato Interno: `IAtasRepository.listarAtasPaginado` (novo, paralelo a `listarAtas`)

Ao contrário de Instrumentos, `listarAtas(): Promise<Ata[]>` **não** é alterado — permanece
exatamente como está hoje, porque `useListarAtas()` também é consumido por
`CadastrarContrato.tsx` e `CadastrarNotaEmpenho.tsx` para popular seletores de Ata, que precisam da
lista completa. Um método novo e segregado é adicionado só para a listagem paginada da tela de
Gestão. Ver research.md #4.

```typescript
// src/features/atas/domain/repositories/IAtasRepository.ts
export interface ListarAtasParams {
  page?: number;
  limit?: number;
}

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>; // SEM ALTERAÇÃO — usado pelos seletores de Cadastro
  listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>; // NOVO
  // ...demais métodos inalterados
}
```

## Contrato externo reaproveitado (l1core)

`GET /api/atas` já documenta `page`/`limit` opcionais em `l1core/docs/openapi.yaml`
(linhas ~2701-2748). Passando ambos os parâmetros, a resposta muda do array simples para o
envelope paginado:

```json
{
  "data": [ /* AtaListagemResponse[] */ ],
  "meta": { "page": 1, "limit": 20, "total": 37, "totalPages": 2 }
}
```

- **Query params usados por esta feature**: `page` (incrementado a cada "Carregar mais"), `limit`
  (fixo em 20 — ver research.md #3).
- `listarAtas()` continua chamando `GET /api/atas` **sem** `page`/`limit`, recebendo o array
  simples de sempre (comportamento inalterado para os seletores de Cadastro).
- Não existe filtro por `status` ou busca textual na API — ver research.md #2. Esses filtros
  continuam resolvidos no cliente, sobre os itens já acumulados pela tela de Gestão.

## `ListarAtasPaginadoUseCase` (novo)

```typescript
export class ListarAtasPaginadoUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(params?: ListarAtasParams): Promise<ListaAtas> {
    return this.repository.listarAtasPaginado(params);
  }
}
```

`ListarAtasUseCase` (existente, usado pelos seletores de Cadastro) permanece sem alteração.

## Consumo pelo novo hook (`useListagemAtas`)

O hook chama `listarAtasPaginadoUseCase.execute({ page, limit: 20 })`, incrementando `page` a cada
"Carregar mais", acumulando `itens` no estado local e usando `totalPaginas` para habilitar/
desabilitar o botão. Busca e filtro de status continuam aplicados em memória sobre o acumulado,
nunca enviados ao backend.
