# Modelo de Dados: Cadastro de Usuário e Licitante

**Feature**: `003-register-licitante`  
**Data**: 2026-05-21

## Entidades do Domínio

### RegisterCredentials (nova)

Payload de cadastro validado na camada de apresentação antes de atingir o domínio.

| Campo | Tipo | Regras de Validação |
|-------|------|---------------------|
| `nome` | `string` | Obrigatório; 3–255 caracteres |
| `email` | `string` | Obrigatório; formato RFC de e-mail |
| `password` | `string` | Obrigatório; mínimo 8 caracteres |
| `cnpj` | `string` | Obrigatório; 14 dígitos numéricos (com ou sem formatação) |
| `razaoSocial` | `string` | Obrigatório; 10–255 caracteres |

**Localização**: `src/features/auth/domain/entities/registerCredentials.ts`

---

### User (existente — sem alteração)

Entidade já definida em `domain/entities/user.ts`. Reutilizada após `getMe()` para hidratar o estado pós-cadastro.

### Licitante (existente — sem alteração)

Entidade já definida em `domain/entities/licitante.ts`.

---

## Extensão de Interfaces

### IAuthRepository (estendida)

Adicionar ao contrato existente:

```
register(credentials: RegisterCredentials): Promise<void>
```

O método não retorna dados — o estado autenticado é obtido via `getMe()` após o registro.

---

## Mapeadores de API

### ApiRegisterResponse (novo — interno ao data layer)

Tipo intermediário que reflete a resposta 201 do servidor. Usado apenas internamente no `AuthRepository` para confirmar que a chamada foi bem-sucedida; os dados não são propagados para o domínio.

| Campo API | Tipo |
|-----------|------|
| `user.id` | `string` |
| `user.email` | `string` |
| `user.nome` | `string` |
| `licitante.id` | `string` |
| `licitante.cnpj` | `string` |
| `licitante.razao_social` | `string` |

---

## Fluxo de Estado — Ciclo de Vida do Cadastro

```
RegisterPage
  │ submete RegisterCredentials validados
  ▼
useRegister (presentation hook)
  │ chama AuthContext.register()
  ▼
AuthContext.register()
  │ dispatch LOADING
  │ executa RegisterUseCase.execute(credentials)
  │   └─ RegisterUseCase valida campos e chama IAuthRepository.register()
  │         └─ AuthRepository.register() → POST /api/users/register-with-bidder
  │              ├─ 201: retorna (cookie BEARER definido pelo servidor)
  │              ├─ 409: lança AuthError com mensagem do campo `error`
  │              └─ erro de rede: lança AuthError genérico
  │ em sucesso: executa getMeUseCase.execute()
  │   └─ GET /api/me (autenticado via cookie recém-definido)
  │         └─ retorna User → dispatch SET_USER
  ▼
useRegister navega para /selecionar-vinculo
```

---

## Erros de Domínio

| Classe | Quando | Origem |
|--------|--------|--------|
| `AuthError` | E-mail já cadastrado, CNPJ já cadastrado, campos inválidos, serviço indisponível | Já existente; reaproveitado |

Nenhum novo tipo de erro é necessário — `AuthError` com mensagem descritiva é suficiente para todos os cenários do cadastro.
