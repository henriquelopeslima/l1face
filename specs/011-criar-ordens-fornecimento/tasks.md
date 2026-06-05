# Tarefas: Ordens de Fornecimento

**Entrada**: Documentos de design em `specs/011-criar-ordens-fornecimento/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: A qual história de usuário esta tarefa pertence
- Caminhos relativos à raiz do repositório SPA: `src/features/instrumentos/`

---

## Fase 1: Fundação (bloqueante para todas as histórias)

**Propósito**: Infraestrutura central que DEVE ser concluída antes de qualquer história de usuário.
Adiciona as entidades, contratos, mappers e métodos de repositório das Ordens de Fornecimento.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até esta fase estar completa.

- [ ] T001 Adicionar tipos de OF a `src/features/instrumentos/domain/entities/instrumentoContratual.ts`: `StatusOrdemFornecimento`, `StatusPagamento`, `ItemOrdemFornecimento`, `OrdemFornecimento`, `ListagemOrdensFornecimento`, `EmitirOrdemFornecimentoInput`, `ItemEmitirOFInput`, `AvancarStatusOrdemFornecimentoInput`, `RegistrarLiquidacaoInput`, `RegistrarPagamentoInput`
- [ ] T002 [P] Adicionar 5 assinaturas de método de OF a `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`: `emitirOrdemFornecimento`, `listarOrdensFornecimento`, `avancarStatusOrdemFornecimento`, `registrarLiquidacaoOrdemFornecimento`, `registrarPagamentoOrdemFornecimento`
- [ ] T003 [P] Criar `src/features/instrumentos/data/mappers/ordemFornecimentoMappers.ts` com as funções `mapApiItemOrdemFornecimentoToItemOrdemFornecimento`, `mapApiOrdemFornecimentoToOrdemFornecimento` e `mapApiListagemOrdensToListagemOrdensFornecimento`
- [ ] T004 Implementar os 5 novos métodos em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts` usando os endpoints `POST /api/instrumentos/{id}/ordens-fornecimento`, `GET /api/instrumentos/{id}/ordens-fornecimento`, `PATCH /api/ordens-fornecimento/{id}/status`, `PATCH /api/ordens-fornecimento/{id}/liquidacao` e `PATCH /api/ordens-fornecimento/{id}/pagamento` com tratamento dos erros específicos (SALDO_INSUFICIENTE, ITEM_NAO_PERTENCE_AO_CONTRATO, TRANSICAO_STATUS_INVALIDA, LIQUIDACAO_REQUER_ENTREGA, PAGAMENTO_REQUER_LIQUIDACAO)

**Checkpoint**: Fundação pronta — tipos exportados, contrato compilando, mappers criados, repositório implementando os 5 métodos.

---

## Fase 2: US1 — Emitir Ordem de Fornecimento (Prioridade: P1) 🎯 MVP

**Objetivo**: Permitir que o licitante emita uma OF a partir da página de detalhes do instrumento,
selecionando itens, quantidades e valores unitários.

**Teste Independente**: Com um contrato que possui itens, clicar em "Emitir OF", selecionar ao menos
um item, informar quantidade e valor unitário e confirmar. A OF deve aparecer na seção de OFs da
página (ainda que seja o placeholder) com status `pedido_recebido`.

