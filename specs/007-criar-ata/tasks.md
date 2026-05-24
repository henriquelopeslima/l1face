# Tarefas: Criar Ata de Registro de Preços

**Entrada**: Documentos de design em `specs/007-criar-ata/`  
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organização**: As tarefas são agrupadas por história de usuário para permitir implementação e teste independentes.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence
- Caminhos relativos à raiz do repositório

---

## Fase 1: Setup (Fundação de Domínio)

**Propósito**: Criar entidades de domínio e atualizar a interface do repositório. Estes artefatos bloqueiam TODAS as histórias de usuário — devem ser concluídos antes de qualquer fase subsequente.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [X] T001 Criar entidades de domínio `CriarAtaInput`, `ItemAtaInput` e `DadosAtaPncp` em `src/features/atas/domain/entities/criarAta.ts`
- [X] T002 Atualizar `src/features/atas/domain/repositories/IAtasRepository.ts` adicionando as assinaturas `criarAta(input: CriarAtaInput): Promise<AtaDetalhes>` e `consultarAtaPncp(codigo: string): Promise<DadosAtaPncp>`

**Checkpoint**: Entidades e interface prontas — implementação das histórias pode começar.

---

## Fase 2: História de Usuário 1 — Cadastrar Ata Manualmente (Prioridade: P1) 🎯 MVP

**Objetivo**: Integrar o botão "Finalizar Cadastro" do wizard com a API real, persistindo a ata com seus itens. Inclui refatoração do state do componente para alinhar nomes de campos com o contrato da API.

**Teste Independente**: Preencher as 3 etapas do wizard com dados válidos, clicar "Finalizar Cadastro" e verificar que a ata aparece na listagem de atas (`/atas/gestao`).

### Implementação para História de Usuário 1

- [X] T003 [P] [US1] Criar `src/features/atas/data/mappers/criarAtaMappers.ts` com as funções `mapCriarAtaInputToApiRequest` (domínio → API, inclui `ativo: true` fixo) e `mapApiAtaResponseToAtaDetalhes` (reutiliza `ataDetalhesMappers`)
- [X] T004 [P] [US1] Criar `src/features/atas/domain/usecases/CriarAtaUseCase.ts` com método `execute(input: CriarAtaInput): Promise<AtaDetalhes>` delegando ao repositório
- [X] T005 [P] [US1] Criar `src/features/atas/domain/usecases/CriarAtaUseCase.test.ts` cobrindo: sucesso (201), AtaError em 401, 403, 404, 422 e falha de rede (100% cobertura)
- [X] T006 [US1] Adicionar método `criarAta(input: CriarAtaInput): Promise<AtaDetalhes>` em `src/features/atas/data/repositories/AtasRepository.ts` com `POST /api/atas` e tratamento dos status 400, 401, 403, 404, 422 e erro de rede (depende de T003)
- [X] T007 [US1] Criar `src/features/atas/presentation/hooks/useCriarAta.ts` retornando `{ criarAta, isLoading, error }` — imperativo, sem auto-execução (depende de T004, T006)
- [X] T008 [US1] Atualizar `src/features/atas/presentation/components/CadastrarArp.tsx`: refatorar interfaces locais `DadosArp` e `ItemArp` alinhando nomes ao contrato da API (conforme `data-model.md`), substituir `finalizarCadastro` mock pelo hook `useCriarAta`, trocar campo `anexoArp: File` por `anexoUrl: string` (campo de texto para URL) (depende de T007)

**Checkpoint**: Cadastro de ata funcional de ponta a ponta — formulário → API → listagem.

---

## Fase 3: História de Usuário 2 — Pré-preencher via Código PNCP (Prioridade: P2)

**Objetivo**: Substituir a função `buscarPNCP` mockada no componente pela integração real com `/api/pncp/atas?codigo=`, pré-preenchendo os campos do formulário com os dados retornados.

