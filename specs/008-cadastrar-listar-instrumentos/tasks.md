# Tarefas: Cadastrar e Listar Instrumentos

**Entrada**: Documentos de design em `specs/008-cadastrar-listar-instrumentos/`  
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Testes**: Incluídos para Use Cases conforme exigência constitucional (cobertura 100% de domain).

**Organização**: 3 histórias de usuário independentes. US1 entrega a listagem real; US2 e US3 entregam os formulários integrados.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: À qual história de usuário esta tarefa pertence
- Caminhos de arquivo exatos nas descrições

---

## Fase 1: Setup (Sem alterações necessárias)

O projeto já existe com estrutura de pastas correta. Não há setup adicional.

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Atualizar tipos de domínio e declarar novos contratos de repositório — necessário antes de qualquer história.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [x] T001 [P] Atualizar tipos de domínio em `src/features/instrumentos/domain/entities/instrumentoContratual.ts`: substituir `TipoInstrumentoContratual` por `TipoInstrumento = 'CONTRATO' | 'EMPENHO'`, substituir campo `status` por `StatusInstrumento = 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'`, e atualizar todos os campos de `InstrumentoListagem` para os nomes da API (`numero`, `orgao`, `unidade`, `prazoFinal`, `valor`, `saldo`)
- [x] T002 [P] Adicionar entidades de input em `src/features/instrumentos/domain/entities/criarContrato.ts`: interfaces `ItemInstrumentoInput`, `CriarContratoInput` e `CriarEmpenhoInput` conforme data-model.md
- [x] T003 Atualizar `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`: adicionar assinaturas `listarInstrumentos(): Promise<InstrumentoListagem[]>`, `criarContrato(input: CriarContratoInput): Promise<string>` e `criarEmpenho(input: CriarEmpenhoInput): Promise<string>` (retornam o `instrumento_id`)
- [x] T004 Adicionar stubs dos 3 novos métodos em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts` para satisfazer TypeScript (corpo: `throw new Error('Not implemented')`): `listarInstrumentos`, `criarContrato`, `criarEmpenho`

**Checkpoint**: Fundação pronta — TypeScript compila sem erros, base para as 3 histórias estabelecida

---

## Fase 3: História de Usuário 1 — Listar Instrumentos (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir `INSTRUMENTOS_MOCK` na página de gestão pelos dados reais de `GET /api/instrumentos`.

**Teste Independente**: Abrir `/instrumentos/gestao` autenticado e ver a lista real do licitante; lista vazia exibe mensagem adequada; status `PROXIMA_AO_VENCIMENTO` aparece em badge amarelo.

### Implementação para História de Usuário 1

- [x] T005 [P] [US1] Criar `src/features/instrumentos/data/mappers/instrumentosMappers.ts`: função `mapApiInstrumentoListagemToInstrumentoListagem` mapeando campos snake_case da API para camelCase do domínio conforme data-model.md
- [x] T006 [P] [US1] Criar `src/features/instrumentos/domain/useCases/ListarInstrumentosUseCase.ts` e `ListarInstrumentosUseCase.test.ts`: use case chama `repository.listarInstrumentos()` e retorna `InstrumentoListagem[]`; testes com mock de `IInstrumentosRepository` cobrem retorno de lista populada e lista vazia
- [x] T007 [US1] Substituir stub `listarInstrumentos` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: implementar chamada real a `GET /api/instrumentos`, tratando erros 401/403/404/500 com mensagens descritivas, e usando `mapApiInstrumentoListagemToInstrumentoListagem` na resposta
- [x] T008 [US1] Criar `src/features/instrumentos/presentation/hooks/useListarInstrumentos.ts`: hook com estados `instrumentos`, `isLoading`, `error` e `refetch`; instanciar `ListarInstrumentosUseCase` com `InstrumentosRepository` (mesmo padrão de `useListarAtas.ts`)
- [x] T009 [US1] Atualizar `src/features/instrumentos/presentation/pages/InstrumentosGestaoPage.tsx`: remover `INSTRUMENTOS_MOCK` e `TipoInstrumentoContratual`; usar `useListarInstrumentos`; atualizar `badgeTipo` para receber `TipoInstrumento` (`'CONTRATO'|'EMPENHO'`); atualizar `getStatusBadge` para `StatusInstrumento` (`'ATIVA'|'PROXIMA_AO_VENCIMENTO'|'ENCERRADA'`); atualizar referências de campos renomeados (`orgao`, `unidade`, `prazoFinal`, `valor`, `saldo`); exibir estado de loading e erro; exibir mensagem de lista vazia adequada

**Checkpoint**: `InstrumentosGestaoPage` exibe dados reais. US1 completamente funcional e testável.

---

## Fase 4: História de Usuário 2 — Cadastrar Contrato (Prioridade: P2)

**Objetivo**: Substituir `finalizarCadastro` mock em `CadastrarContrato` pela integração real com `POST /api/instrumentos/contratos`; substituir `arpsDisponiveis` mock por `useListarAtas`.

**Teste Independente**: Preencher o formulário de cadastro de contrato, submeter, e verificar que o instrumento aparece na listagem real após redirecionamento.

### Implementação para História de Usuário 2

- [x] T010 [P] [US2] Criar `src/features/instrumentos/data/mappers/criarContratoMappers.ts`: função `mapCriarContratoInputToApiRequest` convertendo `CriarContratoInput` (camelCase) para o body da API (snake_case) conforme contracts/criar-contrato.md; mapeamento inclui `itens[]` com todos os campos
- [x] T011 [P] [US2] Criar `src/features/instrumentos/domain/useCases/CriarContratoUseCase.ts` e `CriarContratoUseCase.test.ts`: use case valida `vigenciaFinal >= vigenciaInicial` (lança erro descritivo se inválido) e chama `repository.criarContrato(input)`; testes cobrem: contrato válido criado com sucesso, vigência inválida lança erro, tipos de prazo inválidos lançam erro
- [x] T012 [US2] Substituir stub `criarContrato` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: implementar chamada real a `POST /api/instrumentos/contratos` com body gerado por `mapCriarContratoInputToApiRequest`; tratar erros 400/401/403/422 com mensagens descritivas; retornar `instrumento_id` do response
- [x] T013 [US2] Criar `src/features/instrumentos/presentation/hooks/useCriarContrato.ts`: hook com estados `isLoading` e `error`, função `criar(input: CriarContratoInput): Promise<string | null>` retornando o `instrumento_id` em caso de sucesso ou `null` em erro (mesmo padrão de `useCriarAta.ts`)
- [x] T014 [US2] Atualizar `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`: (a) substituir `arpsDisponiveis` mock por `useListarAtas()` importado de `@/features/atas/presentation/hooks/useListarAtas`; atualizar o `<Select>` de ARP para mapear campos reais da `Ata` (`id`, `numero`, `nomeOrgaoGerenciador`); (b) substituir `finalizarCadastro` mock por chamada a `useCriarContrato`; mapear `dadosContrato` e `itensContrato` para `CriarContratoInput`; redirecionar para `/instrumentos/gestao` no sucesso; exibir erro em `Alert` em caso de falha; (c) relaxar `validarEtapaDados`: remover obrigatoriedade de `prazoEntrega`, `prazoPagamento` e `enderecoEntrega`; (d) tornar itens opcionais: remover bloqueio em `validarEtapaItens` quando lista estiver vazia

**Checkpoint**: Formulário de contrato salva dados reais. Lista atualizada após cadastro. US2 funcional.

---

## Fase 5: História de Usuário 3 — Cadastrar Empenho (Prioridade: P3)

**Objetivo**: Substituir o mock de salvamento em `CadastrarNotaEmpenho` pela integração real com `POST /api/instrumentos/empenhos`; adicionar seletor de ARP.

**Teste Independente**: Preencher o formulário de empenho com órgão, unidade e objeto, submeter, e verificar que o empenho aparece na listagem real com tipo "EMPENHO".

### Implementação para História de Usuário 3

- [x] T015 [P] [US3] Criar `src/features/instrumentos/data/mappers/criarEmpenhoMappers.ts`: função `mapCriarEmpenhoInputToApiRequest` convertendo `CriarEmpenhoInput` (camelCase) para o body da API (snake_case) conforme contracts/criar-empenho.md
- [x] T016 [P] [US3] Criar `src/features/instrumentos/domain/useCases/CriarEmpenhoUseCase.ts` e `CriarEmpenhoUseCase.test.ts`: use case chama `repository.criarEmpenho(input)` sem validações adicionais de domínio; testes cobrem: empenho mínimo (apenas campos obrigatórios) criado com sucesso, empenho com ata e itens criado com sucesso
- [x] T017 [US3] Substituir stub `criarEmpenho` em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`: implementar chamada real a `POST /api/instrumentos/empenhos` com body gerado por `mapCriarEmpenhoInputToApiRequest`; tratar erros 400/401/403/422; retornar `instrumento_id`
- [x] T018 [US3] Criar `src/features/instrumentos/presentation/hooks/useCriarEmpenho.ts`: hook com estados `isLoading` e `error`, função `criar(input: CriarEmpenhoInput): Promise<string | null>`
- [x] T019 [US3] Atualizar `src/features/instrumentos/presentation/components/CadastrarNotaEmpenho.tsx`: (a) adicionar estado `ataId` e campo `<Select>` de ARP usando `useListarAtas()` (equivalente ao de `CadastrarContrato`); (b) mapear estado do formulário para `CriarEmpenhoInput` incluindo campos: `orgaoContratante` (`orgaoContratante`), `unidade` (`unidade`), `objeto` (`objeto`), `ataId` (se selecionado), `numeroPncp` (se preenchido), `itens[]`; (c) substituir mock de save por chamada a `useCriarEmpenho`; redirecionar para `/instrumentos/gestao` no sucesso; exibir erro em `Alert` em caso de falha

