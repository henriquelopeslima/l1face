# Tarefas: Atualização do Fluxo de Ordens de Fornecimento

**Entrada**: Documentos de design em `specs/012-of-flow-update/`  
**Branch**: `012-of-flow-update`

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1–US5)

---

## Fase 1: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Atualizar as camadas de domínio e dados que todos os user stories dependem. **Nenhuma história de usuário pode começar até esta fase estar completa.**

- [X] T001 Atualizar entidades e inputs em `src/features/instrumentos/domain/entities/instrumentoContratual.ts`: adicionar campos `prazoEntrega`, `dataSeparacao`, `dataDespacho`, `codigoRastreio`, `numeroNfDespacho` à interface `OrdemFornecimento`; remover `valorUnitario` de `ItemEmitirOFInput`; adicionar `dataRecebimento` e `prazoEntrega` a `EmitirOrdemFornecimentoInput`; remover `AvancarStatusOrdemFornecimentoInput`; adicionar `IniciarSeparacaoInput`, `RegistrarDespachoInput`, `ConfirmarEntregaInput`
- [X] T002 [P] Atualizar contrato do repositório em `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`: remover `avancarStatusOrdemFornecimento`; adicionar `iniciarSeparacaoOrdemFornecimento`, `registrarDespachoOrdemFornecimento`, `confirmarEntregaOrdemFornecimento` com seus respectivos tipos de entrada e retorno `Promise<OrdemFornecimento>`
- [X] T003 [P] Atualizar mapper em `src/features/instrumentos/data/mappers/ordemFornecimentoMappers.ts`: adicionar campos `prazo_entrega`, `data_separacao`, `data_despacho`, `codigo_rastreio`, `numero_nf_despacho` ao tipo interno `ApiOrdemFornecimento` e mapeá-los na função `mapApiOrdemFornecimentoToOrdemFornecimento`

**Checkpoint**: As camadas de domínio e data estão alinhadas — a implementação das histórias de usuário pode começar.

---

## Fase 2: História de Usuário 1 — Emitir OF com novos campos (Prioridade: P1) 🎯 MVP

**Objetivo**: O formulário de criação de OF passa a enviar `data_recebimento` e `prazo_entrega` e não envia mais `valor_unitario`. O valor total é calculado pelo backend.

**Teste Independente**: Abrir o dialog de emissão de OF, preencher data de recebimento e prazo de entrega, selecionar um item com quantidade, confirmar — a OF é criada com status `pedido_recebido` e o valor total é exibido conforme retornado pelo backend.

- [X] T004 [US1] Atualizar método `emitirOrdemFornecimento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: remover `valor_unitario` do body do request; adicionar `data_recebimento: input.dataRecebimento` e `prazo_entrega: input.prazoEntrega`; adicionar tratamento para erro `QUANTIDADE_INSUFICIENTE` (status 422)
- [X] T005 [US1] Atualizar componente `src/features/instrumentos/presentation/components/CriarOrdemFornecimento.tsx`: remover campo "Número do Empenho" e a função `gerarNumeroEmpenho`; adicionar campo de date input "Prazo de Entrega" obrigatório no Passo 1; remover colunas "Valor Unit." e "Valor Total" individual da tabela do Passo 2; remover linha de total da OF; remover campo `valorUnitario` do estado `ItemOFFormulario`; adicionar estado `prazoEntrega: string`; incluir `dataRecebimento` e `prazoEntrega` no payload enviado ao use case; adicionar validação frontend: exibir erro se `prazoEntrega < dataRecebimento` antes de enviar
- [X] T006 [US1] Atualizar fixture do teste em `src/features/instrumentos/domain/useCases/EmitirOrdemFornecimentoUseCase.test.ts`: remover `valorUnitario` do objeto de input dos itens; adicionar `dataRecebimento` e `prazoEntrega` ao input

**Checkpoint**: A emissão de OF está totalmente funcional com os novos campos. A criação pode ser testada de ponta a ponta.

---

## Fase 3: História de Usuário 2 — Iniciar Separação da OF (Prioridade: P2)

**Objetivo**: O licitante pode avançar uma OF de `pedido_recebido` para `em_separacao` informando `data_separacao`.

**Teste Independente**: Com uma OF no status `pedido_recebido`, abrir o formulário inline de separação, informar uma data válida e confirmar — a OF exibe status `em_separacao` e a data de separação registrada.

- [X] T007 [P] [US2] Criar use case `src/features/instrumentos/domain/useCases/IniciarSeparacaoOrdemFornecimentoUseCase.ts`: classe com construtor recebendo `IInstrumentosRepository`, método `execute(input: IniciarSeparacaoInput): Promise<OrdemFornecimento>` delegando ao repositório
- [X] T008 [P] [US2] Criar teste `src/features/instrumentos/domain/useCases/IniciarSeparacaoOrdemFornecimentoUseCase.test.ts`: verificar que o repositório é chamado com o input correto e que a OF retornada é propagada sem modificação
- [X] T009 [US2] Adicionar método `iniciarSeparacaoOrdemFornecimento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: `PATCH /api/ordens-fornecimento/{id}/separacao` com body `{ data_separacao }`; tratar erros 401, 404, 422 (`TRANSICAO_STATUS_INVALIDA` → "Operação não permitida para o status atual desta ordem.", `DATA_CRONOLOGICA_INVALIDA` → mensagem amigável)
- [X] T010 [US2] Criar hook `src/features/instrumentos/presentation/hooks/useIniciarSeparacaoOrdemFornecimento.ts`: padrão dos hooks existentes com `useState` para `isLoading` e `error`; `useCallback` para o método `iniciar(input: IniciarSeparacaoInput)`; instanciar `IniciarSeparacaoOrdemFornecimentoUseCase`

