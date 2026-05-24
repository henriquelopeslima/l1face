# Tarefas: Visualizar Detalhes de Ata

**Entrada**: Documentos de design em `specs/006-ata-detail-view/`
**Pré-requisitos**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Organização**: Tarefas agrupadas por história de usuário para implementação e teste independentes.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: História de usuário à qual esta tarefa pertence (US1, US2, US3)

---

## Fase 1: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Camada de domínio e dados que DEVE ser concluída antes que qualquer história de usuário possa ser implementada.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [x] T001 Criar entidades `ItemAta` e `AtaDetalhes` (com `AtaStatus`) em `src/features/atas/domain/entities/ataDetalhes.ts`
- [x] T002 Adicionar método `getAta(ataId: string): Promise<AtaDetalhes>` à interface em `src/features/atas/domain/repositories/IAtasRepository.ts` (depende de T001)
- [x] T003 Criar `GetAtaUseCase` em `src/features/atas/domain/usecases/GetAtaUseCase.ts` (depende de T001, T002)
- [x] T004 Criar `GetAtaUseCase.test.ts` com 100% de cobertura (casos: sucesso, AtaError, erro genérico) em `src/features/atas/domain/usecases/GetAtaUseCase.test.ts` (depende de T003)
- [x] T005 [P] Criar mappers `mapApiItemAtaToItemAta` e `mapApiAtaDetalhesToAtaDetalhes` em `src/features/atas/data/mappers/ataDetalhesMappers.ts` (depende de T001)
- [x] T006 Implementar `getAta(ataId: string)` em `src/features/atas/data/repositories/AtasRepository.ts` — chamada `GET /api/atas?id={ataId}`, tratar 401/403/404 com `AtaError`, usar mapper do T005 (depende de T002, T005)
- [x] T007 Criar hook `useGetAta(ataId: string)` retornando `{ ata, isLoading, error, refetch }` em `src/features/atas/presentation/hooks/useGetAta.ts` (depende de T003, T006)

**Checkpoint**: Fundação pronta — `npm run test` deve passar. Implementação das histórias de usuário pode começar.

---

## Fase 2: História de Usuário 1 — Acessar detalhes de uma ata (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir os dados mockados em `ArpDetalhesPage` por dados reais da API, exibindo cabeçalho completo da ata e lista de itens.

**Teste Independente**: Navegar em `/atas/gestao` → expandir uma ata → clicar "Abrir Detalhes Completos" → verificar que os dados reais da ata aparecem (número, órgão, objeto, vigência, status, itens com quantidades reais).

- [x] T008 [US1] Substituir o bloco `arpsDetalhadas` por `useGetAta(id)` e implementar estado de loading (mostrar `<LoadingLogo />`) em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T007)
- [x] T009 [US1] Atualizar cabeçalho e aba "Dados Mestres" para renderizar campos reais de `AtaDetalhes`: `numero`, `descricao`, `nomeOrgaoGerenciador`, `cnpjOrgaoGerenciador`, `dataInicioVigencia`, `dataFimVigencia`, `aceitaAdesao`, `renovavel`, `numeroPncp` (exibir "Não informado" se null), `anexoUrl` (exibir botão de link se não null) em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T008)
- [x] T010 [US1] Atualizar aba "Itens e Saldo" para renderizar `ata.itens[]` de `AtaDetalhes` usando campos `ItemAta`: `numeroItem`, `descricao`, `unidadeMedida`, `valorEstimado`, `qtdRegistrada`, `qtdConsumidaOrgao`, `qtdParaCarona`, `qtdConsumidaCarona`; calcular saldos e totais localmente em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T009)
- [x] T011 [US1] Manter aba "Contratos Gerados" como seção estática/vazia (remover mock de contratos, exibir mensagem "Em breve") e preservar o botão "Voltar para Listagem" existente em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T010)

**Checkpoint**: US1 completa. `ArpDetalhesPage` exibe dados reais de qualquer ata. Botão de retorno funciona. MVP entregue.

---

## Fase 3: História de Usuário 3 — Tratamento de falhas ao carregar (Prioridade: P3)

**Objetivo**: Exibir mensagens de erro específicas para cada tipo de falha e oferecer opção de nova tentativa.

