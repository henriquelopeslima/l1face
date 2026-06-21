# Data Model: Upload de Foto de Perfil

## Entidades de Domínio

### FotoPerfilUpload (input do Use Case)

```
FotoPerfilUpload {
  arquivo: File           // arquivo selecionado pelo usuário
}
```

**Regras de validação (aplicadas no use case)**:
- `arquivo.type` deve ser `image/jpeg` ou `image/png`
- `arquivo.size` deve ser ≤ 5.242.880 bytes (5 MB)

---

### FotoPerfilResult (output do Use Case de upload)

```
FotoPerfilResult {
  fotoUrl: string         // URL assinada, válida por 1 hora
}
```

---

## Erros de Domínio (configuracoes/domain/errors/perfilErrors.ts)

| Classe | Quando lançar |
|--------|--------------|
| `PerfilError` | Erro genérico de perfil (base) |
| `FormatoInvalidoError` | Arquivo não é JPEG nem PNG |
| `ArquivoMuitoGrandeError` | Arquivo excede 5 MB |
| `ArquivoInvalidoError` | Conteúdo corrompido (422 da API) |
| `StorageIndisponivelError` | Serviço R2 fora do ar (503 da API) |

---

## Interface do Repositório (IPerfilRepository)

```
IPerfilRepository {
  uploadFoto(arquivo: File): Promise<FotoPerfilResult>
  removerFoto(): Promise<void>
}
```

---

## Extensão do AuthContext

Nova ação no reducer:

```
| { type: 'UPDATE_FOTO_PERFIL'; fotoUrl: string | null }
```

Nova função exposta no contexto:

```
updateFotoPerfil(url: string | null): void
```

Atualiza `user.fotoPerfil` no estado global sem chamar a API, refletindo o avatar no `AppHeader` e no `PerfilSection` imediatamente.

---

## Mapeamento API → Domínio

| API response field | Domínio |
|--------------------|---------|
| `foto_url` (string) | `FotoPerfilResult.fotoUrl` |

---

## Estrutura de erros HTTP mapeados

| HTTP status | Erro de domínio |
|-------------|-----------------|
| 415 | `FormatoInvalidoError` |
| 422 `arquivo_invalido` | `ArquivoInvalidoError` |
| 422 `arquivo_muito_grande` | `ArquivoMuitoGrandeError` |
| 422 `arquivo_ausente` | `PerfilError` (genérico) |
| 503 | `StorageIndisponivelError` |
| 401 | `UnauthenticatedError` (reuso do auth) |
| outros | `PerfilError` genérico |
