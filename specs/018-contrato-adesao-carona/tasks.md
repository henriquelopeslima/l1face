---
description: "Tarefas de implementação: Exibição de Saldo de Carona nos Itens do Contrato de Adesão"
---

# Tarefas: Exibição de Saldo de Carona nos Itens do Contrato de Adesão

**Entrada**: Documentos de design em `specs/018-contrato-adesao-carona/`  
**Pré-requisitos**: plan.md ✅ | spec.md ✅  
**Arquivo único afetado**: `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`  
**Sem setup ou fundação necessários** — nenhum arquivo novo, nenhuma dependência nova.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

---

## Fase 1: História de Usuário 1 — Itens mostram saldo correto por tipo de contrato (P1) 🎯 MVP

**Objetivo**: Quando `isAdesao = true`, os itens da ARP devem usar `saldoCarona` como limite e indicador de disponibilidade — não `saldoOrgao`.

**Teste Independente**: Abrir cadastro de contrato > selecionar ARP com `aceita_adesao = true` > marcar "É uma adesão? Sim" > avançar para Itens > verificar que itens com `qtd_para_carona = 0` aparecem como "Sem saldo" e que itens com `qtd_para_carona > 0` permitem entrada até o saldo de carona.

### Implementação para História de Usuário 1

- [x] T001 [US1] Substituir condição `item.saldoOrgao !== undefined` por `isItensVinculadosArp` na variável `semSaldo` (~linha 824) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`
- [x] T002 [US1] Substituir condição `item.saldoOrgao !== undefined` por `isItensVinculadosArp` no bloco de renderização do badge de saldo (~linha 856) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`

**Checkpoint**: Após T001 e T002, itens com `saldoCarona = 0` mas `saldoOrgao > 0` devem aparecer como "Sem saldo" quando `isAdesao = true`, e itens com `saldoCarona > 0` devem mostrar o saldo de carona correto. O limite do campo de quantidade (`max`) já está correto e não precisa de alteração.

---

## Fase 2: História de Usuário 2 — Indicação visual do tipo de saldo exibido (P2)

**Objetivo**: O cabeçalho da coluna de quantidade na tabela de itens deve mudar dinamicamente para "Qtd. / Saldo Carona" ou "Qtd. / Saldo Órgão" conforme o estado de adesão.

**Teste Independente**: Na etapa de itens do cadastro de contrato, verificar que o cabeçalho da coluna muda ao alternar entre "É uma adesão? Sim" e "Não". Sem ARP vinculada, o cabeçalho deve ser "Quantidade".

### Implementação para História de Usuário 2

- [x] T003 [US2] Substituir o `<TableHead>` estático "Quantidade" (~linha 813) por renderização dinâmica baseada em `isItensVinculadosArp` e `isAdesao` em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`:
  - Sem ARP: `"Quantidade"`
  - Com ARP, `isAdesao = true`: `"Qtd. / Saldo Carona"`
  - Com ARP, `isAdesao = false`: `"Qtd. / Saldo Órgão"`

**Checkpoint**: O cabeçalho deve refletir imediatamente o tipo de saldo ao alternar o campo de adesão (sem reload).

---

## Fase 3: História de Usuário 3 — Validação de avanço considera saldo de carona (P3)

**Objetivo**: A condição de avanço na etapa de itens deve ser semanticamente clara e usar o saldo correto ao filtrar itens disponíveis.

**Teste Independente**: Com uma ARP onde todos os itens têm `qtd_para_carona = 0`, marcar como adesão e verificar que o botão "Avançar" permanece desabilitado. Com ao menos um item com `qtd_para_carona > 0` e quantidade preenchida, o botão deve habilitar.

### Implementação para História de Usuário 3

- [x] T004 [US3] Em `validarEtapaItens`, substituir a condição `if (i.saldoOrgao === undefined) return true` por `if (!isItensVinculadosArp) return true` (~linha 257) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx` para tornar a intenção semântica explícita

**Checkpoint**: A validação do botão "Avançar" já funciona corretamente com carona (a lógica de `saldo = isAdesao ? saldoCarona : saldoOrgao` está correta); esta tarefa apenas torna a condição de guarda mais semântica.

---

## Fase Final: Polimento & Validação

- [ ] T005 Validar manualmente o fluxo completo conforme `specs/018-contrato-adesao-carona/plan.md` seção quickstart: (1) contrato como adesão com ARP que tem itens com carona disponível, (2) contrato como adesão com todos os itens sem carona, (3) contrato sem adesão — verificar que saldo do órgão é exibido normalmente
- [ ] T006 Verificar que alternar entre "adesão Sim" e "adesão Não" atualiza o cabeçalho da coluna e os badges de saldo imediatamente em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`

---

## Dependências & Ordem de Execução

### Dependências entre Tarefas

- **T001 e T002**: Independentes entre si, podem ser feitas em qualquer ordem (ambas na mesma função de renderização do row)
- **T003**: Independente de T001/T002 (cabeçalho vs. células)
- **T004**: Independente de todas (função `validarEtapaItens`)
- **T005 e T006**: Dependem da conclusão de T001–T004

### Oportunidades de Paralelismo

```bash
# T001, T002, T003 e T004 são todos no mesmo arquivo mas em regiões distintas —
# podem ser feitos em sequência rápida ou por um único desenvolvedor em ordem.
# Nenhum conflito de merge se feitos atomicamente.
```

---

## Estratégia de Implementação

### MVP (apenas US1 — T001 + T002)

1. Implementar T001 e T002 em `CadastrarContrato.tsx`
2. **PARAR e VALIDAR**: Testar manualmente que saldo de carona é respeitado como limite quando `isAdesao = true`
3. Fazer commit se estiver correto

### Entrega Completa

1. T001 + T002 → Saldo correto por tipo (US1)
2. T003 → Cabeçalho dinâmico (US2)
3. T004 → Validação semântica (US3)
4. T005 + T006 → Validação final

---

## Notas

- Todas as 4 tarefas de implementação (T001–T004) tocam o arquivo `CadastrarContrato.tsx` em regiões distintas: `semSaldo` (~L824), badge display (`~L856`), `<TableHead>` (~L813), e `validarEtapaItens` (~L257)
- Nenhum arquivo de `domain/` ou `data/` precisa ser alterado — a entidade `ItemAta` já possui todos os campos necessários
- Nenhum teste unitário novo de domínio é necessário (nenhum Use Case foi alterado)
