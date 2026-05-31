# Contrato: Listar Instrumentos

**Endpoint**: `GET /api/instrumentos`  
**Use Case**: `ListarInstrumentosUseCase`

## Request

### Headers
| Header | Obrigatório | Descrição |
|---|---|---|
| `X-Licitante-Id` | Sim | UUID do licitante autenticado (injetado automaticamente por `apiFetch`) |

### Parâmetros
Nenhum parâmetro de query.

## Response

### 200 OK
```json
[
  {
    "id": "01963b7a-1234-7abc-8def-000000000001",
    "tipo": "CONTRATO",
    "numero": "CTR-2026/001",
    "orgao": "Prefeitura Municipal de São Paulo",
    "unidade": "Secretaria de Obras",
    "objeto": "Fornecimento de material de construção",
    "prazo_final": "2026-12-31",
    "valor": 150000.00,
    "saldo": 150000.00,
    "status": "ATIVA"
  },
  {
    "id": "01963b7a-5678-7abc-8def-000000000002",
    "tipo": "EMPENHO",
    "numero": "2026/0001234-1",
    "orgao": "Governo do Estado do Rio de Janeiro",
    "unidade": "Secretaria de Saúde",
    "objeto": "Aquisição de equipamentos hospitalares",
    "prazo_final": null,
    "valor": 50000.00,
    "saldo": 50000.00,
    "status": "PROXIMA_AO_VENCIMENTO"
  }
]
```

### Campos da Resposta
| Campo | Tipo | Nullable | Descrição |
|---|---|---|---|
| `id` | string (UUID) | não | Identificador do instrumento |
| `tipo` | `'CONTRATO' \| 'EMPENHO'` | não | Tipo do instrumento |
| `numero` | string | sim | Número do instrumento (null para empenho sem número PNCP) |
| `orgao` | string | não | Nome do órgão contratante |
| `unidade` | string | não | Unidade do órgão |
| `objeto` | string | não | Objeto do instrumento |
| `prazo_final` | date (YYYY-MM-DD) | sim | Data fim de vigência (apenas para CONTRATO) |
| `valor` | number | não | Soma dos valorTotal dos itens |
| `saldo` | number | não | Igual a `valor` (consumo não implementado) |
| `status` | `'ATIVA' \| 'PROXIMA_AO_VENCIMENTO' \| 'ENCERRADA'` | não | Calculado dinamicamente |

### Erros
| Status | Condição |
|---|---|
| 400 | Header `X-Licitante-Id` ausente |
| 401 | Token JWT ausente, inválido ou expirado |
| 403 | Usuário sem vínculo com o licitante |
| 404 | Licitante não encontrado |
