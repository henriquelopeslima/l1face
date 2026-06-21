# Tarefas: Dados Reais no Perfil de Configurações

**Entrada**: Documentos de design em `/specs/014-real-profile-data/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

**Organização**: Feature de arquivo único — todas as histórias de usuário são implementadas no mesmo componente. US2 (fallback "—") é um comportamento intrínseco da implementação de US1 e não requer tarefa separada de código.

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: US1–US2 conforme spec.md

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Verificar que o `AuthContext` e as entidades estão no estado esperado antes da modificação.

- [x] T001 Confirmar que `useAuth()` em `src/features/auth/presentation/context/AuthContext.tsx` expõe `user` (com `nomeCompleto` e `email`) e `session` (com `licitante.nomeEmpresa`) — apenas leitura, sem alteração

**Checkpoint**: Contexto validado — implementação pode iniciar.

---

## Fase 3: História de Usuário 1 — Perfil exibe dados reais (Prioridade: P1) 🎯 MVP

**Objetivo**: Substituir os 4 valores hardcoded na seção de perfil de `ConfiguracoesPage.tsx` pelos dados reais do usuário autenticado.

**Teste Independente**: Logar com qualquer conta real, navegar para Configurações e verificar que nome, e-mail e organização refletem os dados da conta — nenhum dado fictício visível.

- [x] T002 [US1] Atualizar `src/features/configuracoes/presentation/pages/ConfiguracoesPage.tsx`:
  1. Adicionar import: `import { useAuth } from '@/features/auth/presentation/context/AuthContext';`
  2. No topo do componente, após as chamadas de hook existentes: `const { user, session } = useAuth();`
  3. Linha 81 — substituir `alt="Foto de perfil de Lisvalder Paz"` por `alt={\`Foto de perfil de ${user?.nomeCompleto ?? ''}\`}`
  4. Linha 83 — substituir `"Lisvalder Paz"` por `{user?.nomeCompleto ?? '—'}`
  5. Linha 84 — substituir `"LP Soluções em Licitações"` por `{session?.licitante?.nomeEmpresa ?? '—'}`
  6. No array das linhas 89–92, substituir os valores:
     - E-mail: `'lisvalder.paz@lpsolucoes.com.br'` → `user?.email ?? '—'`
     - Telefone: `'(11) 98765-4321'` → `'—'` (campo não existe na entidade User)
     - Organização: `'LP Soluções em Licitações'` → `session?.licitante?.nomeEmpresa ?? '—'`

**Checkpoint**: US1 completa — dados reais visíveis na seção de perfil, US2 coberta pelo mesmo fallback `?? '—'`.

---

## Fase 4: Polimento & Validação

- [x] T003 [P] Executar `npx tsc --noEmit` e confirmar zero erros de tipo — verificar especialmente os campos opcionais (`user?.nomeCompleto`, `session?.licitante?.nomeEmpresa`)

---

## Dependências & Ordem de Execução

- T001 → T002 → T003

### Oportunidades de Paralelismo

Nenhuma (arquivo único, 3 tarefas sequenciais).

---

## Estratégia de Implementação

### Execução Solo (Recomendada)

T001 → T002 → T003

### MVP (apenas US1)

T002 já entrega US1 e US2 simultaneamente — não há divisão MVP/incremental necessária.

---

## Notas

- Apenas `src/features/configuracoes/presentation/pages/ConfiguracoesPage.tsx` é alterado
- Nenhum novo Use Case, repositório, mapper ou endpoint é necessário
- Nenhuma nova cobertura de teste unitário obrigatória (constituição §V exige 100% apenas para Use Cases do domain — não há novo Use Case aqui)
- Os valores de outras seções (notificações, assinatura, gestão de acessos) permanecem inalterados
