# API Contract: Password Change

**Referência**: `/api/auth/alterar-senha` (documentado em `l1core/docs/openapi.yaml`)  
**Versão**: 1.0  
**Última Atualização**: 2026-06-30

## Endpoint: POST /api/auth/alterar-senha

### Autenticação

**Obrigatória**: Sim  
**Métodos Suportados**:
- Cookie HttpOnly `BEARER` (JWT) — recomendado para SPA
- Header `Authorization: Bearer <JWT>` — suportado para API clients

### Request

**Content-Type**: `application/json`

**Body**:
```json
{
  "senhaAtual": "string (mín: 1 char)",
  "novaSenha": "string (8-20 chars, letras + números obrigatórios)"
}
```

**Validações Backend**:
1. `senhaAtual` — não vazio
2. `novaSenha` — comprimento 8-20
3. `novaSenha` — contém letras (a-z, A-Z)
4. `novaSenha` — contém números (0-9)
5. `senhaAtual` — corresponde a senha atual do usuário autenticado
6. (Opcional) `novaSenha` != `senhaAtual` — não permitir mesma senha

**Exemplo cURL**:
```bash
curl -X POST http://localhost/api/auth/alterar-senha \
  -H "Content-Type: application/json" \
  -b "BEARER=eyJ..." \
  -d '{
    "senhaAtual": "SenhaAntiga123",
    "novaSenha": "NovaSenha456"
  }'
```

---

### Response

#### 200 OK — Sucesso

```json
{
  "message": "Senha alterada com sucesso."
}
```

**Significado**: Senha alterada com sucesso. Usuário permanece logado; nova senha funciona imediatamente no próximo login.

---

#### 400 Bad Request — Validação Falhou

```json
{
  "success": false,
  "error": "Mensagem de erro específica"
}
```

**Possíveis valores de `error`**:
- `"Senha deve ter no mínimo 8 caracteres"` — `novaSenha.length < 8`
- `"Senha deve ter no máximo 20 caracteres"` — `novaSenha.length > 20`
- `"Senha deve conter letras"` — sem a-z ou A-Z
- `"Senha deve conter números"` — sem 0-9
- `"Senha atual incorreta"` — `senhaAtual` não corresponde

**Nota**: Mensagens genéricas por razões de segurança (não diferencia entre "usuário não existe" e "senha incorreta").

---

#### 401 Unauthorized — JWT Inválido/Expirado

```json
{
  "code": 401,
  "message": "JWT Token not found" ou "Token expired"
}
```

**Significado**: Usuário não autenticado ou sessão expirou. Cliente DEVE redirecionar para `/login`.

---

#### 422 Unprocessable Entity — Formato Inválido

```json
{
  "error": "O campo 'senhaAtual' é obrigatório."
}
```

**Significado**: Body JSON ausente ou campos obrigatórios faltando.

---

#### 5xx Server Error

Falha interna do servidor. Cliente DEVE:
1. Exibir "Erro ao alterar senha. Tente novamente mais tarde"
2. Preservar dados do formulário (user pode retentar)
3. Logar erro para monitoramento

---

## Headers de Resposta

**Set-Cookie**: Não enviado (senha alterada não redefine sessão)

---

## Contrato para Frontend

### DataSource (HTTP Client Wrapper)

```typescript
interface IChangePasswordDataSource {
  /**
   * Altera a senha do usuário autenticado
   * @param request - senhaAtual e novaSenha
   * @returns Promise<ChangePasswordResponse>
   * @throws AxiosError em caso de erro de rede ou HTTP 4xx/5xx
   */
  changePassword(
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse>;
}
```

**Implementação**:
- Usa instância HTTP configurada do projeto (axios com baseURL, retry, etc.)
- Mapeia response DTO para entidade domain
- Trata erros HTTP 401 (redirect login), 5xx (retry), 400 (propagar mensagem)

### Comportamento Esperado

