---

description: "Lista de tarefas para implementação: Tela de Todas as Notificações"
---

# Tarefas: Tela de Todas as Notificações

**Entrada**: Documentos de design em `/specs/028-listagem-notificacoes/`
**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Incluídas tarefas de teste unitário para a extensão do `ListarNotificacoesUseCase` e para
a função pura `agruparPorPeriodo`, pois o Princípio V da constituição do projeto exige cobertura para
Use Cases/lógica de domínio pura — não é um pedido extra da spec, é uma regra já vigente no
repositório. Não há testes de componente React no projeto hoje (nenhum `*.test.tsx` existe), então
nenhum é adicionado para `NotificacoesListagemPage`/`FiltroNotificacoes`.

**Organização**: Tarefas agrupadas por história de usuário (spec.md) para permitir implementação e
teste independentes de cada uma.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto único (`l1face`), estendendo a feature já existente `src/features/notificacoes`
(027-central-notificacoes) em vez de criar uma nova, conforme `plan.md`.

---

## Fase 1: Setup

**Propósito**: Preparar as pastas ainda não usadas pela feature `notificacoes` (que hoje só tem
`domain`, `data` e `presentation/{context,components,hooks}`).

- [X] T001 Criar as pastas `src/features/notificacoes/presentation/pages` e
  `src/features/notificacoes/presentation/utils`

**Checkpoint**: Estrutura pronta para receber a extensão de paginação e a nova página.

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Estender a paginação real do repositório/Use Case de listagem e construir o hook
`useListagemNotificacoes` (acumulação de páginas + filtros + agrupamento por data) do qual as 3
histórias de usuário dependem.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [X] T002 [P] Estender a entidade `ListaNotificacoes` com `paginaAtual`/`totalPaginas` (ver
  data-model.md) em `src/features/notificacoes/domain/entities/Notificacao.ts`
- [X] T003 [P] Estender `INotificacaoRepository.listar` para aceitar um parâmetro opcional
  `ListarNotificacoesParams { page?: number; limit?: number }` (ver
  contracts/INotificacaoRepository-paginacao.md), mantendo compatibilidade com chamadas sem
  argumentos, em `src/features/notificacoes/domain/contracts/INotificacaoRepository.ts` (depende de
  T002)
- [X] T004 Estender `notificacaoMappers.ts` para mapear `meta.page`/`meta.totalPages` da resposta da
  API para `paginaAtual`/`totalPaginas`, em `src/features/notificacoes/data/mappers/notificacaoMappers.ts`
  (depende de T002)
- [X] T005 Estender `NotificacaoRepository.listar(params?)` para montar a query string com
  `page`/`limit` (default `page=1&limit=20`, preservando o comportamento atual quando chamado sem
  argumentos), em `src/features/notificacoes/data/repositories/NotificacaoRepository.ts` (depende de
  T003, T004)
- [X] T006 Estender `ListarNotificacoesUseCase.execute(params?)` para repassar os parâmetros opcionais
  ao repositório, em `src/features/notificacoes/domain/useCases/ListarNotificacoesUseCase.ts`
  (depende de T003)
- [X] T007 [P] Atualizar `ListarNotificacoesUseCase.test.ts` cobrindo chamada sem parâmetros
  (comportamento atual preservado) e com `{ page, limit }`, em
  `src/features/notificacoes/domain/useCases/ListarNotificacoesUseCase.test.ts` (depende de T006)
