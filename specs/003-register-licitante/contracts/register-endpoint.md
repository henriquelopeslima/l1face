# Contrato: POST /api/users/register-with-bidder

**Feature**: `003-register-licitante`  
**Fonte**: `l1core/docs/openapi.yaml`

## Request

```
POST /api/users/register-with-bidder
Content-Type: application/json
```

### Body

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `nome` | string | sim | 3–255 caracteres |
| `email` | string (email) | sim | formato RFC |
| `password` | string | sim | mínimo 8 caracteres |
| `cnpj` | string | sim | com ou sem formatação |
| `razao_social` | string | sim | 10–255 caracteres |

### Mapeamento frontend → API

| Campo frontend (`RegisterCredentials`) | Campo API |
|----------------------------------------|-----------|
| `nome` | `nome` |
| `email` | `email` |
| `password` | `password` |
| `cnpj` | `cnpj` |
| `razaoSocial` | `razao_social` |

## Responses

### 201 Created

Cookie `BEARER` (HttpOnly, SameSite=Strict) definido no header `Set-Cookie`.

```json
{
  "user": { "id": "...", "email": "...", "nome": "..." },
  "licitante": { "id": "...", "cnpj": "...", "razao_social": "..." }
}
```

**Ação do cliente**: ignorar o body; chamar `GET /api/me` para hidratar o estado autenticado.

### 400 Bad Request

```json
{ "error": "Invalid JSON" }
```

**Tratamento**: `AuthError('Erro ao realizar cadastro. Tente novamente.')` — não deve ocorrer se validação do formulário estiver correta.

### 409 Conflict

```json
{ "error": "Email já cadastrado." }
```

ou

```json
{ "error": "CNPJ já cadastrado." }  
```

**Tratamento**: `AuthError(response.error)` — exibir mensagem diretamente ao usuário.

### Erros de rede / indisponibilidade

**Tratamento**: `AuthError('Serviço indisponível. Verifique sua conexão e tente novamente.')`
