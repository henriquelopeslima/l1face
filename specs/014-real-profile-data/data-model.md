# Modelo de Dados: Dados Reais no Perfil de Configurações

Esta funcionalidade **não introduz novas entidades**. Utiliza entidades existentes já definidas em `src/features/auth/domain/entities/`.

## Entidades Consumidas (somente leitura)

### User
`src/features/auth/domain/entities/user.ts`

| Campo | Tipo | Mapeamento no Perfil |
|---|---|---|
| `id` | `string` | Não exibido |
| `email` | `string` | Campo "E-mail" |
| `nomeCompleto` | `string` | Campo "Nome" |
| `fotoPerfil` | `string \| null \| undefined` | Avatar (se implementado) |
| `licitantes` | `Licitante[]` | Não exibido diretamente |

### Licitante (via `session.licitante`)
`src/features/auth/domain/entities/licitante.ts`

| Campo | Tipo | Mapeamento no Perfil |
|---|---|---|
| `id` | `string` | Não exibido |
| `cnpj` | `string` | Não exibido atualmente |
| `nomeEmpresa` | `string` | Campo "Organização" |

## Regra de Fallback

Qualquer campo com valor `null`, `undefined` ou ausente na entidade exibe `"—"`.

| Campo exibido | Fonte | Fallback |
|---|---|---|
| Nome | `user.nomeCompleto` | `"—"` |
| E-mail | `user.email` | `"—"` |
| Organização | `session?.licitante?.nomeEmpresa` | `"—"` |
| Telefone | *(sem campo na entidade)* | `"—"` (fixo) |
