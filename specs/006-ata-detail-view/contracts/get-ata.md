# Contrato: Buscar Detalhes de uma Ata

## Endpoint

```
GET /api/atas?id={ataId}
```

## Headers

| Header | Origem | Obrigatório |
|--------|--------|-------------|
| `X-Licitante-Id` | `apiClient.activeLicitanteId` (injetado por `apiFetch`) | Sim |
| `Content-Type` | `application/json` (padrão de `apiFetch`) | Sim |

## Parâmetros de Query

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | `string` (UUID) | Identificador da ata a ser buscada |

## Respostas

### Sucesso — 200 OK

Retorna `AtaResponse` conforme schema OpenAPI (`AtaResponse`), que inclui a lista `itens[]`.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "numero": "001/2026",
  "descricao": "AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR",
  "cnpj_orgao_gerenciador": "00360305000104",
  "nome_orgao_gerenciador": "Ministério da Fazenda",
  "data_inicio_vigencia": "2026-01-01",
  "data_fim_vigencia": "2026-12-31",
  "aceita_adesao": true,
  "renovavel": false,
  "numero_pncp": "00360305000104-1-000001/2026",
  "anexo_url": null,
  "status": "ATIVA",
  "itens": [
    {
      "id": "7f4e2a1b-3c0d-4e5f-a6b7-c8d9e0f1a2b3",
      "numero_item": 1,
      "descricao": "Seringa descartável 10ml",
      "unidade_medida": "UN",
      "valor_estimado": 1.50,
      "qtd_registrada": 10000.0,
      "qtd_para_carona": 2000.0,
      "qtd_consumida_orgao": 0.0,
      "qtd_consumida_carona": 0.0
    }
  ]
}
```

### Erros

| Status | Causa | Comportamento no Frontend |
|--------|-------|--------------------------|
| 401 | Sessão expirada / token ausente | Mensagem: "Sessão expirada. Faça login novamente." |
| 403 | Usuário sem vínculo com o licitante | Mensagem: "Acesso negado ao licitante informado." |
| 404 | Ata não encontrada | Mensagem: "Ata não encontrada." |
| outros | Erro inesperado | Mensagem genérica + botão "Tentar novamente" |

## Mapeamento de Tipos TypeScript

```typescript
// IAtasRepository (domain)
getAta(ataId: string): Promise<AtaDetalhes>

// GetAtaUseCase (domain)
execute(ataId: string): Promise<AtaDetalhes>

// useGetAta (presentation)
useGetAta(ataId: string): {
  ata: AtaDetalhes | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```