- [ ] T005 [P] [US1] Criar `src/features/instrumentos/domain/useCases/EmitirOrdemFornecimentoUseCase.ts` delegando para `repository.emitirOrdemFornecimento(input)`
- [ ] T006 [P] [US1] Criar `src/features/instrumentos/domain/useCases/EmitirOrdemFornecimentoUseCase.test.ts` com 100% de cobertura: sucesso retorna `OrdemFornecimento`, repositório lança erro e use case propaga
- [ ] T007 [US1] Criar `src/features/instrumentos/presentation/hooks/useEmitirOrdemFornecimento.ts` — mutation hook com método `emitir(input)`, `isLoading` e `error`; re-lança o erro após registrar no estado para permitir orquestração de `refetch` na página
- [ ] T008 [US1] Refatorar `src/features/instrumentos/presentation/components/CriarOrdemFornecimento.tsx`: remover props `contratoId`, `prazoEntrega` e fields `numeroEmpenho`/`tipoEmpenho`; trocar tipo de `itensContrato` por `ItemInstrumentoDetalhe[]`; adicionar campo `valorUnitario` (number) por item no Passo 2; mudar callback `onSubmit` para receber `EmitirOrdemFornecimentoInput` com `instrumentoId`; integrar o hook `useEmitirOrdemFornecimento` internamente
- [ ] T009 [US1] Atualizar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: adicionar botão "Emitir OF" no header ou no card de OFs que abre o dialog `CriarOrdemFornecimento`; passar `instrumentoId` e `itens` do instrumento para o componente; após emissão bem-sucedida emitir evento/callback para futuro `refetch`
- [ ] T010 [US1] Atualizar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx` com a mesma integração do T009

**Checkpoint**: Botão "Emitir OF" funcional nas duas páginas, formulário conectado à API, OF criada com sucesso.

---

## Fase 3: US2 — Visualizar Ordens de Fornecimento (Prioridade: P1)

**Objetivo**: Exibir a listagem real de OFs de um instrumento com saldo remanescente calculado,
substituindo o placeholder "Funcionalidade disponível em breve".

**Teste Independente**: Instrumento com OFs já criadas → acessar página de detalhes → seção
"Ordens de Fornecimento" exibe lista das OFs com código, status, valor total e o saldo remanescente
correto. Instrumento sem OFs exibe mensagem vazia.

- [ ] T011 [P] [US2] Criar `src/features/instrumentos/domain/useCases/ListarOrdensFornecimentoUseCase.ts` delegando para `repository.listarOrdensFornecimento(instrumentoId)`
- [ ] T012 [P] [US2] Criar `src/features/instrumentos/domain/useCases/ListarOrdensFornecimentoUseCase.test.ts` com 100% de cobertura: sucesso retorna `ListagemOrdensFornecimento`, repositório lança e use case propaga
- [ ] T013 [US2] Criar `src/features/instrumentos/presentation/hooks/useListarOrdensFornecimento.ts` — query hook com `dados: ListagemOrdensFornecimento | null`, `isLoading`, `error` e `refetch`; padrão idêntico ao `useBuscarInstrumento`
- [ ] T014 [US2] Atualizar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: instanciar `useListarOrdensFornecimento(instrumento.instrumentoId)`; substituir o card placeholder pelo `saldoRemanescente` e pela lista de OFs (código, status badge, datas, valor total); exibir estado vazio quando `ordensFornecimento` for vazia; conectar `refetch` ao callback de emissão do T009
- [ ] T015 [US2] Atualizar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx` com a mesma integração do T014

**Checkpoint**: Listagem real visível nas duas páginas com saldo remanescente e estado vazio correto.

---

## Fase 4: US3 — Avançar Status Operacional (Prioridade: P2)

**Objetivo**: Permitir avançar o status de cada OF na sequência
`pedido_recebido → em_separacao → despachado → entregue`, com ações contextuais por status.

**Teste Independente**: OF com status `pedido_recebido` → clicar em "Avançar status" → status muda
para `em_separacao` e interface atualiza. Tentativa de retroceder não disponível na UI.

- [ ] T016 [P] [US3] Criar `src/features/instrumentos/domain/useCases/AvancarStatusOrdemFornecimentoUseCase.ts` delegando para `repository.avancarStatusOrdemFornecimento(input)`
- [ ] T017 [P] [US3] Criar `src/features/instrumentos/domain/useCases/AvancarStatusOrdemFornecimentoUseCase.test.ts` com 100% de cobertura: sucesso retorna OF atualizada, repositório lança e use case propaga
- [ ] T018 [US3] Criar `src/features/instrumentos/presentation/hooks/useAvancarStatusOrdemFornecimento.ts` — mutation hook com método `avancar(input: AvancarStatusOrdemFornecimentoInput)`, `isLoading` e `error`
- [ ] T019 [US3] Atualizar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: em cada OF da listagem, exibir botão "Avançar" com o próximo status disponível (visível apenas se status não for `entregue` nem `pago`); ao confirmar, chamar `avancar` e depois `refetch`; mostrar erro inline em caso de falha
- [ ] T020 [US3] Atualizar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx` com a mesma integração do T019

**Checkpoint**: Botões de avanço de status funcionais nas duas páginas; transições refletidas em tempo real.

---

## Fase 5: US4 — Registrar Liquidação e Pagamento (Prioridade: P3)

**Objetivo**: Encerrar o ciclo financeiro da OF: registrar liquidação (NF-e, data, prazo) e
posteriormente o pagamento efetivo, transitando a OF para `pago`.

**Teste Independente**: OF com status `entregue` → registrar liquidação com data, prazo e NF-e
de 44 dígitos → `status_pagamento` muda para `pendente`; então registrar pagamento efetivo →
OF fica com status `pago` e `status_pagamento: pago`.

- [ ] T021 [P] [US4] Criar `src/features/instrumentos/domain/useCases/RegistrarLiquidacaoOrdemFornecimentoUseCase.ts` delegando para `repository.registrarLiquidacaoOrdemFornecimento(input)`
- [ ] T022 [P] [US4] Criar `src/features/instrumentos/domain/useCases/RegistrarLiquidacaoOrdemFornecimentoUseCase.test.ts` com 100% de cobertura
- [ ] T023 [P] [US4] Criar `src/features/instrumentos/domain/useCases/RegistrarPagamentoOrdemFornecimentoUseCase.ts` delegando para `repository.registrarPagamentoOrdemFornecimento(input)`
- [ ] T024 [P] [US4] Criar `src/features/instrumentos/domain/useCases/RegistrarPagamentoOrdemFornecimentoUseCase.test.ts` com 100% de cobertura
- [ ] T025 [P] [US4] Criar `src/features/instrumentos/presentation/hooks/useRegistrarLiquidacaoOrdemFornecimento.ts` — mutation hook com método `registrar(input: RegistrarLiquidacaoInput)`, `isLoading` e `error`
- [ ] T026 [P] [US4] Criar `src/features/instrumentos/presentation/hooks/useRegistrarPagamentoOrdemFornecimento.ts` — mutation hook com método `registrar(input: RegistrarPagamentoInput)`, `isLoading` e `error`
- [ ] T027 [US4] Atualizar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: OF com status `entregue` exibe botão "Registrar Liquidação" que abre formulário inline (data_liquidacao, prazo_pagamento, numero_nfe com validação de 44 dígitos); OF com liquidação registrada e sem pagamento exibe botão "Registrar Pagamento" com campo data_pagamento_efetivo; após cada ação chamar `refetch`; exibir `status_pagamento` badge em cada OF
- [ ] T028 [US4] Atualizar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx` com a mesma integração do T027

