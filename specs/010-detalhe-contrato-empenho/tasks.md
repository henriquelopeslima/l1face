# Tarefas: Detalhes do Contrato e Empenho

**Entrada**: Documentos de design em `/specs/010-detalhe-contrato-empenho/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: A qual história de usuário esta tarefa pertence

---

## Fase 1: Setup

*Sem tarefas de setup — projeto e rotas já existem. Páginas `ContratoDetalhesPage.tsx` e
`NotaEmpenhoDetalhesPage.tsx` já estão criadas com UI completa (mock data). A fundação abaixo
é o único pré-requisito bloqueante.*

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Camadas de domínio e dados que DEVEM estar prontas antes das páginas.

**⚠️ CRÍTICO**: Nenhuma refatoração de página pode começar até esta fase estar completa.

- [x] T001 Adicionar tipos `TipoPrazo`, `ItemInstrumentoDetalhe`, `ContratoDetalhe`, `EmpenhoDetalhe` e `InstrumentoDetalhe` (union discriminada) em `src/features/instrumentos/domain/entities/instrumentoContratual.ts`
- [x] T002 [P] Adicionar método `buscarInstrumento(id: string): Promise<InstrumentoDetalhe>` à interface `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`
- [x] T003 [P] Adicionar função `mapApiInstrumentoDetalhesToInstrumentoDetalhe` em `src/features/instrumentos/data/mappers/instrumentosMappers.ts` (converte snake_case → camelCase conforme data-model.md, com narrowing por `tipo`)
- [x] T004 Implementar método `buscarInstrumento(id: string)` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts` chamando `GET /api/instrumentos/{id}` com tratamento de erros 401/404/500 (depende de T002, T003)
- [x] T005 [P] Criar `src/features/instrumentos/domain/usecases/BuscarInstrumentoUseCase.ts` com método `execute(id: string): Promise<InstrumentoDetalhe>` delegando ao repositório (depende de T001, T002)
- [x] T006 [P] Criar `src/features/instrumentos/domain/usecases/BuscarInstrumentoUseCase.test.ts` com 100% de cobertura: testar delegação ao repositório e propagação de erro (depende de T005)
- [x] T007 Criar hook `src/features/instrumentos/presentation/hooks/useBuscarInstrumento.ts` retornando `{ instrumento, isLoading, error, refetch }` seguindo padrão de `useGetAta.ts` (depende de T004, T005)

**Checkpoint**: Fundação pronta — implementação das histórias de usuário pode começar.

---

## Fase 3: História de Usuário 1 — Ver Detalhes do Contrato (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir o mock data de `ContratoDetalhesPage` por dados reais da API, exibindo
todos os campos do contrato com fallbacks para valores nulos.

**Teste Independente**: Acessar `/contratos/detalhes/:id` com um contrato cadastrado via API e
verificar que: campos reais aparecem, `status` exibe badge correto, campos nulos exibem "Não
informado", ARP card aparece apenas quando `ata_id !== null`, itens listados na tabela.

### Implementação para História de Usuário 1

- [x] T008 [US1] Refatorar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: remover todas as interfaces locais (`ContratoDetalhado`, `ItemContrato`, `MovimentacaoItem`, `OrdemFornecimento`) e todos os dados mock hardcoded (`contratosDetalhados`, `itensContrato`, `movimentacoesContrato`, `ordensFornecimento`) (depende de T007)
- [x] T009 [US1] Conectar `ContratoDetalhesPage.tsx` ao hook: usar `useBuscarInstrumento(id)`, adicionar estado de loading (skeleton/spinner), estado de erro com botão retry, e guard para redirecionar se `instrumento?.tipo !== 'CONTRATO'` (depende de T008)
- [x] T010 [US1] Adaptar campos em `ContratoDetalhesPage.tsx`: `isARP → ataId !== null`, `secretaria → unidade`, `valorGlobal → itens.reduce(s + valorTotal, 0)`, `saldoAtual → mesmo valor (sem lógica de consumo)`, prazo com tipo `→ "${prazoEntrega} ${tipoPrazoEntrega === 'UTEIS' ? 'dias úteis' : 'dias corridos'}"`, badge de status mapeando `StatusInstrumento` para labels/cores (depende de T009)
- [x] T011 [US1] Simplificar tabela de itens em `ContratoDetalhesPage.tsx`: remover colunas `qtdEntregue`, `qtdReservada`, `saldoDisponivel` e barra de progresso de consumo; manter colunas `descricao`, `unidadeMedida`, `quantidadeTotal`, `valorUnitario`, `valorTotal`; adicionar empty state "Nenhum item registrado" (depende de T010)
- [x] T012 [US1] Adaptar seção Documentos em `ContratoDetalhesPage.tsx`: se `contrato.anexoUrl !== null` exibir link/botão de download; caso contrário exibir "Nenhum anexo disponível" (depende de T010)
- [x] T013 [US1] Adaptar card ARP de Origem em `ContratoDetalhesPage.tsx`: exibir somente quando `instrumento.ataId !== null` com link para `/atas/detalhes/{ataId}`; quando `ataId === null` não renderizar o card (depende de T010)
- [x] T014 [US1] Substituir visão "Extrato" de itens em `ContratoDetalhesPage.tsx` por empty state: "Histórico de movimentações disponível em breve"; manter seção Ordens de Fornecimento com empty state "Nenhuma ordem cadastrada" (depende de T010)

**Checkpoint**: `ContratoDetalhesPage` exibe dados reais sem qualquer mock data. US1 funcionando.

---

