# Contrato Externo: API de Notificações (l1core)

Extraído de `l1core/docs/openapi.yaml` (fonte da verdade — consultar o arquivo original em caso de
dúvida). Documentado aqui apenas para referência rápida durante a implementação desta feature; nenhum
destes endpoints é criado ou alterado por esta funcionalidade.

Todos os endpoints exigem autenticação (cookie `BEARER` ou `Authorization: Bearer`, já tratado pelo
`apiClient` existente) e o header `X-Licitante-Id` (já injetado automaticamente pelo `apiFetch` a partir
de `setActiveLicitanteId`).

## `GET /api/notificacoes`

Lista as notificações do usuário autenticado no licitante ativo, paginado, mais recente primeiro.

- **Query params**: `page` (default 1), `limit` (default 20).
- **200**: `ListaNotificacoesResponse`:
  ```jsonc
  {
    "data": [
      {
        "id": "uuid",
        "tipoOrigem": "instrumento" | "ata" | "of",
        "entidadeId": "uuid",
        "conteudo": { "titulo": "string", "descricao": "string", "cor": "#F59E0B" },
        "lida": false,
        "lidaEm": null, // ou ISO 8601 se lida
        "criadaEm": "2026-07-20T10:00:00+00:00"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 2, "totalPages": 1 }
  }
  ```
- **400**: header `X-Licitante-Id` ausente.
- **401**: não autenticado.
- **403**: sem vínculo com o licitante informado.
- **404**: licitante não encontrado.

Uso nesta feature: `NotificacaoRepository.listar()` chama este endpoint com `limit` suficiente para
cobrir o sino do cabeçalho e a seção "Alertas recentes" (mesma primeira página para os dois, conforme
Premissas da spec — sem paginação nesta fase).

## `PATCH /api/notificacoes/{id}/lida`

Marca uma notificação específica como lida. Idempotente — chamar de novo numa já lida retorna 200 sem
alterar `lidaEm`.

- **200**: `NotificacaoResponse` (mesmo formato de item de `data[]` acima).
- **400**: header `X-Licitante-Id` ausente.
- **401**: não autenticado.
- **403**: sem vínculo com o licitante.
- **404**: notificação inexistente, de outro usuário ou de outro licitante (mesma resposta nos três
  casos — o frontend não deve tentar diferenciar esses cenários ao usuário).

Uso nesta feature: `NotificacaoRepository.marcarComoLida(id)`.

## `PATCH /api/notificacoes/lidas`

Marca todas as notificações não lidas do usuário no licitante ativo como lidas.

- **200**: `{ "marcadas": number }` — quantidade marcada nesta execução (pode ser `0`).
- **400**: header `X-Licitante-Id` ausente.
- **401**: não autenticado.
- **403**: sem vínculo com o licitante.

Uso nesta feature: `NotificacaoRepository.marcarTodasComoLidas()`.

## Fora de escopo (referência apenas)

`GET /api/dashboard` já retorna, no campo `alertas`, as 5 notificações mais recentes no mesmo formato
de `NotificacaoResponse` — já consumido por `features/dashboard`. Esta feature não chama `/api/dashboard`.
