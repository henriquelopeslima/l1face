# Data Model: Visualizar Detalhes de Ata

## Entidades do Domínio

### `ItemAta`
Representa um item individual dentro de uma Ata de Registro de Preços.

| Campo | Tipo | Origem API | Descrição |
|-------|------|-----------|-----------|
| `id` | `string` (UUID) | `id` | Identificador único |
| `numeroItem` | `number` | `numero_item` | Número do item na ata |
| `descricao` | `string` | `descricao` | Descrição do produto/serviço |
| `unidadeMedida` | `string` | `unidade_medida` | Unidade (UN, KG, etc.) |
| `valorEstimado` | `number` | `valor_estimado` | Valor unitário estimado |
| `qtdRegistrada` | `number` | `qtd_registrada` | Quantidade total registrada |
| `qtdParaCarona` | `number` | `qtd_para_carona` | Quantidade disponível para adesão |
| `qtdConsumidaOrgao` | `number` | `qtd_consumida_orgao` | Quantidade consumida pelo órgão |
| `qtdConsumidaCarona` | `number` | `qtd_consumida_carona` | Quantidade consumida por caronas |

### `AtaDetalhes`
Resposta completa de uma Ata, incluindo itens e campos ausentes na listagem.

| Campo | Tipo | Origem API | Descrição |
|-------|------|-----------|-----------|
| `id` | `string` (UUID) | `id` | Identificador único |
| `numero` | `string` | `numero` | Número da ata (ex.: "001/2026") |
| `descricao` | `string` | `descricao` | Objeto/descrição da ata |
| `cnpjOrgaoGerenciador` | `string` | `cnpj_orgao_gerenciador` | CNPJ (14 dígitos, sem formatação) |
| `nomeOrgaoGerenciador` | `string` | `nome_orgao_gerenciador` | Nome do órgão gerenciador |
| `dataInicioVigencia` | `string` (date) | `data_inicio_vigencia` | Início da vigência (YYYY-MM-DD) |
| `dataFimVigencia` | `string` (date) | `data_fim_vigencia` | Fim da vigência (YYYY-MM-DD) |
| `aceitaAdesao` | `boolean` | `aceita_adesao` | Aceita caronas |
| `renovavel` | `boolean` | `renovavel` | É renovável |
| `numeroPncp` | `string \| null` | `numero_pncp` | Código PNCP (opcional) |
| `anexoUrl` | `string \| null` | `anexo_url` | URL do documento (opcional) |
| `status` | `AtaStatus` | `status` | ATIVA / PROXIMA_AO_VENCIMENTO / ENCERRADA |
| `itens` | `ItemAta[]` | `itens` | Lista de itens da ata |

## Mapeamento API → Domínio

```
GET /api/atas?id={ataId}
Header: X-Licitante-Id (injetado automaticamente por apiFetch)

Response: AtaResponse (OpenAPI)
  └─ mapApiAtaDetalhesToAtaDetalhes()
       └─ AtaDetalhes (domínio)
            └─ itens[]: ItemAtaResponse
                 └─ mapApiItemAtaToItemAta()
                      └─ ItemAta (domínio)
```

## Validações e Regras

- `status` é calculado pelo servidor; o frontend exibe sem recalcular
- `numeroPncp` e `anexoUrl` são nullable — exibidos como "Não informado" quando ausentes
- `qtdParaCarona`, `qtdConsumidaOrgao`, `qtdConsumidaCarona` são sempre números (padrão 0 se omitidos)
- Saldo por item é calculado no frontend: `qtdRegistrada - qtdConsumidaOrgao` e `qtdParaCarona - qtdConsumidaCarona`
