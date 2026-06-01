# Tarefas: Visualizar Detalhes de Instrumento

**Entrada**: Documentos de design em `specs/009-detalhe-empenho-contrato/`
**Pré-requisitos**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Testes**: `BuscarInstrumentoUseCase.test.ts` incluído — obrigatório pela Constituição (100% de cobertura em Use Cases de domínio).

**Organização**: 2 histórias de usuário. A cadeia de domínio (Fase 2) bloqueia ambas. US1 e US2 compartilham o mesmo hook (`useBuscarInstrumento`) e podem ser implementadas em paralelo após a Fundação.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2)

---

## Fase 1: Setup

> Sem setup necessário. As rotas (`/contratos/detalhes/:id`, `/notas-empenho/detalhes/:id`),
> as páginas e a infraestrutura de repositório já existem. A feature inicia diretamente na Fundação.

---

## Fase 2: Fundação — Cadeia de Domínio (Pré-requisitos Bloqueantes)

**Propósito**: Implementar a cadeia completa `entidade → contrato → use case → mapper → repositório → hook`.
Nenhuma história de usuário pode ser conectada à API até que T007 esteja concluído.

**⚠️ CRÍTICO**: Toda esta fase deve estar completa e com testes passando antes de iniciar US1 ou US2.

- [ ] T001 Adicionar entidades `ItemInstrumentoDetalhe`, `ContratoDetalhe`, `EmpenhoDetalhe` e `InstrumentoDetalhe` (union discriminada) em `src/features/instrumentos/domain/entities/instrumentoContratual.ts`
- [ ] T002 [P] Adicionar método `buscarInstrumento(id: string): Promise<InstrumentoDetalhe>` à interface `IInstrumentosRepository` em `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts` (depende de T001)
- [ ] T003 [P] Adicionar função `mapApiInstrumentoDetalhesToInstrumentoDetalhe` em `src/features/instrumentos/data/mappers/instrumentosMappers.ts` — mapeia `InstrumentoDetalhesResponse` (snake_case) para `InstrumentoDetalhe` (camelCase), incluindo sub-objetos `contrato` e `empenho` e array `itens` (depende de T001)
- [ ] T004 Criar `BuscarInstrumentoUseCase` em `src/features/instrumentos/domain/useCases/BuscarInstrumentoUseCase.ts` — wrapper fino sobre `repository.buscarInstrumento(id)` (depende de T002)
- [ ] T005 Criar `BuscarInstrumentoUseCase.test.ts` em `src/features/instrumentos/domain/useCases/BuscarInstrumentoUseCase.test.ts` com cobertura 100%: cenário de sucesso (retorna `InstrumentoDetalhe`) e cenário de erro (propaga exceção do repositório) (depende de T004)
- [ ] T006 Implementar método `buscarInstrumento` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts` — `GET /api/instrumentos/{id}`, tratamento de 401 e 404, mapeamento via `mapApiInstrumentoDetalhesToInstrumentoDetalhe` (depende de T002, T003)
- [ ] T007 Criar hook `useBuscarInstrumento(id: string | undefined)` em `src/features/instrumentos/presentation/hooks/useBuscarInstrumento.ts` — gerencia `instrumento`, `isLoading`, `error` e expõe `retry` (depende de T004, T006)

**Checkpoint**: Executar `npx vitest run BuscarInstrumentoUseCase` — todos os testes devem passar. Fundação pronta para US1 e US2.

---

## Fase 3: História de Usuário 1 — Detalhe de Contrato (Prioridade: P1) 🎯 MVP

**Objetivo**: Ao clicar em um instrumento do tipo Contrato na listagem, exibir todos os seus dados reais (vigência, prazos, itens, ata vinculada) consumidos da API.

**Teste Independente**: Navegar para `/contratos/detalhes/{id}` com o ID de um contrato real; verificar que vigência, prazos, itens e status são exibidos com dados da API (não hardcoded). Verificar estado de carregamento (spinner) e estado de erro (mensagem amigável + botão retry).

- [ ] T008 [US1] Refatorar `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`: (1) remover interfaces locais e arrays de mock; (2) substituir lookup de mock por `useBuscarInstrumento(id)`; (3) narrowing via `instrumento.tipo === 'CONTRATO'`; (4) renderizar loading e erro antes do guard `if (!instrumento)`; (5) adaptar seção "Detalhes do Contrato" para campos da API (`orgaoContratante`, `unidade`, `vigenciaInicial`, `vigenciaFinal`, `renovavel`, `endereco`, `enderecoEntrega`, `prazoEntrega`, `tipoPrazoEntrega`, `prazoPagamento`, `tipoPrazoPagamento`, `anexoUrl`); (6) remover campo `isARP` e badge "ARP"; (7) adaptar labels de tipo de prazo: `'DIAS'` → `'dias'`, `'MESES'` → `'meses'`; (8) seção "Itens do Contrato" com `instrumento.itens` — exibir descrição, unidade, quantidade, valor unitário e valor total (remover colunas qtdEntregue/qtdReservada/saldoDisponivel); (9) seção "ARP de Origem" exibir quando `instrumento.ataId !== null`; (10) seção "Ordens de Fornecimento" manter UI com estado vazio (depende de T007)

**Checkpoint**: Detalhe de Contrato funciona end-to-end com dados reais. US1 está completa.

---

## Fase 4: História de Usuário 2 — Detalhe de Empenho (Prioridade: P2)

**Objetivo**: Ao clicar em um instrumento do tipo Empenho na listagem, exibir seus dados reais (órgão, unidade, objeto, status, itens) consumidos da API — sem campos exclusivos de Contrato.

**Teste Independente**: Navegar para `/notas-empenho/detalhes/{id}` com o ID de um empenho real; verificar que órgão, unidade, objeto, status e itens aparecem com dados da API. Confirmar ausência de campos `tipoEmpenho`, `dataEmissao`, `dataVencimento`. Verificar estados de loading e erro.

- [ ] T009 [US2] Refatorar `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`: (1) remover interfaces locais e arrays de mock; (2) substituir mock por `useBuscarInstrumento(id)`; (3) narrowing via `instrumento.tipo === 'EMPENHO'`; (4) renderizar loading e erro; (5) adaptar seção "Detalhes" para campos da API (`orgaoContratante`, `unidade`, `objeto`, `status`, `numeroPncp` quando presente, `ataId` quando vinculado, `anexoUrl` quando presente); (6) remover campos não existentes na API: `tipoEmpenho`, `dataEmissao`, `dataVencimento`, `enderecoEntrega`, `prazoEntrega`, `prazoPagamento`; (7) seção "Itens" com `instrumento.itens` — descrição, unidade, quantidade total, valor unitário, valor total (remover colunas qtdEntregue/qtdReservada); (8) seção "Ordens de Fornecimento" manter UI com estado vazio (depende de T007)

**Checkpoint**: Detalhe de Empenho funciona end-to-end com dados reais. US2 está completa.

---

## Fase 5: Polimento & Aspectos Transversais

- [ ] T010 [P] Verificar TypeScript sem erros: `npx tsc --noEmit` — zero erros em todos os arquivos alterados
- [ ] T011 [P] Executar suite de testes completa: `npx vitest run` — nenhuma regressão nos testes existentes

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Bloqueante — DEVE estar completa antes de US1 e US2
- **US1 (Fase 3)** e **US2 (Fase 4)**: Ambas dependem apenas da Fase 2; podem ser implementadas em paralelo
- **Polimento (Fase 5)**: Depende da conclusão de US1 e US2

### Dependências dentro da Fundação

```
T001 (entidades)
  ├── T002 [P] (contrato IRepo)  ──→ T004 (use case) ──→ T005 (teste use case)
  │                              └──────────────────────→ T007 (hook)
  └── T003 [P] (mapper)          ──→ T006 (repositório) ─→ T007 (hook)
                                 └──────────────────────→ T007 (hook)
