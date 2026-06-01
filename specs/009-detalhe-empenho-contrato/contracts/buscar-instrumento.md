# Contrato: Buscar Instrumento Detalhado

## Endpoint

`GET /api/instrumentos/{id}`

## Headers Obrigatórios

| Header          | Valor         | Descrição                                   |
|-----------------|---------------|---------------------------------------------|
| `X-Licitante-Id` | UUID (string) | ID do licitante autenticado (injetado pelo `apiFetch`) |
| Cookie `BEARER`  | JWT           | Token de autenticação (cookie HttpOnly)      |

## Parâmetros

| Parâmetro | Tipo   | Localização | Obrigatório | Descrição               |
|-----------|--------|-------------|-------------|-------------------------|
| `id`      | UUID   | path        | sim         | UUID do instrumento raiz|

## Resposta 200 — Instrumento tipo Contrato

```json
{
  "instrumento_id": "01963b7a-1234-7abc-8def-000000000001",
  "licitante_id": "01963b7a-0000-7abc-8def-000000000099",
  "ata_id": null,
  "criado_em": "2026-01-15T10:30:00+00:00",
  "tipo": "CONTRATO",
  "contrato": {
    "id": "01963b7a-aaaa-7abc-8def-000000000010",
    "numero_pncp": null,
    "numero": "CT-001/2026",
    "orgao_contratante": "Secretaria Municipal de Obras",
    "unidade": "Departamento de Licitações",
    "objeto": "Fornecimento de materiais de construção",
    "vigencia_inicial": "2026-01-01",
    "vigencia_final": "2026-12-31",
    "endereco": null,
    "prazo_entrega": 30,
    "tipo_prazo_entrega": "DIAS",
    "prazo_pagamento": 15,
    "tipo_prazo_pagamento": "DIAS",
    "endereco_entrega": null,
    "renovavel": true,
    "anexo_url": null,
    "status": "ATIVA",
    "criado_em": "2026-01-15T10:30:00+00:00"
  },
  "empenho": null,
  "itens": [
    {
      "id": "01963b7a-bbbb-7abc-8def-000000000020",
      "descricao": "Cimento Portland CP-II",
      "unidade_medida": "saco 50kg",
      "quantidade_total": 500.0,
      "valor_unitario": 35.00,
      "valor_total": 17500.00
    }
  ]
}
```

## Resposta 200 — Instrumento tipo Empenho

```json
{
  "instrumento_id": "01963b7a-2222-7abc-8def-000000000002",
  "licitante_id": "01963b7a-0000-7abc-8def-000000000099",
  "ata_id": "01963b7a-cccc-7abc-8def-000000000030",
  "criado_em": "2026-02-10T08:00:00+00:00",
  "tipo": "EMPENHO",
  "contrato": null,
  "empenho": {
    "id": "01963b7a-dddd-7abc-8def-000000000040",
    "numero_pncp": "NE-2026-0042",
    "orgao_contratante": "Secretaria Municipal de Saúde",
    "unidade": "Hospital Central",
    "objeto": "Aquisição de medicamentos",
    "anexo_url": null,
    "status": "PROXIMA_AO_VENCIMENTO",
    "criado_em": "2026-02-10T08:00:00+00:00"
  },
  "itens": [
    {
      "id": "01963b7a-eeee-7abc-8def-000000000050",
      "descricao": "Paracetamol 500mg",
      "unidade_medida": "caixa 24un",
      "quantidade_total": 100.0,
      "valor_unitario": 12.50,
      "valor_total": 1250.00
    }
  ]
}
```

## Erros

| Status | Condição                                           |
|--------|----------------------------------------------------|
| `401`  | Token ausente, inválido ou expirado                |
| `404`  | Instrumento não encontrado ou pertence a outro licitante |

## Notas de Implementação

- O campo `tipo` determina qual sub-objeto estará preenchido (`contrato` ou `empenho`).
- `ata_id` no envelope raiz indica se o instrumento está vinculado a uma Ata de Registro de Preços.
- O campo `status` nos sub-objetos é calculado dinamicamente pelo backend (não armazenado).
- O `apiFetch` já injeta o header `X-Licitante-Id` automaticamente.
