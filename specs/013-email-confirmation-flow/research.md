# Research: Fluxo de Confirmação de E-mail

**Feature**: 013-email-confirmation-flow
**Status**: Completo — sem NEEDS CLARIFICATION; todos os dados derivados do código existente e da spec.

---

## Decisão 1: Tratamento do erro `email_nao_confirmado` no login

**Decisão**: Criar `EmailNaoConfirmadoError` como subclasse de `AuthError` no domínio da feature `auth`.

**Rationale**: A camada `presentation` precisa distinguir "credenciais inválidas" de "conta não confirmada" para exibir UX diferente (botão de reenvio inline vs. mensagem genérica de erro). O mecanismo de `instanceof` em TypeScript é a forma mais limpa de discriminar erros no domínio sem poluir a interface do repositório com campos de metadado. Subclassear `AuthError` garante que o tratamento genérico de erros existente continua funcionando sem alteração.

**Alternativas rejeitadas**:
- Retornar um discriminator enum de `login()` — quebraria a assinatura `Promise<void>` atual e espalharia lógica de UX para a camada de domínio.
- Verificar a string de mensagem na camada de apresentação — acopla a view a detalhes de infraestrutura do backend.

---

## Decisão 2: `register()` passa a retornar `{ message: string }` em vez de `Promise<void>`

**Decisão**: `IAuthRepository.register()` retornará `Promise<{ message: string }>` para que o `RegisterUseCase` e a camada de apresentação possam exibir a mensagem de instrução de verificação de e-mail retornada pelo servidor.

**Rationale**: A mensagem `"Cadastro realizado. Verifique seu e-mail para confirmar a conta."` é gerada pelo servidor e não deve ser hard-coded no frontend. Retornar o shape `{ message }` da resposta 201 é a abordagem mínima que atende ao requisito sem criar um tipo novo desnecessário.

**Alternativas rejeitadas**:
- Hard-code da mensagem no frontend — acoplamento desnecessário; o backend pode mudar o texto.
- Criar uma entidade `RegistrationResult` separada — overhead para um único campo string.

---

## Decisão 3: Auto-login após confirmação de e-mail via `getMe()`

**Decisão**: Após `POST /api/auth/confirmar-email` retornar 200, o frontend chamará `getMe()` para hidratar o estado de autenticação, exatamente como o fluxo de login existente.

**Rationale**: O cookie `BEARER` é definido pelo servidor na resposta 200. Chamar `getMe()` é a forma idiomática já usada pelo `AuthContext` para hidratar o estado do usuário após login. Reutilizar esse padrão mantém coerência e evita duplicar lógica de mapeamento de usuário. O campo `token` retornado no body da confirmação pode ser ignorado — o cookie já está ativo.

**Alternativas rejeitadas**:
- Mapear o `user` do body da resposta de confirmação diretamente — o shape (`nome_completo` presente) é similar mas não idêntico ao de `/api/me`; usar `getMe()` é a fonte de verdade única.
- Criar um novo mapper para o body da confirmação — duplicação desnecessária para um campo (`nome_completo` vs `nome`) que já é tratado pelo mapper de `/api/me`.

---

## Decisão 4: `confirmarEmail()` e `reenviarConfirmacao()` como Use Cases independentes, com `confirmarEmail` exposto pelo `AuthContext`

**Decisão**: `ConfirmarEmailUseCase` e `ReenviarConfirmacaoEmailUseCase` são novos use cases no domínio. `confirmarEmail` é exposto pelo `AuthContext` (pois resulta em autenticação). `reenviarConfirmacao` é acessado diretamente via hook local sem passar pelo contexto.

**Rationale**: A confirmação de e-mail altera o estado de autenticação global (usuário passa de "não autenticado" para "autenticado"), portanto deve ser orquestrada pelo `AuthContext` da mesma forma que `login`. O reenvio não altera estado global; expô-lo pelo contexto seria over-engineering.

**Alternativas rejeitadas**:
- Expor ambos pelo `AuthContext` — o reenvio não tem estado compartilhado relevante.
- Não usar use cases e chamar o repositório diretamente dos hooks — viola a Regra de Isolamento da constituição (presentation não pode acessar data diretamente).

---

## Decisão 5: Erros de token com tipos discriminados no domínio

**Decisão**: Criar três novas classes de erro no domínio: `TokenInvalidoError` (400), `TokenExpiradoError` (410) e `ContaJaConfirmadaError` (409, específico do endpoint confirmar-email), todas subclasses de `AuthError`.

**Rationale**: A `ConfirmarEmailPage` precisa renderizar UX radicalmente diferente para cada estado de erro. O uso de classes de erro discriminadas no domínio mantém o `AuthRepository` (data) como único responsável por interpretar os status HTTP, e deixa a camada de apresentação reagindo a tipos de domínio — aderindo à Regra de Isolamento da constituição.

**Alternativas rejeitadas**:
- Retornar um enum/union type do use case — torna o use case stateful e dificulta composição.
- Verificar o status HTTP na view — a camada de apresentação não deve conhecer detalhes de HTTP.

---

## Decisão 6: Desabilitação do botão de reenvio após 429 — estado local sem timer persistido

**Decisão**: Ao receber erro 429 (`limite_reenvio_excedido`), o hook `useReenviarConfirmacao` define `isDisabled = true`. O botão permanece desabilitado até o usuário recarregar a página. Não há timer de 60 minutos implementado pelo frontend.

**Rationale**: Implementar um timer de 60 min com `setTimeout` ou persistência em `localStorage` adiciona complexidade sem ganho real — o backend é a fonte de verdade sobre o rate limit. A mensagem de erro já orienta o usuário a "aguardar". Recarregar a página reseta o estado, o que é comportamento aceitável.

**Alternativas rejeitadas**:
- Timer de 60 minutos com localStorage — complexidade desnecessária; o backend pode retornar 429 novamente de qualquer forma.
- Não desabilitar o botão — geraria múltiplos cliques e UX confusa.

---

## Mapeamento de impacto nos arquivos existentes

| Arquivo existente | Mudança necessária |
|---|---|
| `domain/errors/authErrors.ts` | Adicionar `EmailNaoConfirmadoError`, `TokenInvalidoError`, `TokenExpiradoError`, `ContaJaConfirmadaError`, `RateLimitReenvioError` |
| `domain/repositories/IAuthRepository.ts` | Atualizar `register()` para retornar `Promise<{ message: string }>` + adicionar `confirmarEmail()` e `reenviarConfirmacao()` |
| `data/repositories/AuthRepository.ts` | Implementar os 3 métodos novos + ajustar `register()` e `login()` |
| `data/mappers/authMappers.ts` | Adicionar `ApiRegisterResponse.message` ao tipo existente |
| `domain/usecases/RegisterUseCase.ts` | Retornar `{ message: string }` |
| `domain/usecases/RegisterUseCase.test.ts` | Atualizar testes para novo tipo de retorno |
| `presentation/context/AuthContext.tsx` | Expor `confirmarEmail()`, atualizar `register()` para retornar `{ message }` |
| `presentation/hooks/useLogin.ts` | Detectar `EmailNaoConfirmadoError` e retornar flag `emailNaoConfirmado` |
| `presentation/hooks/useRegister.ts` | Retornar `registrationMessage` para a view |
| `presentation/pages/LoginPage.tsx` | Exibir seção de reenvio inline quando `emailNaoConfirmado === true` |
| `src/app/routes.tsx` | Adicionar rota pública `/confirmar-email` |
