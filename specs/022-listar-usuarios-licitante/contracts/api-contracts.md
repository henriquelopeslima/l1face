# API Contracts: Listar e Revogar Usuários do Licitante

## GET /api/licitantes/{licitanteId}/usuarios

**Descrição**: Retorna todos os vínculos usuário-licitante.  
**Autenticação**: Cookie HttpOnly `BEARER`.

### Request

```
GET /api/licitantes/{licitanteId}/usuarios
```

| Parâmetro    | Local | Tipo   | Obrigatório | Descrição             |
|--------------|-------|--------|-------------|-----------------------|
| licitanteId  | path  | UUID   | Sim         | UUID do licitante     |

### Response 200

```json
[
  {
    "id": "c1d2e3f4-a5b6-7890-cdef-123456789abc",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "nomeCompleto": "João Silva",
    "email": "joao@empresa.com.br",
    "licitanteId": "550e8400-e29b-41d4-a716-446655440001",
    "papel": "ADMIN",
    "criadoEm": "2026-01-15T10:30:00+00:00"
  }
]
```

### Respostas de Erro

| Status | Significado                              |
|--------|------------------------------------------|
| 401    | Token ausente, inválido ou expirado      |

---

## DELETE /api/licitantes/{licitanteId}/usuarios/{userId}

**Descrição**: Remove o vínculo de um usuário ao licitante.  
**Autenticação**: Cookie HttpOnly `BEARER`.  
**Autorização**: Apenas usuários com papel `ADMIN` no licitante.

### Request

```
DELETE /api/licitantes/{licitanteId}/usuarios/{userId}
```

| Parâmetro   | Local | Tipo | Obrigatório | Descrição                              |
|-------------|-------|------|-------------|----------------------------------------|
| licitanteId | path  | UUID | Sim         | UUID do licitante                      |
| userId      | path  | UUID | Sim         | UUID do usuário cujo acesso será revogado |

### Response 204

Sem corpo. Acesso revogado com sucesso.

### Respostas de Erro

| Status | Causa                                             | Mensagem para o usuário                                   |
|--------|---------------------------------------------------|-----------------------------------------------------------|
| 401    | Token inválido ou expirado                        | (redireciona para login)                                  |
| 403    | Usuário autenticado não é ADMIN                   | "Apenas administradores podem revogar acessos."           |
| 404    | Vínculo não encontrado                            | "Vínculo não encontrado. A lista será atualizada."        |
| 409    | Tentativa de remover o último ADMIN               | "Não é possível remover o último administrador."          |
| 5xx    | Erro de servidor                                  | "Erro ao revogar acesso. Tente novamente."                |
