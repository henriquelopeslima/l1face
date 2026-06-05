# Modelo de Dados: Ordens de Fornecimento

**Branch**: `011-criar-ordens-fornecimento` | **Data**: 2026-06-04

## Entidades do Domínio

### OrdemFornecimento

Representa uma entrega (parcial ou total) vinculada a um instrumento.

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | `string` (UUID) | não | Identificador único da OF |
| `codigo` | `number` | não | Código sequencial por instrumento (1, 2, 3...) |
| `instrumentoId` | `string` (UUID) | não | Instrumento ao qual a OF pertence |
| `status` | `StatusOrdemFornecimento` | não | Status operacional atual |
| `dataRecebimento` | `string` (date) | não | Preenchida automaticamente na emissão |
| `dataEntrega` | `string` (date) | sim | Preenchida ao transitar para `entregue` |
| `dataLiquidacao` | `string` (date) | sim | Informada no registro de liquidação |
| `prazoPagamento` | `string` (date) | sim | Data limite de pagamento (liquidação) |
| `dataPagamentoEfetivo` | `string` (date) | sim | Informada no registro de pagamento |
| `statusPagamento` | `StatusPagamento` | sim | `null` antes da liquidação |
| `numeroNfe` | `string` | sim | NF-e 44 dígitos, obrigatório na liquidação |
| `valorTotal` | `number` | não | Soma dos valores totais dos itens |
| `itens` | `ItemOrdemFornecimento[]` | não | Itens fornecidos nesta OF |
| `criadoEm` | `string` (datetime) | não | Timestamp de criação |

### ItemOrdemFornecimento

Item específico de uma OF, referenciando um item do instrumento.

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | `string` (UUID) | não | Identificador único do item OF |
| `itemInstrumentoId` | `string` (UUID) | não | Referência ao `ItemInstrumentoDetalhe` |
| `descricao` | `string` | não | Descrição do item (desnormalizada da API) |
| `unidadeMedida` | `string` | não | Unidade de medida |
| `quantidadeFornecida` | `number` | não | Quantidade entregue nesta OF |
| `valorUnitario` | `number` | não | Valor unitário no momento da emissão |
| `valorTotal` | `number` | não | `quantidadeFornecida × valorUnitario` |

### ListagemOrdensFornecimento

Resultado da listagem de OFs de um instrumento.

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `instrumentoId` | `string` (UUID) | não | Instrumento consultado |
| `saldoRemanescente` | `number` | não | Valor total − soma das OFs |
| `ordensFornecimento` | `OrdemFornecimento[]` | não | Lista ordenada por código |

---

## Tipos (Enums)

### StatusOrdemFornecimento

```
'pedido_recebido' | 'em_separacao' | 'despachado' | 'entregue' | 'pago'
```

Transições válidas (irreversíveis, sequenciais):
- `pedido_recebido` → `em_separacao` (via PATCH /status)
- `em_separacao` → `despachado` (via PATCH /status)
- `despachado` → `entregue` (via PATCH /status)
- `entregue` → `pago` (via PATCH /pagamento, depois de /liquidacao)

### StatusPagamento

```
'pendente' | 'em_atraso' | 'pago' | null
```

- `null`: Liquidação não registrada
- `pendente`: Liquidação registrada, prazo não vencido
- `em_atraso`: Prazo de pagamento ultrapassado
- `pago`: Pagamento efetivo registrado

---

## Inputs (formulários e ações)

### EmitirOrdemFornecimentoInput

Usado pelo `EmitirOrdemFornecimentoUseCase`.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `instrumentoId` | `string` (UUID) | sim | Instrumento alvo |
| `itens` | `ItemEmitirOFInput[]` | sim (≥1) | Itens a fornecer |

### ItemEmitirOFInput

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `itemInstrumentoId` | `string` (UUID) | sim | Item do instrumento referenciado |
| `quantidadeFornecida` | `number` | sim | Quantidade a fornecer (> 0) |
| `valorUnitario` | `number` | sim | Valor unitário no momento da emissão |

### AvancarStatusOrdemFornecimentoInput

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (UUID) | sim | ID da OF |
| `status` | `'em_separacao' \| 'despachado' \| 'entregue'` | sim | Próximo status |

### RegistrarLiquidacaoInput

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (UUID) | sim | ID da OF |
| `dataLiquidacao` | `string` (date) | sim | Data da liquidação |
| `prazoPagamento` | `string` (date) | sim | Data limite de pagamento |
| `numeroNfe` | `string` | sim | NF-e (44 dígitos) |

### RegistrarPagamentoInput

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` (UUID) | sim | ID da OF |
| `dataPagamentoEfetivo` | `string` (date) | sim | Data do pagamento |

---

## Relacionamentos

```
InstrumentoDetalhe (1) ──── (N) OrdemFornecimento
OrdemFornecimento  (1) ──── (N) ItemOrdemFornecimento
ItemOrdemFornecimento (N) ─── (1) ItemInstrumentoDetalhe (por itemInstrumentoId)
```
