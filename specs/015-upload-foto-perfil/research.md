# Research: Upload de Foto de Perfil

## 1. Endpoints de API

**Decision**: Usar os três endpoints já documentados em `l1core/docs/openapi.yaml`.

| Operação | Método | Endpoint |
|----------|--------|----------|
| Upload / substituição | `PUT` | `/api/perfil/foto` |
| Remoção | `DELETE` | `/api/perfil/foto` |
| Visualização | `GET` | `/api/perfil/{userId}/foto` |

**Detalhes do upload**:
- Content-Type: `multipart/form-data`, campo `foto`
- Formatos aceitos: `image/jpeg`, `image/png`
- Tamanho máximo: 5 MB
- Resposta 200: `{ foto_url: string }` — URL assinada Cloudflare R2, válida por 1 hora

**Detalhe do visualizar**:
- Resposta: redirect `302` para URL assinada R2
- JWT em cookie HttpOnly → browser segue o redirect automaticamente
- Pode ser usado como `src` de `<img>` diretamente

---

## 2. Problema com apiFetch e multipart/form-data

**Decision**: Modificar `apiFetch` para omitir o header `Content-Type` quando o `body` for uma instância de `FormData`.

**Rationale**: `apiFetch` atualmente define `Content-Type: application/json` por padrão. Para multipart, o browser precisa definir o `Content-Type` automaticamente (incluindo o boundary). Sobrescrever com `application/json` corrompe a requisição. A modificação é mínima e mantém compatibilidade total com todos os outros usos.

**Alternativa rejeitada**: Usar `fetch` diretamente no repositório — acoplaria o repositório ao mecanismo de `credentials: 'include'` e ao header `x-licitante-id`, duplicando responsabilidades.

**Alternativa rejeitada**: Criar um segundo cliente HTTP — over-engineering para um ajuste de duas linhas.

---

## 3. Atualização reativa do avatar (AuthContext)

**Decision**: Adicionar ação `UPDATE_FOTO_PERFIL` ao reducer do `AuthContext` e expor a função `updateFotoPerfil(url: string | null): void` no valor do contexto.

**Rationale**: O estado global do usuário (`user.fotoPerfil`) já vive no `AuthContext`. Reutilizar o `SET_USER` (disparar `getMeUseCase`) faria uma chamada extra à API desnecessariamente. A nova ação é cirúrgica: atualiza só o campo `fotoPerfil` do `User` no estado existente, refletindo no `AppHeader` e no `PerfilSection` imediatamente.

**Alternativa rejeitada**: Re-fetch completo de `/api/me` — viagem de rede desnecessária quando já temos a URL na resposta do upload.

**Alternativa rejeitada**: Estado local isolado em `PerfilSection` — o `AppHeader` também exibe o avatar e não teria como saber do update.

---

## 4. Validação client-side antes do upload

**Decision**: Validar `tipo` (MIME type) e `tamanho` no hook `useUploadFotoPerfil` antes de chamar o use case.

**Rationale**: Evitar viagem de rede para arquivos claramente inválidos; é também o padrão da constituição (validação na borda / camada de apresentação via `Zod` ou lógica equivalente).

**Alternativas consideradas**: Validar só na API — degrada UX pois exige round-trip; validar no use case (domain) — o domain não deve depender de tipos browser (`File`). Validação na camada de apresentação é o padrão correto pela constituição.

---

## 5. Onde reside a feature

**Decision**: Toda a nova lógica reside em `src/features/configuracoes/`, seguindo a estrutura `domain/ data/ presentation/`.

**Rationale**: Upload de foto é uma ação iniciada a partir da tela de Configurações. A `configuracoes` feature já existe. A dependência cruzada com `auth` é feita via `AuthContext` (injeção via React Context), sem importar implementações internas de `auth` — padrão permitido pela constituição.

---

## 6. Expiração da URL assinada (1 hora)

**Decision**: Não implementar renovação automática da URL nesta versão. A URL é usada imediatamente no avatar como `src`. Se expirar após 1h, na próxima renderização do avatar (ex.: refresh da página) a URL seria carregada novamente via `GET /api/me`, que retorna `fotoPerfil` atualizado.

**Rationale**: Escopo desta versão é o upload e exibição imediata. Renovação silenciosa é uma melhoria futura.
