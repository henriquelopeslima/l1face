# Data Model: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

## `CriarEmpenhoInput` (domain/entities/criarContrato.ts)

Entidade de entrada do Use Case `CriarEmpenhoUseCase`, usada para montar o payload de `POST /api/instrumentos/empenhos`.

```ts
export interface CriarEmpenhoInput {
  ataId?: string | null;
  isAdesao?: boolean | null;
  numeroPncp?: string | null;
  numero: string;                    // NOVO — obrigatório, alinhado ao backend
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl?: string | null;
  itens?: ItemInstrumentoInput[];
}
```

**Mudança**: adição do campo `numero: string` (não opcional). `ItemInstrumentoInput` (compartilhado com contrato) já possui `itemAtaId?: string` — não precisa de alteração de tipo, apenas passa a ser preenchido e mapeado no fluxo de empenho.

**Validação**:
- `numero` não pode ser string vazia — reforçado na camada `presentation` antes do envio (o backend rejeita com 422 se o campo estiver ausente do JSON, mas aceita qualquer string não vazia; não há validação de formato no backend).
- Quando `ataId` está definido, cada item de `itens` DEVE ter `itemAtaId` preenchido com um item pertencente à ARP — reforçado na UI ao restringir a origem dos itens à lista carregada da ARP (o usuário nunca consegue montar um item sem `itemAtaId` quando uma ARP está selecionada).

## Estado local de `CadastrarNotaEmpenho.tsx` — `ItemLinha`

```ts
interface ItemLinha {
  id: string;
  itemAtaId?: string;       // NOVO — referência ao ItemAta de origem, quando vinculado
  descricao: string;
  unidadeMedida: string;
  quantidade: string;
  valorUnitario: string;
  saldoOrgao?: number;      // NOVO — saldo remanescente do item na ARP (órgão)
  saldoCarona?: number;     // NOVO — saldo remanescente do item na ARP (carona/adesão)
}
```

**Origem dos novos campos**: preenchidos a partir de `ItemAta` (`atas/domain/entities/ataDetalhes.ts`, já existente e sem alteração):

```ts
export interface ItemAta {
  id: string;
  numeroItem: number;
  descricao: string;
  unidadeMedida: string;
  valorEstimado: number;
  qtdOrgao: number;
  qtdCarona: number;
  qtdSaldoOrgao: number;
  qtdSaldoCarona: number;
}
```

Mapeamento ao carregar itens da ARP (mesmo padrão de `carregarItensDaArp` em `CadastrarContrato.tsx`):

| `ItemLinha` (novo/alterado) | Origem em `ItemAta` |
|---|---|
| `itemAtaId` | `item.id` |
| `descricao` | `item.descricao` |
| `unidadeMedida` | `item.unidadeMedida` |
| `valorUnitario` | `item.valorEstimado` (formatado como string BRL) |
| `saldoOrgao` | `item.qtdSaldoOrgao` |
| `saldoCarona` | `item.qtdSaldoCarona` |
| `quantidade` | `''` (usuário preenche, limitado ao saldo aplicável) |

## Máquina de estados: vínculo de itens à ARP no formulário

```
[Nenhuma ARP selecionada] --seleciona ARP--> [Carregando itens da ARP]
[Carregando itens da ARP] --sucesso (itens > 0)--> [Itens vinculados à ARP: edição bloqueada, quantidade limitada por saldo]
[Carregando itens da ARP] --sucesso (itens = 0)--> [Itens vinculados à ARP: lista vazia, alerta "ARP sem itens"]
[Carregando itens da ARP] --falha--> [Erro ao carregar: alerta + itens vazios, ARP permanece selecionada]
[Itens vinculados à ARP] --troca de ARP--> [Carregando itens da ARP] (substitui itens anteriores)
[Itens vinculados à ARP] --desfaz seleção (Nenhuma ARP)--> [Itens manuais livres] (limpa itens)
[Erro ao carregar] --troca ou remove ARP--> [Carregando itens da ARP] | [Itens manuais livres]
```

Nenhuma persistência de estado entre sessões é necessária — tudo vive no estado local do componente até o envio do formulário.