**Teste Independente**: Digitar um código PNCP válido no campo "Código PNCP", clicar "Buscar" e verificar que os campos nome do órgão, CNPJ, descrição e datas de vigência são preenchidos automaticamente.

### Implementação para História de Usuário 2

- [X] T009 [P] [US2] Criar `src/features/atas/data/mappers/pncpMappers.ts` com a função `mapApiDadosAtaPncpToDadosAtaPncp` (snake_case → camelCase, conforme `data-model.md`)
- [X] T010 [P] [US2] Criar `src/features/atas/domain/usecases/ConsultarAtaPncpUseCase.ts` com método `execute(codigo: string): Promise<DadosAtaPncp>` delegando ao repositório
- [X] T011 [P] [US2] Criar `src/features/atas/domain/usecases/ConsultarAtaPncpUseCase.test.ts` cobrindo: sucesso (200), AtaError em 404, 422, 503 e falha de rede (100% cobertura)
- [X] T012 [US2] Adicionar método `consultarAtaPncp(codigo: string): Promise<DadosAtaPncp>` em `src/features/atas/data/repositories/AtasRepository.ts` com `GET /api/pncp/atas?codigo={encodeURIComponent(codigo)}` e tratamento dos status 400, 401, 404, 422, 503 (atenção: erros PNCP retornam campo `erro`, não `error`) (depende de T009)
- [X] T013 [US2] Criar `src/features/atas/presentation/hooks/useConsultarAtaPncp.ts` retornando `{ consultar, isLoading, error, dados }` — imperativo (depende de T010, T012)
- [X] T014 [US2] Atualizar `src/features/atas/presentation/components/CadastrarArp.tsx`: substituir `buscarPNCP` mock pelo hook `useConsultarAtaPncp`; ao receber `DadosAtaPncp`, preencher `nomeOrgaoGerenciador`, `cnpjOrgaoGerenciador`, `descricao`, `dataInicioVigencia`, `dataFimVigencia` e `numeroPncp`; remover o `buscarCNPJ` mock (campo CNPJ separado do nome do órgão é suficiente via PNCP); exibir erros de busca inline (depende de T013)

**Checkpoint**: Lookup PNCP funcional — código → API → campos pré-preenchidos no formulário.

---

## Fase 4: História de Usuário 3 — Gerenciar Itens com Número e Controle de Carona (Prioridade: P2)

**Objetivo**: Adicionar o campo `numeroItem` obrigatório aos itens do formulário (campo que faltava) e garantir que a quantidade para carona seja zerada/desabilitada quando `aceitaAdesao` é `false`.

**Teste Independente**: Adicionar dois itens com o mesmo número, verificar que o sistema bloqueia a submissão. Desativar "Aceita Adesão", verificar que o campo de quantidade para carona some dos itens e seu valor é enviado como zero na criação.

### Implementação para História de Usuário 3

- [X] T015 [US3] Atualizar `src/features/atas/presentation/components/CadastrarArp.tsx` na Etapa 2 (itens): adicionar coluna "Nº Item" (campo `numeroItem: number`) na tabela de itens, validar unicidade de `numeroItem` antes de avançar para a Etapa 3, inicializar `numeroItem` auto-incrementado ao adicionar novo item (depende de T008, T014)
- [X] T016 [US3] Atualizar `src/features/atas/presentation/components/CadastrarArp.tsx`: garantir que ao desativar `aceitaAdesao` todos os `qtdParaCarona` dos itens sejam zerados imediatamente via efeito ou handler; coluna "Qtd. Carona" permanece oculta na tabela quando `aceitaAdesao` é `false` (comportamento já existia parcialmente — garantir consistência com os novos nomes de campos)

**Checkpoint**: Itens com número único obrigatório e controle de carona coerente com o flag da ata.

---

## Fase 5: Polimento & Aspectos Transversais

**Propósito**: Verificação final de qualidade, TypeScript estrito e revisão de cobertura de testes.

