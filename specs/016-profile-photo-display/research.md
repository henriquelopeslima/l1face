# Research: Exibição da Foto de Perfil na Navbar e Configurações

## Campo da API

**Decision**: Usar o campo `foto_perfil_url` retornado por `GET /api/me`

**Rationale**: Confirmado via OpenAPI spec (`l1core/docs/openapi.yaml`, linha 1217). Campo nullable, URL assinada com TTL de 1 hora.

**Alternatives considered**: Nenhuma — campo único disponível no endpoint.

---

## Diagnóstico do Gap

**Decision**: Modificar exclusivamente `ApiMeResponse` + `mapApiMeToUser` em `authMappers.ts`

**Rationale**:
- `User` entity (`user.ts`) já possui `fotoPerfil?: string | null`
- `AppHeader` já lê `session?.user.fotoPerfil` e renderiza `<img>` se presente
- `PerfilSection` já lê `user?.fotoPerfil` e renderiza `<img>` se presente
- `AuthContext` já possui ação `UPDATE_FOTO_PERFIL` para atualização pós-upload/remoção
- O único elo ausente é o mapper que transforma `foto_perfil_url` da resposta da API em `fotoPerfil` da entidade `User`

**Alternatives considered**: Criar novo Use Case ou hook — desnecessário; o gap é exclusivamente de mapeamento de dados.

---

## Cobertura de Testes Existente

| Arquivo | Situação |
|---------|----------|
| `GetMeUseCase.test.ts` | Testa o Use Case mas sem `fotoPerfil` no mock de `fakeUser` |
| `authMappers.ts` | Sem testes dedicados — mapper testado indiretamente |

**Decision**: Adicionar testes unitários diretos para `mapApiMeToUser` cobrindo os casos: foto presente, foto `null`, campo ausente.

**Rationale**: A constituição exige 100% de cobertura de Use Cases. Como o mapper é `data/` (não `domain/`), testes diretos são bons mas não exigidos; porém a ausência de cobertura para esse comportamento específico é a causa da regressão que este fix resolve — vale cobrir.