## Fase 4: História de Usuário 2 — Ver Detalhes do Empenho (Prioridade: P2)

**Objetivo**: Substituir o mock data de `NotaEmpenhoDetalhesPage` por dados reais da API,
exibindo apenas os campos disponíveis no empenho (sem vigência, prazos ou endereço).

**Teste Independente**: Acessar `/notas-empenho/detalhes/:id` com um empenho cadastrado via API
e verificar que: `numeroPncp` (ou "Número PNCP não informado"), `orgaoContratante`, `unidade`,
`objeto` aparecem corretamente; ARP card condicional; tabela de itens.

### Implementação para História de Usuário 2

- [x] T015 [US2] Refatorar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`: remover todas as interfaces locais (`NotaEmpenhoDetalhada`, `ItemNotaEmpenho`, `MovimentacaoItem`, `OrdemFornecimento`) e todos os dados mock hardcoded (depende de T007)
- [x] T016 [US2] Conectar `NotaEmpenhoDetalhesPage.tsx` ao hook: usar `useBuscarInstrumento(id)`, adicionar estado de loading, estado de erro com retry, e guard para redirecionar se `instrumento?.tipo !== 'EMPENHO'` (depende de T015)
- [x] T017 [US2] Adaptar campos em `NotaEmpenhoDetalhesPage.tsx`: título `empenho.numeroPncp ?? 'Número PNCP não informado'`, `orgaoContratante`, `unidade`, `objeto`; remover seções de Vigência, Prazos Operacionais e Endereço de Entrega (não disponíveis na API); badge de status (depende de T016)
- [x] T018 [US2] Adaptar tabela de itens em `NotaEmpenhoDetalhesPage.tsx`: mesmas colunas simples do Contrato (`descricao`, `unidadeMedida`, `quantidadeTotal`, `valorUnitario`, `valorTotal`); empty state "Nenhum item registrado" (depende de T017)
- [x] T019 [US2] Adaptar Documentos e ARP de Origem em `NotaEmpenhoDetalhesPage.tsx`: mesma lógica de T012 e T013 para `empenho.anexoUrl` e `instrumento.ataId`; Ordens de Fornecimento → empty state (depende de T017)

**Checkpoint**: `NotaEmpenhoDetalhesPage` exibe dados reais. US1 e US2 funcionando.

---

## Fase 5: Polimento & Validação

**Propósito**: Verificação final de qualidade e conformidade com a constituição.

- [x] T020 [P] Executar `pnpm tsc --noEmit` e corrigir quaisquer erros de TypeScript (zero tolerância a `any` — constituição §II)
- [x] T021 [P] Executar `pnpm vitest run` e confirmar que `BuscarInstrumentoUseCase.test.ts` passa com 100% de cobertura do use case (constituição §V)
- [x] T022 Verificação manual: acessar `http://localhost:5174`, navegar para um contrato e um empenho reais e confirmar todos os cenários de aceite da spec (campos nulos, ARP card, loading, erro 404)

---

## Dependências & Ordem de Execução

### Dependências entre Fases

```
Fase 2 (Fundação) → Fase 3 (US1) → Fase 5 (Polimento)
                  ↘ Fase 4 (US2) ↗
```

- **Fase 2**: BLOQUEIA tudo — deve ser concluída primeiro
- **Fase 3 (US1) ‖ Fase 4 (US2)**: Podem começar em paralelo após Fase 2
- **Fase 5**: Após conclusão de US1 e US2

### Dependências entre Tarefas (Fase 2)

```
T001
 ├── T002 [P] ──┐
 └── T003 [P] ──┤
                ├── T004 ──┐
                └── T005 ──┤
                    T006 ──┘ (paralelo com T004)
                            └── T007
```

### Dependências entre Tarefas (Fase 3 — US1)

```
T007 → T008 → T009 → T010 → T011
                           → T012
                           → T013
                           → T014
```

### Dependências entre Tarefas (Fase 4 — US2)

```
T007 → T015 → T016 → T017 → T018
                           → T019
```

### Oportunidades de Paralelismo

- **Fase 2**: T002 ‖ T003 | T004 ‖ T006 (após T005) | T005 pode ser feito junto com T003
- **Entre Fases**: Fase 3 ‖ Fase 4 (após Fase 2 completa)
- **Fase 5**: T020 ‖ T021

---

## Exemplo de Paralelismo

```text
# Fase 2 — paralelismo máximo:
Agente A: T001 → T002 → T004
Agente B: T001 → T003 (espera T001)
Agente C: T001 → T005 → T006

# Após Fase 2:
Agente A: T008 → T009 → T010 → T011, T012, T013, T014  (US1)
Agente B: T015 → T016 → T017 → T018, T019              (US2)
```

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2: Fundação (T001–T007)
2. Concluir Fase 3: US1 (T008–T014)
3. **Parar e validar**: ContratoDetalhesPage com dados reais
4. Fazer demo/deploy se aprovado

### Entrega Incremental

1. Fase 2 → Fundação pronta
2. Fase 3 (US1) → ContratoDetalhesPage funcional → Demo MVP
3. Fase 4 (US2) → NotaEmpenhoDetalhesPage funcional → Demo completo
4. Fase 5 → Polimento e validação → Pronto para merge

---

## Notas

- Tarefas [P] = arquivos distintos, sem dependência entre si naquele momento
- T006 (teste do use case) é obrigatório pela constituição §V — não omitir
- Dados mock **devem** ser completamente removidos das páginas, não apenas ocultados
- Campos nulos devem sempre exibir texto de fallback (não string vazia nem crash)
- Commit após cada fase concluída
