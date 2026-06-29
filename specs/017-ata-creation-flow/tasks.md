# Tarefas: Ajuste do Fluxo de Criação de Instrumento com ARP

**Entrada**: Documentos de design em `specs/017-ata-creation-flow/`
**Arquivo único modificado**: `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (sem dependências de tarefas incompletas)
- **[Story]**: Mapeamento para a história de usuário do spec.md
- Todas as tarefas são no mesmo arquivo — paralelismo é lógico, não físico

---

## Fase 1: Fundação (Pré-requisito para US2)

**Propósito**: Extensão da interface local `ItemContrato` — necessária para armazenar saldos por item. US1 e US3 podem ser feitas em paralelo pois não dependem desta mudança.

- [x] T001 Adicionar campos `saldoOrgao?: number` e `saldoCarona?: number` à interface `ItemContrato` em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`

**Checkpoint**: Interface compilando sem erros; itens manuais existentes não quebram (campos são opcionais).

---

## Fase 2: História de Usuário 1 — Padrão Não-Adesão (Prioridade: P1) 🎯 MVP

**Objetivo**: Ao selecionar uma ARP, o radio "É uma adesão?" exibe "Não" pré-selecionado; ARPs sem adesão desabilitam a opção "Sim".

**Teste Independente**: Selecionar uma ARP no formulário de contrato e verificar que o radio "Não" aparece marcado sem nenhuma interação adicional do usuário. Selecionar uma ARP com `aceitaAdesao: false` e verificar que a opção "Sim" está desabilitada.

### Implementação para História de Usuário 1

- [x] T002 [P] [US1] No `useEffect` que reage a `dadosContrato.arpOrigem` em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, adicionar `setIsAdesao((prev) => prev === undefined ? false : prev)` no início do bloco que executa quando `arpOrigem` é definido
- [x] T003 [P] [US1] No bloco JSX do `RadioGroupItem value="sim"` (etapa 2 — Dados do Contrato) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, adicionar `disabled={arpSelecionada?.aceitaAdesao === false}` e garantir que quando desabilitado o rótulo visual indique indisponibilidade

**Checkpoint**: US1 funcional — radio pré-seleciona "Não"; ARPs sem adesão bloqueiam a opção "Sim".

---

## Fase 3: História de Usuário 2 — Quantidade Limitada ao Saldo Disponível (Prioridade: P1)

**Objetivo**: Itens carregados da ARP exibem e respeitam o saldo disponível como limite máximo no campo de quantidade — `saldo_orgao` para contratos do órgão e `saldo_carona` para adesões.

**Teste Independente**: Selecionar uma ARP com itens de saldo conhecido, navegar até a etapa de itens, verificar que: (a) o `max` do input reflete o saldo correto para o tipo, (b) itens com saldo zero estão desabilitados, (c) trocar entre adesão/não-adesão recalcula os limites automaticamente.

**⚠️ Depende de**: T001 (campos `saldoOrgao` e `saldoCarona` na interface)

### Implementação para História de Usuário 2

