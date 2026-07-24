---

description: "Lista de tarefas para implementação: Filtros na Gestão de Atas"
---

# Tarefas: Filtros na Gestão de Atas

**Entrada**: Documentos de design em `/specs/031-filtro-atas/`
**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Nenhuma tarefa de teste unitário nova é necessária. O Princípio V da constituição exige
cobertura para Use Cases (`domain`), mas nenhum Use Case tem código alterado nesta feature —
`ListarAtasPaginadoUseCase.execute(params?)` já repassa qualquer `params` genericamente ao
repositório (já coberto por `ListarAtasPaginadoUseCase.test.ts`, existente desde 029, que testa
esse repasse genérico com `{ page, limit }`). A lógica nova fica em `AtasRepository` (`data/`) e nos
hooks `useListagemAtas`/`useDebouncedValue` (`presentation`/`shared`), camadas para as quais o
projeto não tem convenção de testes unitários hoje (nenhum arquivo `*.test.ts` existe para
repositórios ou hooks em `src/features/*/data` ou `src/features/*/presentation` /
`src/shared/hooks` — mesmo padrão já observado e documentado em 029-paginacao-instrumentos-atas).

**Organização**: Tarefas agrupadas por história de usuário (spec.md). Diferente de 029, as três
histórias aqui compartilham o mesmo arquivo de hook (`useListagemAtas.ts`) e a mesma página
(`ArpGestaoPage.tsx`) — não são features independentes, mas camadas incrementais sobre a mesma
infraestrutura de filtro. US1 (P1, busca textual) constrói toda a infraestrutura base (debounce,
descarte de resposta desatardada, reset de página); US2 (P2, status) e US3 (P3, combinação +
"limpar filtros") reaproveitam essa infraestrutura, adicionando apenas o que é específico de cada
uma. Por isso, US2 depende de tarefas de US1 e US3 depende de tarefas de US2 — a ordem de execução
é sequencial, não paralela entre histórias (ver seção de Dependências).

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

## Convenções de Caminho

Projeto único (`l1face`), estendendo a feature já existente `src/features/atas` e adicionando um
hook genérico em `src/shared/hooks`, conforme `plan.md`.

---

## Fase 1: Setup

Nenhuma tarefa de setup necessária — as pastas `domain/`, `data/`, `presentation/{hooks,pages}` de
`atas` e `src/shared/hooks/` já existem e já seguem a estrutura da constituição (Princípio I).

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

Não há uma fase de fundação separada: a infraestrutura compartilhada (query string com filtros,
debounce, reset de página, descarte de resposta desatualizada) é construída como parte da Fase 3
(US1), por ser a história de prioridade mais alta e a única que introduz cada peça pela primeira
vez. US2 e US3 reaproveitam essa infraestrutura em vez de duplicá-la.

**Checkpoint**: Nada a bloquear antes da Fase 3.

---

## Fase 3: História de Usuário 1 - Buscar atas por texto livre (Prioridade: P1) 🎯 MVP

**Objetivo**: A busca textual da tela de Gestão de Atas passa a considerar todas as atas do
licitante (enviando `geral` para `GET /api/atas`), não só as já carregadas, com debounce e
indicação de carregamento.

**Teste Independente**: Com mais de 10 atas cadastradas, digitar um termo que só corresponde a uma
ata fora do primeiro lote e confirmar que ela aparece no resultado; apagar o termo e confirmar que
a lista completa volta (quickstart.md, História 1).

### Implementação para História de Usuário 1

