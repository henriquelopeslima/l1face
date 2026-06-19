# Modelo de Dados: Atualização do Fluxo de Ordens de Fornecimento

## Entidades do Domínio

### OrdemFornecimento (atualizada)

```typescript
interface OrdemFornecimento {
  id: string;
  codigo: number;
  instrumentoId: string;
  status: StatusOrdemFornecimento;
  dataRecebimento: string;          // date (obrigatório)
  prazoEntrega: string;             // date (NOVO — obrigatório na criação)
  dataSeparacao: string | null;     // NOVO — preenchido no PATCH /separacao
  dataDespacho: string | null;      // NOVO — preenchido no PATCH /despacho
  codigoRastreio: string | null;    // NOVO — opcional no PATCH /despacho
  numeroNfDespacho: string | null;  // NOVO — opcional no PATCH /despacho
  dataEntrega: string | null;       // preenchido no PATCH /entrega
  prazoPagamento: string | null;    // preenchido no PATCH /entrega
  dataLiquidacao: string | null;    // manter (fora de escopo mas presente na resposta)
  dataPagamentoEfetivo: string | null;
  statusPagamento: StatusPagamento;
  numeroNfe: string | null;         // manter (liquidação fora de escopo)
  valorTotal: number;
  itens: ItemOrdemFornecimento[];
  criadoEm: string;
}
```

**Campos removidos de `ItemEmitirOFInput`:**
- `valorUnitario: number` — removido (calculado pelo backend)

---

### EmitirOrdemFornecimentoInput (atualizado)

```typescript
interface ItemEmitirOFInput {
  itemInstrumentoId: string;
  quantidadeFornecida: number;
  // valorUnitario REMOVIDO
}

interface EmitirOrdemFornecimentoInput {
  instrumentoId: string;
  dataRecebimento: string;   // NOVO — obrigatório
  prazoEntrega: string;      // NOVO — obrigatório, >= dataRecebimento
  itens: ItemEmitirOFInput[];
}
```

---

### IniciarSeparacaoInput (novo)

```typescript
interface IniciarSeparacaoInput {
  id: string;                // UUID da OF
  dataSeparacao: string;     // date, >= dataRecebimento
}
```

---

### RegistrarDespachoInput (novo)

```typescript
interface RegistrarDespachoInput {
  id: string;                        // UUID da OF
  dataDespacho: string;              // date, >= dataSeparacao (obrigatório)
  codigoRastreio?: string | null;    // opcional
  numeroNf?: string | null;          // opcional
}
```

---

### ConfirmarEntregaInput (novo)

```typescript
interface ConfirmarEntregaInput {
  id: string;                // UUID da OF
  dataEntrega: string;       // date, >= dataDespacho (obrigatório)
  prazoPagamento: string;    // date, >= dataEntrega (obrigatório)
}
```

---

### AvancarStatusOrdemFornecimentoInput (removido)

Este tipo é substituído pelos 3 novos inputs acima.

---

## Regras de Negócio por Transição

| Status Origem      | Status Destino | Endpoint              | Campos Obrigatórios               | Campos Opcionais               |
|--------------------|----------------|-----------------------|-----------------------------------|--------------------------------|
| `pedido_recebido`  | `em_separacao` | PATCH /separacao      | `data_separacao`                  | —                              |
| `em_separacao`     | `despachado`   | PATCH /despacho       | `data_despacho`                   | `codigo_rastreio`, `numero_nf` |
| `despachado`       | `entregue`     | PATCH /entrega        | `data_entrega`, `prazo_pagamento` | —                              |
| `entregue`         | `pago`         | PATCH /pagamento      | `data_pagamento_efetivo`          | —                              |

**Invariantes de data (cronológica):**
- `data_separacao` >= `data_recebimento`
- `data_despacho` >= `data_separacao`
- `data_entrega` >= `data_despacho`
- `prazo_pagamento` >= `data_entrega`
- `prazo_entrega` >= `data_recebimento`

## Mapeamento API → Domínio (atualização do mapper)

```typescript
// ApiOrdemFornecimento (tipo interno do mapper) — campos adicionados
interface ApiOrdemFornecimento {
  // ... campos existentes ...
  prazo_entrega: string;              // NOVO
  data_separacao: string | null;      // NOVO
  data_despacho: string | null;       // NOVO
  codigo_rastreio: string | null;     // NOVO
  numero_nf_despacho: string | null;  // NOVO
}
```