```

### Dependências das Histórias de Usuário

```
T007 (hook)
  ├── T008 [US1] (ContratoDetalhesPage)
  └── T009 [US2] (NotaEmpenhoDetalhesPage)
```

### Oportunidades de Paralelismo

- **T002 e T003** podem ser executados em paralelo após T001 (arquivos diferentes)
- **T004 e T006** podem ser executados em paralelo assim que T002 e T003 estiverem concluídas
- **T008 e T009** podem ser executados em paralelo após T007 (arquivos diferentes)
- **T010 e T011** podem ser executados em paralelo após T008 e T009

---

## Exemplo de Paralelismo: Fundação

```bash
# Após T001 concluído, iniciar em paralelo:
Task A: "T002 — adicionar buscarInstrumento à IInstrumentosRepository"
Task B: "T003 — adicionar mapApiInstrumentoDetalhesToInstrumentoDetalhe ao mapper"

# Após T002 e T003 concluídos, iniciar em paralelo:
Task A: "T004 — criar BuscarInstrumentoUseCase"
Task B: "T006 — implementar buscarInstrumento no InstrumentosRepository"
```

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2 (Fundação) — T001 → T002+T003 → T004+T006 → T005 → T007
2. Concluir T008 (ContratoDetalhesPage conectada à API)
3. **VALIDAR**: testar detalhe de contrato com dados reais
4. Continuar com US2 se MVP estiver aprovado

### Entrega Completa

1. Fase 2 completa → fundação pronta
2. T008 (US1) → detalhe de contrato com dados reais ✅
3. T009 (US2) → detalhe de empenho com dados reais ✅
4. T010+T011 → zero erros TypeScript, zero regressões

### Estratégia com Dois Desenvolvedores

1. Ambos concluem Fase 2 juntos
2. Dev A: T008 (US1 — ContratoDetalhesPage)
3. Dev B: T009 (US2 — NotaEmpenhoDetalhesPage)
4. Ambos executam T010+T011 ao final
