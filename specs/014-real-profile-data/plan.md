# Plano de Implementação: Dados Reais no Perfil de Configurações

**Branch**: `014-real-profile-data` | **Data**: 2026-06-21 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `specs/014-real-profile-data/spec.md`

## Resumo

Substituir os valores hardcoded/mock na seção de perfil da `ConfiguracoesPage` pelos dados reais do usuário autenticado, disponíveis via `AuthContext`. Campos sem valor na entidade exibem "—". Mudança restrita à camada `presentation/`; nenhum novo Use Case, endpoint ou entidade é necessário.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 + React 18
**Dependências Principais**: `AuthContext` (já existente em `src/features/auth/presentation/context/AuthContext.tsx`)
**Armazenamento**: N/A — dados lidos do contexto de autenticação em memória
**Testes**: Vitest (unitários de Use Cases); não há novo Use Case nesta feature
**Plataforma Alvo**: SPA web (browser)
**Tipo de Projeto**: web-app (frontend SPA)
**Metas de Performance**: N/A — leitura síncrona de contexto React
**Restrições**: Sem acesso a `localStorage` para dados sensíveis (constituição §IV)
**Escala/Scope**: 1 arquivo de página modificado

## Verificação de Constituição

| Princípio | Status | Observação |
|---|---|---|
| I. Arquitetura (Vertical Slices) | ✅ | Mudança confinada em `presentation/`; nenhuma camada `domain`/`data` alterada |
| II. TypeScript Estrito | ✅ | Sem `any`; tipos derivados das entidades existentes; `?? '—'` é type-safe |
| III. Boas Práticas React | ✅ | Sem lógica complexa; `useAuth()` direto (sem hook extra) é adequado para leitura trivial |
| IV. Segurança | ✅ | Sem `dangerouslySetInnerHTML`; sem tokens em `localStorage` |
| V. Testes | ✅ | Nenhum novo Use Case → nenhuma nova cobertura obrigatória |

Sem violações. Rastreamento de Complexidade não aplicável.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/014-real-profile-data/
├── plan.md          ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── checklists/
│   └── requirements.md
└── tasks.md         ← gerado pelo /speckit-tasks
```

### Código-Fonte (arquivo a modificar)

```text
src/features/configuracoes/presentation/pages/
└── ConfiguracoesPage.tsx   ← único arquivo alterado
```

## Detalhes de Implementação

### Arquivo: `ConfiguracoesPage.tsx`

**1. Importar `useAuth`**

```typescript
import { useAuth } from '@/features/auth/presentation/context/AuthContext';
```

**2. Desestruturar dados do contexto no topo do componente**

```typescript
const { user, session } = useAuth();
```

**3. Substituir cada valor mock pelo dado real com fallback**

| Campo na UI | Antes (mock) | Depois (real) |
|---|---|---|
| Nome | `"Lisvalder Paz"` | `user?.nomeCompleto ?? '—'` |
| E-mail | `"lisvalder.paz@lpsolucoes.com.br"` | `user?.email ?? '—'` |
| Organização | `"LP Soluções em Licitações"` | `session?.licitante?.nomeEmpresa ?? '—'` |
| Telefone | `"(11) 98765-4321"` | `'—'` (fixo — campo não existe na entidade) |

> Os campos estáticos de outras seções (notificações, assinatura, gestão de acessos) permanecem inalterados.