**Checkpoint**: O hook de separação está pronto. A UI das páginas pode consumir `useIniciarSeparacaoOrdemFornecimento`.

---

## Fase 4: História de Usuário 3 — Registrar Despacho da OF (Prioridade: P2)

**Objetivo**: O licitante pode registrar o despacho de uma OF com status `em_separacao` informando `data_despacho` (obrigatório) e opcionalmente `codigo_rastreio` e `numero_nf`.

**Teste Independente**: Com uma OF no status `em_separacao`, abrir o formulário inline de despacho, informar data de despacho e opcionalmente código de rastreio, confirmar — a OF exibe status `despachado` e os dados de rastreio.

- [X] T011 [P] [US3] Criar use case `src/features/instrumentos/domain/useCases/RegistrarDespachoOrdemFornecimentoUseCase.ts`: mesmo padrão do T007, com `RegistrarDespachoInput`
- [X] T012 [P] [US3] Criar teste `src/features/instrumentos/domain/useCases/RegistrarDespachoOrdemFornecimentoUseCase.test.ts`: verificar delegação correta ao repositório
- [X] T013 [US3] Adicionar método `registrarDespachoOrdemFornecimento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: `PATCH /api/ordens-fornecimento/{id}/despacho` com body `{ data_despacho, codigo_rastreio?, numero_nf? }`; tratar erros 401, 404, 422 (`TRANSICAO_STATUS_INVALIDA`, `CAMPO_OBRIGATORIO_AUSENTE`)
- [X] T014 [US3] Criar hook `src/features/instrumentos/presentation/hooks/useRegistrarDespachoOrdemFornecimento.ts`: padrão dos hooks existentes; método `registrar(input: RegistrarDespachoInput)`; instanciar `RegistrarDespachoOrdemFornecimentoUseCase`

**Checkpoint**: O hook de despacho está pronto. A UI das páginas pode consumir `useRegistrarDespachoOrdemFornecimento`.

---

## Fase 5: História de Usuário 4 — Confirmar Entrega da OF (Prioridade: P2)

**Objetivo**: O licitante confirma a entrega informando `data_entrega` e `prazo_pagamento`. A OF avança para `entregue` e `status_pagamento` passa a `pendente`.

**Teste Independente**: Com uma OF no status `despachado`, abrir o formulário inline de entrega, informar data de entrega e prazo de pagamento, confirmar — a OF exibe status `entregue` e `status_pagamento: pendente`.

- [X] T015 [P] [US4] Criar use case `src/features/instrumentos/domain/useCases/ConfirmarEntregaOrdemFornecimentoUseCase.ts`: mesmo padrão, com `ConfirmarEntregaInput`
- [X] T016 [P] [US4] Criar teste `src/features/instrumentos/domain/useCases/ConfirmarEntregaOrdemFornecimentoUseCase.test.ts`: verificar delegação correta ao repositório
- [X] T017 [US4] Adicionar método `confirmarEntregaOrdemFornecimento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: `PATCH /api/ordens-fornecimento/{id}/entrega` com body `{ data_entrega, prazo_pagamento }`; tratar erros 401, 404, 422 (`TRANSICAO_STATUS_INVALIDA`, `DATA_CRONOLOGICA_INVALIDA`)
- [X] T018 [US4] Criar hook `src/features/instrumentos/presentation/hooks/useConfirmarEntregaOrdemFornecimento.ts`: padrão dos hooks existentes; método `confirmar(input: ConfirmarEntregaInput)`; instanciar `ConfirmarEntregaOrdemFornecimentoUseCase`

**Checkpoint**: Os 3 hooks de transição de status estão prontos. As páginas podem ser refatoradas.

---

## Fase 6: História de Usuário 5 — Registrar Pagamento Efetivo (Prioridade: P3)

**Objetivo**: Corrigir o fluxo de pagamento para não exigir liquidação prévia. A OF deve estar no status `entregue` para que o pagamento seja registrado.

**Teste Independente**: Com uma OF no status `entregue` (sem liquidação), abrir o formulário de pagamento, informar a data, confirmar — a OF transita para `pago` e `status_pagamento: pago`.

