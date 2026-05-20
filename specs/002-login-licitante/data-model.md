# Modelo de Dados: Autenticação e Seleção de Licitante

**Branch**: `002-login-licitante` | **Data**: 2026-05-19

## Entidades de Domínio

### User

Representa o usuário autenticado na plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` (UUID) | Identificador único do usuário |
| `email` | `string` | Endereço de e-mail |
| `nomeCompleto` | `string` | Nome completo do usuário |
| `licitantes` | `Licitante[]` | Lista de licitantes aos quais o usuário pertence |

**Regras**:
- `email` deve ser um endereço de e-mail válido (validado via Zod na camada de apresentação)
- `licitantes` pode ser um array vazio (usuário sem vínculo), com um item (seleção automática) ou múltiplos itens

---

### Licitante

Representa uma empresa registrada na plataforma à qual o usuário pertence.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` (UUID) | Identificador único do licitante |
| `cnpj` | `string` | CNPJ da empresa (14 dígitos, sem formatação) |
| `nomeEmpresa` | `string` | Razão social da empresa |

**Regras**:
- `cnpj` sempre chega da API sem formatação (14 dígitos numéricos); formatação para exibição (`XX.XXX.XXX/XXXX-XX`) ocorre na camada de apresentação

---

### LoginCredentials

Dados de entrada para autenticação (não é entidade persistida — é um value object de comando).

| Campo | Tipo | Restrição | Validação Zod |
|-------|------|-----------|---------------|
| `email` | `string` | Obrigatório | `z.string().email()` |
| `password` | `string` | Obrigatório, mínimo 8 caracteres | `z.string().min(8)` |

---

### AuthSession

Estado da sessão ativa. Armazenado em memória via React Context.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user` | `User` | Dados do usuário autenticado |
| `licitante` | `Licitante` | Licitante selecionado para a sessão atual |

**Transições de Estado**:

```
[Unauthenticated]
      ↓ login() — POST /api/login + GET /api/me
[Authenticated — sem licitante selecionado]
      ↓ selectLicitante() — usuário escolhe ou seleção automática
[Authenticated — licitante ativo]
      ↓ logout() — POST /api/logout
[Unauthenticated]
```

**Casos especiais**:
- `user.licitantes.length === 0` → tela de aviso (sem vínculo disponível)
- `user.licitantes.length === 1` → seleção automática, pula `SelecionarVinculoPage`
- `user.licitantes.length > 1` → exibe `SelecionarVinculoPage`

---

## Mapeamentos API → Domínio

### GET /api/me → User

```
API Response             Entidade User
─────────────────        ──────────────────────
id                    →  id
email                 →  email
nome_completo         →  nomeCompleto
licitantes[].id       →  licitantes[].id
licitantes[].cnpj     →  licitantes[].cnpj
licitantes[].nome_empresa → licitantes[].nomeEmpresa
```

---

## Interfaces de Repositório

### IAuthRepository

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `login(credentials: LoginCredentials)` | `Promise<void>` | POST /api/login — define cookie BEARER |
| `logout()` | `Promise<void>` | POST /api/logout — limpa cookie BEARER |
| `getMe()` | `Promise<User>` | GET /api/me — retorna perfil + licitantes |

**Erros tratados**:
- `login`: 401 → `AuthError('Credenciais inválidas')`, falha de rede → `AuthError('Serviço indisponível')`
- `getMe`: 401 → sessão expirada → `UnauthenticatedError`

---

## Estado do Context React

### AuthContextValue

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `session` | `AuthSession \| null` | `null` = não autenticado ou sem licitante selecionado |
| `isAuthenticated` | `boolean` | `true` quando user está logado |
| `isLoading` | `boolean` | `true` durante chamadas de auth |
| `error` | `string \| null` | Mensagem de erro para exibição |
| `login` | `(credentials: LoginCredentials) => Promise<void>` | Executa login + getMe |
| `logout` | `() => Promise<void>` | Executa logout e limpa estado |
| `selectLicitante` | `(licitante: Licitante) => void` | Define licitante da sessão |
