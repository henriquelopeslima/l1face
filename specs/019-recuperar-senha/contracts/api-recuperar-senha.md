# Contrato de API: Recuperação de Senha

## Endpoint

```
POST /api/auth/recuperar-senha
```

## Request

```json
{
  "email": "joao@example.com"
}
```

| Campo | Tipo   | Obrigatório | Validação           |
|-------|--------|-------------|---------------------|
| email | string | Sim         | Formato e-mail válido |

## Responses

### 200 OK — Solicitação processada

Resposta **sempre** retornada, independentemente de o e-mail existir no sistema
(proteção contra enumeração de usuários).

```json
{
  "message": "Se o email existir, você receberá uma nova senha em instantes."
}
```

### 400 Bad Request — Campo ausente ou inválido

```json
{
  "error": "O campo 'email' é obrigatório."
}
```

ou

```json
{
  "error": "Formato de e-mail inválido."
}
```

## Comportamento de Segurança

- O backend **nunca** confirma nem nega se o e-mail existe no sistema.
- A nova senha é gerada aleatoriamente (12 caracteres, multi-charset) e enviada por e-mail.
- O frontend deve reproduzir esse comportamento: exibir mensagem genérica de sucesso
  independentemente da resposta (desde que não seja erro de conectividade/servidor).

## Tratamento de Erros no Frontend

| Cenário                  | Ação do Frontend                                          |
|--------------------------|-----------------------------------------------------------|
| 200 OK                   | Exibir mensagem genérica de sucesso; manter no estado `sent` |
| 400 (validação backend)  | Não deve ocorrer (validação prévia no frontend)           |
| Falha de conexão / 5xx   | Exibir mensagem de erro amigável; manter formulário ativo |
