# Tarefas: Dashboard com Dados Reais

**Entrada**: Documentos de design em `specs/025-dashboard-endpoints/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: Teste de Use Case é **obrigatório** pela constituição (Princípio V — 100% de cobertura de Use Cases em domain). Seguindo o precedente da feature mais recentemente construída (`instrumentos`), não há testes dedicados de hook ou de repository nesta feature — apenas `ObterDashboardUseCase.test.ts` é exigido.

**Organização**: 3 histórias de usuário (US1: indicadores, US2: gráficos, US3: alertas), organizadas por prioridade. As 3 dependem da mesma chamada única `GET /api/dashboard`, então toda a cadeia de dados (entidade → contrato → use case → mapper → repository → hook) é construída em US1, que é o incremento MVP; US2 e US3 apenas passam a renderizar seções adicionais da mesma resposta já buscada por US1, sem novo código de domínio/dados.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História de usuário correspondente (US1, US2, US3)

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Entidades de domínio e contrato de repositório dos quais US1, US2 e US3 dependem.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [X] T001 [P] Criar entidades de domínio em `src/features/dashboard/domain/entities/DashboardData.ts`: `DashboardData` (`cards`, `evolucaoMensal`, `statusInstrumentos`, `alertas`), `IndicadorValor` (`valor: number`, `variacaoPercentualMesAnterior: number | null`), `IndicadorInstrumentosAtivos` (`quantidade`, `proximosAoVencimento`), `IndicadorPendenciasFinanceiras` (`valor`, `quantidadeAguardandoProcessamento`), `PontoEvolucaoMensal` (`mes: string`, `contratos: number`, `atas: number`), `StatusInstrumentoResumo` (`status: 'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'`, `quantidade: number`), `AlertaDashboard` (`id`, `tipoOrigem: 'instrumento' | 'ata' | 'of'`, `entidadeId`, `conteudo: { titulo: string; descricao: string; cor: string }`, `lida: boolean`, `criadaEm: string`); criar `src/features/dashboard/domain/entities/index.ts` re-exportando tudo
- [X] T002 Criar `IDashboardRepository` em `src/features/dashboard/domain/contracts/IDashboardRepository.ts` com `obterDashboard(): Promise<DashboardData>` (importa o tipo criado em T001)

**Checkpoint**: Fundação pronta — implementação das histórias pode começar.

---

## Fase 3: História de Usuário 1 — Ver indicadores financeiros e operacionais reais (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir os 4 cards hardcoded de `DashboardPage.tsx` (Valor Total Contratado, Valor Total em Atas, Instrumentos Ativos, Pendências Financeiras) pelos dados reais de `GET /api/dashboard`, incluindo estados de carregamento e erro para a tela inteira.

**Teste Independente**: Acessar a tela inicial autenticado e conferir que os 4 indicadores exibem valores reais (não mais R$ 1.000.000,00 / R$ 359.112,10 / 56 / R$ 125.450,00 fixos) e a variação percentual correta, incluindo a omissão da variação quando não houver base de comparação.

### Testes para História de Usuário 1 (mandatório pela constituição)

- [X] T003 [P] [US1] Criar teste unitário para `ObterDashboardUseCase` em `src/features/dashboard/domain/useCases/ObterDashboardUseCase.test.ts` — cobrir: sucesso retorna o `DashboardData` do repositório, `repository.obterDashboard()` é chamado sem argumentos (licitante ativo já é resolvido pelo `apiFetch`), erro do repositório propaga a exceção

### Implementação para História de Usuário 1

- [X] T004 [P] [US1] Criar `ObterDashboardUseCase` em `src/features/dashboard/domain/useCases/ObterDashboardUseCase.ts` (recebe `IDashboardRepository`, método `execute(): Promise<DashboardData>` delega para `repository.obterDashboard()`); verificar que T003 passa
- [X] T005 [P] [US1] Criar `dashboardMappers.ts` em `src/features/dashboard/data/mappers/dashboardMappers.ts` — função `mapApiDashboardResponseToDashboardData(dto)` que converte o corpo bruto de `GET /api/dashboard` (tipado localmente, sem `any`) para `DashboardData`; `cards`, `evolucaoMensal` e `statusInstrumentos` são passagem direta (mesmos nomes/formatos); `alertas[]` (formato `NotificacaoResponse` — `id`, `tipoOrigem`, `entidadeId`, `conteudo`, `lida`, `criadaEm`) é mapeado 1:1 para `AlertaDashboard[]`
- [X] T006 [US1] Criar `DashboardRepository.ts` em `src/features/dashboard/data/repositories/DashboardRepository.ts` implementando `IDashboardRepository` — `obterDashboard()` chama `apiFetch('/api/dashboard')` e usa `dashboardMappers`; erros HTTP mapeados para mensagens amigáveis: `400` → `"Não foi possível identificar a empresa ativa. Atualize a página e tente novamente."`, `401` → `"Sessão expirada. Faça login novamente."`, `403` → `"Você não tem acesso aos dados desta empresa."`, `404` → `"Não foi possível localizar a empresa. Atualize a página e tente novamente."`, demais/falha de rede → `"Não foi possível carregar os dados da tela inicial. Tente novamente."` — **ajuste feito durante a implementação**: sem redirecionamento automático para `/login` no 401, seguindo o precedente real de `InstrumentosRepository` (não o de `UsuarioLicitanteRepository`, que foi a suposição original do plano) — depende de T005
- [X] T007 [US1] Criar `useDashboard.ts` em `src/features/dashboard/presentation/hooks/useDashboard.ts` (modelo: `useListarInstrumentos.ts`) — estado `{ dashboard: DashboardData | null, isLoading: boolean, error: string | null }`, `isLoading` inicia `true`, `dashboard` inicia `null`; busca via `ObterDashboardUseCase` em `useEffect` ao montar; expõe `refetch: () => void` — depende de T004 e T006
- [X] T008 [US1] Modificar `src/features/dashboard/presentation/pages/DashboardPage.tsx`: consumir `useDashboard()`; enquanto `isLoading`, exibir skeleton/placeholder nos 4 cards (RF-008); quando `error !== null`, substituir o conteúdo da página por uma mensagem de erro amigável com botão "Tentar novamente" que chama `refetch` (RF-009); quando `dashboard` estiver disponível (mesmo com todos os indicadores zerados — RF-007), renderizar os 4 cards com `dashboard.cards.valorTotalContratado`, `.valorTotalAtas`, `.instrumentosAtivos`, `.pendenciasFinanceiras`; omitir a linha de variação percentual quando `variacaoPercentualMesAnterior === null`, sem exibir "+0%" nem texto inventado (RF-003); remover os literais hardcoded dos 4 cards — depende de T007

**Checkpoint**: Neste ponto, a História de Usuário 1 deve estar totalmente funcional — os 4 indicadores exibem dados reais, com carregamento e erro tratados para a tela inteira.

---

## Fase 4: História de Usuário 2 — Ver evolução mensal e distribuição de instrumentos reais (Prioridade: P2)

**Objetivo**: Substituir os arrays mockados `monthlyData` e `statusData` do gráfico de evolução mensal e do gráfico de status de instrumentos pelos dados reais já disponíveis em `dashboard.evolucaoMensal` e `dashboard.statusInstrumentos` (buscados pelo hook criado em US1).

**Teste Independente**: Acessar a tela inicial e conferir que o gráfico de evolução mensal exibe os 6 meses reais (não mais Jan–Jun fixos) e que o gráfico de status reflete a distribuição real de instrumentos, incluindo o caso de licitante sem instrumentos (gráfico vazio, sem erro).

### Implementação para História de Usuário 2

> Não há código novo de domínio/dados — `dashboard.evolucaoMensal`/`dashboard.statusInstrumentos` já vêm da mesma chamada usada em US1 (T006/T007).

- [X] T009 [P] [US2] Adicionar função pura `formatarMesAbreviado(mes: string): string` em `DashboardPage.tsx` (ou arquivo colocalizado no mesmo diretório) que converte `"YYYY-MM"` (ex. `"2026-07"`) para abreviação em português (ex. `"Jul"`), usada como rótulo do eixo X do `AreaChart`
- [X] T010 [P] [US2] Adicionar mapa `STATUS_LABEL_COR: Record<StatusInstrumentoResumo['status'], { label: string; color: string }>` em `DashboardPage.tsx` — `ATIVA` → `{ label: 'Vigentes', color: '#0050FF' }`, `PROXIMA_AO_VENCIMENTO` → `{ label: 'Vencendo', color: '#4D8EFF' }`, `ENCERRADA` → `{ label: 'Vencidos', color: '#6B4DFF' }` (preserva a aparência visual atual)
- [X] T011 [US2] Modificar `DashboardPage.tsx`: substituir `monthlyData` por `dashboard.evolucaoMensal` (rótulo do eixo X via T009) no `AreaChart`; substituir `statusData` por `dashboard.statusInstrumentos` (rótulo/cor via T010) no `PieChart` e na legenda abaixo dele; ambos os gráficos devem renderizar normalmente (vazio/zerado) quando os arrays vierem vazios, sem exibir erro (RF-007); remover as constantes `monthlyData`/`statusData` do arquivo — depende de T009, T010

**Checkpoint**: Neste ponto, as Histórias de Usuário 1 e 2 devem funcionar com dados reais — cards, evolução mensal e status de instrumentos.

---

## Fase 5: História de Usuário 3 — Ver alertas e pendências recentes reais (Prioridade: P3)

**Objetivo**: Substituir a constante mockada `alertas` da seção "Alertas e pendências" pelas até 5 notificações reais retornadas em `dashboard.alertas`.

**Teste Independente**: Acessar a tela inicial e conferir que a seção de alertas exibe as notificações reais do usuário (título/descrição/cor vindos da API), e que a seção aparece vazia (sem itens fictícios) quando não há notificações.

### Implementação para História de Usuário 3

> Não há código novo de domínio/dados — `dashboard.alertas` já vem da mesma chamada usada em US1 (T006/T007).

- [X] T012 [P] [US3] Adicionar mapa `TIPO_ORIGEM_ICONE: Record<AlertaDashboard['tipoOrigem'], IconComponent>` em `DashboardPage.tsx` — `instrumento`/`ata` → `Clock`, `of` → `WarningTriangle` (mesmos ícones usados hoje, já importados de `iconoir-react`)
- [X] T013 [US3] Modificar `DashboardPage.tsx`: substituir a constante `alertas` por `dashboard.alertas.map(...)` na seção "Alertas e pendências", renderizando `conteudo.titulo` como texto principal, `conteudo.descricao` como texto secundário e o ícone resolvido via T012 com a cor de `conteudo.cor`; quando `dashboard.alertas.length === 0`, exibir a seção sem itens (sem lista fictícia, sem erro) — depende de T012

**Checkpoint**: Todas as histórias de usuário (US1, US2, US3) devem agora exibir dados reais — nenhum valor mockado resta na tela inicial.

---

## Fase 6: Polimento & Verificação Final

- [X] T014 [P] Confirmar em `src/features/dashboard/presentation/pages/DashboardPage.tsx` que não restam vestígios de dados mockados (`monthlyData`, `statusData`, `alertas` hardcoded) nem imports não utilizados
- [X] T015 Executar `tsc -b --noEmit` e `vitest run` na raiz do projeto e confirmar zero erros de tipo e todos os testes passando
- [X] T016 Verificação manual via `/run`: acessar a tela inicial autenticado e confirmar que os 4 cards, os dois gráficos e a lista de alertas mostram dados reais (não os valores originais mockados: R$ 1.000.000,00 / R$ 359.112,10 / 56 / R$ 125.450,00); se possível, verificar também o estado de licitante sem dados (tudo zerado, sem erro) e o estado de erro (ex. via DevTools offline), confirmando que o botão "Tentar novamente" refaz a busca

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências — pode começar imediatamente. **BLOQUEIA** US1, US2 e US3.
- **US1 (Fase 3)**: Depende da conclusão de T001 e T002.
- **US2 (Fase 4)**: Depende da conclusão de US1 (T006/T007 já buscam `evolucaoMensal`/`statusInstrumentos`; T009–T011 apenas passam a renderizá-los).
- **US3 (Fase 5)**: Depende da conclusão de US1 (T006/T007 já buscam `alertas`; T012–T013 apenas passam a renderizá-los).
- **Polimento (Fase 6)**: Depende da conclusão de US1, US2 e US3.

### Dependências dentro de US1

```
T001, T002 (Fundação)
  └─ T003 [P] (teste → escrever antes da implementação)
       └─ T004 [P] (impl use case, verifica T003 verde)
  └─ T005 [P] (mapper, depende apenas de T001)
       └─ T006 (repository, depende de T002 e T005)
            └─ T007 (hook, depende de T004 e T006)
                 └─ T008 (página: cards + loading/erro, depende de T007)
