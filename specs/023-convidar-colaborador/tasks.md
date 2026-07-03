# Tarefas: Convidar Colaborador

**Entrada**: Documentos de design em `specs/023-convidar-colaborador/`
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: Testes de Use Case são **obrigatórios** pela constituição (Princípio V — 100% de cobertura de Use Cases em domain). Testes de hook seguem o precedente já estabelecido em `022-listar-usuarios-licitante`.

**Organização**: 3 histórias de usuário (US1: convidar, US2: impedir duplicado/validar e-mail, US3: reenviar), organizadas por prioridade. As 3 compartilham o mesmo endpoint e a mesma ação de UI (ver `research.md`), então US2 e US3 adicionam principalmente cobertura de teste e verificação sobre a base construída em US1.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: História de usuário correspondente (US1, US2, US3)

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Entidade de domínio e extensão da interface de repositório das quais US1, US2 e US3 dependem.

**⚠️ CRÍTICO**: Nenhuma história de usuário pode começar até que esta fase esteja completa.

- [x] T001 Criar entidade `ConviteColaborador` em `src/features/configuracoes/domain/entities/ConviteColaborador.ts` com campos: `id`, `email`, `licitanteId`, `usuarioJaCadastrado: boolean`, `status: 'PENDENTE' | 'ACEITO' | 'RECUSADO'`, `criadoEm`, `expiresAt`; re-exportar em `src/features/configuracoes/domain/entities/index.ts`
- [x] T002 Adicionar método `convidar(licitanteId: string, email: string): Promise<ConviteColaborador>` à interface `IUsuarioLicitanteRepository` em `src/features/configuracoes/domain/repositories/IUsuarioLicitanteRepository.ts` (importar o tipo criado em T001)

**Checkpoint**: Fundação pronta — implementação das histórias pode começar.

---

## Fase 3: História de Usuário 1 — Convidar um novo colaborador por e-mail (Prioridade: P1) 🎯 MVP

**Objetivo**: Permitir que um Administrador envie um convite de colaboração informando apenas o e-mail, substituindo a ação mock "Adicionar usuário" (nome + senha manual, sem chamada real de API).

**Teste Independente**: Como Administrador, na tela de Configurações → "Gestão de acessos", informar um e-mail válido ainda não vinculado e confirmar o convite → mensagem de sucesso é exibida indicando que o convite foi enviado.

### Testes para História de Usuário 1 (mandatório pela constituição)

- [x] T003 [P] [US1] Criar testes unitários para `ConvidarColaboradorUseCase` em `src/features/configuracoes/__tests__/domain/ConvidarColaboradorUseCase.test.ts` — cobrir: sucesso retorna o `ConviteColaborador` do repositório, repositório é chamado com `licitanteId` e `email` corretos, repositório lançando erro propaga a exceção

### Implementação para História de Usuário 1

- [x] T004 [US1] Criar `ConvidarColaboradorUseCase` em `src/features/configuracoes/domain/usecases/ConvidarColaboradorUseCase.ts` (recebe `IUsuarioLicitanteRepository`, método `execute(licitanteId, email)` delega para `repository.convidar`); re-exportar em `src/features/configuracoes/domain/usecases/index.ts`; verificar que T003 passa
- [x] T005 [P] [US1] Adicionar método `convidar(licitanteId, email)` em `src/features/configuracoes/data/datasources/UsuarioLicitanteAPI.ts` — chama `POST /api/licitantes/{licitanteId}/convites` com corpo `{ email }` via `apiFetch`; em `201` retorna `response.json()` como `ConviteColaborador`; mapeia erros: `401` → lança `Error('JWT_EXPIRED')`, `403` → `"Apenas administradores podem enviar convites."`, `404` → `"Não foi possível localizar a empresa. Atualize a página e tente novamente."`, `409` → `"Este e-mail já tem acesso a esta empresa."`, `422` → `"Informe um e-mail válido."`, demais → `"Erro ao enviar convite. Tente novamente."`
- [x] T006 [US1] Implementar `convidar(licitanteId, email)` em `src/features/configuracoes/data/repositories/UsuarioLicitanteRepository.ts` — delega para `UsuarioLicitanteAPI.convidar`; trata `JWT_EXPIRED` → `window.location.href = '/login'` (mesmo padrão de `listar`/`revogar`)
- [x] T007 [US1] Estender o hook `src/features/configuracoes/presentation/hooks/useGestaoAcessos.ts`: adicionar `isAdmin: boolean` (via `useMemo`, `usuarios.find(u => u.userId === currentUserId)?.papel === 'ADMIN'`), estados `convidando: boolean`, `convidarError: string | null`, `convidarSucesso: string | null`, ação `convidarColaborador(email: string): Promise<boolean>` (chama `ConvidarColaboradorUseCase`, em sucesso seta `convidarSucesso` com mensagem incluindo o e-mail e retorna `true`, em erro seta `convidarError` com `err.message` e retorna `false`, sempre limpando o outro estado antes de tentar) e `clearConvidarFeedback(): void`
- [x] T008 [US1] Reescrever o Drawer de `src/features/configuracoes/presentation/components/GestaoAcessosSection.tsx`: remover `gerarSenhaAleatoria`, estados `nome`/`senha`/`papel`/`modo`/`feedback`, função `abrirEditar` e o botão de editar (lápis); renomear a ação principal e o título do Drawer para "Convidar colaborador"; formulário com único campo de e-mail, validado com Zod (`z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.')`) antes de chamar `convidarColaborador`; exibir `convidarSucesso`/`convidarError` inline no Drawer; renderizar o botão "Convidar colaborador" somente quando `isAdmin === true`

