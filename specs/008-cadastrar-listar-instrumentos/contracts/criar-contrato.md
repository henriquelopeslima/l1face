# Contrato: Criar Instrumento com Contrato

**Endpoint**: `POST /api/instrumentos/contratos`  
**Use Case**: `CriarContratoUseCase`

## Request

### Headers
| Header | Obrigatório | Descrição |
|---|---|---|
| `X-Licitante-Id` | Sim | UUID do licitante (injetado automaticamente por `apiFetch`) |

### Body
```json
{
  "ata_id": "550e8400-e29b-41d4-a716-446655440010",
  "numero_pncp": "12345678000195-1-000001/2026",
  "numero": "001/2026",
  "orgao_contratante": "Prefeitura Municipal de São Paulo",
  "unidade": "Secretaria de Educação",
  "objeto": "Fornecimento de material escolar para rede municipal",
  "vigencia_inicial": "2026-01-01",
  "vigencia_final": "2026-12-31",
  "endereco": "Rua da Consolação, 1234 - São Paulo/SP",
  "prazo_entrega": 30,
  "tipo_prazo_entrega": "UTEIS",
  "prazo_pagamento": 15,
  "tipo_prazo_pagamento": "CORRIDOS",
  "endereco_entrega": "Av. Paulista, 100 - São Paulo/SP",
  "renovavel": false,
  "anexo_url": "https://storage.example.com/contratos/001-2026.pdf",
  "itens": [
    {
      "descricao": "Caderno universitário 200 folhas",
      "unidade_medida": "UN",
      "quantidade_total": 1000,
      "valor_unitario": 12.50,
      "valor_total": 12500.00
    }
  ]
}
```

### Campos Obrigatórios
`numero`, `orgao_contratante`, `unidade`, `objeto`, `vigencia_inicial`, `vigencia_final`, `renovavel`

### Campos Opcionais
`ata_id`, `numero_pncp`, `endereco`, `prazo_entrega`, `tipo_prazo_entrega`, `prazo_pagamento`, `tipo_prazo_pagamento`, `endereco_entrega`, `anexo_url`, `itens`

### Validações
- `vigencia_final >= vigencia_inicial`
- `tipo_prazo_entrega` e `tipo_prazo_pagamento`: apenas `'UTEIS'` ou `'CORRIDOS'`
- Se `ata_id` informado: ata deve pertencer ao licitante; vigência do contrato deve estar contida na vigência da ata

## Response

### 201 Created
```json
{
  "instrumento_id": "7f3a9c2e-1234-4b5c-8d9e-0f1a2b3c4d5e",
  "contrato": {
    "id": "9b8a7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "numero_pncp": "12345678000195-1-000001/2026",
    "numero": "001/2026",
    "orgao_contratante": "Prefeitura Municipal de São Paulo",
    "unidade": "Secretaria de Educação",
    "objeto": "Fornecimento de material escolar para rede municipal",
    "vigencia_inicial": "2026-01-01",
    "vigencia_final": "2026-12-31",
    "renovavel": false,
    "itens": []
  }
}
```

### Campos da Resposta de Sucesso Relevantes
| Campo | Tipo | Descrição |
|---|---|---|
| `instrumento_id` | string (UUID) | ID do instrumento agrupador criado |
| `contrato.id` | string (UUID) | ID do contrato criado |

### Erros
| Status | Condição |
|---|---|
| 400 | JSON inválido ou `X-Licitante-Id` ausente |
| 401 | Token JWT ausente, inválido ou expirado |
| 403 | Usuário sem vínculo com o licitante |
| 422 | Campo obrigatório ausente, vigência inválida, ata não encontrada, vigência fora da ata, tipo de prazo inválido |