```

### Oportunidades de Paralelismo

- **T003, T004 e T005**: podem começar em paralelo logo após a Fundação (arquivos e responsabilidades diferentes; T004 só precisa que T003 exista para "ficar verde", não que esteja fisicamente pronto antes)
- **T009 e T010**: podem ser escritos em paralelo — funções independentes no mesmo arquivo, sem dependência entre si
- **T012**: independente de T009/T010, pode ser feito a qualquer momento após US1 concluído (em paralelo com toda a Fase 4)

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2: T001, T002
2. Concluir Fase 3: T003 → T004, T005 → T006 → T007 → T008
3. **PARAR e VALIDAR**: Abrir a tela inicial, confirmar que os 4 cards mostram dados reais, testar o estado de carregamento e o de erro (retry)
4. Avançar para US2/US3 somente após validação

### Entrega Incremental

1. Fundação → entidades e contrato de repositório prontos
2. US1 completo → indicadores reais + loading/erro da tela inteira (MVP!)
3. US2 completo → gráfico de evolução mensal e de status com dados reais
4. US3 completo → alertas reais
5. Polimento → limpeza de código morto + verificação de tipos/testes + validação manual

---

## Notas

- Teste de Use Case (T003) é **mandatório** pela constituição — escrever antes da implementação
- Proibido `any` em qualquer arquivo novo ou modificado
- Toda a cadeia de acesso a dados (entidade, contrato, use case, mapper, repository, hook) é construída uma única vez em US1, pois `GET /api/dashboard` retorna tudo numa única resposta — US2 e US3 não introduzem nenhum arquivo novo de domínio/dados, apenas passam a renderizar seções adicionais da mesma resposta já buscada
- Sem testes dedicados de hook/repository nesta feature, seguindo o precedente da feature `instrumentos` (mais recentemente construída) — divergência intencional do padrão mais antigo usado em `022`/`023` (`useGestaoAcessos.test.ts`)
