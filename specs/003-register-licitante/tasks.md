# Tarefas: Cadastro de Usuário e Licitante

**Entrada**: Documentos de design em `specs/003-register-licitante/`  
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Testes**: `RegisterUseCase.test.ts` é obrigatório por mandato constitucional (Princípio V — 100% cobertura de Use Cases), não por solicitação da spec. Os demais testes são opcionais.

**Organização**: Tarefas agrupadas por história de usuário para implementação e teste independentes.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1–US4)

---

## Fase 2: Fundação (Domain & Data Layer)

**Propósito**: Camadas de domínio e dados que DEVEM estar completas antes de qualquer história de usuário poder ser implementada.

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [x] T001 Criar entidade `RegisterCredentials` em `src/features/auth/domain/entities/registerCredentials.ts` com campos: `nome: string`, `email: string`, `password: string`, `cnpj: string`, `razaoSocial: string`
- [x] T002 Estender `src/features/auth/domain/repositories/IAuthRepository.ts` adicionando método `register(credentials: RegisterCredentials): Promise<void>` (importar `RegisterCredentials` do passo T001)
- [x] T003 Implementar `src/features/auth/domain/usecases/RegisterUseCase.ts`: recebe `IAuthRepository`, método `execute(credentials: RegisterCredentials): Promise<void>` que valida campos obrigatórios (nome, email, password, cnpj, razaoSocial todos não-vazios) e chama `repository.register(credentials)`; lança `AuthError` para campos ausentes
- [x] T004 Escrever `src/features/auth/domain/usecases/RegisterUseCase.test.ts` com 100% de cobertura (constitucional): testar happy path, cada campo vazio → `AuthError`, propagação de `AuthError` do repositório (409 duplicidade), propagação de `AuthError` do repositório (serviço indisponível)
- [x] T005 [P] Adicionar tipo `ApiRegisterResponse` (interface interna) em `src/features/auth/data/mappers/authMappers.ts` com campos `user: { id, email, nome }` e `licitante: { id, cnpj, razao_social }` — usado apenas para tipagem do `AuthRepository`, sem função de mapeamento exportada
- [x] T006 Implementar `register(credentials: RegisterCredentials): Promise<void>` em `src/features/auth/data/repositories/AuthRepository.ts`: `POST /api/users/register-with-bidder` com `credentials: include`; mapear `credentials.razaoSocial → razao_social` no body JSON; tratar 409 → `AuthError(data.error)`, erro de rede → `AuthError('Serviço indisponível...')`, outros erros não-ok → `AuthError('Erro ao realizar cadastro. Tente novamente.')`

**Checkpoint**: Fundação completa — `npm test` deve passar (RegisterUseCase 100% coberto). Implementação das histórias pode começar.

---

## Fase 3: História de Usuário 1 — Cadastro Completo (Prioridade: P1) 🎯 MVP

**Objetivo**: Novo visitante preenche o formulário com dados válidos, cria conta, é autenticado automaticamente e redirecionado para a área logada.

**Teste Independente**: Acessar `/cadastro`, preencher todos os campos com dados válidos, submeter e verificar redirecionamento para `/selecionar-vinculo` com sessão ativa.

