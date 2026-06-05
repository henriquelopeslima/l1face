# Contratos: Ordens de Fornecimento

**Branch**: `011-criar-ordens-fornecimento` | **Data**: 2026-06-04

## IInstrumentosRepository — métodos novos

Extensão do contrato existente em
`src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`.

```typescript
// Adicionar à interface IInstrumentosRepository:

emitirOrdemFornecimento(input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento>;

listarOrdensFornecimento(instrumentoId: string): Promise<ListagemOrdensFornecimento>;

avancarStatusOrdemFornecimento(
  input: AvancarStatusOrdemFornecimentoInput
): Promise<OrdemFornecimento>;

registrarLiquidacaoOrdemFornecimento(
  input: RegistrarLiquidacaoInput
): Promise<OrdemFornecimento>;

registrarPagamentoOrdemFornecimento(
  input: RegistrarPagamentoInput
): Promise<OrdemFornecimento>;
```

---

## Contratos de Use Cases

### EmitirOrdemFornecimentoUseCase

```typescript
class EmitirOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  execute(input: EmitirOrdemFornecimentoInput): Promise<OrdemFornecimento>
}
```

**Pré-condições**:
- `input.itens` deve ter ao menos 1 item
- Cada `itemInstrumentoId` deve pertencer ao instrumento

**Pós-condições**:
- OF criada com status `pedido_recebido`
- `dataRecebimento` preenchida automaticamente pela API

---

### ListarOrdensFornecimentoUseCase

```typescript
class ListarOrdensFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  execute(instrumentoId: string): Promise<ListagemOrdensFornecimento>
}
```

---

### AvancarStatusOrdemFornecimentoUseCase

```typescript
class AvancarStatusOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  execute(input: AvancarStatusOrdemFornecimentoInput): Promise<OrdemFornecimento>
}
```

**Pré-condições**:
- Transição deve ser sequencial (próximo status na fila)
- `status` deve ser `em_separacao`, `despachado` ou `entregue`

---

### RegistrarLiquidacaoOrdemFornecimentoUseCase

```typescript
class RegistrarLiquidacaoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  execute(input: RegistrarLiquidacaoInput): Promise<OrdemFornecimento>
}
```

**Pré-condições**:
- OF deve estar com status `entregue`
- `numeroNfe` deve ter exatamente 44 dígitos

---

### RegistrarPagamentoOrdemFornecimentoUseCase

```typescript
class RegistrarPagamentoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  execute(input: RegistrarPagamentoInput): Promise<OrdemFornecimento>
}
```

**Pré-condições**:
- Liquidação já deve ter sido registrada (API valida e retorna 422 caso contrário)

---

## Contratos dos Hooks de Apresentação

### useListarOrdensFornecimento (query hook)

```typescript
interface UseListarOrdensFornecimentoResult {
  dados: ListagemOrdensFornecimento | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useListarOrdensFornecimento(instrumentoId: string): UseListarOrdensFornecimentoResult
```

---

### useEmitirOrdemFornecimento (mutation hook)

```typescript
interface UseEmitirOrdemFornecimentoResult {
  emitir: (input: EmitirOrdemFornecimentoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function useEmitirOrdemFornecimento(): UseEmitirOrdemFornecimentoResult
```

---

### useAvancarStatusOrdemFornecimento (mutation hook)

```typescript
interface UseAvancarStatusResult {
  avancar: (input: AvancarStatusOrdemFornecimentoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function useAvancarStatusOrdemFornecimento(): UseAvancarStatusResult
```

---

### useRegistrarLiquidacaoOrdemFornecimento (mutation hook)

```typescript
interface UseRegistrarLiquidacaoResult {
  registrar: (input: RegistrarLiquidacaoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function useRegistrarLiquidacaoOrdemFornecimento(): UseRegistrarLiquidacaoResult
```

---

### useRegistrarPagamentoOrdemFornecimento (mutation hook)

```typescript
interface UseRegistrarPagamentoResult {
  registrar: (input: RegistrarPagamentoInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function useRegistrarPagamentoOrdemFornecimento(): UseRegistrarPagamentoResult
```
