# Contratos de Interface: Ordens de Fornecimento

## Contratos de Entrada (Use Cases → Repository)

### IniciarSeparacaoInput
```typescript
{
  id: string;             // UUID da OF
  dataSeparacao: string;  // ISO date (YYYY-MM-DD), >= dataRecebimento
}
```

### RegistrarDespachoInput
```typescript
{
  id: string;                    // UUID da OF
  dataDespacho: string;          // ISO date (YYYY-MM-DD), >= dataSeparacao
  codigoRastreio?: string | null; // opcional
  numeroNf?: string | null;       // opcional
}
```

### ConfirmarEntregaInput
```typescript
{
  id: string;             // UUID da OF
  dataEntrega: string;    // ISO date (YYYY-MM-DD), >= dataDespacho
  prazoPagamento: string; // ISO date (YYYY-MM-DD), >= dataEntrega
}
```

### EmitirOrdemFornecimentoInput (atualizado)
```typescript
{
  instrumentoId: string;
  dataRecebimento: string;    // ISO date (YYYY-MM-DD)
  prazoEntrega: string;       // ISO date (YYYY-MM-DD), >= dataRecebimento
  itens: Array<{
    itemInstrumentoId: string;
    quantidadeFornecida: number; // > 0
    // valorUnitario REMOVIDO
  }>;
}
```

## Contratos de Saída (API → Domínio)

Todos os endpoints de transição de status retornam `OrdemFornecimento` completa:

```typescript
interface OrdemFornecimento {
  id: string;
  codigo: number;
  instrumentoId: string;
  status: 'pedido_recebido' | 'em_separacao' | 'despachado' | 'entregue' | 'pago';
  dataRecebimento: string;
  prazoEntrega: string;              // NOVO
  dataSeparacao: string | null;      // NOVO
  dataDespacho: string | null;       // NOVO
  codigoRastreio: string | null;     // NOVO
  numeroNfDespacho: string | null;   // NOVO
  dataEntrega: string | null;
  prazoPagamento: string | null;
  dataLiquidacao: string | null;
  dataPagamentoEfetivo: string | null;
  statusPagamento: 'pendente' | 'em_atraso' | 'pago' | null;
  numeroNfe: string | null;
  valorTotal: number;
  itens: ItemOrdemFornecimento[];
  criadoEm: string;
}
```

## Mapeamento de Erros (API → Mensagem de usuário)

| Código de erro API           | Mensagem exibida ao usuário                                         |
|------------------------------|---------------------------------------------------------------------|
| `TRANSICAO_STATUS_INVALIDA`  | "Operação não permitida para o status atual desta ordem."           |
| `DATA_CRONOLOGICA_INVALIDA`  | Mensagem específica do campo (ex: "Prazo de entrega inválido.")     |
| `CAMPO_OBRIGATORIO_AUSENTE`  | "Preencha todos os campos obrigatórios."                            |
| `SALDO_INSUFICIENTE`         | "Saldo do instrumento insuficiente para emitir esta OF."            |
| `ITEM_NAO_PERTENCE_AO_CONTRATO` | mensagem do backend                                              |
| `QUANTIDADE_INSUFICIENTE`    | mensagem do backend                                                 |
| 401                          | "Sessão expirada. Faça login novamente."                            |
| 404                          | "Ordem de fornecimento não encontrada."                             |
| network error                | "Serviço indisponível. Verifique sua conexão e tente novamente."    |

## Endpoints Consumidos (resumo)

| Método | Path                                                         | Input principal               |
|--------|--------------------------------------------------------------|-------------------------------|
| POST   | `/api/instrumentos/{id}/ordens-fornecimento`                 | `EmitirOrdemFornecimentoInput`|
| PATCH  | `/api/ordens-fornecimento/{id}/separacao`                    | `IniciarSeparacaoInput`       |
| PATCH  | `/api/ordens-fornecimento/{id}/despacho`                     | `RegistrarDespachoInput`      |
| PATCH  | `/api/ordens-fornecimento/{id}/entrega`                      | `ConfirmarEntregaInput`       |
| PATCH  | `/api/ordens-fornecimento/{id}/pagamento`                    | `RegistrarPagamentoInput`     |
