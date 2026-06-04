# Data Model: Detalhes do Contrato e Empenho

## Novos Tipos a Adicionar em `instrumentoContratual.ts`

### `TipoPrazo`
```typescript
export type TipoPrazo = 'UTEIS' | 'CORRIDOS';
```

### `ItemInstrumentoDetalhe`
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

### `ContratoDetalhe`
```typescript
export interface ContratoDetalhe {
  id: string;
  numeroPncp: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;   // ISO date yyyy-MM-dd
  vigenciaFinal: string;     // ISO date yyyy-MM-dd
  endereco: string | null;
  prazoEntrega: number | null;
  tipoPrazoEntrega: TipoPrazo | null;
  prazoPagamento: number | null;
  tipoPrazoPagamento: TipoPrazo | null;
  enderecoEntrega: string | null;
  renovavel: boolean;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;          // ISO datetime
}
```

### `EmpenhoDetalhe`
```typescript
export interface EmpenhoDetalhe {
  id: string;
  numeroPncp: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;          // ISO datetime
}
```

### `InstrumentoDetalhe` (discriminated union)
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

## Mapeamento API → Domínio

```
GET /api/instrumentos/{id} Response         → InstrumentoDetalhe
───────────────────────────────────────────────────────────────
instrumento_id                               → instrumentoId
licitante_id                                 → licitanteId
ata_id                                       → ataId
criado_em                                    → criadoEm
tipo                                         → tipo
contrato (quando tipo === 'CONTRATO'):
  id                                         → contrato.id
  numero_pncp                                → contrato.numeroPncp
  numero                                     → contrato.numero
  orgao_contratante                          → contrato.orgaoContratante
  unidade                                    → contrato.unidade
  objeto                                     → contrato.objeto
  vigencia_inicial                           → contrato.vigenciaInicial
  vigencia_final                             → contrato.vigenciaFinal
  endereco                                   → contrato.endereco
  prazo_entrega                              → contrato.prazoEntrega
  tipo_prazo_entrega                         → contrato.tipoPrazoEntrega
  prazo_pagamento                            → contrato.prazoPagamento
  tipo_prazo_pagamento                       → contrato.tipoPrazoPagamento
  endereco_entrega                           → contrato.enderecoEntrega
  renovavel                                  → contrato.renovavel
  anexo_url                                  → contrato.anexoUrl
  status                                     → contrato.status
  criado_em                                  → contrato.criadoEm
empenho (quando tipo === 'EMPENHO'):
  id                                         → empenho.id
  numero_pncp                                → empenho.numeroPncp
  orgao_contratante                          → empenho.orgaoContratante
  unidade                                    → empenho.unidade
  objeto                                     → empenho.objeto
  anexo_url                                  → empenho.anexoUrl
  status                                     → empenho.status
  criado_em                                  → empenho.criadoEm
itens[]:
  id                                         → id
  descricao                                  → descricao
  unidade_medida                             → unidadeMedida
  quantidade_total                           → quantidadeTotal
  valor_unitario                             → valorUnitario
  valor_total                                → valorTotal
```

---

## Regras de Validação / Fallback na UI

| Campo | Condição Null | Exibição |
|-------|---------------|----------|
| `contrato.numeroPncp` | null | "Não informado" |
| `contrato.endereco` | null | "Não informado" |
| `contrato.enderecoEntrega` | null | "Não informado" |
| `contrato.prazoEntrega` | null | "Não informado" |
| `contrato.tipoPrazoEntrega` | null | não exibir unidade |
| `contrato.anexoUrl` | null | "Nenhum anexo disponível" |
| `empenho.numeroPncp` | null | "Número PNCP não informado" |
| `empenho.anexoUrl` | null | "Nenhum anexo disponível" |
| `ataId` | null | ocultar card ARP de Origem |
| `itens` | array vazio | "Nenhum item registrado" |
