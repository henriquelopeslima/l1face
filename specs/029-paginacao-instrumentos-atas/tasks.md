---

description: "Lista de tarefas para implementação: Paginação em Gestão de Instrumentos e Gestão de Atas"
---

# Tarefas: Paginação em Gestão de Instrumentos e Gestão de Atas

**Entrada**: Documentos de design em `/specs/029-paginacao-instrumentos-atas/`
**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Incluídas tarefas de teste unitário para `ListarInstrumentosUseCase` (estendido) e para o
novo `ListarAtasPaginadoUseCase`, pois o Princípio V da constituição do projeto exige cobertura para
Use Cases/lógica de domínio pura — não é um pedido extra da spec, é uma regra já vigente no
repositório. Não há testes de componente React no projeto hoje, então nenhum é adicionado para
`InstrumentosGestaoPage`/`ArpGestaoPage`.

**Organização**: Tarefas agrupadas por história de usuário (spec.md) para permitir implementação e
teste independentes de cada uma. US1 (Instrumentos) e US2 (Atas) são features independentes — podem
ser feitas em paralelo por pessoas diferentes. US3 (busca/filtro com paginação) depende de US1 e US2
já estarem prontas, pois ajusta o comportamento das duas telas.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto único (`l1face`), estendendo as features já existentes `src/features/instrumentos` e
`src/features/atas` em vez de criar features novas, conforme `plan.md`.

---

## Fase 1: Setup

Nenhuma tarefa de setup necessária — as pastas `domain/`, `data/` e `presentation/{hooks,pages}` de
`instrumentos` e `atas` já existem e já seguem a estrutura da constituição (Princípio I).

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

Não há infraestrutura compartilhada entre US1 e US2 — são extensões independentes de features
diferentes (`instrumentos` vs. `atas`), cada uma com seu próprio domínio de dados. As extensões de
`domain`/`data` de cada feature fazem parte da própria fase da história de usuário correspondente
(Fase 3 para US1, Fase 4 para US2).

**Checkpoint**: Nada a bloquear — US1 e US2 podem começar imediatamente e em paralelo.

---

## Fase 3: História de Usuário 1 - Carregar instrumentos em lotes (Prioridade: P1) 🎯 MVP

**Objetivo**: A tela de Gestão de Instrumentos carrega os registros em lotes de 10 via "Carregar
mais", em vez de buscar a coleção inteira de uma vez, mantendo o cartão "Total na base" exato.

**Teste Independente**: Abrir Gestão de Instrumentos com uma base de mais de 10 instrumentos,
confirmar que só o primeiro lote aparece, clicar em "Carregar mais" até esgotar, conferir "Total na
base" (quickstart.md, História 1).

### Implementação para História de Usuário 1

