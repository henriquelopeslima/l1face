# Tarefas: Listagem de Atas com API Real

**Entrada**: Documentos de design em `specs/004-atas-api-integration/`  
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organização**: As tarefas são agrupadas por história de usuário para implementação e teste independentes.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

---

## Fase 1: Setup

**Propósito**: Não há dependências externas nem configurações a instalar — a feature `atas` já existe no projeto. O setup consiste apenas em criar a estrutura de diretórios ausente.

- [x] T001 Criar diretórios `src/features/atas/domain/entities/`, `src/features/atas/domain/errors/`, `src/features/atas/domain/repositories/`, `src/features/atas/domain/usecases/`, `src/features/atas/data/mappers/`, `src/features/atas/data/repositories/`, `src/features/atas/presentation/hooks/`

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Camada de domínio completa — entidade, erro, interface de repositório e use case com testes. Deve estar concluída antes das fases de apresentação e dados.

**⚠️ CRÍTICO**: Nenhum trabalho de data layer ou presentation layer pode começar até que esta fase esteja completa.

- [x] T002 [P] Criar entidade `Ata` em `src/features/atas/domain/entities/ata.ts` com todos os campos definidos em `data-model.md` (id, numero, objeto, orgaoGerenciador, vigenciaInicial, vigenciaFinal, valorRegistrado, saldo, contratos, status como union type `'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'`, aceitaAdesao, renovavel)

- [x] T003 [P] Criar erro de domínio `AtaError` em `src/features/atas/domain/errors/ataErrors.ts` — classe que estende `Error`, sem campos adicionais

- [x] T004 Criar interface `IAtasRepository` em `src/features/atas/domain/repositories/IAtasRepository.ts` com método `listarAtas(): Promise<Ata[]>` (depende de T002)

- [x] T005 Criar `ListarAtasUseCase` em `src/features/atas/domain/usecases/ListarAtasUseCase.ts` que recebe `IAtasRepository` no construtor e chama `repository.listarAtas()` no método `execute(): Promise<Ata[]>` (depende de T004)

- [x] T006 Criar `ListarAtasUseCase.test.ts` em `src/features/atas/domain/usecases/ListarAtasUseCase.test.ts` com 100% de cobertura — testar: retorno da lista de atas quando repositório resolve com sucesso; propagação do `AtaError` quando repositório rejeita; retorno de array vazio quando repositório resolve com `[]` (depende de T005)

**Checkpoint**: Fundação pronta — `npx vitest run` deve executar e passar nos testes de `ListarAtasUseCase`.

---

## Fase 3: Histórias de Usuário 1 e 2 — Visualizar Atas e Identificação do Licitante (Prioridade: P1) 🎯 MVP

**Objetivo**: O usuário autenticado com licitante ativo acessa a página de gestão de atas e vê a lista real do servidor. O identificador do licitante é enviado automaticamente no header `X-Licitante-Id` pelo `apiClient` existente.

**Teste Independente**: Com o servidor l1core rodando e ao menos uma ata cadastrada, acessar `/atas` e verificar que a lista exibe dados reais (não os estáticos), com indicador de carregamento durante a busca e lista vazia quando não há atas.

### Implementação — Data Layer (US1 + US2)

- [x] T007 [P] [US1] Criar mapper `mapApiAtaToAta` em `src/features/atas/data/mappers/atasMappers.ts` que converte o formato snake_case da API (`ApiAtaListagemResponse`) para a entidade `Ata` do domínio — tipo `ApiAtaListagemResponse` definido localmente no arquivo com os campos: `id`, `numero`, `objeto`, `orgao_gerenciador: { nome: string; cnpj: string }`, `vigencia_inicial`, `vigencia_final`, `valor_registrado`, `saldo`, `contratos`, `status`, `aceita_adesao`, `renovavel`

- [x] T008 [US1] Criar `AtasRepository` em `src/features/atas/data/repositories/AtasRepository.ts` implementando `IAtasRepository` — chamar `apiFetch('/api/atas', { method: 'GET' })` e mapear cada item da resposta com `mapApiAtaToAta`; para falha de rede (catch), lançar `AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.')` (depende de T004, T007)

### Implementação — Presentation Layer (US1 + US2)

- [x] T009 [US1] Criar hook `useListarAtas` em `src/features/atas/presentation/hooks/useListarAtas.ts` que instancia `AtasRepository` e `ListarAtasUseCase` internamente, dispara a busca no `useEffect` inicial e expõe `{ atas: Ata[], isLoading: boolean, error: string | null, refetch: () => void }` (depende de T005, T008)

- [x] T010 [US1] Atualizar `ArpGestaoPage` em `src/features/atas/presentation/pages/ArpGestaoPage.tsx`:
  - Remover a constante estática `ARPS` e a interface local `Arp`
  - Importar e usar `useListarAtas`
  - Exibir `<LoadingLogo />` (ou skeleton) quando `isLoading === true`
  - Exibir os dados retornados quando carregado com sucesso
  - Adaptar a lógica de filtro e a linha de tabela para usar os campos da entidade `Ata` do domínio (ex: `ata.numero` em vez de `arp.numeroAta`, `ata.orgaoGerenciador.nome` em vez de `arp.orgaoGerenciador`, `ata.valorRegistrado` em vez de `arp.valorTotalRegistrado`, `ata.vigenciaFinal` em vez de `arp.vigenciaFinal`)
  - Mapear `status` do domínio para rótulos de exibição: `ATIVA` → `'Ativa'`, `PROXIMA_AO_VENCIMENTO` → `'Próxima ao Vencimento'`, `ENCERRADA` → `'Encerrada'`
  - Manter filtro de busca por texto e por status sobre os dados retornados
  (depende de T009)