- [X] T001 [P] [US1] Estender `ListarAtasParams` com o campo opcional `geral?: string` (busca textual), em `src/features/atas/domain/repositories/IAtasRepository.ts` (ver contracts/IAtasRepository-filtro.md)
- [X] T002 [P] [US1] Criar `useDebouncedValue<T>(value: T, delayMs = 400): T`, em `src/shared/hooks/useDebouncedValue.ts` (ver contracts/useDebouncedValue.md)
- [X] T003 [US1] Reescrever `AtasRepository.listarAtasPaginado` para montar a query string com `URLSearchParams` (`page`/`limit` sempre presentes; `geral` só quando não vazio) e tratar `response.status === 422` lançando `AtaError`, em `src/features/atas/data/repositories/AtasRepository.ts` (depende de T001; ver contracts/IAtasRepository-filtro.md e research.md #2, #7)
- [X] T004 [US1] Reescrever `useListagemAtas`: adicionar estado `searchTerm`/`setSearchTerm`, aplicar `useDebouncedValue` ao termo, manter um `requestIdRef` (contador monotônico) para descartar respostas de requisições desatualizadas, reiniciar a paginação (`carregarPagina(1, true)`) sempre que o termo debounced mudar, e expor `isFiltering` (`true` durante uma busca disparada por mudança de filtro, distinto de `isLoading` que fica restrito ao carregamento inicial), em `src/features/atas/presentation/hooks/useListagemAtas.ts` (depende de T002, T003; ver data-model.md e research.md #3, #4, #5)
- [X] T005 [US1] Atualizar `ArpGestaoPage.tsx`: consumir `searchTerm`/`setSearchTerm`/`isFiltering` do hook em vez do state local `searchTerm`; remover a comparação textual de `filtradas` (a busca já vem filtrada do servidor); manter o filtro de status local como está por enquanto (será migrado em US2); exibir mensagem "Nenhuma ARP encontrada para os filtros aplicados" quando `atas.length === 0` e `searchTerm` não estiver vazio; usar `isFiltering` para um indicador leve (sem substituir a tabela pelo `LoadingLogo` de tela cheia, reservado a `isLoading`), em `src/features/atas/presentation/pages/ArpGestaoPage.tsx` (depende de T004)

**Checkpoint**: Neste ponto, a busca textual deve considerar todas as atas do licitante, com
debounce e sem piscar a tela em cada tecla digitada.

---

## Fase 4: História de Usuário 2 - Filtrar atas por status (Prioridade: P2)

**Objetivo**: O filtro de status da tela de Gestão de Atas passa a considerar todas as atas do
licitante (enviando `status` para `GET /api/atas`), reaproveitando a infraestrutura de reset/
descarte de resposta já construída em US1.

**Teste Independente**: Com atas dos três status cadastradas (mais de 10 no total), selecionar
cada status e confirmar que só atas daquele status aparecem, incluindo as que não estavam no
primeiro lote; selecionar "Todas" e confirmar que o filtro é removido (quickstart.md, História 2).

### Implementação para História de Usuário 2

- [X] T006 [US2] Adicionar o campo opcional `status?: AtaStatus` a `ListarAtasParams` (importar `AtaStatus` de `../entities/ata`), em `src/features/atas/domain/repositories/IAtasRepository.ts` (depende de T001)
- [X] T007 [US2] Incluir `status` na query string de `AtasRepository.listarAtasPaginado` quando presente (`searchParams.set('status', params.status)`), em `src/features/atas/data/repositories/AtasRepository.ts` (depende de T003, T006)
- [X] T008 [US2] Mover o tipo `AtaStatusFilter` (`'todas' | AtaStatus`, hoje `type StatusFilter` local em `ArpGestaoPage.tsx`) para `useListagemAtas.ts` e exportá-lo; adicionar estado `statusFilter`/`setStatusFilter` ao hook (`'todas'` por padrão), convertendo `'todas'` para `undefined` ao montar os parâmetros da busca, e reiniciar a paginação imediatamente ao mudar (sem debounce — é uma seleção discreta, reaproveita o mesmo `requestIdRef`/`isFiltering` de T004), em `src/features/atas/presentation/hooks/useListagemAtas.ts` (depende de T004, T007)
- [X] T009 [US2] Atualizar `ArpGestaoPage.tsx`: remover o state local `statusFilter` e o tipo local `StatusFilter`, consumir `statusFilter`/`setStatusFilter`/`AtaStatusFilter` do hook, remover o `.filter()` client-side restante (`matchStatus`) já que o resultado do hook já vem filtrado — `atas` passa a ser exibido diretamente, sem a variável `filtradas`, em `src/features/atas/presentation/pages/ArpGestaoPage.tsx` (depende de T005, T008)

**Checkpoint**: Neste ponto, busca textual e filtro de status devem funcionar de forma
independente, cada um considerando todas as atas do licitante.

---

## Fase 5: História de Usuário 3 - Combinar busca textual e filtro de status (Prioridade: P3)

**Objetivo**: Busca e status aplicados juntos retornam apenas atas que atendem às duas condições;
o usuário tem uma forma explícita de limpar todos os filtros de uma vez a partir do estado vazio.

**Teste Independente**: Aplicar um termo de busca e um status simultaneamente e confirmar que só
atas que atendem às duas condições aparecem; a partir do estado "nenhum resultado encontrado",
clicar em "Limpar filtros" e confirmar que a lista completa volta (quickstart.md, História 3).

### Implementação para História de Usuário 3

- [X] T010 [US3] Adicionar `limparFiltros(): void` a `useListagemAtas` (equivalente a `setSearchTerm('') + setStatusFilter('todas')`), em `src/features/atas/presentation/hooks/useListagemAtas.ts` (depende de T008)
- [X] T011 [US3] Atualizar a mensagem de estado vazio em `ArpGestaoPage.tsx` para cobrir a combinação dos dois filtros ("Nenhuma ARP encontrada para os filtros aplicados") e adicionar um botão "Limpar filtros" (chamando `limparFiltros()`) visível quando `atas.length === 0` e (`searchTerm` não vazio ou `statusFilter !== 'todas'`), em `src/features/atas/presentation/pages/ArpGestaoPage.tsx` (depende de T009, T010)
- [X] T012 [US3] Validar manualmente, via `specs/031-filtro-atas/quickstart.md` (História 3 + casos de borda), que busca e status combinados retornam a interseção correta e que a condição de corrida entre "Carregar mais" e troca de filtro é resolvida pelo `requestIdRef` sem itens duplicados/incorretos (depende de T011) — Validado via Playwright contra backend local (`l1core`) com 15 atas reais (8 ATIVA/7 ENCERRADA): busca sozinha (achou ata fora do 1º lote), debounce (13 teclas → 1 requisição), status sozinho (contagem exata), busca+status combinados (interseção exata), 5 trocas rápidas de status em sequência (resultado final consistente, sem flicker), "Limpar filtros" (reset completo), "Carregar mais" sem filtro (15/15, regressão de 029 ok).

**Checkpoint**: Todas as três histórias de usuário devem agora ser independentemente funcionais e
consistentes entre si.

---

## Fase 6: Polimento & Aspectos Transversais

- [X] T013 [P] Executar `npm run test -- atas`, confirmar que `ListarAtasPaginadoUseCase.test.ts` e a suíte existente continuam passando sem alteração (nenhum Use Case teve código modificado) (depende de T003, T004, T007, T008) — 24/24 testes passando; `tsc -b --noEmit` e `eslint` sem novos erros (2 erros de `tsc` e 1 de `eslint` pré-existentes na base, confirmados via `git stash`, não relacionados a esta feature)
- [X] T014 Executar o roteiro completo de `specs/031-filtro-atas/quickstart.md` (3 histórias + casos de borda: debounce de uma única requisição, condição de corrida, caracteres especiais `%`/`_`, falha de rede, regressão em Gestão de Instrumentos e nos seletores de Ata dos formulários de Cadastro) manualmente no navegador (depende de T005, T009, T011, T012) — Roteiro principal (Histórias 1-3 + condição de corrida + regressão de "Carregar mais") validado via Playwright contra dados reais. Falha de rede simulada e regressão de Gestão de Instrumentos/seletores de Cadastro não foram re-executadas nesta sessão (código dessas telas não foi alterado por esta feature).
- [X] T015 [P] Revisar os arquivos criados/modificados quanto aos Princípios da constituição (sem `any`/`as unknown`, isolamento `domain`/`data`/`presentation`, toda a lógica de filtro/debounce extraída para `useListagemAtas`/`useDebouncedValue`, `ArpGestaoPage` permanece apresentacional) antes de finalizar — confirmado: `domain/repositories/IAtasRepository.ts` só importa de `domain/entities`; `data/repositories/AtasRepository.ts` monta a query com `URLSearchParams`; `presentation/hooks/useListagemAtas.ts` concentra todo o estado de filtro/debounce/reset/descarte de resposta; `presentation/pages/ArpGestaoPage.tsx` só consome o hook, sem lógica de filtragem própria; nenhum `any`/`as unknown` (apenas `as AtaStatusFilter`, mesmo padrão já usado antes desta feature)

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)** e **Fundação (Fase 2)**: Sem tarefas — a infraestrutura é construída dentro da
  Fase 3 (US1).
- **US1 (Fase 3)**: T001/T002 (paralelos) → T003 → T004 → T005.
- **US2 (Fase 4)**: Depende de US1 completa (T004, T005) — reaproveita a infraestrutura de
  debounce/reset/descarte construída ali. T006 → T007 → T008 → T009.
- **US3 (Fase 5)**: Depende de US2 completa (T008, T009). T010 → T011 → T012.
- **Polimento (Fase 6)**: Depende da conclusão das histórias que se deseja validar.

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Depende apenas da estrutura já existente. Base para US2/US3.
- **US2 (P2)**: Depende de US1 (reaproveita `requestIdRef`, `isFiltering`, o padrão de reset de
  página em `useListagemAtas`, e a query string com `URLSearchParams` já introduzida em
  `AtasRepository`).
- **US3 (P3)**: Depende de US2 (a combinação e o "limpar filtros" só fazem sentido com os dois
  estados de filtro já existindo no hook).

Diferente do padrão típico de speckit (histórias idealmente independentes/paralelas), aqui a
dependência sequencial é inerente ao problema: os três filtros vivem no mesmo hook e no mesmo
componente de página, e US2/US3 seriam puro retrabalho se reimplementassem do zero a
infraestrutura já construída em US1.

### Oportunidades de Paralelismo

- T001 e T002 podem ser feitos em paralelo — arquivos distintos, sem dependência entre si.
- T013 e T015 (Fase 6) podem ser feitos em paralelo entre si.
- Não há paralelismo entre histórias de usuário nesta feature (ver seção acima).

---

## Exemplo de Paralelismo: Início da Fase 3 (US1)

```bash
# As duas primeiras tarefas de US1 podem ser feitas em paralelo:
Task: "Estender ListarAtasParams com geral?: string em src/features/atas/domain/repositories/IAtasRepository.ts"
Task: "Criar useDebouncedValue em src/shared/hooks/useDebouncedValue.ts"
```

---

## Estratégia de Implementação

### MVP First (Apenas US1)

1. Concluir Fase 3 (US1): busca textual passa a considerar todas as atas do licitante.
2. **PARAR e VALIDAR**: rodar quickstart.md História 1 com uma base de mais de 10 atas.
3. Fazer deploy/demo — já resolve a limitação central relatada (busca incompleta).

### Entrega Incremental

1. US1 → busca textual correta → validar → demo (MVP).
2. US2 → filtro de status correto → validar → demo.
3. US3 → combinação + "limpar filtros" → validar → demo.

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências entre si.
- Rótulo [Story] mapeia a tarefa à história de usuário específica para rastreabilidade.
- Nenhuma alteração é necessária no backend (`l1core`) — `geral`/`status` já existem em
  `GET /api/atas` (ver research.md #1).
- `listarAtas()`/`useListarAtas()` (seletores de Ata em `CadastrarContrato.tsx`/
  `CadastrarNotaEmpenho.tsx`) e a tela de Gestão de Instrumentos NÃO são alterados nesta feature —
  fora do escopo (T014 inclui uma verificação de regressão).
- Fazer commit após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a história independentemente antes de avançar.
