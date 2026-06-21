# Contratos de API: Fluxo de Confirmação de E-mail

Todos os endpoints abaixo são públicos (sem cookie BEARER). Chamados pelo `AuthRepository` via `apiFetch`.

---

## POST /api/users/register-with-bidder

**Mudança**: Resposta 201 passa a incluir `message`. O frontend deve exibir este campo.

### Request
```json
{
  "nome": "string",
  "email": "string",
  "password": "string",
  "cnpj": "string",
  "razao_social": "string"
}
```

### Resposta 201 — Sucesso
```json
{
  "user": { "id": "uuid", "email": "string", "nome": "string" },
  "licitante": { "id": "uuid", "cnpj": "string", "razao_social": "string" },
  "message": "Cadastro realizado. Verifique seu e-mail para confirmar a conta."
}
```
Sem JWT. Sem cookie BEARER. Frontend exibe `message` e permanece na tela de verificação.

### Resposta 409 — Conflito
```json
{ "error": "Esta empresa já está cadastrada." }
```
Frontend exibe `error`. Nenhuma mudança de comportamento.

---

## POST /api/auth/confirmar-email

**Novo endpoint.**

### Request
```json
{ "token": "string (hex 64 chars)" }
```

### Resposta 200 — Sucesso
```json
{
  "user": { "id": "uuid", "email": "string", "nome_completo": "string" },
  "token": "string (jwt)"
}
```
Cookie `BEARER=<jwt>; HttpOnly; SameSite=Lax; Path=/` definido pelo servidor.
Frontend chama `GET /api/me` para hidratar estado de autenticação, então redireciona para `/`.

### Resposta 400 — Token inválido ou ausente
```json
{ "error": "token_invalido", "message": "Token de confirmação inválido." }
```
Frontend: exibe mensagem genérica de erro + link para `/login`.
Mapeado para: `TokenInvalidoError(message)`.

### Resposta 410 — Token expirado
```json
{ "error": "token_expirado", "message": "O link de confirmação expirou. Solicite um novo e-mail de confirmação." }
```
Frontend: exibe mensagem de expiração + botão "Solicitar novo link" → `/login`.
Mapeado para: `TokenExpiradoError(message)`.

### Resposta 409 — Conta já confirmada
```json
{ "error": "conta_ja_confirmada", "message": "Esta conta já foi confirmada. Acesse o sistema com suas credenciais." }
```
Frontend: exibe mensagem + redireciona para `/login`.
Mapeado para: `ContaJaConfirmadaError(message)`.

---

## POST /api/login

**Mudança**: Diferenciação entre erro de credenciais inválidas e conta não confirmada.

### Resposta 401 — Credenciais inválidas (comportamento existente)
```json
{ "code": 401, "message": "Invalid credentials." }
```
Frontend: exibe "E-mail ou senha incorretos." (comportamento inalterado).
Mapeado para: `AuthError('E-mail ou senha incorretos.')`.

### Resposta 401 — Conta não confirmada (novo)
```json
{ "code": 401, "message": "email_nao_confirmado" }
```
Diferenciado por: `body.message === 'email_nao_confirmado'`.
Frontend: exibe aviso de e-mail não confirmado + botão "Reenviar e-mail de confirmação" inline.
Mapeado para: `EmailNaoConfirmadoError`.

---

## POST /api/auth/reenviar-confirmacao

**Novo endpoint.**

### Request
```json
{ "email": "string" }
```

### Resposta 200 — Sucesso (retornado também para e-mails inexistentes)
```json
{ "message": "E-mail de confirmação reenviado com sucesso." }
```
Frontend: exibe feedback de envio. Não inferir existência do e-mail.

### Resposta 429 — Rate limit
```json
{ "error": "limite_reenvio_excedido", "message": "Muitas tentativas de reenvio. Aguarde antes de tentar novamente." }
```
Frontend: exibe `message` e desabilita botão de reenvio.
Mapeado para: `RateLimitReenvioError(message)`.
