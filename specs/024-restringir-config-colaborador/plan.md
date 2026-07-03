# Plano de Implementação: Restringir Configurações para Colaborador

**Branch**: `024-restringir-config-colaborador` | **Data**: 2026-07-03 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/024-restringir-config-colaborador/spec.md`

## Resumo

Ocultar, na tela de Configurações, as seções "Assinatura e cobrança" e "Gestão de acessos" para usuários cujo papel no licitante ativo seja Colaborador, mantendo-as visíveis para Administradores. Não existe hoje nenhuma fonte de papel do usuário disponível em `AuthContext`/`session` — o único jeito de descobrir o papel do usuário no licitante ativo é através de `GET /api/licitantes/{licitanteId}/usuarios` (já usado por `useGestaoAcessos`). A abordagem é extrair essa determinação de papel para um novo hook reutilizável em `configuracoes/presentation/hooks`, consumido por `ConfiguracoesPage` para decidir o que renderizar — sem alterar `useGestaoAcessos`/`GestaoAcessosSection`, que continuam com sua própria lógica interna de `isAdmin` (usada para os botões internos de convidar/revogar), agora redundante mas inofensiva quando a seção só é montada para Administradores.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode), React 18
**Dependências Principais**: React Router (`useLocation` já usado por `useHashScroll`), `AuthContext` (`useAuth` para `licitanteId`/`currentUserId`)
**Armazenamento**: N/A — leitura via HTTP API já existente
**Testes**: Vitest + React Testing Library
**Plataforma Alvo**: Web SPA (l1face)
**Tipo de Projeto**: Feature slice dentro de `src/features/configuracoes/`
**Metas de Performance**: Padrão de web app — decisão de exibir/ocultar aplicada antes do primeiro paint perceptível das seções restritas (sem "flash")
**Restrições**: Proibido `any`; nenhuma seção restrita pode ser montada no DOM para Colaborador (não apenas escondida via CSS), para que `useHashScroll`/acesso por âncora também fiquem naturalmente bloqueados
**Escala/Scope**: Reaproveita endpoint e entidade já existentes (`UsuarioLicitante.papel`); nenhuma mudança de contrato de API

## Verificação de Constituição

*GATE: Deve passar antes de iniciar a implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slice em `src/features/configuracoes/` | ✅ PASS | Único arquivo novo é um hook de `presentation/hooks`; nenhum arquivo fora da feature é criado |
| I. Isolamento domain → data → presentation | ✅ PASS | Novo hook consome apenas `ListarUsuariosLicitanteUseCase` (domain) já existente, sem acessar `data` diretamente |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Tipos explícitos reaproveitando `UsuarioLicitante` |
| III. Lógica extraída para hook customizado | ✅ PASS | `ConfiguracoesPage` permanece declarativa; decisão de papel fica no hook |
| III. Componentes puros | ✅ PASS | `AssinaturaSection`/`GestaoAcessosSection` não são alterados — apenas deixam de ser renderizados condicionalmente pelo pai |
| IV. Nenhuma exposição de dado sensível | ✅ PASS | Nenhuma mudança em tratamento de token/erro |
| V. Cobertura de testes de hooks | ✅ PASS | Novo hook ganha teste seguindo o precedente de `useGestaoAcessos.test.ts` |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/024-restringir-config-colaborador/
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
├── presentation/
│   ├── hooks/
│   │   ├── useIsAdminLicitante.ts        [CRIAR]
│   │   └── index.ts                      [ATUALIZAR — re-exportar o novo hook]
│   └── pages/
│       └── ConfiguracoesPage.tsx         [MODIFICAR — renderizar AssinaturaSection/GestaoAcessosSection condicionalmente]
└── __tests__/
    └── presentation/
        └── useIsAdminLicitante.test.ts   [CRIAR]
```

