# Plano de Implementação: Listar e Revogar Usuários do Licitante

**Branch**: `022-listar-usuarios-licitante` | **Data**: 2026-06-30 | **Spec**: [spec.md](spec.md)

## Resumo

Conectar o componente `GestaoAcessosSection` à API real para listar os usuários vinculados ao licitante ativo e permitir que ADMINs revogem o acesso de outros usuários. O componente atual usa dados mock; esta implementação substitui esse mock pela camada de dados real, seguindo a Clean Architecture já estabelecida na feature `configuracoes`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode), React 18  
**Dependências Principais**: React Context (AuthContext para licitanteId/userId), `apiFetch` do `@/shared/infrastructure/apiClient`  
**Armazenamento**: N/A — leitura/escrita via HTTP API  
**Testes**: Vitest + React Testing Library  
**Plataforma Alvo**: Web SPA (l1face)  
**Tipo de Projeto**: Feature slice dentro de `src/features/configuracoes/`  
**Metas de Performance**: Padrão de web app — lista carregada em < 3s  
**Restrições**: Proibido `any`, proibido acesso direto da presentation à data layer  
**Escala/Scope**: Lista de usuários de uma PME — sem paginação necessária

## Verificação de Constituição

*GATE: Deve passar antes de iniciar a implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slice em `src/features/configuracoes/` | ✅ PASS | Todos os novos arquivos ficam dentro da feature |
| I. Isolamento domain → data → presentation | ✅ PASS | Domain não importa data ou presentation |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Todos os tipos serão explícitos |
| III. Lógica extraída para hook customizado (`useGestaoAcessos`) | ✅ PASS | Componente fica puramente presentational |
| III. Imutabilidade de estado | ✅ PASS | useState com spreads |
| IV. Token JWT não exposto (cookie HttpOnly) | ✅ PASS | Enviado automaticamente pelo browser |
| V. Use Cases com 100% cobertura de testes unitários | ✅ PASS | Testes obrigatórios para os 2 novos Use Cases |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/022-listar-usuarios-licitante/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── checklists/
    └── requirements.md
```

### Código-Fonte (arquivos a criar/modificar)

```text
src/features/configuracoes/
├── domain/
│   ├── entities/
│   │   ├── UsuarioLicitante.ts           [CRIAR]
│   │   └── index.ts                      [ATUALIZAR — re-exportar UsuarioLicitante]
│   ├── repositories/
│   │   ├── IUsuarioLicitanteRepository.ts [CRIAR]
│   │   └── index.ts                      [ATUALIZAR — re-exportar interface]
│   └── usecases/
│       ├── ListarUsuariosLicitanteUseCase.ts [CRIAR]
│       ├── RevogarAcessoUseCase.ts           [CRIAR]
│       └── index.ts                          [ATUALIZAR — re-exportar use cases]
├── data/
│   ├── datasources/
│   │   ├── UsuarioLicitanteAPI.ts        [CRIAR]
│   │   └── index.ts                      [ATUALIZAR]
│   └── repositories/
│       ├── UsuarioLicitanteRepository.ts [CRIAR]
│       └── index.ts                      [ATUALIZAR]
├── presentation/
│   ├── hooks/
│   │   ├── useGestaoAcessos.ts           [CRIAR]
│   │   └── index.ts                      [ATUALIZAR]
│   └── components/
│       └── GestaoAcessosSection.tsx      [MODIFICAR — substituir mock por dados reais]
└── __tests__/
    ├── domain/
    │   ├── ListarUsuariosLicitanteUseCase.test.ts [CRIAR]
    │   └── RevogarAcessoUseCase.test.ts           [CRIAR]
    └── presentation/
        └── useGestaoAcessos.test.ts               [CRIAR]
```

**Decisão de Estrutura**: Feature slice único em `configuracoes`. Nenhum arquivo fora desta feature é criado ou modificado (exceto possíveis re-exports em `index.ts`).

## Detalhes de Implementação por Camada

### Domain

**`UsuarioLicitante.ts`**
```ts
export interface UsuarioLicitante {
  id: string;
  userId: string;
  nomeCompleto: string;
  email: string;
  licitanteId: string;
  papel: 'ADMIN' | 'COLABORADOR';
  criadoEm: string;
}
```

**`IUsuarioLicitanteRepository.ts`**
```ts
export interface IUsuarioLicitanteRepository {
  listar(licitanteId: string): Promise<UsuarioLicitante[]>;
  revogar(licitanteId: string, userId: string): Promise<void>;
}
```

**`ListarUsuariosLicitanteUseCase.ts`** — executa `repository.listar(licitanteId)`.  
**`RevogarAcessoUseCase.ts`** — executa `repository.revogar(licitanteId, userId)`.

### Data

**`UsuarioLicitanteAPI.ts`**
- `listar`: `GET /api/licitantes/{licitanteId}/usuarios` → `UsuarioLicitante[]`
- `revogar`: `DELETE /api/licitantes/{licitanteId}/usuarios/{userId}` → lança erro mapeado por status HTTP (403/404/409/5xx)

**`UsuarioLicitanteRepository.ts`**
- Delega para `UsuarioLicitanteAPI`.
- Trata `JWT_EXPIRED` → `window.location.href = '/login'` (padrão da feature).

### Presentation

**`useGestaoAcessos.ts`**

Estado:
- `usuarios: UsuarioLicitante[]`
- `isLoading: boolean`
- `error: string | null`
- `removendoId: string | null` (userId sendo removido, para loading inline)
- `removeError: string | null`

Ações:
- `revogarAcesso(userId: string): Promise<void>` — chama use case, atualiza estado pessimisticamente.

Inicialização:
- Obtém `licitanteId` via `useAuth().session?.licitante.id`.
- Chama `listarUseCase.execute(licitanteId)` em `useEffect` no mount.

**`GestaoAcessosSection.tsx`** (modificações)
- Remove toda lógica de mock e estados de criação/edição (fora do escopo).
- Remove o Drawer de criar/editar (fora do escopo).
- Mantém o `AlertDialog` de confirmação de remoção.
- Usa `useGestaoAcessos()` para dados e ações.
- Oculta botão "Remover" quando `usuario.userId === currentUser.id`.
- Exibe skeleton/spinner durante `isLoading`.
- Exibe mensagem de erro quando `error` ou `removeError` não são null.

## Rastreamento de Complexidade

*Nenhuma violação de constituição identificada. Seção não aplicável.*