**Checkpoint**: Neste ponto, a História de Usuário 1 deve estar totalmente funcional — Administrador consegue convidar um colaborador por e-mail e ver a confirmação; a ação fica oculta para não-administradores.

---

## Fase 4: História de Usuário 2 — Impedir convite duplicado para quem já tem acesso (Prioridade: P2)

**Objetivo**: Garantir que tentativas de convidar um e-mail já vinculado ao licitante, ou em formato inválido, sejam bloqueadas com mensagens claras (sem erro técnico e sem envio duplicado).

**Teste Independente**: Convidar o e-mail de um usuário que já aparece na lista de acessos do licitante → mensagem "Este e-mail já tem acesso a esta empresa." exibida, sem fechar o Drawer. Tentar confirmar com e-mail vazio ou mal formatado → mensagem de validação exibida antes de qualquer chamada à API.

### Testes para História de Usuário 2

- [x] T009 [P] [US2] Adicionar casos em `src/features/configuracoes/__tests__/presentation/useGestaoAcessos.test.ts`: `convidarColaborador` retorna `false` e popula `convidarError` com a mensagem do repositório quando este rejeita com `"Este e-mail já tem acesso a esta empresa."` (cenário 409), sem alterar `usuarios`; idem para rejeição com `"Informe um e-mail válido."` (cenário 422)

### Implementação para História de Usuário 2

> A tradução de status HTTP (T005) e a validação Zod no formulário (T008) já cobrem o comportamento funcional desta história — não há novos arquivos de produção, apenas a verificação abaixo.

- [x] T010 [US2] Verificação manual via `/run`: no `GestaoAcessosSection.tsx`, confirmar que (a) submeter e-mail vazio ou inválido exibe a mensagem de validação do Zod sem chamar a API, e (b) convidar um e-mail já presente na tabela de usuários retorna a mensagem de vínculo já existente e mantém o Drawer aberto para nova tentativa

**Checkpoint**: US1 + US2 funcionais — convites duplicados e e-mails inválidos são bloqueados com mensagens claras.

---

## Fase 5: História de Usuário 3 — Reenviar um convite ainda pendente (Prioridade: P3)

**Objetivo**: Permitir que o Administrador reenvie um convite pendente simplesmente convidando novamente o mesmo e-mail, sem nenhuma ação de UI adicional (o backend trata a repetição como reenvio).

**Teste Independente**: Convidar um e-mail que já possui convite pendente para o mesmo licitante → o sistema exibe nova confirmação de sucesso (mesmo texto da História 1), sem erro de duplicidade.

### Testes para História de Usuário 3

- [x] T011 [P] [US3] Adicionar caso em `src/features/configuracoes/__tests__/presentation/useGestaoAcessos.test.ts`: duas chamadas consecutivas de `convidarColaborador` bem-sucedidas para o mesmo e-mail (representando convite novo e reenvio) resultam ambas em `convidarSucesso` preenchido e retorno `true`, sem tratamento especial no hook para a segunda chamada

