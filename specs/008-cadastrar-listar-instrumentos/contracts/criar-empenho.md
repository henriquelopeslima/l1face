# Contrato: Criar Instrumento com Empenho

**Endpoint**: `POST /api/instrumentos/empenhos`  
**Use Case**: `CriarEmpenhoUseCase`

## Request

### Headers
| Header | Obrigatório | Descrição |
|---|---|---|
| `X-Licitante-Id` | Sim | UUID do licitante (injetado automaticamente por `apiFetch`) |

### Body
```json
{
  "ata_id": "550e8400-e29b-41d4-a716-446655440010",
  "numero_pncp": "12345678000195-2-000001/2026",
  "orgao_contratante": "Prefeitura Municipal de São Paulo",
  "unidade": "Secretaria de Saúde",
  "objeto": "Aquisição de insumos médicos",
  "anexo_url": "https://storage.example.com/empenhos/001-2026.pdf",
  "itens": [
    {
      "descricao": "Luva descartável tamanho M caixa com 100un",
      "unidade_medida": "CX",
      "quantidade_total": 500,
      "valor_unitario": 35.00,
      "valor_total": 17500.00
    }
  ]
}
```

### Campos Obrigatórios
`orgao_contratante`, `unidade`, `objeto`

### Campos Opcionais
`ata_id`, `numero_pncp`, `anexo_url`, `itens`

### Validações
- Se `ata_id` informado: ata deve pertencer ao licitante

## Response

### 201 Created
```json
{
  "instrumento_id": "8e4b7c1d-2345-5c6d-9e0f-1a2b3c4d5e6f",
  "empenho": {
    "id": "0c9b8a7d-6e5f-4a3b-2c1d-0f9e8d7c6b5a",
    "numero_pncp": "12345678000195-2-000001/2026",
    "orgao_contratante": "Prefeitura Municipal de São Paulo",
    "unidade": "Secretaria de Saúde",
    "objeto": "Aquisição de insumos médicos",
    "itens": []
  }
}
```

### Campos da Resposta de Sucesso Relevantes
| Campo | Tipo | Descrição |
|---|---|---|
| `instrumento_id` | string (UUID) | ID do instrumento agrupador criado |
| `empenho.id` | string (UUID) | ID do empenho criado |

### Erros
| Status | Condição |
|---|---|
| 400 | JSON inválido ou `X-Licitante-Id` ausente |
| 401 | Token JWT ausente, inválido ou expirado |
| 403 | Usuário sem vínculo com o licitante |
| 422 | Campo obrigatório ausente ou ata não pertence ao licitante |