| Cenário | Status HTTP | Resposta | Comportamento |
|---------|------------|----------|---------------|
| Sucesso | 200 | `message: "Senha alterada com sucesso."` | Limpar form, toast sucesso, permanecer logado |
| Senha inválida (força) | 400 | `error: "Senha deve..."` | Mostrar erro, form preservado |
| Senha atual incorreta | 400 | `error: "Senha atual incorreta"` | Mostrar erro, form preservado |
| JWT expirado | 401 | `code: 401, message: "..."` | Redirecionar para `/login` |
| Erro servidor | 5xx | `code: 500, message: "..."` | Mostrar erro genérico, retry automático 1x |
| Erro de rede (timeout) | N/A | `AxiosError` | Mostrar "Verifique conexão", retry manual |

---

## Notas de Segurança

1. **Senhas não são retornadas na resposta** — apenas `success` boolean
2. **Mensagens de erro são genéricas** — "Senha atual incorreta" nunca diferencia usuário vs. senha (força bruta)
3. **JWT em cookie HttpOnly** — não acessível via JavaScript (XSS protection)
4. **Sem armazenamento em localStorage** — tokens sensíveis nunca tocam armazenamento não-seguro
5. **Backend valida SEMPRE** — cliente nunca é autoridade sobre regras
6. **Hashing bcrypt backend** — nova senha é hasheada antes de persistir

---

## Exemplo de Fluxo End-to-End

```
┌─────────┐
│ Cliente │
└────┬────┘
     │ usuário preenche form
     │ currentPassword: "SenhaAntiga123"
     │ newPassword: "NovaSenha456"
     │
     ├─→ Validação Cliente (frontend só)
     │   ✓ newPassword.length = 11 (8-20) ✓
     │   ✓ contém letra? S ✓
     │   ✓ contém número? S ✓
     │
     │ usuário clica "Alterar"
     │
     ├─→ POST /api/auth/alterar-senha
     │   Headers: Content-Type: application/json
     │   Cookie: BEARER=eyJ...
     │   Body: {senhaAtual: "SenhaAntiga123", novaSenha: "NovaSenha456"}
     │
     │   ↓ Backend (Symfony)
     │   ├─ Validar JWT ✓
     │   ├─ Validar comprimento novaSenha ✓
     │   ├─ Validar força novaSenha ✓
     │   ├─ Validar senhaAtual == hash armazenado ✓
     │   ├─ Hash novaSenha com bcrypt
     │   ├─ UPDATE users SET password_hash = ... WHERE id = 123
     │   └─ RETURN {success: true, error: null}
     │
     │ ← 200 OK
     │   {success: true, error: null}
     │
     ├─→ Frontend
     │   ✓ Exibir toast "Senha alterada com sucesso"
     │   ✓ Limpar formulário
     │   ✓ Permanecer na página (usuário continua logado)
     │
     └─ FIM (sucesso)

Cenário alternativo (Senha atual incorreta):

     ├─→ POST /api/auth/alterar-senha
     │   ... mesmo request ...
     │
     │   ↓ Backend
     │   ├─ ... validações iniciais ...
     │   ├─ Validar senhaAtual == hash ✗ FALHA
     │   └─ RETURN 400 {success: false, error: "Senha atual incorreta"}
     │
     │ ← 400 Bad Request
     │   {success: false, error: "Senha atual incorreta"}
     │
     ├─→ Frontend
     │   ✗ Exibir erro "Senha atual incorreta"
     │   ✓ Form preservado (usuário pode retentar)
     │
     └─ FIM (falha esperada, usuário retentar)
```

---

## Teste Manual (Postman / cURL)

**1. Setup**: Fazer login primeiro para obter JWT

```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "OldPassword123"}' \
  -c cookies.txt
```

**2. Alterar Senha**

```bash
curl -X POST http://localhost/api/auth/alterar-senha \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "senhaAtual": "OldPassword123",
    "novaSenha": "NewPassword456"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "error": null
}
```

**3. Verificar**: Login com nova senha

```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "NewPassword456"}' \
  -c cookies.txt
```

Deve retornar 204 com JWT cookie.

---

## Versionamento de API

Esta especificação documenta **v1** do contrato.

**Mudanças Futuras Compatíveis**:
- Adicionar campos opcionais na request (ex: `twoFactorCode`)
- Adicionar campos na response (ex: `requiresReLogin: boolean`)

**Mudanças Futuras Incompatíveis** (novo major version):
- Mudar campo obrigatório em request
- Remover campo de response
- Mudar semântica de status HTTP