### Implementação para História de Usuário 3

> Nenhum código de produção novo: o mesmo `convidarColaborador` (T004–T008) já cobre o reenvio, pois o backend trata e-mail com convite pendente como renovação (ver `research.md`).

- [x] T012 [US3] Verificação manual via `/run`: enviar um convite, depois convidar o mesmo e-mail novamente antes de expirar (24h) e confirmar nova mensagem de sucesso, sem erro de duplicidade

**Checkpoint**: Todas as histórias de usuário (US1, US2, US3) devem agora ser independentemente funcionais.

---

## Fase 6: Polimento & Verificação Final

- [x] T013 [P] Confirmar em `src/features/configuracoes/presentation/components/GestaoAcessosSection.tsx` que não restam vestígios do fluxo mock removido (`gerarSenhaAleatoria`, estados `nome`/`senha`/`papel`/`modo`/`feedback`, `abrirEditar`, botão de editar/lápis, imports não utilizados como `EditPencil`)
- [x] T014 Executar `tsc --noEmit` e `vitest run --reporter=verbose` na raiz do projeto e confirmar zero erros de tipo e todos os testes passando

---

## Fase 7: Correção pós-implementação — Aceitar/Recusar convite (RF-011, RF-012)

**Motivo**: verificação manual em ambiente real (backend + Mailpit) mostrou que o link do e-mail de convite aponta para `/convites/aceitar` (e `/convites/recusar` para convidados já cadastrados), rotas que não existiam no frontend — resultando em 404 para o convidado. A premissa original da spec ("aceite/recusa fora do escopo") estava incorreta; sem essas páginas o convite enviado por US1 é inutilizável.

- [x] T015 [P] Criar `src/features/configuracoes/domain/errors/conviteErrors.ts` (`ConviteError`, `ConviteTokenInvalidoError`, `ConviteJaRespondidoError`, `ConviteExpiradoError`), `src/features/configuracoes/domain/entities/AceitarConviteResultado.ts` e `src/features/configuracoes/domain/repositories/IConviteRepository.ts` (`aceitar(token)`, `recusar(token)`); re-exportar nos respectivos `index.ts`
- [x] T016 [P] Criar testes unitários `AceitarConviteUseCase.test.ts` e `RecusarConviteUseCase.test.ts` em `src/features/configuracoes/__tests__/domain/`
- [x] T017 Criar `AceitarConviteUseCase` e `RecusarConviteUseCase` em `src/features/configuracoes/domain/usecases/`; re-exportar em `domain/usecases/index.ts`; verificar que T016 passa
- [x] T018 [P] Criar `ConviteAPI` em `src/features/configuracoes/data/datasources/ConviteAPI.ts` — `POST /api/convites/aceitar` e `POST /api/convites/recusar` (endpoints públicos, sem `licitanteId`), mapeando 400/409/410 para os erros de T015; criar `ConviteRepository` em `data/repositories/` implementando `IConviteRepository`; re-exportar em ambos `index.ts`
- [x] T019 Criar hooks `useAceitarConvite(token)` e `useRecusarConvite(token)` em `src/features/configuracoes/presentation/hooks/` (mesmo formato de máquina de estados de `useConfirmarEmail` do feature `auth`: `loading | success | expired | already_responded | invalid`); re-exportar em `presentation/hooks/index.ts`
- [x] T020 [P] Criar `AceitarConvitePage.tsx` e `RecusarConvitePage.tsx` em `src/features/configuracoes/presentation/pages/` (mesmo layout visual de `ConfirmarEmailPage`), lendo `token` via `useSearchParams`
- [x] T021 Registrar as rotas públicas `/convites/aceitar` e `/convites/recusar` em `src/app/routes.tsx`
- [x] T022 Verificação manual via `/run` (fluxo real ponta a ponta contra backend + Mailpit): admin convida um e-mail novo → e-mail de convite recebido contém link para `/convites/aceitar?token=...` → navegar para essa rota no frontend local exibe "Convite aceito!" com orientação de credenciais enviadas por e-mail (sem mais 404)

**Checkpoint**: o ciclo completo do convite (enviar → e-mail → aceitar/recusar) funciona ponta a ponta.

---

## Fase 8: Correção pós-implementação — Nome opcional no convite

