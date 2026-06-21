# Plano de Implementação: Exibição da Foto de Perfil na Navbar e Configurações

**Branch**: `016-profile-photo-display` | **Data**: 2026-06-21 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `specs/016-profile-photo-display/spec.md`

## Resumo

O endpoint `/api/me` já retorna o campo `foto_perfil_url` com a URL assinada da foto de perfil do usuário. A entidade `User` e os componentes visuais (navbar e tela de configurações) já estão preparados para exibir essa foto. O único gap é o mapper `mapApiMeToUser` em `authMappers.ts`, que não inclui `foto_perfil_url` na transformação. A implementação consiste em adicionar o campo à interface `ApiMeResponse` e mapeá-lo para `fotoPerfil` na entidade `User`, com cobertura de testes unitários para o mapper.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict)
**Dependências Principais**: React 18, React Router, Tailwind CSS, shadcn/ui
**Armazenamento**: N/A (URLs assinadas do Cloudflare R2, gerenciadas pela API)
**Testes**: Vitest + React Testing Library
**Plataforma Alvo**: SPA Web (navegadores modernos)
**Tipo de Projeto**: web-app (frontend SPA consumindo API REST)
**Metas de Performance**: Sem targets específicos — mudança de mapeamento sem impacto em latência
**Restrições**: Sem `any` ou `as unknown`; URLs assinadas com TTL de 1 hora — expiração aceita sem refresh automático
**Escala/Scope**: Um campo adicional no mapper; zero componentes novos

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slices — mudança em `auth/data/mappers/` | ✅ | Camada `data/` correta para mapeamento de API |
| I. `domain` não importa `data` ou `presentation` | ✅ | Sem alteração na camada `domain` |
| I. `presentation` acessa `domain` via contratos | ✅ | Sem alteração nas camadas `presentation` ou `domain` |
| II. Sem `any` / `as unknown` | ✅ | Tipagem explícita: `foto_perfil_url?: string \| null` |
| II. SOLID — SRP | ✅ | Mapper continua com responsabilidade única |
| III. Lógica de estado em hook customizado | ✅ | Sem hooks novos necessários |
| IV. Sem localStorage para dados sensíveis | ✅ | URL de foto não é dado sensível; não armazenada localmente |
| V. Use Cases com 100% de cobertura | ✅ | `GetMeUseCase` já coberto; testes do mapper adicionados nesta feature |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/016-profile-photo-display/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 ✅
├── data-model.md        # Fase 1 ✅
└── tasks.md             # Fase 2 (gerado por /speckit-tasks)
```

### Código-Fonte (arquivos afetados)

```text
src/
└── features/
    └── auth/
        └── data/
            └── mappers/
                ├── authMappers.ts              # MODIFICAR: ApiMeResponse + mapApiMeToUser
                └── authMappers.test.ts         # CRIAR: testes unitários do mapper
```

**Decisão de Estrutura**: Mudança cirúrgica em um único arquivo de mapper na camada `data/`. Nenhum arquivo de componente, Use Case, entidade ou contexto precisa ser alterado.

## Detalhes de Implementação

### 1. Modificar `src/features/auth/data/mappers/authMappers.ts`

**Antes**:
```typescript
interface ApiMeResponse {
  id: string;
  email: string;
  nome_completo: string;
  licitantes: ApiLicitante[];
}

export function mapApiMeToUser(raw: ApiMeResponse): User {
  return {
    id: raw.id,
    email: raw.email,
    nomeCompleto: raw.nome_completo,
    licitantes: raw.licitantes.map(mapLicitante),
  };
}
```

**Depois**:
```typescript
interface ApiMeResponse {
  id: string;
  email: string;
  nome_completo: string;
  foto_perfil_url?: string | null;
  licitantes: ApiLicitante[];
}

export function mapApiMeToUser(raw: ApiMeResponse): User {
  return {
    id: raw.id,
    email: raw.email,
    nomeCompleto: raw.nome_completo,
    fotoPerfil: raw.foto_perfil_url ?? null,
    licitantes: raw.licitantes.map(mapLicitante),
  };
}
```

### 2. Criar `src/features/auth/data/mappers/authMappers.test.ts`

Casos de teste para `mapApiMeToUser`:

| Cenário | Input | Resultado esperado em `fotoPerfil` |
|---------|-------|------------------------------------|
| Foto presente | `foto_perfil_url: "https://..."` | `"https://..."` |
| Foto nula | `foto_perfil_url: null` | `null` |
| Campo ausente | `foto_perfil_url` não presente | `null` |
| Sem foto (user completo) | campos mínimos obrigatórios | `null` |

## Critérios de Aceite Técnicos

- `mapApiMeToUser` retorna `fotoPerfil` preenchido quando `foto_perfil_url` está na resposta
- `mapApiMeToUser` retorna `fotoPerfil: null` quando `foto_perfil_url` é `null` ou ausente
- Todos os testes unitários passam (`npm run test`)
- TypeScript compila sem erros (`npm run typecheck`)
- Avatar com iniciais continua exibido para usuários sem foto (sem regressão)
