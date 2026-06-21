---

description: "Tarefas de implementação: Exibição da Foto de Perfil na Navbar e Configurações"
---

# Tarefas: Exibição da Foto de Perfil na Navbar e Configurações

**Entrada**: Documentos de design em `specs/016-profile-photo-display/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo
- **[Story]**: História de usuário à qual a tarefa pertence

---

## Fase 1: Fundação (Pré-requisito Bloqueante)

**Propósito**: Único arquivo a modificar — unbloqueia ambas as histórias de usuário simultaneamente.

**⚠️ CRÍTICO**: Nenhum trabalho das histórias de usuário pode ser validado antes desta fase.

- [x] T001 Adicionar campo `foto_perfil_url?: string | null` à interface `ApiMeResponse` e mapear para `fotoPerfil: raw.foto_perfil_url ?? null` na função `mapApiMeToUser` em `src/features/auth/data/mappers/authMappers.ts`

**Checkpoint**: Mapper corrigido — ambas US1 e US2 ficam funcionais após este único commit.

---

## Fase 2: Histórias de Usuário 1 e 2 — Foto na Navbar e nas Configurações (Prioridade: P1)

**Objetivo**: Garantir que `fotoPerfil` carregado corretamente pelo mapper seja exibido na navbar (`AppHeader`) e na seção "Meu Perfil" das configurações (`PerfilSection`), e cobrir o comportamento com testes unitários do mapper.

**Teste Independente**:
- US1: Fazer login com conta que possui foto cadastrada e verificar exibição na navbar
- US2: Acessar `/configuracoes` com conta que possui foto e verificar exibição na seção "Meu Perfil"

### Testes para US1 + US2

- [x] T002 [P] [US1] Criar arquivo `src/features/auth/data/mappers/authMappers.test.ts` com os 4 cenários do mapper: (1) `foto_perfil_url` presente → `fotoPerfil` preenchido; (2) `foto_perfil_url: null` → `fotoPerfil: null`; (3) campo `foto_perfil_url` ausente → `fotoPerfil: null`; (4) `mapApiMeToUser` com todos os campos obrigatórios presentes retorna `User` completo

### Validação US1 — Navbar

- [ ] T003 [US1] Executar a aplicação e verificar que usuário com foto cadastrada vê a foto na navbar (`AppHeader`) em vez do avatar com iniciais — validar também que usuário sem foto continua vendo as iniciais (sem regressão)

### Validação US2 — Configurações

- [ ] T004 [US2] Verificar que a seção "Meu Perfil" em `/configuracoes` exibe a foto do usuário autenticado ao carregar a página, e que upload/remoção de foto continua atualizando a foto na navbar e na seção de configurações em tempo real (sem regressão no fluxo existente)

**Checkpoint**: US1 e US2 funcionando — foto exibida na navbar e em configurações.

---

## Fase Final: Polimento & Qualidade

- [x] T005 [P] Executar suite de testes completa e confirmar que todos passam: `npm test` ou `npx vitest run`
- [x] T006 [P] Executar verificação de tipagem TypeScript sem erros: `npm run typecheck`

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fundação (Fase 1)**: Sem dependências — iniciar imediatamente com T001
- **US1 + US2 (Fase 2)**: Depende de T001 concluído
  - T002 (testes do mapper) pode ser escrito em paralelo com T001
  - T003 e T004 (validações) exigem T001 concluído
- **Polimento (Fase Final)**: Depende de T001 + T002 concluídos

### Dentro da Fase 2

- T002 pode ser criado em paralelo com T001 (arquivo diferente, sem dependência de runtime)
- T003 e T004 são validações manuais — executar após T001 deployado localmente

### Oportunidades de Paralelismo

- T002, T005 e T006 são todos marcados [P] — podem ser executados simultaneamente após T001

---

## Estratégia de Implementação

### MVP (mínimo para validar a feature)

1. Concluir T001 (modificar `authMappers.ts`)
2. **VALIDAR**: Fazer login com conta que possui foto → foto deve aparecer na navbar e configurações
3. Concluir T002 (criar testes do mapper)
4. Executar T005 e T006 para garantir sem regressão

### Entrega Completa

1. T001 → T002 (em paralelo) → T003 + T004 (validações manuais) → T005 + T006

---

## Notas

- Toda a implementação reside em um único arquivo (`authMappers.ts`) — mudança de 2 linhas
- Os componentes visuais (`AppHeader`, `PerfilSection`) e o `AuthContext` já estão prontos
- T002 deve ser criado mesmo sendo `data/` (não `domain/`) — cobre gap de cobertura que causou o bug
- Não há migrations, contratos de API novos, ou novos Use Cases necessários