**Motivo**: o endpoint `POST /api/licitantes/{licitanteId}/convites` passou a aceitar um campo opcional `nome` no corpo da requisição (e a retorná-lo na resposta), usado para personalizar o e-mail de convite e nomear a conta criada automaticamente quando o e-mail convidado ainda não pertence a um usuário cadastrado. RF-010 foi ajustado para deixar claro que essa informação é opcional, não exigida.

- [x] T023 [P] Adicionar `nome: string` à entidade `ConviteColaborador` em `src/features/configuracoes/domain/entities/ConviteColaborador.ts`
- [x] T024 Adicionar parâmetro opcional `nome?: string` ao método `convidar` em `IUsuarioLicitanteRepository`, `UsuarioLicitanteRepository`, `UsuarioLicitanteAPI` (corpo da requisição `{ email, nome }`) e `ConvidarColaboradorUseCase`
- [x] T025 [P] Atualizar `useGestaoAcessos.convidarColaborador(email, nome?)` para repassar o nome ao Use Case
- [x] T026 [US1] Adicionar campo "Nome do colaborador" ao Drawer de convite em `GestaoAcessosSection.tsx`, obrigatório na UI (validado via Zod como o e-mail; `required` no input), embora opcional no contrato da API
- [x] T027 [P] Atualizar `ConvidarColaboradorUseCase.test.ts` e `useGestaoAcessos.test.ts` com casos cobrindo o `nome` opcional (informado e omitido)

**Checkpoint**: Administrador pode, opcionalmente, informar o nome do colaborador convidado; comportamento sem nome permanece idêntico ao anterior.

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências — pode começar imediatamente. **BLOQUEIA** US1, US2 e US3.
- **US1 (Fase 3)**: Depende da conclusão de T001 e T002.
- **US2 (Fase 4)**: Depende da conclusão de US1 (T005 e T008 já implementam o comportamento; T009/T010 apenas verificam).
- **US3 (Fase 5)**: Depende da conclusão de US1 (T004–T008 já implementam o comportamento; T011/T012 apenas verificam).
- **Polimento (Fase 6)**: Depende da conclusão de US1, US2 e US3.

### Dependências dentro de US1

```
T001, T002 (Fundação)
  └─ T003 (teste → escrever antes da implementação)
       └─ T004 (impl use case, verifica T003 verde)
  └─ T005 [P] (datasource, depende apenas de T002)
       └─ T006 (repository, depende de T005)
            └─ T007 (hook, depende de T004 e T006)
                 └─ T008 (componente, depende de T007)
```

### Oportunidades de Paralelismo

- **T003 e T005**: podem começar em paralelo após a Fundação (arquivos e responsabilidades diferentes)
- **T009 e T011**: podem ser escritos em paralelo — ambos apenas adicionam casos ao mesmo arquivo de teste, mas descrevem cenários independentes; combinar em um único commit ao final de US1 é aceitável
- US2 e US3 não têm código de produção próprio — suas tarefas de verificação (T010, T012) podem ser executadas em qualquer ordem após o Checkpoint de US1

---

## Estratégia de Implementação

### MVP First (apenas US1)

1. Concluir Fase 2: T001, T002
2. Concluir Fase 3: T003 → T004, T005 → T006 → T007 → T008
3. **PARAR e VALIDAR**: Abrir Configurações, convidar um e-mail novo, confirmar mensagem de sucesso e ausência do botão para não-administradores
4. Avançar para US2/US3 somente após validação

### Entrega Incremental

1. Fundação → entidade e contrato de repositório prontos
2. US1 completo → convite por e-mail funcionando (MVP!)
3. US2 completo → duplicidade e e-mail inválido bloqueados e testados
4. US3 completo → reenvio confirmado como comportamento natural da mesma ação
5. Polimento → limpeza de código morto + verificação de tipos/testes

---

## Notas

- Teste de Use Case (T003) é **mandatório** pela constituição — escrever antes da implementação
- Proibido `any` em qualquer arquivo novo ou modificado
- Não existe endpoint de listagem de convites pendentes (`GET .../convites`) — por isso não há tarefa de UI para exibir histórico de convites (ver `research.md`)
- O reenvio (US3) não introduz nenhum arquivo novo de produção — é uma consequência do contrato já implementado em US1
