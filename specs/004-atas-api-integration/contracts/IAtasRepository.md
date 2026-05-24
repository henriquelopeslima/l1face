# Contrato: IAtasRepository

**Arquivo**: `src/features/atas/domain/repositories/IAtasRepository.ts`

Interface que a camada de domínio usa para buscar atas. A implementação concreta reside em `data/repositories/AtasRepository.ts`.

## Interface

```typescript
export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;
}
```

## Contrato por método

### `listarAtas(): Promise<Ata[]>`

**Pré-condição**: Há um licitante ativo na sessão (o `apiClient` injeta o header `X-Licitante-Id` automaticamente).

**Pós-condição (sucesso)**: Retorna array de `Ata[]` — pode ser vazio se o licitante não tiver atas cadastradas.

**Exceções lançadas**:

| Situação                              | Erro lançado          | Mensagem sugerida                                                     |
|---------------------------------------|-----------------------|-----------------------------------------------------------------------|
| Falha de rede / timeout               | `AtaError`            | "Serviço indisponível. Verifique sua conexão e tente novamente."      |
| API retorna 401 (não autenticado)     | `AtaError`            | "Sessão expirada. Faça login novamente."                              |
| API retorna 403 (sem vínculo)         | `AtaError`            | "Acesso negado. Você não tem permissão para visualizar estas atas."   |
| API retorna 400 (header ausente)      | `AtaError`            | "Nenhum licitante ativo selecionado."                                 |
| API retorna outro erro (5xx, etc.)    | `AtaError`            | "Erro ao carregar atas. Tente novamente."                             |

**Implementação** (`AtasRepository`):

- Chama `GET /api/atas` via `apiFetch` (header `X-Licitante-Id` injetado automaticamente pelo `apiClient`)
- Converte cada item do array de resposta via `mapApiAtaToAta`
- Não pagina — retorna todos os registros da resposta