- [x] T004 [US2] Em `carregarItensDaArp` dentro de `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, atualizar o mapeamento `ItemAta → ItemContrato` para: setar `quantidadeTotal: 0` (em vez de `item.qtdRegistrada`), `saldoOrgao: item.qtdRegistrada - item.qtdConsumidaOrgao`, e `saldoCarona: item.qtdParaCarona - item.qtdConsumidaCarona`
- [x] T005 [US2] Na tabela de itens da etapa 3 em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, para cada linha com ARP vinculada: calcular `saldoAtual = isAdesao ? (item.saldoCarona ?? Infinity) : (item.saldoOrgao ?? Infinity)` e aplicar `max={saldoAtual === Infinity ? undefined : saldoAtual}` e `disabled={saldoAtual === 0}` no input de quantidade (depende de T004)
- [x] T006 [US2] Abaixo do input de quantidade de cada item (quando vinculado a ARP) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, adicionar texto informativo `"Saldo: {saldoAtual} {item.unidadeMedida}"` com classe `text-xs text-muted-foreground`; quando `saldoAtual === 0`, substituir por `"Sem saldo disponível"` com classe `text-xs text-destructive` (depende de T005)

**Checkpoint**: US2 funcional — saldos corretos exibidos, `max` respeitado, zero-saldo desabilitado, troca adesão/orgão recalcula instantaneamente.

---

## Fase 4: História de Usuário 3 — Erro da API Visível na Etapa de Revisão (Prioridade: P2)

**Objetivo**: Quando a API rejeita o cadastro, o alerta de erro aparece diretamente na etapa 4 (Revisão e Confirmação) sem ocultar o formulário.

**Teste Independente**: Forçar um erro na submissão (payload inválido ou mock) e verificar que: (a) a etapa 4 permanece visível, (b) um alerta destrutivo com a mensagem da API é exibido, (c) nova tentativa limpa o alerta enquanto a requisição está em andamento.

### Implementação para História de Usuário 3

- [x] T007 [P] [US3] No JSX da etapa 4 (Revisão e Confirmação) em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, logo após o `Alert` de "Atenção" existente, adicionar bloco condicional `{erroSalvar && (<Alert variant="destructive"><WarningTriangle className="h-4 w-4" /><AlertTitle>Erro ao cadastrar contrato</AlertTitle><AlertDescription>{erroSalvar}</AlertDescription></Alert>)}`; garantir que o bloco `if (processandoCadastro || cadastroConcluido)` que substitui o formulário inteiro **não** seja a única via de exibição do erro

**Checkpoint**: US3 funcional — erro da API visível na etapa 4; formulário permanece íntegro após falha.

---

## Fase 5: Polimento & Verificação

**Propósito**: Validação final do fluxo completo e verificação do quickstart.

- [x] T008 Verificar manualmente os 5 cenários do `quickstart.md` em `specs/017-ata-creation-flow/quickstart.md`: (1) ARP selecionada → radio "Não" pré-marcado, (2) ARP sem adesão → "Sim" desabilitado, (3) Itens etapa 3 → `max` correto para orgão, (4) Trocar para adesão → `max` recalcular para carona, (5) Finalizar com erro → alerta na etapa 4

---

## Dependências & Ordem de Execução

### Dependências entre Tarefas

```
T001 → T004 → T005 → T006

T002  (independente de T001)
T003  (independente de T001)
T007  (independente de T001)

T008  (depende de todas: T001–T007)
```

### Dependências entre Histórias de Usuário

- **US1 (T002, T003)**: Independente — pode começar antes ou em paralelo com T001
- **US2 (T004, T005, T006)**: Depende de T001 (interface estendida)
- **US3 (T007)**: Independente — pode ser feita em qualquer ordem

---

## Oportunidades de Paralelismo

```
# Sessão 1: Iniciar em paralelo
T001  — Extender interface (fundação)
T002  — Auto-default isAdesao (US1, independente)
T003  — Desabilitar "Sim" na ARP sem adesão (US1, independente)
T007  — Alerta de erro na etapa 4 (US3, independente)

# Sessão 2: Após T001 estar completo
T004  — Calcular saldos em carregarItensDaArp (US2)

# Sessão 3: Sequencial após T004
T005  → T006  — Aplicar max + exibir saldo na tabela

# Final
T008  — Verificação do quickstart
```

---

## Estratégia de Implementação

### MVP First (US1 — única história de 1 tarefa de fundação + 2 de implementação)

1. Completar T001 (fundação — interface)
2. Completar T002 + T003 (US1 — radio default e bloqueio)
3. **PARAR e VALIDAR**: Testar US1 independentemente no browser

### Entrega Incremental

1. T001 → T002 + T003 → Validar US1 (MVP)
2. T004 → T005 → T006 → Validar US2
3. T007 → Validar US3
4. T008 → Verificação final e deploy

---

## Notas

- Todas as 8 tarefas são no mesmo arquivo — commits frequentes por tarefa evitam conflitos de merge
- T002 e T003 (US1) não dependem da extensão da interface — podem ser feitas antes de T001 se necessário
- T007 (US3) é completamente independente e pode ser o primeiro a ser implementado
- Os campos `saldoOrgao` e `saldoCarona` são `undefined` para itens manuais — lógica de `max` deve tratar `undefined` como "sem limite"