- [X] T001 [US1] Adicionar a entidade `ListaInstrumentos { itens: InstrumentoListagem[]; total: number; paginaAtual: number; totalPaginas: number }` (ver data-model.md) em `src/features/instrumentos/domain/entities/instrumentoContratual.ts`
- [X] T002 [US1] Alterar `IInstrumentosRepository.listarInstrumentos` para `listarInstrumentos(params?: ListarInstrumentosParams): Promise<ListaInstrumentos>` (ver contracts/IInstrumentosRepository-paginacao.md), em `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts` (depende de T001)
- [X] T003 [P] [US1] Adicionar `mapApiListaInstrumentosToListaInstrumentos` mapeando `meta.page`→`paginaAtual`, `meta.total`→`total`, `meta.totalPages`→`totalPaginas` e `data[]` via `mapApiInstrumentoListagemToInstrumentoListagem` já existente, em `src/features/instrumentos/data/mappers/instrumentosMappers.ts` (depende de T001)
- [X] T004 [US1] Alterar `InstrumentosRepository.listarInstrumentos(params?)` para chamar `GET /api/instrumentos?page=${page}&limit=${limit}` (default `page=1&limit=10`, sempre enviados) e retornar o envelope mapeado, em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts` (depende de T002, T003)
- [X] T005 [US1] Alterar `ListarInstrumentosUseCase.execute(params?)` para repassar os parâmetros e retornar `ListaInstrumentos`, em `src/features/instrumentos/domain/useCases/ListarInstrumentosUseCase.ts` (depende de T002)
- [X] T006 [P] [US1] Criar `ListarInstrumentosUseCase.test.ts` cobrindo chamada com `{ page, limit }` e o mapeamento do envelope retornado, em `src/features/instrumentos/domain/useCases/ListarInstrumentosUseCase.test.ts` (depende de T005)
- [X] T007 [US1] Renomear `useListarInstrumentos.ts` para `useListagemInstrumentos.ts`, acumulando páginas via `listarInstrumentosUseCase.execute({ page, limit: 10 })`, expondo `instrumentos` (acumulado), `totalNaBase` (de `total`), `temMaisPaginas` (`paginaAtual < totalPaginas`), `isLoading`, `isLoadingMais`, `error`, `carregarMais`, `refetch` (ver data-model.md), em `src/features/instrumentos/presentation/hooks/useListagemInstrumentos.ts` (depende de T004, T005)
- [X] T008 [US1] Atualizar `InstrumentosGestaoPage.tsx` para usar `useListagemInstrumentos`, adicionar botão "Carregar mais" (habilitado por `temMaisPaginas`, desabilitado durante `isLoadingMais`, com mensagem de erro e "tentar novamente" em caso de falha — RF-009) abaixo da tabela desktop e da lista mobile, e trocar o cartão "Total na base" para usar `totalNaBase` mantendo "Contratos"/"Notas de empenho" como contagem sobre os itens já carregados com indicação visual de que pode aumentar (RF-008), em `src/features/instrumentos/presentation/pages/InstrumentosGestaoPage.tsx` (depende de T007)

**Checkpoint**: Neste ponto, a História de Usuário 1 deve ser totalmente funcional e testável independentemente.

---

## Fase 4: História de Usuário 2 - Carregar atas em lotes (Prioridade: P1) 🎯 MVP

**Objetivo**: A tela de Gestão de Atas carrega os registros em lotes de 10 via "Carregar mais", sem
alterar `useListarAtas()`/`listarAtas()`, que continuam intocados para os seletores de Ata em
"Cadastrar Contrato"/"Cadastrar Nota de Empenho" (ver research.md #4).

**Teste Independente**: Abrir Gestão de Atas com uma base de mais de 10 atas, confirmar que só o
primeiro lote aparece, clicar em "Carregar mais" até esgotar; confirmar que os seletores de Ata nos
formulários de Cadastro continuam mostrando a lista completa (quickstart.md, História 2).

### Implementação para História de Usuário 2

- [X] T009 [US2] Adicionar a entidade `ListaAtas { itens: Ata[]; total: number; paginaAtual: number; totalPaginas: number }` (ver data-model.md) em `src/features/atas/domain/entities/ata.ts`
- [X] T010 [US2] Adicionar `listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>` a `IAtasRepository`, mantendo `listarAtas(): Promise<Ata[]>` sem nenhuma alteração (ver contracts/IAtasRepository-paginacao.md), em `src/features/atas/domain/repositories/IAtasRepository.ts` (depende de T009)
- [X] T011 [P] [US2] Adicionar `mapApiListaAtasToListaAtas` mapeando `meta.page`→`paginaAtual`, `meta.total`→`total`, `meta.totalPages`→`totalPaginas` e `data[]` via `mapApiAtaToAta` já existente, em `src/features/atas/data/mappers/atasMappers.ts` (depende de T009)
- [X] T012 [US2] Implementar `AtasRepository.listarAtasPaginado(params?)` chamando `GET /api/atas?page=${page}&limit=${limit}` (default `page=1&limit=10`, sempre enviados) e retornando o envelope mapeado, sem tocar em `listarAtas()`, em `src/features/atas/data/repositories/AtasRepository.ts` (depende de T010, T011)
- [X] T013 [US2] Criar `ListarAtasPaginadoUseCase.execute(params?)` delegando a `repository.listarAtasPaginado(params)`, em `src/features/atas/domain/usecases/ListarAtasPaginadoUseCase.ts` (depende de T010)
- [X] T014 [P] [US2] Criar `ListarAtasPaginadoUseCase.test.ts` cobrindo chamada com `{ page, limit }` e o mapeamento do envelope retornado, em `src/features/atas/domain/usecases/ListarAtasPaginadoUseCase.test.ts` (depende de T013)
- [X] T015 [US2] Criar `useListagemAtas`, acumulando páginas via `listarAtasPaginadoUseCase.execute({ page, limit: 10 })`, expondo `atas` (acumulado), `temMaisPaginas`, `isLoading`, `isLoadingMais`, `error`, `carregarMais`, `refetch` (ver data-model.md), ao lado de `useListarAtas.ts` que permanece sem alteração, em `src/features/atas/presentation/hooks/useListagemAtas.ts` (depende de T012, T013)
- [X] T016 [US2] Atualizar `ArpGestaoPage.tsx` para trocar `useListarAtas` por `useListagemAtas`, adicionar botão "Carregar mais" (habilitado por `temMaisPaginas`, desabilitado durante `isLoadingMais`, com mensagem de erro e "tentar novamente" — RF-009) abaixo da tabela, em `src/features/atas/presentation/pages/ArpGestaoPage.tsx` (depende de T015)
- [X] T017 [P] [US2] Verificar que `src/features/instrumentos/presentation/components/CadastrarContrato.tsx` e `src/features/instrumentos/presentation/components/CadastrarNotaEmpenho.tsx` continuam importando `useListarAtas` (não `useListagemAtas`) e recebendo a lista completa de atas sem alteração de comportamento (regressão) (depende de T016)

**Checkpoint**: Neste ponto, as Histórias de Usuário 1 e 2 devem funcionar de forma independente e conjunta.

---

## Fase 5: História de Usuário 3 - Buscar e filtrar continuam funcionando com paginação (Prioridade: P2)

**Objetivo**: Busca por texto e filtros (tipo em Instrumentos, status em Atas) continuam operando
sobre os itens já carregados nas duas telas, com "Carregar mais" disponível para ampliar o alcance
da busca (RF-006, RF-007, RF-010 — ver research.md #2).

**Teste Independente**: Buscar um termo que só existe em um lote ainda não carregado, confirmar lista
vazia/incompleta com "Carregar mais" disponível, clicar até o registro aparecer; trocar de filtro com
múltiplos lotes carregados e confirmar que a listagem filtrada reflete corretamente o novo filtro
(quickstart.md, História 3).

### Implementação para História de Usuário 3

- [X] T018 [P] [US3] Diferenciar, em `InstrumentosGestaoPage.tsx`, a mensagem de "nenhum resultado" entre "nenhum instrumento cadastrado" (base vazia) e "nenhum instrumento encontrado nos itens carregados — carregue mais para continuar buscando" (quando há busca/filtro ativo, a lista filtrada está vazia e `temMaisPaginas` é `true`), em `src/features/instrumentos/presentation/pages/InstrumentosGestaoPage.tsx` (depende de T008)
- [X] T019 [P] [US3] Mesma diferenciação de mensagem em `ArpGestaoPage.tsx` ("nenhuma ARP cadastrada" vs. "nenhuma ARP encontrada nos itens carregados — carregue mais para continuar buscando"), em `src/features/atas/presentation/pages/ArpGestaoPage.tsx` (depende de T016)
- [ ] T020 [US3] Validar manualmente, via `specs/029-paginacao-instrumentos-atas/quickstart.md` (História 3), que trocar o filtro de tipo (Instrumentos) ou de status (Atas) com múltiplos lotes já carregados atualiza a lista filtrada corretamente sem exigir novo carregamento (RF-010 já é satisfeito pelo `useMemo` client-side existente sobre o array acumulado — apenas confirmar, sem código adicional esperado) (depende de T018, T019) — PENDENTE: requer navegador + backend local com dados de teste.

**Checkpoint**: Todas as três histórias de usuário devem agora ser independentemente funcionais e consistentes entre si.

---

## Fase 6: Polimento & Aspectos Transversais

- [X] T021 [P] Executar `npm run test -- instrumentos` e `npm run test -- atas`, confirmar que `ListarInstrumentosUseCase.test.ts` e `ListarAtasPaginadoUseCase.test.ts` passam junto com a suíte existente (depende de T006, T014)
- [ ] T022 Executar o roteiro completo de `specs/029-paginacao-instrumentos-atas/quickstart.md` (3 histórias + casos de borda: falha de rede ao carregar mais, base vazia, cadastro concorrente) manualmente no navegador (depende de T008, T016, T020) — PENDENTE: requer backend `l1core` local com dados de teste (>10 instrumentos e >10 atas); não executado nesta sessão.
- [X] T023 [P] Revisar os arquivos criados/modificados quanto aos Princípios da constituição (sem `any`/`as unknown`, isolamento `domain`/`data`/`presentation`, lógica extraída para hooks customizados, Interface Segregation entre `listarAtas`/`listarAtasPaginado`) antes de finalizar

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)** e **Fundação (Fase 2)**: Sem tarefas — nada bloqueia o início de US1/US2.
- **US1 (Fase 3)** e **US2 (Fase 4)**: Totalmente independentes entre si (features/arquivos
  diferentes) — podem ser feitas em paralelo. Dentro de cada uma: T001→T002/T003→T004/T005→T006→
  T007→T008 (US1); T009→T010/T011→T012/T013→T014→T015→T016→T017 (US2).
- **US3 (Fase 5)**: Depende de US1 (T008) e US2 (T016) estarem prontas, pois ajusta o comportamento
  de busca/filtro das duas telas.
- **Polimento (Fase 6)**: Depende da conclusão das histórias que se deseja validar.

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Depende apenas da estrutura já existente. Sem dependência de US2/US3.
- **US2 (P1)**: Depende apenas da estrutura já existente. Sem dependência de US1/US3.
- **US3 (P2)**: Depende de US1 (T008) e US2 (T016) já estarem implementadas.

### Oportunidades de Paralelismo

- T002 e T003 (após T001) podem ser feitos em paralelo — arquivos distintos.
- T010 e T011 (após T009) podem ser feitos em paralelo — arquivos distintos.
- Toda a Fase 3 (US1) pode ser feita em paralelo com toda a Fase 4 (US2) por pessoas diferentes.
- T018 e T019 (Fase 5) podem ser feitos em paralelo — arquivos distintos.
- T021 e T023 (Fase 6) podem ser feitos em paralelo entre si.

---

## Exemplo de Paralelismo: US1 e US2 em paralelo

```bash
# Uma pessoa inicia US1 (Instrumentos):
Task: "Adicionar ListaInstrumentos em src/features/instrumentos/domain/entities/instrumentoContratual.ts"

