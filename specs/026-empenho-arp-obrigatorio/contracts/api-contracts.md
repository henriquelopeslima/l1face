# API Contracts: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

> **Nota de fonte**: `l1core/docs/openapi.yaml` está desatualizado para este endpoint (não documenta `numero` nem `item_ata_id` no payload de empenho). O contrato abaixo foi verificado diretamente no código-fonte do backend (`l1core`, branch atual): `CriarInstrumentoEmpenhoController.php`, `CriarInstrumentoEmpenhoRequest.php` e `InstrumentoService::criarComEmpenho`. Nenhuma mudança de backend é necessária para esta feature — o backend já impõe as duas regras pedidas.

## POST /api/instrumentos/empenhos

**Descrição**: Cria atomicamente um Instrumento agrupador e uma Nota de Empenho associada, com seus itens.
**Autenticação**: Cookie HttpOnly `BEARER`.

### Request

```
POST /api/instrumentos/empenhos
X-Licitante-Id: <uuid>
Content-Type: application/json
```

```json
{
  "ata_id": "550e8400-e29b-41d4-a716-446655440010",
  "numero_pncp": "12345678000195-2-000001/2026",
  "numero": "2026.000123",
  "orgao_contratante": "Prefeitura Municipal de São Paulo",
  "unidade": "Secretaria de Saúde",
  "objeto": "Aquisição de insumos médicos",
  "adesao": false,
  "anexo_url": "https://storage.example.com/empenhos/001-2026.pdf",
  "itens": [
    {
      "item_ata_id": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "descricao": "Luva descartável tamanho M caixa com 100un",
      "unidade_medida": "CX",
      "quantidade_total": 500,
      "valor_unitario": 35.00,
      "valor_total": 17500.00
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `numero` | string | **Sim** | Antes desta feature o frontend não enviava este campo — a requisição resultante já era rejeitada pelo backend com 422 quando ausente. |
| `orgao_contratante` | string | Sim | Sem mudança. |
| `unidade` | string | Sim | Sem mudança. |
| `objeto` | string | Sim | Sem mudança. |
| `ata_id` | uuid \| null | Não | Quando presente, ativa a validação de itens abaixo. |
| `itens[].item_ata_id` | uuid | **Condicional** | Obrigatório em cada item quando `ata_id` está presente; deve referenciar um item pertencente a essa Ata. Ausente/omitido quando `ata_id` é `null`. |
| `itens[].quantidade_total` | number | Sim (por item) | Quando `ata_id` presente, não pode exceder o saldo do item (órgão ou carona, conforme `adesao`). |

### Validações do backend relevantes a esta feature

- Se `ata_id` está presente e um item não informa `item_ata_id` → **422**, `{"error": "Cada item deve informar item_ata_id quando o empenho está vinculado a uma Ata."}`
- Se `item_ata_id` não pertence à Ata vinculada → **422**, `{"error": "Item da Ata '{id}' não pertence a esta Ata."}`
- Se `quantidade_total` do item excede o saldo disponível (órgão quando `adesao=false`, carona quando `adesao=true`) → **422**, `{"error": "Quantidade solicitada (X.XXXX) para o item '{id}' excede a quantidade disponível (Y.YYYY)."}`
- Se `numero` está ausente do corpo → **422**, `{"error": "Missing required field: numero"}`

Todas essas respostas já são tratadas de forma genérica pelo `InstrumentosRepository.criarEmpenho` existente (qualquer 422/400 vira `InstrumentosError(data.error)`, exibido em `erroSalvar`) — nenhuma mudança de tratamento de erro é necessária no repositório.

### Response 201 (sem mudanças)

```json
{
  "instrumento_id": "8e4b7c1d-2345-5c6d-9e0f-1a2b3c4d5e6f",
  "empenho": {
    "id": "0c9b8a7d-6e5f-4a3b-2c1d-0f9e8d7c6b5a",
    "numero_pncp": "12345678000195-2-000001/2026",
    "numero": "2026.000123",
    "orgao_contratante": "Prefeitura Municipal de São Paulo",
    "unidade": "Secretaria de Saúde",
    "objeto": "Aquisição de insumos médicos",
    "adesao": false,
    "anexo_url": "https://storage.example.com/empenhos/001-2026.pdf",
    "itens": [ /* ... */ ]
  }
}
```

O frontend hoje só consome `instrumento_id` da resposta (`InstrumentosRepository.criarEmpenho` retorna `data.instrumento_id`) — sem mudança necessária aqui.