- [X] T017 [P] Executar `npx tsc --noEmit` e corrigir qualquer erro de tipagem em todos os arquivos modificados ou criados (`criarAta.ts`, `IAtasRepository.ts`, `CriarAtaUseCase.ts`, `ConsultarAtaPncpUseCase.ts`, `criarAtaMappers.ts`, `pncpMappers.ts`, `AtasRepository.ts`, `useCriarAta.ts`, `useConsultarAtaPncp.ts`, `CadastrarArp.tsx`)
- [X] T018 [P] Executar `npx vitest run` e verificar que `CriarAtaUseCase.test.ts` e `ConsultarAtaPncpUseCase.test.ts` passam com 100% de cobertura nos use cases
- [X] T019 Revisar `CadastrarArp.tsx` final: verificar que não há `any`, que `useMemo`/`useCallback` são usados apenas onde necessário, e que erros da API são exibidos ao usuário sem expor detalhes técnicos

---

## Dependências & Ordem de Execução

### Dependências entre Fases

```
Fase 1 (Setup/Fundação)
  ├── T001 → entidades de domínio
  └── T002 → interface do repositório (depende de T001)
        ↓ BLOQUEIA TODAS AS FASES ABAIXO
Fase 2 (US1 — Cadastrar Manualmente)
  ├── T003, T004, T005 [P] — podem rodar juntos (arquivos diferentes)
  ├── T006 — depende de T003
  ├── T007 — depende de T004, T006
  └── T008 — depende de T007
        ↓
Fase 3 (US2 — PNCP)
  ├── T009, T010, T011 [P] — podem rodar juntos
  ├── T012 — depende de T009
  ├── T013 — depende de T010, T012
  └── T014 — depende de T013
        ↓
Fase 4 (US3 — Itens)
  ├── T015 — depende de T008, T014
  └── T016 — depende de T015
        ↓
Fase 5 (Polimento)
  ├── T017, T018 [P] — podem rodar juntos
  └── T019 — depende de T017, T018
```

### Dependências entre Histórias de Usuário

- **US1 (P1)**: Pode começar após Fase 1 — sem dependências de outras histórias
- **US2 (P2)**: Pode começar após US1 — adiciona PNCP sobre a base do US1
- **US3 (P2)**: Depende de US1 e US2 — ajuste final do componente unificado

### Oportunidades de Paralelismo (dentro das fases)

```bash
# Fase 2 — iniciar juntos:
Task T003: criarAtaMappers.ts
Task T004: CriarAtaUseCase.ts
Task T005: CriarAtaUseCase.test.ts

# Fase 3 — iniciar juntos:
Task T009: pncpMappers.ts
Task T010: ConsultarAtaPncpUseCase.ts
Task T011: ConsultarAtaPncpUseCase.test.ts

# Fase 5 — iniciar juntos:
Task T017: tsc --noEmit
Task T018: vitest run
```

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 1 (T001, T002)
2. Concluir Fase 2 (T003–T008)
3. **PARAR e VALIDAR**: Testar cadastro manual de ata de ponta a ponta
4. Avançar para US2 (PNCP) e US3 (itens)

### Entrega Incremental

1. Fase 1 → Fase 2 → **Demo: cadastrar ata manualmente** (MVP!)
2. + Fase 3 → **Demo: buscar e pré-preencher via PNCP**
3. + Fase 4 → **Demo: itens com número único e controle de carona**
4. + Fase 5 → **Release: polimento e TypeScript estrito**

---

## Notas

- `CadastrarArp.tsx` é atualizado em 3 momentos (T008, T014, T015/T016) — fazer commits separados por fase
- Erros da API PNCP retornam campo `erro` (não `error`) — atenção no mapeamento em T012
- O campo `ativo: true` deve ser fixo no mapper (`criarAtaMappers.ts`), nunca exposto ao usuário
- Upload de arquivo (planilha e anexo PDF) permanece mock visual — fora de escopo
- `buscarCNPJ` (consulta por CNPJ separada do PNCP) é removido em T014 — o CNPJ vem do PNCP ou é preenchido manualmente pelo usuário
