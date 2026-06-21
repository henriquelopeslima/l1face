# Data Model: Exibição da Foto de Perfil

## Entidade: User (existente — sem alteração de schema)

```typescript
interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  fotoPerfil?: string | null;  // já existe — apenas precisa ser populado pelo mapper
  licitantes: Licitante[];
}
```

## Interface de Mapeamento: ApiMeResponse (modificar)

```typescript
// Antes
interface ApiMeResponse {
  id: string;
  email: string;
  nome_completo: string;
  licitantes: ApiLicitante[];
}

// Depois (adicionar campo)
interface ApiMeResponse {
  id: string;
  email: string;
  nome_completo: string;
  foto_perfil_url?: string | null;   // <-- NOVO
  licitantes: ApiLicitante[];
}
```

## Função de Mapper: mapApiMeToUser (modificar)

```typescript
// Antes
export function mapApiMeToUser(raw: ApiMeResponse): User {
  return {
    id: raw.id,
    email: raw.email,
    nomeCompleto: raw.nome_completo,
    licitantes: raw.licitantes.map(mapLicitante),
  };
}

// Depois
export function mapApiMeToUser(raw: ApiMeResponse): User {
  return {
    id: raw.id,
    email: raw.email,
    nomeCompleto: raw.nome_completo,
    fotoPerfil: raw.foto_perfil_url ?? null,  // <-- NOVO
    licitantes: raw.licitantes.map(mapLicitante),
  };
}
```

## Sem alterações em:
- `src/features/auth/domain/entities/user.ts` — campo já existe
- `src/shared/components/layout/AppHeader.tsx` — lógica de exibição já existe
- `src/features/configuracoes/presentation/components/PerfilSection.tsx` — lógica de exibição já existe
- `src/features/auth/presentation/context/AuthContext.tsx` — ação `UPDATE_FOTO_PERFIL` já existe
