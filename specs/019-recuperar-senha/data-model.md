# Modelo de Dados: Recuperação de Senha

## Entidades

### RecuperacaoSenhaRequest (domain entity)

Representa a solicitação de recuperação de senha submetida pelo usuário.

| Campo  | Tipo   | Validação                  | Descrição                          |
|--------|--------|----------------------------|------------------------------------|
| email  | string | Obrigatório, formato e-mail | E-mail cadastrado do usuário       |

**Localização**: `src/features/auth/domain/entities/recuperacaoSenha.ts`

---

## Estado do Fluxo

O fluxo tem três estados visíveis para o usuário:

| Estado      | Descrição                                            |
|-------------|------------------------------------------------------|
| `idle`      | Formulário pronto para entrada (estado inicial)      |
| `loading`   | Solicitação enviada, aguardando resposta do servidor |
| `sent`      | Confirmação exibida, formulário bloqueado            |

Erro (falha de conexão/servidor) não altera o estado para `sent` — o usuário pode tentar novamente.

---

## Extensões ao IAuthRepository

Novo método adicionado à interface existente:

```
recuperarSenha(email: string): Promise<void>
```

Chamada ao endpoint `POST /api/auth/recuperar-senha` com `{ email }`.
Lança `AuthError` em caso de falha de conexão ou erro 5xx.
Não lança erro para 200 — resposta genérica sempre.

---

## Relacionamentos

```
IAuthRepository (domain)
    └── recuperarSenha(email)
            ↑ implementado por
AuthRepository (data)
            ↑ chamado por
RecuperarSenhaUseCase (domain)
            ↑ usado por
useRecuperarSenha (presentation hook)
            ↑ consumido por
RecuperarSenhaPage (presentation page)
```
