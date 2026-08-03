---

description: "Tarefas: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho"
---

# Tarefas: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho

**Entrada**: Documentos de design em `/specs/032-upload-anexo-ata-instrumentos/`
**Pré-requisitos**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Testes**: Incluídos — solicitados explicitamente pelo usuário ("Novos testes para os 3 use
cases de upload e a orquestração criar→upload nos formulários"). Seguem o único padrão de teste já
existente no repositório: unitário puro para Use Cases (`vitest`, sem DOM) e `renderHook` para
hooks de apresentação (mirror de `UploadFotoPerfilUseCase.test.ts` e `useBuscarInstrumento.test.ts`
respectivamente) — não há nenhum teste de componente (`.test.tsx`) em todo o repositório hoje, e
esta funcionalidade não introduz o primeiro, pois a orquestração vive nos hooks, não inline nos
componentes (ver `contracts/orquestracao-criar-upload.md`).

**Nota sobre a ordem de implementação**: a ordem das fases abaixo segue **dependência técnica**,
não a prioridade de negócio (P1/P2) do spec.md. US3 (P2 — habilitar/criar os widgets de arquivo)
é implementada **antes** de US1 (P1 — upload automático), porque o teste independente de US1 exige
selecionar um arquivo em um formulário ("cadastrando uma nova Ata... com um arquivo PDF selecionado
no formulário") — e hoje esse campo não existe (Ata) ou está desabilitado (Contrato/Empenho). Sem
US3, US1 não tem nada para testar ponta a ponta. US2 (P1 — falha parcial) vem por último porque
estende o mesmo bloco try/catch introduzido por US1.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)
- Caminhos de arquivo são relativos à raiz do repositório `l1face/`

---

## Fase 1: Setup (Remoção da entrada legada de anexoUrl)

**Propósito**: Remover o campo `anexoUrl` da entrada de criação antes de introduzir a nova
capacidade de upload — mudança mecânica e independente de qualquer história de usuário.

- [X] T001 [P] Remover campo `anexoUrl: string | null` de `CriarAtaInput` em `src/features/atas/domain/entities/criarAta.ts`
- [X] T002 [P] Remover campo `anexoUrl?: string | null` de `CriarContratoInput` e `CriarEmpenhoInput` em `src/features/instrumentos/domain/entities/criarContrato.ts`
- [X] T003 Remover mapeamento `anexo_url: input.anexoUrl || null` de `mapCriarAtaInputToApiRequest` e o campo correspondente de `ApiCriarAtaRequest` em `src/features/atas/data/mappers/criarAtaMappers.ts` (depende de T001)
- [X] T004 [P] Remover linha `if (input.anexoUrl != null) body.anexo_url = input.anexoUrl;` de `mapCriarContratoInputToApiRequest` em `src/features/instrumentos/data/mappers/criarContratoMappers.ts` (depende de T002)
- [X] T005 [P] Remover linha `if (input.anexoUrl != null) body.anexo_url = input.anexoUrl;` de `mapCriarEmpenhoInputToApiRequest` em `src/features/instrumentos/data/mappers/criarEmpenhoMappers.ts` (depende de T002)
- [X] T006 Remover linha `anexoUrl: null,` de `inputFixture` em `src/features/atas/domain/usecases/CriarAtaUseCase.test.ts` (depende de T001; único teste que de fato referencia `CriarAtaInput.anexoUrl` — `GetAtaUseCase.test.ts`, `BuscarInstrumentoUseCase.test.ts` e `useBuscarInstrumento.test.ts` usam `anexoUrl` da entidade de **detalhe**, não afetada por esta remoção, e não precisam de nenhuma alteração)
- [X] T007 Em `src/features/atas/presentation/components/CadastrarArp.tsx`: remover por completo o state `anexoUrl` de `dadosArp` (linha ~60/95), o campo `<Label htmlFor="anexoUrl">`/`<Input id="anexoUrl">` de texto (linhas ~455-462), a linha `anexoUrl: dadosArp.anexoUrl || null,` do input de criação (linha ~261) e o bloco de exibição condicional `{dadosArp.anexoUrl && (...)}` na etapa de revisão (linhas ~739-744) — sem deixar nada comentado

**Checkpoint**: `anexoUrl` não existe mais em nenhuma entrada de criação nem no formulário de Ata; suíte de testes existente passa (`npm run test`).

---

## Fase 2: Fundação — Camada de dados/domínio de upload (bloqueia US1 e US2)

**Propósito**: Construir `uploadAnexo`/`removerAnexo` nos repositórios de `atas` e `instrumentos`
e os 3 Use Cases de upload — reaproveitados por US1 e US2. Não bloqueia US3 (puramente de UI),
que pode ser feita em paralelo a esta fase.

- [X] T008 [P] Criar `AnexoAtaResult` em `src/features/atas/domain/entities/anexoAta.ts` (`{ anexoUrl: string }`)
- [X] T009 [P] Criar `AnexoInstrumentoResult` em `src/features/instrumentos/domain/entities/anexoInstrumento.ts` (`{ anexoUrl: string }`)
- [X] T010 [P] Adicionar `FormatoInvalidoAnexoError` e `ArquivoMuitoGrandeAnexoError` (extends `AtaError`) em `src/features/atas/domain/errors/ataErrors.ts`
- [X] T011 [P] Criar `src/features/instrumentos/domain/errors/instrumentosErrors.ts` com `InstrumentosError` (mover a classe hoje privada em `InstrumentosRepository.ts` para cá, exportada) + `FormatoInvalidoAnexoError` + `ArquivoMuitoGrandeAnexoError`
- [X] T012 Adicionar `uploadAnexo(ataId: string, arquivo: File): Promise<AnexoAtaResult>` e `removerAnexo(ataId: string): Promise<void>` à interface `IAtasRepository` em `src/features/atas/domain/repositories/IAtasRepository.ts` (depende de T008)
- [X] T013 Adicionar `uploadAnexoContrato`, `removerAnexoContrato`, `uploadAnexoEmpenho`, `removerAnexoEmpenho` à interface `IInstrumentosRepository` em `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts` (depende de T009)
- [X] T014 Implementar `AtasRepository.uploadAnexo`/`removerAnexo` em `src/features/atas/data/repositories/AtasRepository.ts` — `PUT`/`DELETE /api/atas/{id}/anexo`, `FormData` com campo `anexo`, mapeando 404/415/422(`arquivo_muito_grande`)/503 conforme `contracts/IAtasRepository-anexo.md` (depende de T010, T012)
- [X] T015 Atualizar `InstrumentosRepository.ts` para importar `InstrumentosError` de `instrumentosErrors.ts` (remover a classe local duplicada) e implementar `uploadAnexoContrato`/`uploadAnexoEmpenho`/`removerAnexoContrato`/`removerAnexoEmpenho` (com um método privado `uploadAnexo(url, arquivo)` compartilhado) em `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`, conforme `contracts/IInstrumentosRepository-anexo.md` (depende de T011, T013)
- [X] T016 [P] Criar `UploadAnexoAtaUseCase` em `src/features/atas/domain/usecases/UploadAnexoAtaUseCase.ts` — valida `application/pdf`/10 MB antes de delegar a `repository.uploadAnexo`, mirror de `UploadFotoPerfilUseCase` (depende de T010, T012)
- [X] T017 [P] Criar `UploadAnexoContratoUseCase` em `src/features/instrumentos/domain/useCases/UploadAnexoContratoUseCase.ts` (mesma validação, delega a `repository.uploadAnexoContrato`) (depende de T011, T013)
- [X] T018 [P] Criar `UploadAnexoEmpenhoUseCase` em `src/features/instrumentos/domain/useCases/UploadAnexoEmpenhoUseCase.ts` (mesma validação, delega a `repository.uploadAnexoEmpenho`) (depende de T011, T013)
- [X] T019 [P] Testes unitários de `UploadAnexoAtaUseCase` em `src/features/atas/domain/usecases/UploadAnexoAtaUseCase.test.ts` — mirror de `UploadFotoPerfilUseCase.test.ts`: aceita PDF válido até 10 MB, rejeita mimetype diferente de `application/pdf` com `FormatoInvalidoAnexoError`, rejeita >10 MB com `ArquivoMuitoGrandeAnexoError`, aceita exatamente 10 MB, propaga erro do repositório (depende de T016)
- [X] T020 [P] Testes unitários de `UploadAnexoContratoUseCase` em `src/features/instrumentos/domain/useCases/UploadAnexoContratoUseCase.test.ts` (mesmos casos de T019) (depende de T017)
- [X] T021 [P] Testes unitários de `UploadAnexoEmpenhoUseCase` em `src/features/instrumentos/domain/useCases/UploadAnexoEmpenhoUseCase.test.ts` (mesmos casos de T019) (depende de T018)

**Checkpoint**: `uploadAnexo`/`removerAnexo` funcionam de ponta a ponta contra a API (repositório → rota real) para as 3 entidades; os 3 Use Cases têm 100% de cobertura própria.

---

## Fase 3: História de Usuário 3 - Selecionar um arquivo para anexar (Prioridade: P2) 🔧 pré-requisito de UI

**Objetivo**: Cada um dos 3 formulários de cadastro permite selecionar um PDF do computador,
sem bloqueios visuais nem campo de texto de URL.

**Teste Independente**: Abrir cada um dos 3 formulários e confirmar que é possível selecionar um
arquivo PDF, sem avisos "Em breve!" e sem campo de texto de URL (a seleção ainda não precisa
disparar upload algum nesta fase — isso é US1).

### Implementação para História de Usuário 3

- [X] T022 [P] [US3] Em `src/features/atas/presentation/components/CadastrarArp.tsx`: adicionar novo state `arquivoAnexo: File | null` e um novo campo `<Input type="file" accept="application/pdf">` no mesmo padrão visual usado em `CadastrarNotaEmpenho.tsx`/`CadastrarContrato.tsx`, na etapa onde hoje ficava o campo de texto removido em T007
- [X] T023 [P] [US3] Em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx` (linhas ~720-735): remover o `disabled` do `<Input type="file">`, o `<Tooltip>`/`<TooltipContent>Em breve!</TooltipContent>` ao redor, e a classe `opacity-50`/`cursor-not-allowed`/`pointer-events-none` do wrapper — mantendo o state `anexoContrato` já existente
- [X] T024 [P] [US3] Em `src/features/instrumentos/presentation/components/CadastrarNotaEmpenho.tsx` (linhas ~478-495): remover o `disabled` do `<input type="file">`, o `<Tooltip>`/`<TooltipContent>Em breve!</TooltipContent>` ao redor, e as classes `opacity-50`/`cursor-not-allowed` do `<label>` — mantendo o state `anexo` já existente

**Checkpoint**: os 3 formulários permitem selecionar um PDF do computador; nenhum ainda envia o arquivo ao confirmar o cadastro (isso é US1).

---

## Fase 4: História de Usuário 1 - Enviar o anexo automaticamente ao concluir o cadastro (Prioridade: P1) 🎯 MVP

**Objetivo**: Ao confirmar o cadastro com um arquivo selecionado, o registro é criado e o arquivo
é enviado automaticamente como anexo, usando o id retornado pela criação — sem etapa manual
adicional.

**Teste Independente**: Cadastrar uma Ata (ou Contrato/Empenho) com um PDF válido selecionado;
verificar que o registro é criado, o anexo é enviado em seguida sem ação extra do usuário, e que a
listagem/detalhes do registro mostra o link do anexo enviado.

### Implementação para História de Usuário 1

> **Nota de execução**: T025-T027 foram implementadas já incluindo o `try/catch` de T031-T033
> (anexoFalhouUpload) na mesma edição — separar as duas produziria um estado intermediário
> genuinamente quebrado (uma falha de upload sem catch seria capturada pelo catch externo de
> criação e reportada como falha total da criação, o que é o oposto do que a spec pede). O
> checkpoint desta fase e o de US2 foram alcançados juntos.

- [X] T025 [US1] Estender `useCriarAta` em `src/features/atas/presentation/hooks/useCriarAta.ts`: função `criarAta` passa a aceitar um segundo parâmetro opcional `arquivo?: File | null`; após `criarAtaUseCase.execute(input)` resolver, se `arquivo` foi passado, chama `new UploadAnexoAtaUseCase(repository).execute(criado.id, arquivo)` antes de retornar `criado` (depende de T016)
- [X] T026 [US1] Estender `useCriarContrato` em `src/features/instrumentos/presentation/hooks/useCriarContrato.ts` da mesma forma, chamando `UploadAnexoContratoUseCase` com o `instrumentoId` retornado por `criarContrato` (depende de T017)
- [X] T027 [US1] Estender `useCriarEmpenho` em `src/features/instrumentos/presentation/hooks/useCriarEmpenho.ts` da mesma forma, chamando `UploadAnexoEmpenhoUseCase` com o `instrumentoId` retornado por `criarEmpenho` (depende de T018)
- [X] T028 [US1] Em `src/features/atas/presentation/components/CadastrarArp.tsx`, `finalizarCadastro` passa a chamar `criarAta(input, arquivoAnexo)` (arquivo de T022) em vez de `criarAta(input)` (depende de T025, T022)
- [X] T029 [US1] Em `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`, `finalizarCadastro` passa a chamar `criarContrato(input, dadosContrato.anexoContrato)` (depende de T026)
- [X] T030 [US1] Em `src/features/instrumentos/presentation/components/CadastrarNotaEmpenho.tsx`: substituir o `navigate('/instrumentos/gestao')` síncrono em `salvar()` por: chamar `criarEmpenho(input, anexo)`, e — se `instrumentoId` vier preenchido — exibir a mesma tela `CadastroSucesso` (`processandoCadastro`/`cadastroConcluido`, mirror de `CadastrarContrato.tsx` linhas ~347-368) com `onConcluir={() => navigate('/instrumentos/gestao')}`, em vez de navegar imediatamente (depende de T027, T024)

**Checkpoint**: os 3 fluxos de cadastro enviam automaticamente o anexo selecionado após a criação, sem etapa manual — MVP completo e demonstrável.

---

## Fase 5: História de Usuário 2 - Continuar normalmente quando a criação funciona mas o upload falha (Prioridade: P1)

**Objetivo**: Quando o upload falha após uma criação bem-sucedida, o usuário vê uma mensagem
distinta (não um erro total) e segue para o mesmo destino de sempre.

**Teste Independente**: Forçar falha no upload (ex.: arquivo que passa na validação client-side mas
é rejeitado pelo servidor, ou queda de rede logo após a criação) e verificar que a tela final exibe
o aviso de anexo não enviado, mas o registro existe e o fluxo não trava no formulário.

### Implementação para História de Usuário 2

- [X] T031 [US2] Em `useCriarAta` (`src/features/atas/presentation/hooks/useCriarAta.ts`): envolver a chamada a `UploadAnexoAtaUseCase.execute` (introduzida em T025) em `try/catch`; no `catch`, setar novo state `anexoFalhouUpload = true` e **não** relançar o erro — `criado` continua sendo retornado normalmente; expor `anexoFalhouUpload` no retorno do hook (depende de T025)
- [X] T032 [US2] Aplicar a mesma mudança em `useCriarContrato` (`src/features/instrumentos/presentation/hooks/useCriarContrato.ts`) (depende de T026)
- [X] T033 [US2] Aplicar a mesma mudança em `useCriarEmpenho` (`src/features/instrumentos/presentation/hooks/useCriarEmpenho.ts`) (depende de T027)
- [X] T034 [P] [US2] Testes de `useCriarAta` em `src/features/atas/presentation/hooks/useCriarAta.test.ts` (mirror de `useBuscarInstrumento.test.ts`, mockando os 2 Use Cases): cria com sucesso sem arquivo (`anexoFalhouUpload` false, upload nunca chamado); cria com sucesso e upload OK (`anexoFalhouUpload` false); cria com sucesso e upload falha (retorna `criado` normalmente, `anexoFalhouUpload` true); falha na criação (retorna `null`, `error` setado, upload nunca chamado) (depende de T031)
- [X] T035 [P] [US2] Testes equivalentes de `useCriarContrato` em `src/features/instrumentos/presentation/hooks/useCriarContrato.test.ts` (depende de T032)
- [X] T036 [P] [US2] Testes equivalentes de `useCriarEmpenho` em `src/features/instrumentos/presentation/hooks/useCriarEmpenho.test.ts` (depende de T033)
- [X] T037 [US2] Em `CadastrarArp.tsx`: ler `anexoFalhouUpload` do retorno de `useCriarAta` e renderizar o `<Alert>` não-destrutivo ("Registro criado, mas o anexo não foi enviado...", conforme `contracts/orquestracao-criar-upload.md`) junto ao `<CadastroSucesso>` quando verdadeiro (depende de T031, T028)
- [X] T038 [US2] Mesma renderização condicional em `CadastrarContrato.tsx`, junto ao `<CadastroSucesso>` já existente (depende de T032, T029)
- [X] T039 [US2] Mesma renderização condicional em `CadastrarNotaEmpenho.tsx`, junto à tela `<CadastroSucesso>` introduzida em T030 (depende de T033, T030)

**Checkpoint**: falha isolada no upload nunca bloqueia o usuário nem é tratada como erro total em nenhum dos 3 formulários — spec.md RF-005/RF-006/RF-007/RF-009 totalmente cobertos.

---

## Fase Final: Polimento

- [X] T040 [P] Rodar `npm run test -- src/features/atas src/features/instrumentos` e confirmar 100% dos testes novos/existentes passando — 84/84 nesses dois diretórios; suíte completa do repositório: 205/205 testes unitários passando (os únicos 2 arquivos que aparecem como "falhos" são specs Playwright de `e2e/` sendo indevidamente coletados pelo Vitest, um problema de configuração pré-existente e não relacionado a esta feature — confirmado comparando com a base antes das mudanças via `git stash`)
- [X] T041 [P] Rodar `npm run lint` e `npx tsc --noEmit`/`npm run build` para confirmar ausência de `any`/tipos quebrados após a remoção de `anexoUrl` — `tsc --noEmit` e `eslint` limpos nos arquivos tocados (0 problemas novos; os 40 problemas de lint pré-existentes no repositório são idênticos antes/depois). **Achado durante esta tarefa**: `npm run build` (que roda `tsc -b`, modo composite/project-reference, mais rigoroso que `--noEmit` solto) revelou que `CriarAtaUseCase.test.ts` e `ConsultarAtaPncpUseCase.test.ts` tinham um `makeRepo()` que construía `IAtasRepository` como objeto literal sem cast, então o novo `uploadAnexo`/`removerAnexo` obrigatório quebrava o build — corrigido adicionando os 2 mocks a ambos os arquivos (mudança mecânica, nenhum assert dependia disso). `npm run build` passa limpo agora.
- [X] T042 Executar manualmente os 6 roteiros de `quickstart.md` — **não executado nesta sessão**: requer `l1core` rodando localmente (prerequisito do próprio quickstart.md) e as 3 páginas de cadastro ficam atrás de rota autenticada; nenhum backend estava disponível no ambiente desta implementação (`curl` ao endpoint local não respondeu). A verificação nesta sessão se apoiou em `tsc -b`/`vite build` (build de produção real, não só `--noEmit`), `eslint` e nos 84 testes automatizados dos 2 features tocados — não substitui a validação manual ponta a ponta contra uma API real, que fica pendente para quem tiver o ambiente completo disponível.

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: sem dependências — pode começar imediatamente.
- **Fundação (Fase 2)**: independente do Setup (arquivos diferentes); pode rodar em paralelo à
  Fase 1. Bloqueia US1 (Fase 4) e US2 (Fase 5) — ambas chamam os Use Cases criados aqui.
- **US3 (Fase 3)**: depende apenas do Setup (Fase 1, especialmente T007 para Ata) — pode rodar em
  paralelo à Fundação (Fase 2), pois não usa nenhum Use Case novo.
- **US1 (Fase 4)**: depende da Fundação (Fase 2) **e** de US3 (Fase 3) — precisa do arquivo
  selecionável (US3) e dos Use Cases de upload (Fundação) para orquestrar.
- **US2 (Fase 5)**: depende de US1 (Fase 4) — estende o mesmo bloco try/catch introduzido lá.
- **Polimento (Fase Final)**: depende de todas as fases anteriores.

### Oportunidades de Paralelismo

- T001-T002 [P] entre si; T004-T005 [P] entre si (arquivos diferentes).
- Toda a Fase 2 marcada [P] (T008-T011, T016-T021 em pares por feature) pode ser paralelizada,
  respeitando as dependências indicadas.
- Fase 3 (US3): T022, T023, T024 são 3 arquivos diferentes — totalmente paralelizáveis entre si.
- Fase 2 (Fundação) e Fase 3 (US3) podem ser feitas em paralelo por pessoas/sessões diferentes,
  já que não compartilham arquivo nem Use Case.
- Dentro de US2, T034-T036 (testes dos 3 hooks) são paralelizáveis entre si.

---

## Estratégia de Implementação

### MVP First

1. Fase 1 (Setup) + Fase 2 (Fundação) + Fase 3 (US3) — em paralelo onde possível.
2. Fase 4 (US1) — **MVP**: upload automático funcionando nos 3 formulários.
3. **PARAR e VALIDAR**: rodar os roteiros 1-3 do `quickstart.md`.
4. Fase 5 (US2): resiliência a falha parcial de upload.
5. Fase Final: polimento e validação completa do `quickstart.md`.

### Entrega Incremental

1. Setup + Fundação + US3 → base pronta (nenhum valor de usuário ainda, mas nada quebrado).
2. US1 → MVP entregável: cadastro + anexo em um único fluxo.
3. US2 → resiliência: falha parcial não trava mais o usuário.