**Checkpoint**: Neste ponto, US1 e US2 são totalmente funcionais. A página exibe atas reais, o licitante ativo é identificado automaticamente e o indicador de carregamento funciona.

---

## Fase 4: História de Usuário 3 — Tratamento de Falha na Busca (Prioridade: P2)

**Objetivo**: Quando a API retorna erro, o usuário vê uma mensagem clara com opção de nova tentativa — sem tela em branco ou quebrada.

**Teste Independente**: Desconectar o servidor ou simular erro de rede e verificar que a página exibe mensagem de erro com botão "Tentar novamente" que refaz a busca.

### Implementação (US3)

- [x] T011 [US3] Expandir `AtasRepository` em `src/features/atas/data/repositories/AtasRepository.ts` com tratamento completo de erros HTTP — status 401: `AtaError('Sessão expirada. Faça login novamente.')`, status 403: `AtaError('Acesso negado. Você não tem permissão para visualizar estas atas.')`, status 400: `AtaError('Nenhum licitante ativo selecionado.')`, outros erros: `AtaError('Erro ao carregar atas. Tente novamente.')` (depende de T008)

- [x] T012 [US3] Adicionar estado de erro em `ArpGestaoPage` em `src/features/atas/presentation/pages/ArpGestaoPage.tsx`: quando `error !== null`, exibir card/alerta com a mensagem de erro e botão "Tentar novamente" que chama `refetch()` do hook `useListarAtas` (depende de T010, T011)

**Checkpoint**: Neste ponto, US1, US2 e US3 são funcionais. Erros de rede e API são comunicados ao usuário com opção de retry.

---

## Fase 5: Polimento & Aspectos Transversais

- [x] T013 [P] Verificar que todos os tipos TypeScript estão explícitos e sem uso de `any` em todos os arquivos criados (`ata.ts`, `ataErrors.ts`, `IAtasRepository.ts`, `ListarAtasUseCase.ts`, `atasMappers.ts`, `AtasRepository.ts`, `useListarAtas.ts`, `ArpGestaoPage.tsx`)

- [x] T014 Executar `npx vitest run` e confirmar que todos os testes passam, incluindo `ListarAtasUseCase.test.ts` com 100% de cobertura do use case

---

## Dependências & Ordem de Execução

### Dependências entre Fases

```
Fase 1 (Setup)
    └── Fase 2 (Fundação: domínio)
            ├── Fase 3 (US1+US2: data layer + presentation)
            │       └── Fase 4 (US3: error handling)
            │               └── Fase 5 (Polimento)
            └── [T002 e T003 podem ser paralelos entre si]
```

### Dependências dentro da Fase 2

- T002 e T003 → paralelos entre si
- T004 → depende de T002
- T005 → depende de T004
- T006 → depende de T005

### Dependências dentro da Fase 3

- T007 → paralelo a T008 (arquivos distintos); T007 deve estar pronto para T008
- T008 → depende de T004 (interface) e T007 (mapper)
- T009 → depende de T005 (use case) e T008 (repositório)
- T010 → depende de T009

### Oportunidades de Paralelismo

- T002 e T003 (entidade + erro de domínio) — arquivos distintos, sem dependências entre si
- T007 (mapper) pode ser iniciado assim que T002 estiver pronto

---

## Exemplo de Paralelismo: Fase 2 (Fundação)

```bash
# Iniciar juntos (sem dependências):
Task T002: "Criar entidade Ata em src/features/atas/domain/entities/ata.ts"
Task T003: "Criar AtaError em src/features/atas/domain/errors/ataErrors.ts"

# Após T002 concluído:
Task T004: "Criar IAtasRepository em src/features/atas/domain/repositories/IAtasRepository.ts"

# Após T004 concluído:
Task T005: "Criar ListarAtasUseCase em src/features/atas/domain/usecases/ListarAtasUseCase.ts"
Task T006: "Criar ListarAtasUseCase.test.ts (100% cobertura)"
```

---

## Estratégia de Implementação

### MVP First (US1 + US2 — Prioridade P1)

1. Concluir Fase 1: Setup (T001)
2. Concluir Fase 2: Fundação (T002–T006) — CRÍTICO
3. Concluir Fase 3: US1 + US2 (T007–T010)
4. **PARAR e VALIDAR**: A página exibe atas reais com indicador de carregamento e lista vazia
5. Adicionar US3 (T011–T012) para tratamento de erros

### Escopo de cada fase como incremento entregável

- Após Fase 2: use case testável, camada de domínio completa
- Após Fase 3: feature funcional de ponta a ponta (MVP)
- Após Fase 4: experiência robusta com tratamento de falhas
- Após Fase 5: código validado, sem débito técnico
