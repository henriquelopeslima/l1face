---

description: "Lista de tarefas para implementação: Central de Notificações no Frontend"
---

# Tarefas: Central de Notificações no Frontend

**Entrada**: Documentos de design em `/specs/027-central-notificacoes/`
**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Incluídas tarefas de teste unitário para os Use Cases da camada `domain`, pois o Princípio V
da constituição do projeto (`.specify/memory/constitution.md`) exige 100% de cobertura para Use Cases —
não é um pedido extra da spec, é uma regra já vigente no repositório (ver padrão em
`ObterDashboardUseCase.test.ts`). Não há testes de componente React no projeto hoje (nenhum `*.test.tsx`
existe), então nenhum é adicionado aqui.

**Organização**: Tarefas agrupadas por história de usuário (spec.md) para permitir implementação e
teste independentes de cada uma.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto único (`l1face`), caminhos relativos à raiz do repositório, seguindo a Vertical Slice definida
em `plan.md`: nova feature `src/features/notificacoes/{domain,data,presentation}` + modificações pontuais
em `src/shared/components/layout/AppHeader.tsx`, `src/shared/components/layout/RootLayout.tsx` e
`src/features/configuracoes/presentation/components/NotificacoesSection.tsx`.

---

## Fase 1: Setup

**Propósito**: Criar o esqueleto de pastas da nova vertical slice, seguindo a estrutura já usada por
`src/features/dashboard`.

- [X] T001 Criar a estrutura de pastas `src/features/notificacoes/{domain/entities,domain/contracts,domain/useCases,data/mappers,data/repositories,presentation/context,presentation/components}` (pastas vazias/placeholders, sem lógica ainda)