- [X] T008 [P] Criar função pura `agruparPorPeriodo(notificacoes, agora)` retornando seções "Hoje",
  "Esta semana" e "Mais antigas" (ver research.md #5), em
  `src/features/notificacoes/presentation/utils/agruparPorPeriodo.ts`
- [X] T009 [P] Criar teste unitário de `agruparPorPeriodo` cobrindo as 3 seções, ordenação
  decrescente dentro de cada seção e lista vazia, em
  `src/features/notificacoes/presentation/utils/agruparPorPeriodo.test.ts` (depende de T008)
- [X] T010 Criar hook `useListagemNotificacoes` que acumula páginas via
  `ListarNotificacoesUseCase.execute({ page, limit: 20 })`, expõe `notificacoes`,
  `notificacoesFiltradas`, `gruposPorPeriodo` (via `agruparPorPeriodo`), `filtroLeitura`,
  `filtroOrigem`, `temMaisPaginas`, `isLoading`, `error`, `carregarMais`, `definirFiltroLeitura`,
  `definirFiltroOrigem`, e delega `marcarComoLida`/`marcarTodasComoLidas` a `useNotificacoes()`
  espelhando o resultado no estado local acumulado (ver research.md #3), em
  `src/features/notificacoes/presentation/hooks/useListagemNotificacoes.ts` (depende de T006, T008)

**Checkpoint**: Fundação pronta — `useListagemNotificacoes` funcional e testado; as histórias de
usuário podem ser implementadas.

---

## Fase 3: História de Usuário 1 - Ver todas as notificações organizadas por data (Prioridade: P1) 🎯 MVP

**Objetivo**: Tela dedicada acessível a partir da dashboard e do sino, listando todas as
notificações agrupadas por período, com carregamento incremental e o mesmo comportamento de clique
(marcar como lida + navegar) já existente.

**Teste Independente**: Acessar a tela via "Ver todos" na dashboard, conferir agrupamento por
período, "Carregar mais" e clique em uma notificação de instrumento/ata (quickstart.md, História 1).

### Implementação para História de Usuário 1

- [X] T011 [US1] Criar `NotificacoesListagemPage` renderizando `gruposPorPeriodo` com
  `NotificacaoItem` (reaproveitado), botão "Carregar mais" habilitado conforme `temMaisPaginas`,
  ação "Marcar todas como lidas", e estados de carregamento/erro/"nenhuma notificação", em
  `src/features/notificacoes/presentation/pages/NotificacoesListagemPage.tsx` (depende de T010)
- [X] T012 [US1] Adicionar a rota `notificacoes` (`NotificacoesListagemPage`) dentro da árvore
  protegida/`RootLayout`, e um mapeamento de breadcrumb correspondente, em `src/app/routes.tsx` e
  `src/shared/components/layout/RootLayout.tsx` (depende de T011)
- [X] T013 [US1] Repontar o link "Ver todos" do card "Alertas e pendências" para `/notificacoes` em
  `src/features/dashboard/presentation/pages/DashboardPage.tsx` (depende de T012)
- [X] T014 [US1] Adicionar um atalho "Ver todas as notificações" no rodapé do dropdown do sino,
  navegando para `/notificacoes`, em `src/shared/components/layout/AppHeader.tsx` (depende de T012)

**Checkpoint**: História de Usuário 1 completa e testável de forma independente.

---

## Fase 4: História de Usuário 2 - Filtrar por status de leitura (Prioridade: P2)

**Objetivo**: Alternar entre "Todas" e "Não lidas" na tela dedicada.

**Teste Independente**: Selecionar "Não lidas", conferir a lista filtrada, marcar uma como lida e
conferir que ela some do filtro; acionar "marcar todas como lidas" e conferir sincronização com o
sino (quickstart.md, História 2).

### Implementação para História de Usuário 2

- [X] T015 [US2] Criar `FiltroNotificacoes` com os segmented buttons de leitura ("Todas"/"Não
  lidas"), recebendo valor atual e callback de mudança, em
  `src/features/notificacoes/presentation/components/FiltroNotificacoes.tsx`
- [X] T016 [US2] Integrar o filtro de leitura à `NotificacoesListagemPage`, ligando
  `FiltroNotificacoes` a `filtroLeitura`/`definirFiltroLeitura` do hook, em
  `src/features/notificacoes/presentation/pages/NotificacoesListagemPage.tsx` (depende de T015, T011)

**Checkpoint**: Histórias de Usuário 1 e 2 funcionam de forma independente e conjunta.

---

## Fase 5: História de Usuário 3 - Filtrar por tipo de origem (Prioridade: P3)

**Objetivo**: Filtrar por instrumento/ata/ordem de fornecimento, combinável com o filtro de leitura.

**Teste Independente**: Selecionar cada origem isoladamente, combinar com "Não lidas", e testar uma
combinação sem resultados (quickstart.md, História 3).

### Implementação para História de Usuário 3

- [X] T017 [US3] Adicionar os segmented buttons de origem ("Todos"/"Instrumento"/"Ata"/"Ordem de
  fornecimento") a `FiltroNotificacoes`, em
  `src/features/notificacoes/presentation/components/FiltroNotificacoes.tsx` (depende de T015)
- [X] T018 [US3] Integrar o filtro de origem à `NotificacoesListagemPage`, ligando a
  `filtroOrigem`/`definirFiltroOrigem` do hook, com mensagem distinta para "nenhuma notificação para
  este filtro" versus "nenhuma notificação" geral, em
  `src/features/notificacoes/presentation/pages/NotificacoesListagemPage.tsx` (depende de T017, T016)

**Checkpoint**: Todas as três histórias de usuário funcionam de forma independente e consistente
entre si.

---

## Fase 6: Polimento & Aspectos Transversais

**Propósito**: Validação final cruzando as três histórias e os critérios de sucesso da spec.

- [X] T019 Executar `npm run test` e confirmar que os testes de `ListarNotificacoesUseCase` e
  `agruparPorPeriodo` passam, junto com a suíte existente (depende de T007, T009)
- [ ] T020 Executar o roteiro completo de `specs/028-listagem-notificacoes/quickstart.md` (3
  histórias + casos de borda: troca de licitante ativo, falha de rede, entidade excluída)
  manualmente no navegador (depende de T014, T016, T018)
- [X] T021 [P] Revisar os arquivos criados/modificados quanto aos Princípios da constituição (sem
  `any`/`as unknown`, isolamento `domain`/`data`/`presentation`, lógica extraída para hook
  customizado) antes de finalizar

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — pode começar imediatamente.
- **Fundação (Fase 2)**: Depende do Setup — BLOQUEIA todas as histórias de usuário. T002 → T003/T004
  → T005/T006 → T007; T008 → T009; T010 depende de T006 e T008.
- **Histórias de Usuário (Fase 3+)**: Todas dependem da conclusão da Fase de Fundação (T010).
- **Polimento (Fase 6)**: Depende da conclusão das histórias que se deseja validar.

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Depende apenas da Fundação. Sem dependência de US2/US3.
- **US2 (P2)**: Depende da Fundação e da página criada em US1 (T011) para ter onde integrar o
  filtro — mas a lógica de filtro em si (`filtroLeitura` no hook) já está pronta desde a Fundação.
- **US3 (P3)**: Depende da Fundação, de `FiltroNotificacoes` (T015, de US2) e da integração de US2
  (T016) — reaproveita o mesmo componente de filtro, adicionando a dimensão de origem.

### Oportunidades de Paralelismo

- T002, T003 (após T002), T008 podem ser iniciados em paralelo — arquivos distintos.
- T007 e T009 (testes) podem ser feitos em paralelo entre si após T006/T008 estarem prontos.
- T019 e T021 (Fase 6) podem ser feitos em paralelo entre si.

---

## Exemplo de Paralelismo: Fundação (Fase 2)

```bash
# Iniciar a extensão da entidade e a função pura de agrupamento juntas:
Task: "Estender ListaNotificacoes com paginaAtual/totalPaginas em src/features/notificacoes/domain/entities/Notificacao.ts"
Task: "Criar agruparPorPeriodo em src/features/notificacoes/presentation/utils/agruparPorPeriodo.ts"
```

---

## Estratégia de Implementação

### MVP First (Apenas História de Usuário 1)

1. Concluir Fase 1: Setup
2. Concluir Fase 2: Fundação (CRÍTICO — bloqueia todas as histórias)
3. Concluir Fase 3: História de Usuário 1 (tela completa, agrupada, acessível)
4. **PARAR e VALIDAR**: rodar quickstart.md História 1 com conta de teste com múltiplas páginas
5. Fazer deploy/demo se estiver pronto — já resolve o pedido central (tela dedicada organizada)

### Entrega Incremental

1. Setup + Fundação → hook de listagem/filtros pronto
2. US1 → tela acessível e organizada por data → validar → demo
3. US2 → filtro de leitura → validar → demo
4. US3 → filtro de origem → validar → demo

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências entre si.
- Rótulo [Story] mapeia a tarefa à história de usuário específica para rastreabilidade.
- Nenhuma alteração é necessária no backend (`l1core`) — a paginação já existe na API; os filtros
  são inteiramente client-side (ver research.md #1).
- Fazer commit após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a história independentemente antes de avançar.