- [X] T019 [US5] Corrigir método `registrarPagamentoOrdemFornecimento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: remover verificação do erro `PAGAMENTO_REQUER_LIQUIDACAO`; adicionar tratamento de `TRANSICAO_STATUS_INVALIDA` com mensagem "Pagamento só pode ser registrado após a entrega ser confirmada."
- [X] T020 [US5] Corrigir hook `src/features/instrumentos/presentation/hooks/useRegistrarPagamentoOrdemFornecimento.ts`: atualizar mensagem de erro padrão para refletir que o pré-requisito é o status `entregue` (não a liquidação)

**Checkpoint**: O ciclo completo emissão → pagamento está funcional sem exigir liquidação.

---

## Fase 7: Polimento & Limpeza

**Propósito**: Refatorar as páginas de detalhe para usar os novos hooks, remover o fluxo genérico de "avançar status" e remover o formulário de liquidação da UI.

- [X] T021 Refatorar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: remover imports e uso de `useAvancarStatusOrdemFornecimento`, `useRegistrarLiquidacaoOrdemFornecimento`, `getProximoStatus`, `ACAO_LABELS`, `CICLO_ORDER`; adicionar imports de `useIniciarSeparacaoOrdemFornecimento`, `useRegistrarDespachoOrdemFornecimento`, `useConfirmarEntregaOrdemFornecimento`; adicionar estados para cada formulário inline (`separacaoOpenId/Form`, `despachoOpenId/Form`, `entregaOpenId/Form`); substituir o botão genérico de "Avançar Status" e o modal de confirmação por 3 formulários inline condicionais baseados no status da OF; remover o formulário inline de liquidação e seus estados; manter o formulário de pagamento existente (já correto para US5)
- [X] T022 Refatorar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`: aplicar as mesmas mudanças da T021
- [X] T023 [P] Remover arquivo `src/features/instrumentos/domain/useCases/AvancarStatusOrdemFornecimentoUseCase.ts`
- [X] T024 [P] Remover arquivo `src/features/instrumentos/domain/useCases/AvancarStatusOrdemFornecimentoUseCase.test.ts`
- [X] T025 [P] Remover arquivo `src/features/instrumentos/presentation/hooks/useAvancarStatusOrdemFornecimento.ts`

**Checkpoint Final**: O fluxo de OF completo está operacional. Todos os TypeScript errors resolvidos. `useRegistrarLiquidacaoOrdemFornecimento` permanece no código mas sem referência na UI.

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fase 1 (Fundação)**: Sem dependências — iniciar imediatamente
- **Fases 2–6 (User Stories)**: Todas dependem da Fase 1 completa
  - US1 (T004–T006): Pode começar após T001 + T003
  - US2 (T007–T010): Pode começar após T001 + T002; T009 depende de T002
  - US3 (T011–T014): Pode começar após T001 + T002; T013 depende de T002
  - US4 (T015–T018): Pode começar após T001 + T002; T017 depende de T002
  - US5 (T019–T020): Pode começar após T001 + T003 (mapper atualizado)
- **Fase 7 (Polimento)**: T021 e T022 dependem de T010 + T014 + T018 + T020; T023–T025 dependem de T021 + T022

### Oportunidades de Paralelismo

**Na Fase 1:** T002 e T003 são independentes entre si (arquivos distintos) e podem ser feitos em paralelo após T001.

**Nas Fases 2–6:** Os use cases de US2, US3 e US4 são completamente independentes entre si e podem ser criados em paralelo:
```
Paralelo: T007 (Separação UseCase) | T011 (Despacho UseCase) | T015 (Entrega UseCase)
Paralelo: T008 (Separação Test)    | T012 (Despacho Test)    | T016 (Entrega Test)
```

**Na Fase 7:** T023, T024 e T025 (remoções de arquivos) são independentes entre si e podem ser feitos em paralelo após T021 e T022.

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 1: Fundação (T001–T003)
2. Concluir US1 (T004–T006)
3. **Parar e validar**: Emissão de OF funciona com os novos campos
4. Continuar com US2 em diante

### Entrega Incremental

1. Fase 1 → US1 → validar emissão
2. Adicionar US2 → validar separação
3. Adicionar US3 → validar despacho
4. Adicionar US4 → validar entrega
5. Adicionar US5 → validar pagamento
6. Fase 7: Polimento das páginas e limpeza

---

## Notas

- T001 é a única tarefa que bloqueia absolutamente todas as outras — prioridade máxima
- T021 e T022 são as tarefas mais complexas (páginas com muita lógica) — reservar mais tempo
- Os arquivos removidos em T023–T025 só devem ser deletados após T021/T022 garantirem que não há mais imports referenciando-os
- `useRegistrarLiquidacaoOrdemFornecimento.ts` e `RegistrarLiquidacaoOrdemFornecimentoUseCase.ts` **não** são removidos — apenas a UI que os referenciava é limpa
