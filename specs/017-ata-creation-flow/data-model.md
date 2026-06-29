# Data Model: Ajuste do Fluxo de Criação de Instrumento com ARP

## Entidades Modificadas (estado local do formulário)

### `ItemContrato` (interface local em `CadastrarContrato.tsx`)

Adição de dois campos opcionais para armazenar o saldo disponível quando o item vem de uma ARP:

```
ItemContrato {
  id: string
  descricao: string
  unidadeMedida: string
  quantidadeTotal: number
  valorUnitario: number
  valorTotal: number
  saldoOrgao?: number       // novo — qtdRegistrada - qtdConsumidaOrgao (somente itens de ARP)
  saldoCarona?: number      // novo — qtdParaCarona - qtdConsumidaCarona (somente itens de ARP)
}
```

**Regras de derivação**:
- `saldoOrgao = item.qtdRegistrada - item.qtdConsumidaOrgao`
- `saldoCarona = item.qtdParaCarona - item.qtdConsumidaCarona`
- Ambos são `undefined` para itens criados manualmente (sem vínculo com ARP).

**Uso em tempo de execução**:
- `max` do input de quantidade quando não é adesão: `item.saldoOrgao ?? undefined` (sem limite)
- `max` do input de quantidade quando é adesão: `item.saldoCarona ?? undefined` (sem limite)
- Item desabilitado quando: `(isAdesao && item.saldoCarona === 0) || (!isAdesao && item.saldoOrgao === 0)`

---

## Entidades Existentes (sem modificação)

### `ItemAta` (domain entity — `src/features/atas/domain/entities/ataDetalhes.ts`)

Já expõe todos os campos necessários. Nenhuma alteração:

```
ItemAta {
  id: string
  numeroItem: number
  descricao: string
  unidadeMedida: string
  valorEstimado: number
  qtdRegistrada: number
  qtdParaCarona: number
  qtdConsumidaOrgao: number    // usado para calcular saldoOrgao
  qtdConsumidaCarona: number   // usado para calcular saldoCarona
}
```

### `AtaDetalhes` (domain entity — `src/features/atas/domain/entities/ataDetalhes.ts`)

Campo relevante já existe:

```
AtaDetalhes {
  ...
  aceitaAdesao: boolean   // usado para desabilitar opção "Sim" no radio de adesão
  itens: ItemAta[]
}
```

---

## Estado do Componente (mudanças em `CadastrarContrato.tsx`)

| Estado | Tipo atual | Tipo após mudança | Motivo |
|--------|-----------|-------------------|--------|
| `isAdesao` | `boolean \| undefined` | sem mudança de tipo | Inicializado como `undefined`; auto-setado para `false` na seleção da ARP |
| `itensContrato` | `ItemContrato[]` | `ItemContrato[]` (com `saldoOrgao?` e `saldoCarona?`) | Adicionar saldos no mapeamento da ARP |

---

## Lógica de Transição de Estado

```
Evento: usuário seleciona ARP de origem
  → isAdesao === undefined  →  isAdesao = false  (auto-default)
  → isAdesao definido        →  sem alteração     (respeita escolha explícita)
  → ata.aceitaAdesao === false → isAdesao = false, opção "Sim" desabilitada

Evento: carregarItensDaArp(ataId)
  → para cada ItemAta:
       saldoOrgao = item.qtdRegistrada - item.qtdConsumidaOrgao
       saldoCarona = item.qtdParaCarona - item.qtdConsumidaCarona
  → itensContrato preenchidos com saldos calculados

Evento: usuário troca isAdesao (Sim ↔ Não)
  → os campos saldoOrgao/saldoCarona já estão nos itens — o max do input se
     recalcula automaticamente via render (nenhuma ação extra necessária)

Evento: usuário clica "Finalizar Cadastro"
  → API retorna erro  →  erroSalvar exibido na etapa 4 (Revisão)
  → API retorna sucesso → fluxo de sucesso normal
```
