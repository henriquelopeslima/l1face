# Plano de Implementação: Convidar Colaborador

**Branch**: `023-convidar-colaborador` | **Data**: 2026-07-02 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/023-convidar-colaborador/spec.md`

## Resumo

Substituir a ação mock de "Adicionar usuário" (nome + senha manual, sem chamada real de API) em `GestaoAcessosSection` por um fluxo real de convite por e-mail, usando `POST /api/licitantes/{licitanteId}/convites`. O mesmo endpoint cobre tanto o convite inicial quanto o reenvio (quando já existe convite pendente para o mesmo e-mail), então uma única ação de UI ("Convidar colaborador") resolve as três histórias de usuário da spec. A ação fica visível apenas para ADMINs do licitante ativo, papel derivado da lista já carregada por `useGestaoAcessos` (função implementada em 022-listar-usuarios-licitante).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode), React 18
**Dependências Principais**: React Context (`AuthContext` para `licitanteId`/`userId`), `apiFetch` de `@/shared/infrastructure/apiClient`, `zod` (validação de e-mail na presentation, mesmo padrão de `RegisterPage.tsx`)
**Armazenamento**: N/A — leitura/escrita via HTTP API; nenhum estado de convite é persistido localmente (sem endpoint de listagem de convites)
**Testes**: Vitest + React Testing Library
**Plataforma Alvo**: Web SPA (l1face)
**Tipo de Projeto**: Feature slice dentro de `src/features/configuracoes/`, estendendo a base já criada por `022-listar-usuarios-licitante`
**Metas de Performance**: Padrão de web app — confirmação de envio do convite em < 3s
**Restrições**: Proibido `any`; proibido acesso direto da presentation à data layer; nenhuma nova capacidade deve ser simulada (mock) na UI sem suporte real na API
**Escala/Scope**: Convite individual por vez (um e-mail por envio); sem envio em lote

## Verificação de Constituição

*GATE: Deve passar antes de iniciar a implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slice em `src/features/configuracoes/` | ✅ PASS | Todos os novos arquivos ficam dentro da feature, estendendo os já existentes de 022 |
| I. Isolamento domain → data → presentation | ✅ PASS | Domain (`ConvidarColaboradorUseCase`) não importa data ou presentation |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Todos os tipos serão explícitos (`ConviteColaborador`, extensão de `IUsuarioLicitanteRepository`) |
| II. Dependency Inversion | ✅ PASS | `useGestaoAcessos` depende da interface `IUsuarioLicitanteRepository`, não da API diretamente |
| III. Lógica extraída para hook customizado (`useGestaoAcessos`) | ✅ PASS | Estado/ação de convite adicionados ao hook existente; componente permanece presentational |
| III. Imutabilidade de estado | ✅ PASS | `useState` com valores primitivos/spreads |
| IV. Validação na borda (Zod) | ✅ PASS | Campo de e-mail do formulário validado via Zod antes de chamar o Use Case |
| IV. Token JWT não exposto (cookie HttpOnly) | ✅ PASS | Enviado automaticamente pelo browser via `apiFetch` |
| IV. Mascaramento de erros | ✅ PASS | Erros HTTP mapeados para mensagens amigáveis; nenhum detalhe de infraestrutura exposto |
| V. Use Cases com 100% cobertura de testes unitários | ✅ PASS | Teste obrigatório para `ConvidarColaboradorUseCase` |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/023-convidar-colaborador/
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
│   │   ├── ConviteColaborador.ts             [CRIAR]
│   │   └── index.ts                          [ATUALIZAR — re-exportar ConviteColaborador]
│   ├── repositories/
│   │   └── IUsuarioLicitanteRepository.ts    [ATUALIZAR — adicionar método convidar]
│   └── usecases/
│       ├── ConvidarColaboradorUseCase.ts     [CRIAR]
│       └── index.ts                          [ATUALIZAR — re-exportar use case]
├── data/
│   ├── datasources/
│   │   └── UsuarioLicitanteAPI.ts            [ATUALIZAR — adicionar método convidar]
│   └── repositories/
│       └── UsuarioLicitanteRepository.ts     [ATUALIZAR — adicionar método convidar]
├── presentation/
│   ├── hooks/
│   │   └── useGestaoAcessos.ts               [ATUALIZAR — estado/ação de convite + isAdmin]
│   └── components/
│       └── GestaoAcessosSection.tsx          [MODIFICAR — Drawer de criar/editar → formulário de convite]
└── __tests__/
    ├── domain/
    │   └── ConvidarColaboradorUseCase.test.ts [CRIAR]
    └── presentation/
        └── useGestaoAcessos.test.ts           [ATUALIZAR — cobrir fluxo de convite]
```

