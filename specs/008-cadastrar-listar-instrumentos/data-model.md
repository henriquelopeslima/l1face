# Modelo de Dados: Cadastrar e Listar Instrumentos

## Entidades de Domínio

### InstrumentoListagem (ATUALIZAR — `domain/entities/instrumentoContratual.ts`)

Representa um instrumento na listagem retornada por `GET /api/instrumentos`.

```typescript
export type TipoInstrumento = 'CONTRATO' | 'EMPENHO';

export type StatusInstrumento = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA';

export interface InstrumentoListagem {
  id: string;
  tipo: TipoInstrumento;
  numero: string | null;       // null para Empenho sem número PNCP
  orgao: string;
  unidade: string;
  objeto: string;
  prazoFinal: string | null;   // null para Empenho
  valor: number;
  saldo: number;
  status: StatusInstrumento;
}
```

**Campos removidos em relação ao mock**: `numeroInstrumento` (→ `numero`), `isARP`, `orgaoContratante` (→ `orgao`), `secretaria` (→ `unidade`), `vigenciaInicio`, `vigenciaFim`, `prazoEntregaOF` (→ `prazoFinal`), `valorGlobal` (→ `valor`), `saldoAtual` (→ `saldo`).

**Nota de UI**: os labels de status em PT-BR (`Em execução`, `Próximo ao vencimento`, `Encerrado`) são calculados na função `getStatusBadge` em `InstrumentosGestaoPage.tsx`.

---

### CriarContratoInput (ADICIONAR a `domain/entities/criarContrato.ts`)

Input para `POST /api/instrumentos/contratos`.

```typescript
export interface ItemInstrumentoInput {
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface CriarContratoInput {
  ataId?: string | null;
  numeroPncp?: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;   // YYYY-MM-DD
  vigenciaFinal: string;     // YYYY-MM-DD
  endereco?: string | null;
  prazoEntrega?: number | null;
  tipoPrazoEntrega?: 'UTEIS' | 'CORRIDOS' | null;
  prazoPagamento?: number | null;
  tipoPrazoPagamento?: 'UTEIS' | 'CORRIDOS' | null;
  enderecoEntrega?: string | null;
  renovavel: boolean;
  anexoUrl?: string | null;
  itens?: ItemInstrumentoInput[];
}
```

---

### CriarEmpenhoInput (ADICIONAR a `domain/entities/criarContrato.ts`)

Input para `POST /api/instrumentos/empenhos`.

```typescript
export interface CriarEmpenhoInput {
  ataId?: string | null;
  numeroPncp?: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl?: string | null;
  itens?: ItemInstrumentoInput[];
}
```

---

## Mapeamento API ↔ Domínio

### GET /api/instrumentos → InstrumentoListagem

| Campo API               | Campo Domínio        | Transformação                    |
|-------------------------|----------------------|----------------------------------|
| `id`                    | `id`                 | direto                           |
| `tipo`                  | `tipo`               | direto (`'CONTRATO' \| 'EMPENHO'`) |
| `numero`                | `numero`             | direto (pode ser null)           |
| `orgao`                 | `orgao`              | direto                           |
| `unidade`               | `unidade`            | direto                           |
| `objeto`                | `objeto`             | direto                           |
| `prazo_final`           | `prazoFinal`         | snake_case → camelCase           |
| `valor`                 | `valor`              | direto                           |
| `saldo`                 | `saldo`              | direto                           |
| `status`                | `status`             | direto (`'ATIVA' \| 'PROXIMA_AO_VENCIMENTO' \| 'ENCERRADA'`) |

### CriarContratoInput → POST /api/instrumentos/contratos request body

| Campo Domínio           | Campo API                    |
|-------------------------|------------------------------|
| `ataId`                 | `ata_id`                     |
| `numeroPncp`            | `numero_pncp`                |
| `numero`                | `numero`                     |
| `orgaoContratante`      | `orgao_contratante`          |
| `unidade`               | `unidade`                    |
| `objeto`                | `objeto`                     |
| `vigenciaInicial`       | `vigencia_inicial`           |
| `vigenciaFinal`         | `vigencia_final`             |
| `endereco`              | `endereco`                   |
| `prazoEntrega`          | `prazo_entrega`              |
| `tipoPrazoEntrega`      | `tipo_prazo_entrega`         |
| `prazoPagamento`        | `prazo_pagamento`            |
| `tipoPrazoPagamento`    | `tipo_prazo_pagamento`       |
| `enderecoEntrega`       | `endereco_entrega`           |
| `renovavel`             | `renovavel`                  |
| `anexoUrl`              | `anexo_url`                  |
| `itens[].descricao`     | `itens[].descricao`          |
| `itens[].unidadeMedida` | `itens[].unidade_medida`     |
| `itens[].quantidadeTotal`| `itens[].quantidade_total`  |
| `itens[].valorUnitario` | `itens[].valor_unitario`     |
| `itens[].valorTotal`    | `itens[].valor_total`        |

### CriarEmpenhoInput → POST /api/instrumentos/empenhos request body

| Campo Domínio           | Campo API              |
|-------------------------|------------------------|
| `ataId`                 | `ata_id`               |
| `numeroPncp`            | `numero_pncp`          |
| `orgaoContratante`      | `orgao_contratante`    |
| `unidade`               | `unidade`              |
| `objeto`                | `objeto`               |
| `anexoUrl`              | `anexo_url`            |
| `itens[].descricao`     | `itens[].descricao`    |
| `itens[].unidadeMedida` | `itens[].unidade_medida` |
| `itens[].quantidadeTotal`| `itens[].quantidade_total` |
| `itens[].valorUnitario` | `itens[].valor_unitario` |
| `itens[].valorTotal`    | `itens[].valor_total`  |

---

## Regras de Validação (Domínio)

### CriarContratoUseCase
- `vigenciaFinal >= vigenciaInicial` (erro: "Data de vigência final deve ser igual ou posterior à data inicial")
- Se `ataId` informado e `vigenciaInicial < ata.dataInicioVigencia` ou `vigenciaFinal > ata.dataFimVigencia`: erro retornado pela API (422)
- Se `tipoPrazoEntrega` informado: deve ser `'UTEIS'` ou `'CORRIDOS'`
- Se `tipoPrazoPagamento` informado: deve ser `'UTEIS'` ou `'CORRIDOS'`

### CriarEmpenhoUseCase
- Sem validações de domínio adicionais (campos obrigatórios: `orgaoContratante`, `unidade`, `objeto`)

---

## Diagrama de Relacionamentos

```
InstrumentoListagem
  ├── tipo: TipoInstrumento ('CONTRATO' | 'EMPENHO')
  └── status: StatusInstrumento ('ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA')

CriarContratoInput
  ├── ataId? → referencia Ata (feature atas)
  └── itens?: ItemInstrumentoInput[]

CriarEmpenhoInput
  ├── ataId? → referencia Ata (feature atas)
  └── itens?: ItemInstrumentoInput[]
```