# Outra pessoa inicia US2 (Atas), ao mesmo tempo:
Task: "Adicionar ListaAtas em src/features/atas/domain/entities/ata.ts"
```

---

## Estratégia de Implementação

### MVP First (US1 + US2)

1. Concluir Fase 3 (US1) e Fase 4 (US2) — em paralelo se houver duas pessoas, ou sequencialmente.
2. **PARAR e VALIDAR**: rodar quickstart.md Histórias 1 e 2 com uma base de mais de 10 registros em
   cada tela.
3. Fazer deploy/demo — já resolve o problema de performance central (o pedido original).

### Entrega Incremental

1. US1 → Gestão de Instrumentos paginada → validar → demo.
2. US2 → Gestão de Atas paginada → validar → demo.
3. US3 → mensagens diferenciadas de busca/filtro sem resultado nos itens carregados → validar → demo.

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências entre si.
- Rótulo [Story] mapeia a tarefa à história de usuário específica para rastreabilidade.
- Nenhuma alteração é necessária no backend (`l1core`) — `page`/`limit` já existem em
  `GET /api/instrumentos` e `GET /api/atas`; busca/filtro continuam inteiramente client-side (ver
  research.md #1, #2).
- `listarAtas()`/`useListarAtas()` NÃO devem ser alterados — são consumidos por
  `CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx` (T017 é uma verificação de regressão, não uma
  mudança de código esperada).
- Fazer commit após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a história independentemente antes de avançar.