**Checkpoint**: Formulário de empenho salva dados reais com ARP opcional. Todas as 3 histórias funcionais.

---

## Fase Final: Polimento

- [x] T020 Rodar `vitest run` e confirmar que `ListarInstrumentosUseCase.test.ts`, `CriarContratoUseCase.test.ts` e `CriarEmpenhoUseCase.test.ts` passam com cobertura 100% nos use cases
- [x] T021 Verificar TypeScript sem erros com `tsc --noEmit` na raiz do projeto

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fase 2 (Fundação)**: Sem dependências — pode começar imediatamente
- **Fase 3 (US1)**: Depende da conclusão completa da Fase 2
- **Fase 4 (US2)**: Depende da conclusão completa da Fase 2 (pode ocorrer em paralelo com US1 se equipe suficiente)
- **Fase 5 (US3)**: Depende da conclusão completa da Fase 2 (pode ocorrer em paralelo com US1/US2)
- **Fase Final**: Depende da conclusão de todas as histórias

### Dependências Dentro de Cada História

```
US1: T005[P], T006[P] → T007 → T008 → T009
US2: T010[P], T011[P] → T012 → T013 → T014
US3: T015[P], T016[P] → T017 → T018 → T019
```

### Oportunidades de Paralelismo

```bash
# Fundação (em paralelo):
T001: Atualizar instrumentoContratual.ts
T002: Atualizar criarContrato.ts

# US1 (em paralelo após T003+T004):
T005: Criar instrumentosMappers.ts
T006: Criar ListarInstrumentosUseCase.ts + test

# US2 (em paralelo após T003+T004):
T010: Criar criarContratoMappers.ts
T011: Criar CriarContratoUseCase.ts + test

# US3 (em paralelo após T003+T004):
T015: Criar criarEmpenhoMappers.ts
T016: Criar CriarEmpenhoUseCase.ts + test
```

---

## Estratégia de Implementação

### MVP (Apenas US1 — Listagem Real)

1. Concluir Fase 2: Fundação (T001–T004)
2. Concluir Fase 3: US1 (T005–T009)
3. **PARAR e VALIDAR**: A listagem de instrumentos exibe dados reais
4. Opcional: fazer deploy/demo da listagem antes de implementar os cadastros

### Entrega Incremental

1. Setup + Fundação → base pronta
2. US1 (T005–T009) → listagem real funcional → **MVP**
3. US2 (T010–T014) → cadastro de contrato funcional
4. US3 (T015–T019) → cadastro de empenho funcional
5. Polimento (T020–T021) → qualidade garantida

---

## Resumo

| Fase | Tarefas | Paralelizáveis |
|------|---------|----------------|
| Fundação | T001–T004 (4 tarefas) | T001, T002 |
| US1 — Listar | T005–T009 (5 tarefas) | T005, T006 |
| US2 — Cadastrar Contrato | T010–T014 (5 tarefas) | T010, T011 |
| US3 — Cadastrar Empenho | T015–T019 (5 tarefas) | T015, T016 |
| Polimento | T020–T021 (2 tarefas) | T020, T021 |
| **Total** | **21 tarefas** | **8 paralelizáveis** |
