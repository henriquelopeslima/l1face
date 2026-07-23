# Contrato Interno: `INotificacaoRepository`

Interface que a camada `domain` define e a camada `data` implementa (Princípio II — Inversão de
Dependência). Os Use Cases dependem apenas desta interface, nunca da implementação HTTP concreta.

```typescript
// src/features/notificacoes/domain/contracts/INotificacaoRepository.ts
import type { ListaNotificacoes, Notificacao } from '../entities/Notificacao';

export interface INotificacaoRepository {
  listar(): Promise<ListaNotificacoes>;
  marcarComoLida(id: string): Promise<Notificacao>;
  marcarTodasComoLidas(): Promise<{ marcadas: number }>;
}
```

## Use Cases consumidores

```typescript
// domain/useCases/ListarNotificacoesUseCase.ts
export class ListarNotificacoesUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}
  execute(): Promise<ListaNotificacoes> {
    return this.repository.listar();
  }
}

// domain/useCases/MarcarNotificacaoLidaUseCase.ts
export class MarcarNotificacaoLidaUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}
  execute(id: string): Promise<Notificacao> {
    return this.repository.marcarComoLida(id);
  }
}

// domain/useCases/MarcarTodasNotificacoesLidasUseCase.ts
export class MarcarTodasNotificacoesLidasUseCase {
  constructor(private readonly repository: INotificacaoRepository) {}
  execute(): Promise<{ marcadas: number }> {
    return this.repository.marcarTodasComoLidas();
  }
}
```

## Implementação (`data/repositories/NotificacaoRepository.ts`)

Segue exatamente o padrão de erro de `DashboardRepository` (classe de erro própria, mensagens
amigáveis por status HTTP, usando `apiFetch`):

- `listar()` → `apiFetch('/api/notificacoes?limit=20')`, mapeia `ListaNotificacoesResponse` via
  `notificacaoMappers.ts` (análogo a `dashboardMappers.ts`).
- `marcarComoLida(id)` → `apiFetch('/api/notificacoes/' + id + '/lida', { method: 'PATCH' })`.
  - 404 deve virar uma `NotificacaoError` genérica ("Notificação não encontrada"), sem diferenciar os
    três casos que o backend colapsa propositalmente (não revelar existência de notificação de
    terceiros).
- `marcarTodasComoLidas()` → `apiFetch('/api/notificacoes/lidas', { method: 'PATCH' })`.

## Consumo pela `presentation` (hook público)

```typescript
// presentation/context/NotificacoesContext.tsx
export function useNotificacoes(): {
  notificacoes: Notificacao[];
  quantidadeNaoLidas: number;
  isLoading: boolean;
  error: string | null;
  marcarComoLida: (id: string) => Promise<void>;
  marcarTodasComoLidas: () => Promise<void>;
  refetch: () => void;
};
```

`AppHeader` e `NotificacoesSection` (Configurações) só podem depender desta assinatura — nunca de
`NotificacaoRepository` ou de `apiFetch` diretamente (Princípio I/II da constituição).