**Decisão de Estrutura**: Feature slice único em `configuracoes`, estendendo os arquivos já criados por `022-listar-usuarios-licitante`. Nenhum arquivo fora desta feature é criado ou modificado (exceto possíveis re-exports em `index.ts`).

## Detalhes de Implementação por Camada

### Domain

**`ConviteColaborador.ts`**
```ts
export interface ConviteColaborador {
  id: string;
  email: string;
  licitanteId: string;
  usuarioJaCadastrado: boolean;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  criadoEm: string;
  expiresAt: string;
}
```

**`IUsuarioLicitanteRepository.ts`** (extensão)
```ts
export interface IUsuarioLicitanteRepository {
  listar(licitanteId: string): Promise<UsuarioLicitante[]>;
  revogar(licitanteId: string, userId: string): Promise<void>;
  convidar(licitanteId: string, email: string): Promise<ConviteColaborador>;
}
```

**`ConvidarColaboradorUseCase.ts`** — executa `repository.convidar(licitanteId, email)`.

### Data

**`UsuarioLicitanteAPI.ts`** (novo método)
- `convidar`: `POST /api/licitantes/{licitanteId}/convites`, corpo `{ email }` → `ConviteColaborador`; lança erro mapeado por status HTTP (401/403/404/409/422/5xx conforme `contracts/api-contracts.md`).

**`UsuarioLicitanteRepository.ts`** (novo método)
- Delega para `UsuarioLicitanteAPI.convidar`.
- Trata `JWT_EXPIRED` → `window.location.href = '/login'` (mesmo padrão de `listar`/`revogar`).

### Presentation

**`useGestaoAcessos.ts`** (extensão)

Estado novo:
- `isAdmin: boolean` — derivado de `usuarios.find(u => u.userId === currentUserId)?.papel === 'ADMIN'` (recalculado via `useMemo` a cada atualização de `usuarios`/`currentUserId`).
- `convidando: boolean`
- `convidarError: string | null`
- `convidarSucesso: string | null`

Ação nova:
- `convidarColaborador(email: string): Promise<boolean>` — chama `ConvidarColaboradorUseCase`, seta `convidarSucesso` com mensagem de confirmação em caso de êxito (retorna `true`) ou `convidarError` em caso de falha (retorna `false`), sempre limpando o outro estado antes de tentar.
- `clearConvidarFeedback(): void` — limpa `convidarError`/`convidarSucesso` (chamado ao fechar o Drawer).

**`GestaoAcessosSection.tsx`** (modificações)
- Remove `gerarSenhaAleatoria`, estados `nome`/`senha`/`papel`/`modo`/`feedback`, a função `abrirEditar` e o botão de editar (lápis) — nenhum tinha suporte real de API.
- Renomeia a ação principal para "Convidar colaborador"; o Drawer passa a ter um único campo (e-mail), validado com Zod antes do envio.
- Botão "Convidar colaborador" só é renderizado quando `isAdmin === true` (RF-007).
- No submit: chama `convidarColaborador(email)`; em sucesso, exibe mensagem inline (`convidarSucesso`) e mantém o Drawer aberto brevemente para o Admin ler a confirmação, com botão para fechar; em erro, exibe `convidarError` sem fechar o Drawer, permitindo nova tentativa.
- Mantém inalterados: tabela de usuários, `AlertDialog` de confirmação de remoção, ocultação do botão "Remover" para o próprio usuário logado.

## Rastreamento de Complexidade

*Nenhuma violação de constituição identificada. Seção não aplicável.*

A remoção do modo "editar" (não solicitada explicitamente na spec, mas presente no mesmo Drawer que está sendo reescrito) é uma simplificação, não uma complexidade adicional — ver justificativa em `research.md` ("Substituição da UI de 'Adicionar usuário' mock").
