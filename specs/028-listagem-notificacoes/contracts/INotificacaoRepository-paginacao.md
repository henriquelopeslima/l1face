# Contrato Interno: `INotificacaoRepository.listar` (estendido)

Extensão retrocompatível do contrato já documentado em
`specs/027-central-notificacoes/contracts/INotificacaoRepository.md`. Consumidores existentes
(`NotificacoesContext`) continuam chamando `listar()` sem argumentos e recebem o mesmo
comportamento de hoje (página 1, limite 20).

```typescript
// src/features/notificacoes/domain/contracts/INotificacaoRepository.ts
export interface ListarNotificacoesParams {
  page?: number;
  limit?: number;
}

export interface INotificacaoRepository {
  listar(params?: ListarNotificacoesParams): Promise<ListaNotificacoes>;
  marcarComoLida(id: string): Promise<Notificacao>;
  marcarTodasComoLidas(): Promise<{ marcadas: number }>;
}
```

## Contrato externo reaproveitado (l1core)

Mesmo endpoint já documentado em
`specs/027-central-notificacoes/contracts/api-notificacoes.md` — `GET /api/notificacoes`, agora
efetivamente usando os parâmetros `page`/`limit` (documentados na API desde 027, mas até então não
utilizados pelo frontend além do `limit` fixo).

- **Query params usados por esta feature**: `page` (agora variável, incrementado a cada "Carregar
  mais"), `limit` (mantém 20, mesmo valor da tela do sino/Configurações).
- **Campos de `meta` agora consumidos**: `meta.page` → `paginaAtual`; `meta.totalPages` →
  `totalPaginas` (antes ignorados pelo mapper, que só lia `meta.total`).
- Nenhum novo endpoint é necessário. Filtros por `lida`/`tipoOrigem` **não** existem na API — ver
  research.md #1 para a decisão de implementá-los inteiramente no cliente.

## `ListarNotificacoesUseCase` (estendido)

```typescript
export class ListarNotificacoesUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}

  async execute(params?: ListarNotificacoesParams): Promise<ListaNotificacoes> {
    return this.repository.listar(params);
  }
}
```

## Consumo pela nova página (`useListagemNotificacoes`)

O hook chama `listarNotificacoesUseCase.execute({ page, limit: 20 })` incrementando `page` a cada
"Carregar mais", acumulando `itens` no estado local e usando `totalPaginas` para habilitar/desabilitar
o botão. Os filtros de leitura/origem são aplicados em memória sobre o acumulado, nunca enviados ao
backend.
