# Research: Ajuste do Fluxo de Criação de Instrumento com ARP

## Decisão 1 — Onde calcular o saldo disponível por item

**Decisão**: Calcular o saldo diretamente na camada `presentation`, dentro de `carregarItensDaArp` ao mapear `ItemAta → ItemContrato`.

**Rationale**: O saldo é um valor derivado (subtração simples) exibido somente no formulário. Não é uma regra de negócio independente que precise ser testada isoladamente via Use Case. Mover para o domínio adicionaria uma abstração sem benefício mensurável para este caso.

**Alternativas consideradas**: Criar um Use Case `CalcularSaldoItemAtaUseCase` — rejeitado porque o cálculo é trivial (`qtdRegistrada - qtdConsumidaOrgao`) e já existe o `GetAtaUseCase` que retorna todos os campos necessários.

---

## Decisão 2 — Como armazenar o saldo no estado local do formulário

**Decisão**: Adicionar dois campos opcionais (`saldoOrgao?: number`, `saldoCarona?: number`) à interface local `ItemContrato`. São `undefined` para itens adicionados manualmente (sem limite) e preenchidos quando o item vem de uma ARP.

**Rationale**: Evita estado paralelo separado (ex.: `Map<itemId, saldo>`) que precisaria ser sincronizado com `itensContrato`. Co-localizando os dados em cada item o formulário fica mais simples e o `max` de cada input deriva diretamente do próprio item.

**Alternativas consideradas**: Estado separado `Record<string, { saldoOrgao: number; saldoCarona: number }>` — rejeitado por acoplamento implícito e risco de dessincronização.

---

## Decisão 3 — Comportamento do radio "É uma adesão?" ao selecionar ARP

**Decisão**: Quando `arpOrigem` é definido pela primeira vez (de `undefined/none` para um valor), auto-setar `isAdesao = false` somente se `isAdesao` ainda for `undefined`. Quando a ARP não aceita adesão (`aceitaAdesao: false`), forçar `isAdesao = false` e desabilitar a opção "Sim".

**Rationale**: Responde ao requisito RF-001 (padrão não-adesão) e RF-002 (ARP sem adesão). O reset condicional preserva escolhas explícitas do usuário ao trocar de ARP (caso o usuário já tivesse selecionado "Sim" conscientemente).

**Alternativas consideradas**: Sempre resetar para `false` ao trocar de ARP — rejeitado porque sobrescreve escolhas explícitas e pode surpreender o usuário.

---

## Decisão 4 — Onde exibir o erro da API

**Decisão**: Exibir `erroSalvar` diretamente na etapa 4 (Revisão e Confirmação), logo abaixo do alerta de "Atenção" existente. O estado de processamento (`processandoCadastro || cadastroConcluido`) não deve mais ser a única via de exibição do erro.

**Rationale**: O usuário já está na etapa 4 quando clica em "Finalizar Cadastro". Se a API rejeita, o formulário deve permanecer visível com o erro — não deve ocultá-lo atrás da tela de processamento.

**Alternativas consideradas**: Toast/snackbar — rejeitado porque desaparece automaticamente e o usuário pode perder a mensagem antes de entender o que corrigir.