**Checkpoint**: Ciclo completo (emissão → separação → despacho → entrega → liquidação → pagamento) operacional nas duas páginas.

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 1)**: T001 primeiro; T002 e T003 em paralelo após T001; T004 após T002 e T003
- **US1 (Fase 2)**: T005 e T006 em paralelo após Fase 1; T007 após T005; T008 após T007; T009 e T010 após T008
- **US2 (Fase 3)**: T011 e T012 em paralelo após Fase 1; T013 após T011; T014 e T015 após T013 (recomendado após US1 para conectar o `refetch`)
- **US3 (Fase 4)**: T016 e T017 em paralelo após Fase 1; T018 após T016; T019 e T020 após T018 (requer listagem US2 para exibir botões)
- **US4 (Fase 5)**: T021–T026 em paralelo após Fase 1; T027 e T028 após T025 e T026 (requer US3 para o estado `entregue`)

### Dependências entre Histórias de Usuário

- **US1 (Emitir)**: Independente, pode ser validado sem a listagem real (OF criada na API)
- **US2 (Visualizar)**: Recomendado após US1 para conectar o `refetch` pós-emissão, mas implementável antes
- **US3 (Avançar Status)**: Requer US2 na UI (botões são exibidos na listagem)
- **US4 (Liquidação/Pagamento)**: Requer US3 (OF precisa estar `entregue` para liquidar)

### Oportunidades de Paralelismo

```
Fase 1:
  T001 → { T002 [P], T003 [P] } → T004

Fase 2 (após Fase 1):
  { T005 [P], T006 [P] } → T007 → T008 → { T009 [P], T010 [P] }

Fase 3 (após Fase 1):
  { T011 [P], T012 [P] } → T013 → { T014 [P], T015 [P] }

Fase 4 (após Fase 1):
  { T016 [P], T017 [P] } → T018 → { T019 [P], T020 [P] }

Fase 5 (após Fase 1):
  { T021 [P], T022 [P], T023 [P], T024 [P], T025 [P], T026 [P] }
  → { T027 [P], T028 [P] }
```

---

## Estratégia de Implementação

### MVP (apenas US1 + US2)

1. Completar Fase 1 (Fundação) — bloqueante
2. Completar Fase 2 (US1: Emitir OF) — botão funcional nas páginas
3. Completar Fase 3 (US2: Visualizar OFs) — listagem real com saldo
4. **PARAR e VALIDAR**: Emitir OF e ver na listagem; saldo reduzindo corretamente
5. Demo pronto para stakeholders

### Entrega Incremental

1. Fundação → compila sem erros
2. US1 → emissão funcional → validar
3. US2 → listagem + saldo → validar
4. US3 → avanço de status → validar
5. US4 → liquidação + pagamento → ciclo completo → validar

---

## Notas

- T002 e T003 marcados [P]: podem ser executados simultaneamente (arquivos diferentes) após T001
- Testes de use case (T006, T012, T017, T022, T024) são exigidos pela constituição §V (100% coverage)
- `CriarOrdemFornecimento.tsx` (T008) incorpora o hook internamente — a página passa apenas dados de contexto, sem gerenciar estado da mutation
- Após cada task que modifica páginas, verificar que `tsc --noEmit` passa sem erros
