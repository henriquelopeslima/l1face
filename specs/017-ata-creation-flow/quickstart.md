# Quickstart: Ajuste do Fluxo de Criação de Instrumento com ARP

## Arquivo principal

**Único arquivo modificado** (toda a feature é presentation-layer):

```
src/features/instrumentos/presentation/components/CadastrarContrato.tsx
```

Nenhuma nova camada de domínio, repositório ou hook é necessária. As entidades de domínio existentes já expõem os campos corretos.

---

## Mudanças por seção do componente

### 1. Interface `ItemContrato`

Adicionar campos opcionais de saldo:

```typescript
interface ItemContrato {
  id: string
  descricao: string
  unidadeMedida: string
  quantidadeTotal: number
  valorUnitario: number
  valorTotal: number
  saldoOrgao?: number    // novo
  saldoCarona?: number   // novo
}
```

### 2. Função `carregarItensDaArp`

Atualizar o mapeamento para calcular e armazenar os saldos:

```typescript
const carregarItensDaArp = useCallback(async (ataId: string) => {
  // ...
  const ata = await getAtaUseCase.execute(ataId);
  setItensContrato(
    ata.itens.map((item) => ({
      id: `arp-item-${item.id}`,
      descricao: item.descricao,
      unidadeMedida: item.unidadeMedida,
      quantidadeTotal: 0,                                        // começa em 0 (usuário informa)
      valorUnitario: item.valorEstimado,
      valorTotal: 0,
      saldoOrgao: item.qtdRegistrada - item.qtdConsumidaOrgao,   // novo
      saldoCarona: item.qtdParaCarona - item.qtdConsumidaCarona, // novo
    }))
  );
  // ...
}, []);
```

> Nota: `quantidadeTotal` começa em `0` em vez de `item.qtdRegistrada`, pois o usuário deve informar a quantidade a contratar (dentro do saldo disponível).

### 3. Efeito de seleção da ARP

No `useEffect` que reage a `dadosContrato.arpOrigem`, adicionar auto-default de `isAdesao`:

```typescript
useEffect(() => {
  if (!dadosContrato.arpOrigem) {
    setErroItensArp(null);
    setIsAdesao(undefined);
    return;
  }
  // Auto-default: apenas se ainda não foi escolhido pelo usuário
  setIsAdesao((prev) => prev === undefined ? false : prev);
  void carregarItensDaArp(dadosContrato.arpOrigem);
}, [dadosContrato.arpOrigem, carregarItensDaArp]);
```

### 4. Desabilitar opção "Sim" quando ARP não aceita adesão

No bloco JSX do radio de adesão:

```typescript
const arpSelecionadaDetalhe = /* ata carregada — AtaDetalhes ou Ata com aceitaAdesao */;
const arpAceitaAdesao = arpSelecionada?.aceitaAdesao ?? true;

// No RadioGroupItem "sim":
<RadioGroupItem value="sim" id="adesao-sim" disabled={!arpAceitaAdesao} />
```

> Observação: `atas` (lista de `AtaListagemResponse`) já tem o campo `aceitaAdesao`. Não é necessário carregar os detalhes separadamente.

### 5. Campo de quantidade com max = saldo disponível

No input de quantidade da tabela de itens (etapa 3):

```typescript
const saldoAtual = isAdesao ? (item.saldoCarona ?? Infinity) : (item.saldoOrgao ?? Infinity);
const semSaldo = saldoAtual === 0;

<Input
  type="number"
  min="0"
  max={saldoAtual === Infinity ? undefined : saldoAtual}
  disabled={semSaldo}
  placeholder={semSaldo ? 'Sem saldo' : '0'}
  value={item.quantidadeTotal || ''}
  onChange={(e) => atualizarItem(item.id, 'quantidadeTotal', Number(e.target.value))}
/>
```

Exibir o saldo disponível próximo ao campo:

```typescript
{item.saldoOrgao !== undefined && (
  <p className="text-xs text-muted-foreground">
    Saldo: {saldoAtual} {item.unidadeMedida}
  </p>
)}
```

### 6. Exibição de erro na etapa de revisão (etapa 4)

No JSX da etapa 4, após o alerta de "Atenção", adicionar:

```typescript
{erroSalvar && (
  <Alert variant="destructive">
    <WarningTriangle className="h-4 w-4" />
    <AlertTitle>Erro ao cadastrar contrato</AlertTitle>
    <AlertDescription>{erroSalvar}</AlertDescription>
  </Alert>
)}
```

O `erroSalvar` já é resetado pelo hook `useCriarContrato` a cada nova chamada, então não é necessário limpeza manual.

---

## Verificação rápida

Após implementar, testar manualmente:

1. Selecionar uma ARP → verificar radio "Não" pré-selecionado
2. Selecionar ARP sem adesão (`aceitaAdesao: false`) → verificar opção "Sim" desabilitada
3. Avançar para itens → verificar `max` correto (saldo orgão) e itens sem saldo desabilitados
4. Trocar para "Sim" (adesão) → verificar recálculo automático dos `max` para saldo carona
5. Finalizar com payload inválido → verificar alert de erro na etapa 4 sem perder o formulário
