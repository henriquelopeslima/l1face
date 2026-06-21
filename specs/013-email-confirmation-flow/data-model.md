# Data Model: Fluxo de Confirmação de E-mail

**Feature**: 013-email-confirmation-flow

---

## Novas Entidades de Domínio

### `EmailNaoConfirmadoError`
Subclasse de `AuthError`. Lançada pelo `AuthRepository.login()` quando `response.status === 401` e `body.message === 'email_nao_confirmado'`.

```
Campos herdados: message (string), name = 'EmailNaoConfirmadoError'
```

### `TokenInvalidoError`
Subclasse de `AuthError`. Lançada por `AuthRepository.confirmarEmail()` quando `response.status === 400`.

```
Campos herdados: message (string), name = 'TokenInvalidoError'
```

### `TokenExpiradoError`
Subclasse de `AuthError`. Lançada por `AuthRepository.confirmarEmail()` quando `response.status === 410`.

```
Campos herdados: message (string), name = 'TokenExpiradoError'
```

### `ContaJaConfirmadaError`
Subclasse de `AuthError`. Lançada por `AuthRepository.confirmarEmail()` quando `response.status === 409`.

```
Campos herdados: message (string), name = 'ContaJaConfirmadaError'
```

### `RateLimitReenvioError`
Subclasse de `AuthError`. Lançada por `AuthRepository.reenviarConfirmacao()` quando `response.status === 429`.

```
Campos herdados: message (string), name = 'RateLimitReenvioError'
```

---

## Mudanças em Entidades Existentes

### `IAuthRepository` — interface atualizada

```
Métodos existentes alterados:
  register(credentials: RegisterCredentials): Promise<{ message: string }>
    └─ era: Promise<void>
    └─ motivo: precisa retornar a mensagem de instrução de verificação de e-mail do servidor

Métodos novos:
  confirmarEmail(token: string): Promise<void>
    └─ em caso de sucesso: cookie BEARER é definido pelo servidor; frontend chama getMe() em seguida
    └─ em caso de erro: lança TokenInvalidoError | TokenExpiradoError | ContaJaConfirmadaError

  reenviarConfirmacao(email: string): Promise<void>
    └─ em caso de sucesso (200): resolve normalmente
    └─ em caso de rate limit (429): lança RateLimitReenvioError
```

### `ApiRegisterResponse` (mapper existente em `authMappers.ts`)

```
Campo adicionado: message (string)
  └─ presente na resposta 201 de POST /api/users/register-with-bidder
```

---

## Novos Use Cases

### `ConfirmarEmailUseCase`
Localização: `src/features/auth/domain/usecases/ConfirmarEmailUseCase.ts`

```
execute(token: string): Promise<void>
  Pré-condições:
    - token não pode ser vazio (lança AuthError se vazio)
  Fluxo:
    1. Valida que token não é vazio
    2. Chama repository.confirmarEmail(token)
    3. Resolve sem retorno (cookie já foi definido pelo servidor)
  Erros propagados: TokenInvalidoError | TokenExpiradoError | ContaJaConfirmadaError | AuthError
```

### `ReenviarConfirmacaoEmailUseCase`
Localização: `src/features/auth/domain/usecases/ReenviarConfirmacaoEmailUseCase.ts`

```
execute(email: string): Promise<void>
  Pré-condições:
    - email não pode ser vazio (lança AuthError se vazio)
  Fluxo:
    1. Valida que email não é vazio
    2. Chama repository.reenviarConfirmacao(email)
    3. Resolve sem retorno
  Erros propagados: RateLimitReenvioError | AuthError
```

---

## Mudanças em Use Cases Existentes

### `RegisterUseCase`

```
execute(credentials: RegisterCredentials): Promise<{ message: string }>
  └─ era: Promise<void>
  └─ propaga o { message } retornado pelo repositório
```

---

## Novas Páginas e Hooks de Apresentação

### Páginas

| Página | Rota | Descrição |
|--------|------|-----------|
| `VerificarEmailPage` | N/A (renderizada após cadastro bem-sucedido no RegisterPage) | Tela informativa pós-cadastro. Exibe a mensagem do servidor + instrução de verificar spam. |
| `ConfirmarEmailPage` | `/confirmar-email` | Página pública. Extrai `?token=` da URL, chama `confirmarEmail`, exibe estados: loading, sucesso (redirect), erro com CTA. |

### Hooks

| Hook | Localização | Responsabilidade |
|------|------------|-----------------|
| `useConfirmarEmail` | `presentation/hooks/useConfirmarEmail.ts` | Orquestra `AuthContext.confirmarEmail()`, gerencia `status: 'loading' \| 'success' \| 'invalid' \| 'expired' \| 'already_confirmed'` |
| `useReenviarConfirmacao` | `presentation/hooks/useReenviarConfirmacao.ts` | Chama `ReenviarConfirmacaoEmailUseCase` diretamente; gerencia `isLoading`, `isSent`, `isDisabled`, `error` |

### Mudanças em Hooks Existentes

| Hook | Mudança |
|------|---------|
| `useLogin` | Detecta `EmailNaoConfirmadoError` por `instanceof`; retorna `emailNaoConfirmado: boolean` |
| `useRegister` | Retorna `registrationMessage: string \| null` para a view exibir na tela pós-cadastro |

---

## Mudanças no `AuthContext`

```
Novo valor exposto:
  confirmarEmail: (token: string) => Promise<void>

Fluxo interno de confirmarEmail:
  1. dispatch LOADING
  2. Chama ConfirmarEmailUseCase
  3. Chama getMeUseCase.execute() (cookie já ativo)
  4. dispatch SET_USER
  (erros propagados para o hook chamador)

Mudança em register():
  Retorna { message: string } em vez de void
```

---

## Nova Rota

```
Arquivo: src/app/routes.tsx

Adicionar dentro do bloco público (fora de ProtectedRoute):
  { path: '/confirmar-email', Component: ConfirmarEmailPage }
```

---

## Diagrama de Dependências

```
presentation/pages/LoginPage
  └─ useLogin (atualizado)
       └─ AuthContext.login → LoginUseCase → AuthRepository.login (lança EmailNaoConfirmadoError)
  └─ useReenviarConfirmacao (novo)
       └─ ReenviarConfirmacaoEmailUseCase → AuthRepository.reenviarConfirmacao

presentation/pages/RegisterPage (fragmento → VerificarEmailPage inline ou redirect)
  └─ useRegister (atualizado) → RegisterUseCase (retorna { message }) → AuthRepository.register

presentation/pages/ConfirmarEmailPage (nova)
  └─ useConfirmarEmail (novo)
       └─ AuthContext.confirmarEmail → ConfirmarEmailUseCase → AuthRepository.confirmarEmail → (getMe)
```
