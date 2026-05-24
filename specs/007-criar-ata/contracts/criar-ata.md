# Contrato: Criar Ata de Registro de Preços

**Endpoint**: `POST /api/atas`  
**Auth**: Cookie HttpOnly `BEARER` (JWT)  
**Header obrigatório**: `X-Licitante-Id: {uuid}` — injetado automaticamente por `apiFetch`

## Request Body

```json
{
  "numero": "001/2026",
  "descricao": "AQUISIÇÃO DE MATERIAL MÉDICO HOSPITALAR",
  "ativo": true,
  "cnpj_orgao_gerenciador": "00360305000104",
  "nome_orgao_gerenciador": "Ministério da Fazenda",
  "data_inicio_vigencia": "2026-01-01",
  "data_fim_vigencia": "2026-12-31",
  "aceita_adesao": true,
  "renovavel": false,
  "numero_pncp": "00360305000104-1-000001/2026",
  "anexo_url": null,
  "itens": [
    {
      "numero_item": 1,
      "descricao": "Seringa descartável 10ml",
      "unidade_medida": "UN",
      "valor_estimado": 1.50,
      "qtd_registrada": 10000.0,
      "qtd_para_carona": 2000.0
    }
  ]
}
```

## Responses

| Status | Situação |
|--------|----------|
| 201 | Ata criada com sucesso. Body: `AtaDetalhes` (já mapeado em `ataDetalhesMappers.ts`) |
| 400 | Header `X-Licitante-Id` ausente → `AtaError('Nenhum licitante ativo selecionado.')` |
| 401 | JWT ausente/inválido → `AtaError('Sessão expirada. Faça login novamente.')` |
| 403 | Usuário sem vínculo com licitante → `AtaError('Acesso negado ao licitante informado.')` |
| 404 | Licitante não encontrado → `AtaError('Licitante não encontrado.')` |
| 422 | Erro de validação de negócio → `AtaError` com mensagem do campo `error` do body |
| outros | Erro genérico → `AtaError('Erro ao cadastrar ata. Tente novamente.')` |
| rede | Falha de rede → `AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')` |
