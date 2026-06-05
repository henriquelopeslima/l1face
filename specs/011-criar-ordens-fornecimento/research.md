# Research: Ordens de Fornecimento

**Branch**: `011-criar-ordens-fornecimento` | **Data**: 2026-06-04

## 1. Estado atual do código

### Componente existente: `CriarOrdemFornecimento.tsx`

O componente já existe em `presentation/components/CriarOrdemFornecimento.tsx` mas usa
estruturas locais (`ItemContrato`, `TipoEmpenho`) incompatíveis com a API real. Campos como
`numeroEmpenho` e `tipoEmpenho` não existem no endpoint `POST /api/instrumentos/{id}/ordens-fornecimento`.

**Decisão**: Refatorar o componente para usar a estrutura real da API, removendo campos inexistentes
e adicionando `valor_unitario` por item (exigido pela API).

### Páginas existentes

- `ContratoDetalhesPage.tsx` — seção "Ordens de Fornecimento" já existe mas exibe apenas placeholder
  "Funcionalidade disponível em breve".
- `NotaEmpenhoDetalhesPage.tsx` — presumivelmente similar (placeholder).

**Decisão**: Integrar a listagem real de OFs e o formulário de emissão nessas páginas existentes.

---

## 2. Mapeamento API → Domínio

### Endpoints a integrar

| Operação | Endpoint | Método |
|----------|----------|--------|
| Emitir OF | `/api/instrumentos/{instrumentoId}/ordens-fornecimento` | POST |
| Listar OFs | `/api/instrumentos/{instrumentoId}/ordens-fornecimento` | GET |
| Detalhe OF | `/api/ordens-fornecimento/{id}` | GET |
| Avançar status | `/api/ordens-fornecimento/{id}/status` | PATCH |
| Registrar liquidação | `/api/ordens-fornecimento/{id}/liquidacao` | PATCH |
| Registrar pagamento | `/api/ordens-fornecimento/{id}/pagamento` | PATCH |

### Status operacional (sequência irreversível)

`pedido_recebido` → `em_separacao` → `despachado` → `entregue` → (liquidação) → (pagamento efetivo)

**Nota**: `pago` é o status final mas só é atingido via `/pagamento`, não via `/status`.

### Status de pagamento (calculado dinamicamente)

`null` (sem liquidação) → `pendente` → `em_atraso` (prazo vencido) ou `pago`

---

## 3. Decisões de arquitetura

### Onde ficam os novos arquivos

Seguindo o padrão Clean Architecture já estabelecido, tudo fica dentro de
`src/features/instrumentos/` (a feature já existe e as OFs são parte do mesmo contexto de negócio).

**Decisão**: NÃO criar uma feature separada para OFs. O contexto de instrumento é o dono das OFs.

**Rationale**: A API já reflete isso (`/api/instrumentos/{id}/ordens-fornecimento`) e criar
uma feature separada quebraria a coesão sem ganho arquitetural.

### Estratégia de hooks

Para mutation (emitir, avançar status, registrar liquidação, registrar pagamento) o padrão
será hooks no estilo `{ execute, isLoading, error }` (mutation hooks), diferente do `useBuscarInstrumento`
que é um query hook com `refetch`.

**Decisão**: Criar um hook de query (`useListarOrdensForecimento`) com `refetch` e hooks de
mutation separados para cada operação. A página orquestrará os refetches após mutations.

### Refatoração do `CriarOrdemFornecimento.tsx`

O componente existente tem UX de dois passos (selecionar itens, depois quantidades) que é
aproveitável. Porém precisa:
- Remover campos inexistentes na API (`numeroEmpenho`, `tipoEmpenho`)
- Adicionar `valorUnitario` por item (obrigatório pela API)
- Mudar o callback `onSubmit` para disparar diretamente o use case via hook
- Corrigir tipagem para usar `ItemInstrumentoDetalhe` do domínio

**Decisão**: Refatorar o componente existente em vez de criar um novo.

### Validação de saldo

A API retorna erro 400 com `SALDO_INSUFICIENTE` quando o valor total excede o saldo.
O frontend valida preventivamente usando o `saldo_remanescente` da listagem.

**Decisão**: Implementar validação client-side no formulário E tratar o erro 400 no repositório.

---

## 4. Estrutura de entidades novas no domínio

Novos tipos a adicionar em `instrumentoContratual.ts`:

```typescript
// Status operacional da OF
export type StatusOrdemFornecimento = 
  | 'pedido_recebido' | 'em_separacao' | 'despachado' | 'entregue' | 'pago';

// Status de pagamento (null antes da liquidação)
export type StatusPagamento = 'pendente' | 'em_atraso' | 'pago' | null;

export interface ItemOrdemFornecimento {
  id: string;
  itemInstrumentoId: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeFornecida: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemFornecimento {
  id: string;
  codigo: number;
  instrumentoId: string;
  status: StatusOrdemFornecimento;
  dataRecebimento: string;
  dataEntrega: string | null;
  dataLiquidacao: string | null;
  prazoPagamento: string | null;
  dataPagamentoEfetivo: string | null;
  statusPagamento: StatusPagamento;
  numeroNfe: string | null;
  valorTotal: number;
  itens: ItemOrdemFornecimento[];
  criadoEm: string;
}

export interface ListagemOrdensFornecimento {
  instrumentoId: string;
  saldoRemanescente: number;
  ordensFornecimento: OrdemFornecimento[];
}
```

---

## 5. Input para emissão de OF

Novo tipo a adicionar em `criarContrato.ts` (ou arquivo separado):

```typescript
export interface ItemEmitirOrdemFornecimentoInput {
  itemInstrumentoId: string;
  quantidadeFornecida: number;
  valorUnitario: number;
}

export interface EmitirOrdemFornecimentoInput {
  instrumentoId: string;
  itens: ItemEmitirOrdemFornecimentoInput[];
}
```