- [x] T007 [US1] Estender `src/features/auth/presentation/context/AuthContext.tsx`: adicionar `RegisterCredentials` ao `AuthContextValue`; implementar método `register(credentials: RegisterCredentials): Promise<void>` que dispara `LOADING`, executa `RegisterUseCase.execute(credentials)`, em sucesso chama `getMeUseCase.execute()` e dispara `SET_USER`, em falha dispara `SET_ERROR` e relança a exceção — espelhando exatamente o padrão do método `login()`
- [x] T008 [US1] Criar `src/features/auth/presentation/hooks/useRegister.ts`: retorna `{ register, isLoading, error }`; chama `useAuth().register(credentials)` e em sucesso navega para `/selecionar-vinculo` via `useNavigate()` — espelhando `useLogin.ts`
- [x] T009 [US1] Criar `src/features/auth/presentation/pages/RegisterPage.tsx`: layout de duas colunas idêntico ao `LoginPage.tsx` (painel esquerdo com branding + recursos, oculto em mobile; painel direito com formulário); campos: nome completo, e-mail, senha (com toggle show/hide), CNPJ, razão social; botão "Criar conta" que chama `useRegister().register()`; estado de carregamento (`isLoading`) desabilita botão e exibe "Criando conta..."; exibir `displayError` (validationError ?? error) abaixo dos campos com `role="alert"`; link "Já tenho uma conta" (placeholder sem navegação — será implementado em US4)
- [x] T010 [US1] Adicionar rota `/cadastro` em `src/app/routes.tsx` importando `RegisterPage` e registrando como irmã da rota `/login` dentro do `AuthRoot`

**Checkpoint**: Acessar `/cadastro` e criar conta com dados válidos deve funcionar end-to-end.

---

## Fase 4: História de Usuário 2 — Validação de Campos (Prioridade: P1)

**Objetivo**: Campos inválidos ou ausentes exibem mensagens de erro por campo, sem enviar a requisição ao servidor.

**Teste Independente**: Submeter o formulário com cada campo vazio ou inválido individualmente e verificar mensagem de erro específica exibida.

- [x] T011 [US2] Adicionar validação client-side em `src/features/auth/presentation/pages/RegisterPage.tsx`: validar antes de chamar `register()` — nome não vazio e 3–255 chars; e-mail válido (regex `RFC`); senha ≥ 8 chars; CNPJ com 14 dígitos numéricos após remover formatação (`replace(/[.\-\/]/g, '')`); razão social não vazia e 10–255 chars; exibir mensagens individuais via `setValidationError` por campo (ou estado de erros por campo); limpar erros ao submeter novamente

**Checkpoint**: Todos os cenários de aceite da US2 (spec.md) devem passar com feedback visual correto.

---

## Fase 5: História de Usuário 3 — Duplicidade de E-mail ou CNPJ (Prioridade: P2)

**Objetivo**: Conflito retornado pelo servidor (409) exibe mensagem descritiva sem limpar o formulário.

**Teste Independente**: Submeter formulário com e-mail ou CNPJ já cadastrado e verificar mensagem de conflito exibida pelo `displayError` pattern.

- [x] T012 [US3] Verificar e garantir em `src/features/auth/data/repositories/AuthRepository.ts` que a resposta 409 lê o campo `error` do body JSON e lança `AuthError(data.error)` com a mensagem exata retornada pelo servidor; confirmar que `displayError` em `RegisterPage.tsx` renderiza o `error` vindo de `useRegister()` sem limpar os campos do formulário (o estado de cada campo deve ser preservado quando ocorre um erro de servidor)

**Checkpoint**: Submeter e-mail duplicado deve exibir "Email já cadastrado." sem resetar o formulário.

---

## Fase 6: História de Usuário 4 — Navegação entre Cadastro e Login (Prioridade: P3)

**Objetivo**: Visitante pode alternar entre telas de login e cadastro sem usar o botão voltar do navegador.

**Teste Independente**: Clicar em "Já tenho uma conta" em `/cadastro` deve navegar para `/login`; clicar em "Criar conta" em `/login` deve navegar para `/cadastro`.

- [x] T013 [P] [US4] Atualizar `src/features/auth/presentation/pages/RegisterPage.tsx`: substituir o link placeholder "Já tenho uma conta" para usar `useNavigate()` e navegar para `/login` ao ser clicado (remover `alert()` ou placeholder, adicionar navegação real)
- [x] T014 [P] [US4] Atualizar `src/features/auth/presentation/pages/LoginPage.tsx`: substituir o `onClick={() => alert('Funcionalidade de cadastro em breve!')}` do botão "Criar conta" para navegar para `/cadastro` via `useNavigate()`