**Nota**: US2 (retornar à listagem) já está implementada — o botão "Voltar para Listagem" é preservado pela T011 e nenhuma tarefa adicional é necessária.

**Teste Independente**: Testar com ID de ata inválido ou sem ata disponível — verificar mensagem de erro e botão "Tentar novamente".

- [x] T012 [US3] Implementar estado de erro específico para 404 ("Ata não encontrada."), 403 ("Acesso negado ao licitante informado.") e 401 ("Sessão expirada. Faça login novamente.") em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T011)
- [x] T013 [US3] Implementar estado de erro genérico com botão "Tentar novamente" (chamar `refetch`) e manter botão "Voltar para Listagem" visível em qualquer estado de erro em `src/features/atas/presentation/pages/ArpDetalhesPage.tsx` (depende de T012)

**Checkpoint**: Todas as histórias de usuário implementadas. Erros comunicados ao usuário em 100% dos casos.

---

## Fase 4: Polimento & Validação Final

**Propósito**: Garantir corretude de tipos, cobertura de testes e ausência de erros de build.

- [x] T014 [P] Verificar que `GetAtaUseCase.test.ts` cobre todos os branches de erro (sucesso, AtaError propagada, erro genérico convertido em AtaError) e que `npm run test` passa sem falhas em `src/features/atas/domain/usecases/GetAtaUseCase.test.ts`
- [x] T015 [P] Executar `npm run build` — todos os novos artefatos são type-safe; erros de build restantes são pré-existentes (TS1294 `erasableSyntaxOnly` em outros Use Cases, erros em instrumentos/auth não relacionados)
- [ ] T016 Executar verificação manual: `/atas/gestao` → expandir ata → "Abrir Detalhes Completos" → verificar loading → dados reais → aba Itens → back navigation — conforme `specs/006-ata-detail-view/quickstart.md`

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 1)**: Sem dependências externas — pode começar imediatamente
- **US1 (Fase 2)**: Depende da conclusão completa da Fase 1 (T001–T007)
- **US3 (Fase 3)**: Depende da conclusão da Fase 2 (T008–T011)
- **Polimento (Fase 4)**: T014 e T015 podem começar após T007; T016 depende de T013

### Dependências Internas (Fundação)

```
T001 (entidades)
  ├── T002 (interface) → T003 (use case) → T004 (test)
  └── T005 [P] (mappers)

T002 + T005 → T006 (repositório) → T007 (hook)
```

### Oportunidades de Paralelismo

- T004 e T005 podem executar em paralelo após T003 e T001 (respectivamente)
- T014 e T015 (Fase 4) podem executar em paralelo após T007

---

## Exemplo de Paralelismo

```bash
# Após T001:
Task A: T002 — Atualizar IAtasRepository
Task B: T005 — Criar ataDetalhesMappers.ts  ← paralelo com Task A

# Após T003:
Task: T004 — GetAtaUseCase.test.ts  ← pode começar enquanto T005 e T006 rodam

# Após T013 (todas as histórias completas):
Task A: T014 — Verificar cobertura de testes  ← paralelo
Task B: T015 — npm run build                   ← paralelo
```

---

## Estratégia de Implementação

### MVP First (US1 apenas)

1. Concluir Fase 1: Fundação (T001–T007)
2. Concluir Fase 2: US1 (T008–T011)
3. **PARAR e VALIDAR**: Navegar na aplicação, confirmar dados reais exibidos
4. Continuar para US3 se desejado

### Entrega Incremental

1. Fase 1 (Fundação) → Fundação pronta, testes passam
2. Fase 2 (US1) → MVP: página de detalhes funciona com dados reais
3. Fase 3 (US3) → Resiliência: erros tratados adequadamente
4. Fase 4 (Polimento) → Build limpo, cobertura validada

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências incompletas
- `ArpDetalhesPage` tem dependências sequenciais (mesmo arquivo) — T008→T009→T010→T011→T012→T013
- A aba "Contratos Gerados" fica estática (sem endpoint de contratos no escopo)
- US2 (retornar à listagem) já está implementada — botão "Voltar para Listagem" preservado em T011
- Commitar após cada fase ou tarefa lógica concluída
