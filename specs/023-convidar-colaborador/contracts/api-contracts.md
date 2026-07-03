# API Contracts: Convidar Colaborador

## POST /api/licitantes/{licitanteId}/convites

**Descrição**: Envia um convite de colaborador para o e-mail informado. Se já existir um convite pendente para o mesmo par e-mail/licitante, a chamada é tratada como reenvio (renova o prazo de validade do mesmo convite).
**Autenticação**: Cookie HttpOnly `BEARER`.
**Autorização**: Apenas usuários com papel `ADMIN` no licitante.

### Request

```
POST /api/licitantes/{licitanteId}/convites
Content-Type: application/json
```

| Parâmetro   | Local | Tipo   | Obrigatório | Descrição          |
|-------------|-------|--------|-------------|---------------------|
| licitanteId | path  | UUID   | Sim         | UUID do licitante   |
| email       | body  | string | Sim         | E-mail do convidado |
| nome        | body  | string | Não (API) / Sim (formulário) | Nome do convidado. Opcional no contrato da API — só tem efeito quando o e-mail ainda não pertence a um usuário cadastrado (personaliza o e-mail e nomeia a conta criada no aceite) e é ignorado se o e-mail já pertencer a um usuário existente. O formulário de "Convidar colaborador" o exige (mesma validação do e-mail) por decisão de produto. |

```json
{
  "email": "colaborador@empresa.com.br",
  "nome": "Maria Souza"
}
```

### Response 201

```json
{
  "id": "c1d2e3f4-a5b6-7890-cdef-123456789abd",
  "email": "colaborador@empresa.com.br",
  "nome": "Maria Souza",
  "licitanteId": "550e8400-e29b-41d4-a716-446655440001",
  "usuarioJaCadastrado": true,
  "status": "PENDENTE",
  "criadoEm": "2026-01-15T10:30:00+00:00",
  "expiresAt": "2026-01-16T10:30:00+00:00"
}
```

### Respostas de Erro

| Status | Causa                                             | Mensagem para o usuário                                          |
|--------|---------------------------------------------------|--------------------------------------------------------------------|
| 401    | Token ausente, inválido ou expirado                | (redireciona para login)                                          |
| 403    | Usuário autenticado não é ADMIN do licitante       | "Apenas administradores podem enviar convites."                   |
| 404    | Licitante não encontrado                           | "Não foi possível localizar a empresa. Atualize a página e tente novamente." |
| 409    | E-mail já possui vínculo ativo com o licitante     | "Este e-mail já tem acesso a esta empresa."                       |
| 422    | Campo `email` ausente ou com formato inválido      | "Informe um e-mail válido."                                       |
| 5xx    | Erro de servidor                                   | "Erro ao enviar convite. Tente novamente."                        |

### Observação sobre reenvio

Não há distinção no corpo da resposta entre "convite novo" e "reenvio" — em ambos os casos a API responde `201` com `status: "PENDENTE"` e `expiresAt` atualizado. A UI usa a mesma mensagem de sucesso para os dois casos (ver Histórias de Usuário 1 e 3 da spec).

### Endpoints relacionados no `openapi.yaml` fora do escopo desta implementação

- `POST /api/licitantes/{licitanteId}/convites/{conviteId}/reenviar` — reenvio explícito por `conviteId`. Não utilizado porque o reenvio já é coberto automaticamente pelo endpoint acima (ver `research.md`).
- `POST /api/convites/aceitar` e `POST /api/convites/recusar` — usados pelo destinatário do convite a partir do link recebido por e-mail; fora do escopo da tela de Configurações (ver Premissas da spec).
- `GET /api/licitantes/{licitanteId}/convites` — **não existe** na API atual; por isso não há listagem de convites pendentes nesta versão.