**Decisão de Estrutura**: Feature slice único em `configuracoes`, reaproveitando integralmente `ListarUsuariosLicitanteUseCase` e `IUsuarioLicitanteRepository`/`UsuarioLicitanteRepository` já existentes (sem nenhuma mudança nessas camadas). Nenhum arquivo fora desta feature é criado ou modificado.

## Detalhes de Implementação por Camada

### Domain / Data

Nenhuma mudança. `UsuarioLicitante.papel: 'ADMIN' | 'COLABORADOR'`, `ListarUsuariosLicitanteUseCase` e `UsuarioLicitanteRepository` já existentes são reaproveitados sem alteração.

### Presentation

**`useIsAdminLicitante.ts`** (novo)

Mesmo padrão de instanciação em nível de módulo já usado em `useGestaoAcessos.ts` (`repository`/`listarUseCase` como singletons do módulo).

Estado retornado:
- `isAdmin: boolean` — `true` somente quando o papel do usuário autenticado no licitante ativo (`usuarios.find(u => u.userId === currentUserId)?.papel`) for `'ADMIN'`. Começa em `false`.
- `isLoading: boolean` — `true` até a consulta ao roster do licitante ativo se resolver (sucesso ou erro). Começa em `true`.

Comportamento:
- Em `useEffect` (dependência `licitanteId`, obtido via `useAuth().session?.licitante.id`), chama `listarUseCase.execute(licitanteId)`.
- Em caso de erro na consulta, mantém `isAdmin = false` (fail-closed — RF-007/Caso de Borda "falha ao determinar papel") e encerra `isLoading`.
- Não expõe a lista de usuários (isso é responsabilidade exclusiva de `useGestaoAcessos`, que continua fazendo sua própria consulta quando a seção é efetivamente montada para um Administrador).

**`ConfiguracoesPage.tsx`** (modificado)

- Passa a chamar `useIsAdminLicitante()`.
- Enquanto `isLoading === true`, não renderiza `AssinaturaSection` nem `GestaoAcessosSection` (evita o "flash" descrito na spec).
- Após `isLoading === false`: renderiza `<AssinaturaSection />` e `<GestaoAcessosSection />` somente quando `isAdmin === true`; caso contrário, essas duas seções não são montadas no DOM (não apenas ocultas via CSS), o que automaticamente neutraliza `useHashScroll` para essas âncoras (`document.getElementById` retorna `null` e o scroll é ignorado — nenhuma mudança necessária em `useHashScroll.ts`).
- Demais seções (`PerfilSection`, `AparenciaSection`, `NotificacoesSection`, `SegurancaSection`) e o card de "Sair da conta" continuam sempre renderizados, para todos os papéis (RF-008).

`GestaoAcessosSection.tsx` / `useGestaoAcessos.ts`: **sem alterações**. Seguem calculando seu próprio `isAdmin` internamente (usado para gating do botão "Convidar colaborador" e das ações de remoção) — como o componente só é montado quando `ConfiguracoesPage` já confirmou que o usuário é Administrador, esse cálculo interno passa a ser sempre verdadeiro na prática, mas mantê-lo intacto evita qualquer risco de regressão em um componente já coberto por testes existentes.

### Trade-off assumido

`useIsAdminLicitante` e `useGestaoAcessos` fazem, cada um, sua própria chamada a `GET /api/licitantes/{licitanteId}/usuarios` quando o usuário é Administrador (uma para decidir se a seção deve ser montada, outra já dentro da seção montada para listar os usuários). Essa duplicação de chamada ocorre apenas para Administradores (nunca para Colaboradores, que só disparam a primeira chamada) e foi preferida a unificar as duas fontes de dados porque evitaria tocar em `useGestaoAcessos`/`GestaoAcessosSection`, que já são testados e usados em produção — reduz o risco desta mudança a um único hook novo e isolado.

## Rastreamento de Complexidade

*Nenhuma violação de constituição identificada. Seção não aplicável.*