**Checkpoint**: Estrutura de pastas pronta para receber os arquivos da Fundação.

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Construir a fonte única de dados de notificações (entidades, contrato, Use Cases,
repositório HTTP e o Context/hook compartilhado) da qual as 3 histórias de usuário dependem. Nenhuma
história pode ser implementada antes desta fase estar completa, pois todas consomem o mesmo
`useNotificacoes()`.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [X] T002 [P] Criar entidades `Notificacao`, `ConteudoNotificacao` e `ListaNotificacoes` (tipos planos, ver data-model.md) em `src/features/notificacoes/domain/entities/Notificacao.ts`
- [X] T003 [P] Criar contrato `INotificacaoRepository` com os métodos `listar()`, `marcarComoLida(id)` e `marcarTodasComoLidas()` (ver contracts/INotificacaoRepository.md) em `src/features/notificacoes/domain/contracts/INotificacaoRepository.ts`
- [X] T004 [P] Criar `ListarNotificacoesUseCase` (delega a `repository.listar()`) em `src/features/notificacoes/domain/useCases/ListarNotificacoesUseCase.ts`
- [X] T005 [P] Criar teste unitário de `ListarNotificacoesUseCase` (mock do repositório via `vi.fn()`, casos de sucesso e propagação de erro — seguir o padrão de `ObterDashboardUseCase.test.ts`) em `src/features/notificacoes/domain/useCases/ListarNotificacoesUseCase.test.ts`
- [X] T006 [P] Criar `MarcarNotificacaoLidaUseCase` (delega a `repository.marcarComoLida(id)`) em `src/features/notificacoes/domain/useCases/MarcarNotificacaoLidaUseCase.ts`
- [X] T007 [P] Criar teste unitário de `MarcarNotificacaoLidaUseCase` em `src/features/notificacoes/domain/useCases/MarcarNotificacaoLidaUseCase.test.ts`
- [X] T008 [P] Criar `MarcarTodasNotificacoesLidasUseCase` (delega a `repository.marcarTodasComoLidas()`) em `src/features/notificacoes/domain/useCases/MarcarTodasNotificacoesLidasUseCase.ts`
- [X] T009 [P] Criar teste unitário de `MarcarTodasNotificacoesLidasUseCase` em `src/features/notificacoes/domain/useCases/MarcarTodasNotificacoesLidasUseCase.test.ts`
- [X] T010 Criar `notificacaoMappers.ts` mapeando `ListaNotificacoesResponse`/`NotificacaoResponse` da API (ver contracts/api-notificacoes.md) para as entidades `Notificacao`/`ListaNotificacoes` de T002, em `src/features/notificacoes/data/mappers/notificacaoMappers.ts` (depende de T002)
- [X] T011 Criar `NotificacaoRepository implements INotificacaoRepository` usando `apiFetch` de `@/shared/infrastructure/apiClient` para `GET /api/notificacoes?limit=20`, `PATCH /api/notificacoes/{id}/lida` e `PATCH /api/notificacoes/lidas`, com classe de erro própria e mensagens amigáveis por status HTTP (400/401/403/404), seguindo exatamente o padrão de `src/features/dashboard/data/repositories/DashboardRepository.ts`, em `src/features/notificacoes/data/repositories/NotificacaoRepository.ts` (depende de T003, T010)
- [X] T012 Criar `NotificacoesContext.tsx` com `NotificacoesProvider` (instancia repositório + os 3 Use Cases uma única vez, expõe `notificacoes`, `quantidadeNaoLidas` derivado, `isLoading`, `error`, `refetch`) e o hook `useNotificacoes()`, incluindo: busca inicial ao montar, polling a cada 60s (ver research.md #1) enquanto o provider estiver montado, e atualização otimista com rollback em erro para `marcarComoLida`/`marcarTodasComoLidas` (ver research.md #3), em `src/features/notificacoes/presentation/context/NotificacoesContext.tsx` (depende de T004, T006, T008, T011)
- [X] T013 Envolver a árvore autenticada com `NotificacoesProvider` (mesmo nível de `RootLayout`, já dentro de `ProtectedRoute`/`AuthProvider`) para que `AppHeader` e a página de Configurações compartilhem uma única instância do estado, em `src/shared/components/layout/RootLayout.tsx` (depende de T012)

**Checkpoint**: Fundação pronta — `useNotificacoes()` funcional e compartilhado; as histórias de usuário podem ser implementadas.

---

## Fase 3: História de Usuário 1 - Ver notificações reais no sino do cabeçalho (Prioridade: P1) 🎯 MVP

**Objetivo**: O sino do cabeçalho deixa de mostrar as 3 notificações fixas e passa a exibir os dados
reais do usuário (lista + contagem de não lidas + estado vazio), em qualquer tela do sistema.

**Teste Independente**: Login com conta de teste com notificações reais conhecidas; abrir o sino e
comparar lista/contagem exibidas com o retorno real da API (quickstart.md, História 1).

### Implementação para História de Usuário 1

- [X] T014 [P] [US1] Criar componente apresentacional `NotificacaoItem` (título, descrição, indicador de cor `conteudo.cor`, ícone por `tipoOrigem` — mapeamento local, ver research.md #4) recebendo uma `Notificacao` via props, em `src/features/notificacoes/presentation/components/NotificacaoItem.tsx`
- [X] T015 [US1] Substituir o conteúdo mockado do dropdown do sino em `src/shared/components/layout/AppHeader.tsx` por dados de `useNotificacoes()`: renderizar `NotificacaoItem` para cada notificação, badge de contagem com `quantidadeNaoLidas` (oculto quando 0), e estados de `isLoading`/`error` (depende de T012, T014)
- [X] T016 [US1] Adicionar mensagem de "nenhuma notificação" no dropdown do sino quando `notificacoes.length === 0` em `src/shared/components/layout/AppHeader.tsx` (depende de T015)

**Checkpoint**: História de Usuário 1 completa e testável de forma independente (visualização real, sem ações de leitura ainda).

---

## Fase 4: História de Usuário 2 - Marcar notificações como lidas (Prioridade: P2)

**Objetivo**: O usuário consegue marcar uma notificação individual como lida (clique) e todas de uma vez,
com o indicador de não lidas refletindo a mudança imediatamente.

**Teste Independente**: Clicar em uma notificação não lida e conferir que o badge decrementa; acionar
"marcar todas como lidas" e conferir que o badge zera; repetir sem pendências e confirmar ausência de
erro (quickstart.md, História 2).

### Implementação para História de Usuário 2

- [X] T017 [US2] Tornar `NotificacaoItem` clicável quando não lida, disparando `marcarComoLida(id)` (via prop `onClick` recebida do `AppHeader`) em `src/features/notificacoes/presentation/components/NotificacaoItem.tsx` e `src/shared/components/layout/AppHeader.tsx` (depende de T014, T015)
- [X] T018 [US2] Adicionar ação "Marcar todas como lidas" no cabeçalho do dropdown do sino, chamando `marcarTodasComoLidas()` de `useNotificacoes()`, visível apenas quando `quantidadeNaoLidas > 0` em `src/shared/components/layout/AppHeader.tsx` (depende de T015)

**Checkpoint**: Histórias de Usuário 1 e 2 funcionam de forma independente e conjunta.

---

## Fase 5: História de Usuário 3 - Ver alertas reais na tela de Configurações (Prioridade: P3)

**Objetivo**: A seção "Alertas recentes" em Configurações mostra as mesmas notificações reais (e mesmo
estado de leitura) do sino do cabeçalho; os toggles de preferência (sem suporte de backend) ficam
desabilitados com indicação "Em breve".

**Teste Independente**: Comparar a lista de "Alertas recentes" em Configurações com os dados reais;
marcar uma notificação como lida no sino e confirmar que o estado é refletido em Configurações sem
recarregar a página (quickstart.md, História 3).

### Implementação para História de Usuário 3

- [X] T019 [US3] Substituir a lista mockada `alertas` em `NotificacoesSection` por dados de `useNotificacoes()` (reutilizando `NotificacaoItem`), incluindo estado vazio, em `src/features/configuracoes/presentation/components/NotificacoesSection.tsx` (depende de T012, T014)
- [X] T020 [US3] Remover o estado local mockado dos 3 toggles de preferência (`notificacoes`/`notifState`) e renderizá-los `disabled` com um rótulo/badge "Em breve" ao lado da seção (ver research.md #5), em `src/features/configuracoes/presentation/components/NotificacoesSection.tsx` (depende de T019)

**Checkpoint**: Todas as três histórias de usuário funcionam de forma independente e consistente entre si (RF-006).

---

## Fase 6: Polimento & Aspectos Transversais

**Propósito**: Validação final cruzando as três histórias e os critérios de sucesso da spec.

- [X] T021 Executar `npm run test` e confirmar que os testes de `ListarNotificacoesUseCase`, `MarcarNotificacaoLidaUseCase` e `MarcarTodasNotificacoesLidasUseCase` passam, junto com a suíte existente (depende de T005, T007, T009)
- [ ] T022 Executar o roteiro completo de `specs/027-central-notificacoes/quickstart.md` (3 histórias + casos de borda: troca de licitante ativo, falha de rede) manualmente no navegador (depende de T016, T018, T020)
- [X] T023 [P] Revisar os 3 arquivos modificados/criados quanto aos Princípios da constituição (sem `any`/`as unknown`, isolamento `domain`/`data`/`presentation`, lógica extraída para hook customizado) antes de finalizar

## Adendo (pós-implementação): navegação ao clicar em notificação (RF-003a)

- [X] T024 [US2] Criar hook `useAbrirNotificacao` que marca a notificação como lida e, para `tipoOrigem` `ata`/`instrumento`, navega até a página de detalhes (reaproveitando `BuscarInstrumentoUseCase`/`InstrumentosRepository` de `features/instrumentos` para resolver CONTRATO vs EMPENHO), em `src/features/notificacoes/presentation/hooks/useAbrirNotificacao.ts`
- [X] T025 [US2] Substituir o `onClick` que só marcava como lida por `useAbrirNotificacao()` em `src/shared/components/layout/AppHeader.tsx` e `src/features/configuracoes/presentation/components/NotificacoesSection.tsx` (depende de T024)

## Adendo 2 (pós-implementação): clique válido mesmo após lida + dashboard (RF-003a ampliado)

- [X] T026 [P] Extrair tipo mínimo `NotificacaoClicavel` (id/tipoOrigem/entidadeId/conteudo/lida) em `src/features/notificacoes/domain/entities/Notificacao.ts`, permitindo reutilizar `NotificacaoItem`/`useAbrirNotificacao` com o `AlertaDashboard` da feature `dashboard` (mesmo formato, campos a mais são ignorados por assinatura estrutural)
- [X] T027 [US1/US2/US3] Remover a restrição `!lida` de clicabilidade em `NotificacaoItem` — o clique (e a navegação) permanece disponível mesmo após a notificação já estar lida, em `src/features/notificacoes/presentation/components/NotificacaoItem.tsx` (depende de T026)
- [X] T028 [US1] Substituir a renderização manual de `alertas` por `NotificacaoItem` + `useAbrirNotificacao()` em `src/features/dashboard/presentation/pages/DashboardPage.tsx`, removendo o mapeamento de ícone local duplicado (`TIPO_ORIGEM_ICONE`/`TipoOrigemAlerta` não são mais necessários ali) (depende de T026)

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências — pode começar imediatamente.
- **Fundação (Fase 2)**: Depende do Setup — BLOQUEIA todas as histórias de usuário (T002–T013 formam uma cadeia: entidades/contrato → mappers/repositório → Use Cases já podem ser feitos em paralelo com mappers/repositório → Context depende de tudo → wiring no RootLayout por último).
- **Histórias de Usuário (Fase 3+)**: Todas dependem da conclusão da Fase de Fundação (T013).
- **Polimento (Fase 6)**: Depende da conclusão das histórias que se deseja validar.

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Depende apenas da Fundação. Sem dependência de US2/US3.
- **US2 (P2)**: Depende da Fundação e reaproveita `NotificacaoItem`/`AppHeader` criados em US1 (T014, T015) — na prática implementada em sequência a US1, mas testável isoladamente (a ação de marcar como lida não exige que US3 exista).
- **US3 (P3)**: Depende da Fundação e reaproveita `NotificacaoItem` (T014) — não depende de US2 (marcar como lida em Configurações não é escopo desta spec; a consistência vem "de graça" pelo Context compartilhado).

### Oportunidades de Paralelismo

- T002–T009 (entidades, contrato, os 3 Use Cases e seus testes) podem ser feitos em paralelo — arquivos distintos, sem dependência entre si.
- T014 (componente `NotificacaoItem`) pode ser feito em paralelo com o fim da Fundação (T012/T013), já que só depende das entidades (T002).
- T021 e T023 (Fase 6) podem ser feitos em paralelo entre si.

---

## Exemplo de Paralelismo: Fundação (Fase 2)

```bash
# Iniciar entidades, contrato e os 3 Use Cases (+ testes) juntos:
Task: "Criar entidades Notificacao/ConteudoNotificacao/ListaNotificacoes em src/features/notificacoes/domain/entities/Notificacao.ts"
Task: "Criar contrato INotificacaoRepository em src/features/notificacoes/domain/contracts/INotificacaoRepository.ts"
Task: "Criar ListarNotificacoesUseCase + teste em src/features/notificacoes/domain/useCases/"
Task: "Criar MarcarNotificacaoLidaUseCase + teste em src/features/notificacoes/domain/useCases/"
Task: "Criar MarcarTodasNotificacoesLidasUseCase + teste em src/features/notificacoes/domain/useCases/"
```

---

## Estratégia de Implementação

### MVP First (Apenas História de Usuário 1)

1. Concluir Fase 1: Setup
2. Concluir Fase 2: Fundação (CRÍTICO — bloqueia todas as histórias)
3. Concluir Fase 3: História de Usuário 1 (sino com dados reais)
4. **PARAR e VALIDAR**: rodar quickstart.md História 1 com conta de teste
5. Fazer deploy/demo se estiver pronto — já resolve o problema mais visível (badge/lista fixos no header)

### Entrega Incremental

1. Setup + Fundação → estado compartilhado pronto
2. US1 → sino exibe dados reais → validar → demo
3. US2 → marcar como lida (individual e em lote) → validar → demo
4. US3 → Configurações consistente + toggles desabilitados → validar → demo

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências entre si.
- Rótulo [Story] mapeia a tarefa à história de usuário específica para rastreabilidade.
- Nenhuma alteração é necessária em `src/features/dashboard/**` — a dashboard já consome dados reais e está fora de escopo (Premissas da spec).
- Fazer commit após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a história independentemente antes de avançar.
