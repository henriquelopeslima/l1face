# Contrato: Consultar Ata no PNCP

**Endpoint**: `GET /api/pncp/atas?codigo={codigoPncp}`  
**Auth**: Cookie HttpOnly `BEARER` (JWT)  
**Header**: `X-Licitante-Id` injetado por `apiFetch` (necessário para autenticação)

## Request

Query param `codigo` deve ser URL-encoded (o `/` precisa virar `%2F`).

Exemplo: `GET /api/pncp/atas?codigo=19876424000142-1-000189%2F2025-000016`

## Responses

| Status | Situação |
|--------|----------|
| 200 | Ata encontrada. Body: `DadosAtaPncp` |
| 400 | Parâmetro `codigo` ausente → `AtaError('Código PNCP é obrigatório.')` |
| 401 | JWT ausente/inválido → `AtaError('Sessão expirada. Faça login novamente.')` |
| 404 | Nenhuma ata encontrada → `AtaError` com mensagem do campo `erro` do body |
| 422 | Resultado ambíguo (> 1 resultado) → `AtaError` com mensagem do campo `erro` do body |
| 503 | PNCP indisponível → `AtaError` com mensagem do campo `erro` do body |
| outros | Erro genérico → `AtaError('Erro ao consultar PNCP. Tente novamente.')` |
| rede | Falha de rede → `AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')` |

## Response Body (200)

```json
{
  "numero_controle_pncp": "19876424000142-1-000189/2025-000016",
  "titulo": "Ata nº 63/2026/2026",
  "descricao": "AQUISIÇÃO FUTURA DE MATERIAL MÉDICO HOSPITALAR",
  "orgao_cnpj": "19876424000142",
  "orgao_nome": "MUNICIPIO DE IPATINGA",
  "unidade_nome": "Unidade Única",
  "modalidade_licitacao": "Pregão - Eletrônico",
  "data_assinatura": "2026-05-05",
  "data_inicio_vigencia": "2026-05-05",
  "data_fim_vigencia": "2027-05-05",
  "situacao": "Divulgada no PNCP",
  "cancelado": false,
  "municipio": "Ipatinga",
  "uf": "MG"
}
```