**Checkpoint**: Navegação bidirecional entre `/login` e `/cadastro` funciona sem recarregar a página.

---

## Fase 7: Polimento & Aspectos Transversais

**Propósito**: Qualidade e conformidade constitucional.

- [x] T015 Executar `npm test` e confirmar que `RegisterUseCase.test.ts` atinge 100% de cobertura; corrigir qualquer falha de tipagem TypeScript (`npm run typecheck` ou `tsc --noEmit`)
- [x] T016 [P] Revisar `RegisterPage.tsx` garantindo que o input de CNPJ aceite e exiba corretamente ambos os formatos (com e sem formatação) sem remover a formatação digitada pelo usuário antes do envio; a limpeza de formatação para validação e envio deve ser interna (não alterar o valor do input)

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 2)**: Sem dependências externas — pode começar imediatamente. **BLOQUEIA todas as fases seguintes.**
- **US1 (Fase 3)**: Depende da conclusão da Fase 2 (T001–T006 concluídos)
- **US2 (Fase 4)**: Depende da Fase 3 (T009 — modifica `RegisterPage.tsx`)
- **US3 (Fase 5)**: Depende da Fase 2 (T006) e Fase 3 (T009); pode começar após ambas
- **US4 (Fase 6)**: Depende da Fase 3 (T009 — `RegisterPage` existe) e do `LoginPage.tsx` existente
- **Polimento (Fase 7)**: Depende de todas as fases anteriores

### Dependências dentro da Fase 2 (Fundação)

```
T001 (entidade) → T002 (interface) → T003 (use case) → T004 (testes)
T001 (entidade) → T005 (mapper — paralelo com T002/T003)
T002 + T005 → T006 (repositório)
```

### Dependências dentro da Fase 3 (US1)

```
T007 (AuthContext.register) → T008 (useRegister hook) → T009 (RegisterPage) → T010 (rota)
```

### Oportunidades de Paralelismo

- T005 (mapper) pode ser escrito em paralelo com T002/T003
- T013 e T014 (US4) podem ser escritos em paralelo por serem em arquivos diferentes
- T015 e T016 (polimento) podem ser executados em paralelo

---

## Exemplo de Paralelismo: Fase 2 (Fundação)

```
# Início da Fase 2 — em paralelo:
Task: T001 - registerCredentials.ts
Task: T005 - ApiRegisterResponse em authMappers.ts

# Após T001 — em sequência:
Task: T002 - estender IAuthRepository.ts
Task: T003 - implementar RegisterUseCase.ts
Task: T004 - escrever RegisterUseCase.test.ts

# Após T002 + T005:
Task: T006 - implementar AuthRepository.register()
```

---

## Estratégia de Implementação

### MVP First (US1 — Cadastro Completo)

1. Concluir Fase 2: Fundação (T001–T006)
2. Concluir Fase 3: US1 — Cadastro Completo (T007–T010)
3. **PARAR e VALIDAR**: Criar conta com dados válidos end-to-end
4. Demonstrável e funcional neste ponto

### Entrega Incremental

1. Fundação (Fase 2) → domínio e dados prontos
2. US1 (Fase 3) → fluxo happy path funcional → **MVP demonstrável**
3. US2 (Fase 4) → validação client-side completa
4. US3 (Fase 5) → tratamento de conflitos robusto
5. US4 (Fase 6) → navegação fluida entre telas
6. Polimento (Fase 7) → qualidade e conformidade total

---

## Notas

- Tarefas `[P]` = arquivos diferentes, sem dependências — podem ser executadas em paralelo
- `RegisterUseCase.test.ts` é mandatório pelo Princípio V da constituição — não omitir
- Nenhum token deve ser salvo em localStorage/sessionStorage (Princípio IV inviolável)
- O fluxo pós-cadastro reusa `getMeUseCase.execute()` — não criar caminho paralelo de hidratação
- Navegar para `/selecionar-vinculo` após cadastro — a rota já lida com usuário com 1 ou N licitantes
