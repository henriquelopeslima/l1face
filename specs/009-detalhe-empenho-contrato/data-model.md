# Modelo de Dados: Visualizar Detalhes de Instrumento

## Entidades de Domínio

### ItemInstrumentoDetalhe (ADICIONAR em `domain/entities/instrumentoContratual.ts`)

Item associado a um instrumento, retornado dentro de `InstrumentoDetalhe`.

```typescript
export interface ItemInstrumentoDetalhe {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}
```

---

### ContratoDetalhe (ADICIONAR em `domain/entities/instrumentoContratual.ts`)

Dados completos de um Contrato, sub-objeto de `InstrumentoDetalhe`.

```typescript
export interface ContratoDetalhe {
  id: string;
  numeroPncp: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;          // YYYY-MM-DD
  vigenciaFinal: string;            // YYYY-MM-DD
  endereco: string | null;
  prazoEntrega: number | null;
  tipoPrazoEntrega: 'DIAS' | 'MESES' | null;
  prazoPagamento: number | null;
  tipoPrazoPagamento: 'DIAS' | 'MESES' | null;
  enderecoEntrega: string | null;
  renovavel: boolean;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}
```

---

### EmpenhoDetalhe (ADICIONAR em `domain/entities/instrumentoContratual.ts`)

Dados completos de um Empenho, sub-objeto de `InstrumentoDetalhe`.

```typescript
export interface EmpenhoDetalhe {
  id: string;
  numeroPncp: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}
```

---

### InstrumentoDetalhe (ADICIONAR em `domain/entities/instrumentoContratual.ts`)

Union discriminada que representa o instrumento completo.

```typescript
export type InstrumentoDetalhe =
  | {
      instrumentoId: string;
      licitanteId: string;
      ataId: string | null;
      criadoEm: string;
      tipo: 'CONTRATO';
      contrato: ContratoDetalhe;
      empenho: null;
      itens: ItemInstrumentoDetalhe[];
    }
  | {
      instrumentoId: string;
      licitanteId: string;
      ataId: string | null;
      criadoEm: string;
      tipo: 'EMPENHO';
      contrato: null;
      empenho: EmpenhoDetalhe;
      itens: ItemInstrumentoDetalhe[];
    };
```

---

## Mapeamento API ↔ Domínio

### `GET /api/instrumentos/{id}` → `InstrumentoDetalhe`

| Campo API (`InstrumentoDetalhesResponse`) | Campo Domínio                     | Transformação                            |
|-------------------------------------------|-----------------------------------|------------------------------------------|
| `instrumento_id`                          | `instrumentoId`                   | snake_case → camelCase                   |
| `licitante_id`                            | `licitanteId`                     | snake_case → camelCase                   |
| `ata_id`                                  | `ataId`                           | snake_case → camelCase                   |
| `criado_em`                               | `criadoEm`                        | snake_case → camelCase                   |
| `tipo`                                    | `tipo`                            | direto (`'CONTRATO' \| 'EMPENHO'`)       |
| `contrato`                                | `contrato`                        | objeto aninhado → `ContratoDetalhe`      |
| `empenho`                                 | `empenho`                         | objeto aninhado → `EmpenhoDetalhe`       |
| `itens`                                   | `itens`                           | array → `ItemInstrumentoDetalhe[]`       |

**`contrato` (`ContratoDetalhesResponse`) → `ContratoDetalhe`:**

| Campo API              | Campo Domínio          | Transformação              |
|------------------------|------------------------|----------------------------|
| `id`                   | `id`                   | direto                     |
| `numero_pncp`          | `numeroPncp`           | snake_case → camelCase     |
| `numero`               | `numero`               | direto                     |
| `orgao_contratante`    | `orgaoContratante`     | snake_case → camelCase     |
| `unidade`              | `unidade`              | direto                     |
| `objeto`               | `objeto`               | direto                     |
| `vigencia_inicial`     | `vigenciaInicial`      | snake_case → camelCase     |
| `vigencia_final`       | `vigenciaFinal`        | snake_case → camelCase     |
| `endereco`             | `endereco`             | direto (nullable)          |
| `prazo_entrega`        | `prazoEntrega`         | snake_case → camelCase     |
| `tipo_prazo_entrega`   | `tipoPrazoEntrega`     | snake_case → camelCase     |
| `prazo_pagamento`      | `prazoPagamento`       | snake_case → camelCase     |
| `tipo_prazo_pagamento` | `tipoPrazoPagamento`   | snake_case → camelCase     |
| `endereco_entrega`     | `enderecoEntrega`      | snake_case → camelCase     |
| `renovavel`            | `renovavel`            | direto                     |
| `anexo_url`            | `anexoUrl`             | snake_case → camelCase     |
| `status`               | `status`               | direto (`StatusInstrumento`) |
| `criado_em`            | `criadoEm`             | snake_case → camelCase     |

**`empenho` (`EmpenhoDetalhesResponse`) → `EmpenhoDetalhe`:**

| Campo API           | Campo Domínio      | Transformação              |
|---------------------|--------------------|----------------------------|
| `id`                | `id`               | direto                     |
| `numero_pncp`       | `numeroPncp`       | snake_case → camelCase     |
| `orgao_contratante` | `orgaoContratante` | snake_case → camelCase     |
| `unidade`           | `unidade`          | direto                     |
| `objeto`            | `objeto`           | direto                     |
| `anexo_url`         | `anexoUrl`         | snake_case → camelCase     |
| `status`            | `status`           | direto (`StatusInstrumento`) |
| `criado_em`         | `criadoEm`         | snake_case → camelCase     |

**`itens[]` (`ItemInstrumentoResponse`) → `ItemInstrumentoDetalhe`:**

| Campo API          | Campo Domínio       | Transformação          |
|--------------------|---------------------|------------------------|
| `id`               | `id`                | direto                 |
| `descricao`        | `descricao`         | direto                 |
| `unidade_medida`   | `unidadeMedida`     | snake_case → camelCase |
| `quantidade_total` | `quantidadeTotal`   | snake_case → camelCase |
| `valor_unitario`   | `valorUnitario`     | snake_case → camelCase |
| `valor_total`      | `valorTotal`        | snake_case → camelCase |

---

## Diagrama de Relacionamentos

```
InstrumentoDetalhe (union)
  ├── tipo: 'CONTRATO' → contrato: ContratoDetalhe, empenho: null
  ├── tipo: 'EMPENHO'  → contrato: null, empenho: EmpenhoDetalhe
  ├── ataId?           → referencia Ata (feature atas)
  └── itens: ItemInstrumentoDetalhe[]
```
