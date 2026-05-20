# Plano de Implementação: Autenticação e Seleção de Licitante

**Branch**: `002-login-licitante` | **Data**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `specs/002-login-licitante/spec.md`

## Resumo

Implementar o fluxo completo de autenticação consumindo a API REST do l1core: login via e-mail/senha, recuperação de perfil do usuário e seleção de licitante ativo. O estado autenticado é persistido em React Context e disponibilizado globalmente, substituindo todos os dados fixos (hardcoded) de usuário e licitante existentes na aplicação.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0 (modo estrito ativado)
**Framework/Runtime**: React 19 com Vite 8
**Dependências Principais**: react-router 7, react-hook-form 7, Zod 4, Radix UI, Tailwind CSS 4, Vitest 4
**Armazenamento de Sessão**: React Context em memória; autenticação persistida via cookie HttpOnly `BEARER` gerenciado pelo servidor (l1core)
**Testes**: Vitest + React Testing Library + jsdom
**Plataforma Alvo**: SPA web — navegadores modernos (Chromium, Firefox, Safari)
**Tipo de Projeto**: Single Page Application (frontend puro; backend = l1core separado)
**Metas de Performance**: Login + carregamento de perfil completo em < 2 s em conexão padrão
**Restrições**: Proibido armazenar tokens em localStorage/sessionStorage (Security by Design); TypeScript estrito sem `any`
**Escala/Scope**: ~5 telas protegidas + 1 contexto global de sessão; escopo limitado à feature de auth

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após o design da Fase 1.*

| Princípio | Status | Observações |
|-----------|--------|-------------|
| I. Arquitetura (Vertical Slices) | REQUER ATENÇÃO | `features/auth` existe apenas com `presentation/` — faltam `domain/` e `data/` |
| II. SOLID + TypeScript Estrito | OK | tsconfig já está em modo estrito; implementação seguirá as interfaces do domínio |
| III. Boas Práticas React | REQUER ATENÇÃO | `LoginPage` e `SelecionarVinculoPage` têm lógica de negócio inline — será extraída para hooks |
| IV. Segurança | OK | API usa cookie HttpOnly; Zod valida inputs; sem tokens em storage |
| V. Testes | REQUER ATENÇÃO | Ainda não há testes; Use Cases do domínio precisarão de 100 % de cobertura |

**Conclusão de Gate**: Sem violações justificadas — a estrutura será criada corretamente a partir desta feature. Nenhum item do Rastreamento de Complexidade é necessário.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/002-login-licitante/
├── plan.md              ← este arquivo
├── research.md          ← decisões arquiteturais (Fase 0)
├── data-model.md        ← entidades e contratos (Fase 1)
├── contracts/
│   └── auth-contracts.ts ← interfaces TypeScript do domínio (Fase 1)
└── tasks.md             ← gerado por /speckit-tasks (NÃO criado aqui)
```

### Código-Fonte (raiz do repositório)

```text
src/
├── features/
│   └── auth/
│       ├── domain/
│       │   ├── entities/
│       │   │   ├── user.ts              ← entidade User
│       │   │   └── licitante.ts         ← entidade Licitante
│       │   ├── repositories/
│       │   │   └── IAuthRepository.ts   ← contrato do repositório
│       │   └── usecases/
│       │       ├── LoginUseCase.ts
│       │       ├── LogoutUseCase.ts
│       │       └── GetMeUseCase.ts
│       ├── data/
│       │   ├── mappers/
│       │   │   └── authMappers.ts       ← mapeia respostas da API para entidades
│       │   └── repositories/
│       │       └── AuthRepository.ts    ← implementação via fetch + cookie
│       └── presentation/
│           ├── context/
│           │   └── AuthContext.tsx      ← React Context + Provider global
│           ├── hooks/
│           │   ├── useLogin.ts          ← orquestra LoginUseCase
│           │   └── useSelecionarLicitante.ts
│           └── pages/
│               ├── LoginPage.tsx        ← ATUALIZAR (usar useLogin)
│               └── SelecionarVinculoPage.tsx ← ATUALIZAR (dados reais da API)
├── shared/
│   └── components/
│       ├── guards/
│       │   └── ProtectedRoute.tsx       ← redireciona para /login se sem sessão
│       └── layout/
│           └── AppHeader.tsx            ← ATUALIZAR (usar AuthContext)
└── app/
    └── routes.tsx                       ← ATUALIZAR (adicionar ProtectedRoute)
```

**Decisão de Estrutura**: Aplicação web SPA (Opção frontend). O estado de autenticação é gerenciado em `features/auth/presentation/context/AuthContext.tsx` e consumido por qualquer componente via hook `useAuth()`. A camada `domain/` da feature `auth` é nova — as páginas existentes serão refatoradas para delegar lógica de negócio aos Use Cases.

**Componentes a atualizar (substituição de dados hardcoded)**:

| Arquivo | Dado hardcoded | Substituição |
|---------|----------------|--------------|
| `AppHeader.tsx` | "Lisvalder Paz" + "LP Soluções em Licitações" | `useAuth().session.user` + `session.licitante` |
| `SelecionarVinculoPage.tsx` | Constante `VINCULOS` com 4 empresas fixas | `useAuth().session.user.licitantes` da API `/api/me` |
| `CadastrarArp.tsx` | ID do licitante não usado (submissão simulada) | `useAuth().session.licitante.id` ao chamar a API |
| `LoginPage.tsx` | `navigate('/selecionar-vinculo')` direto | Chamada real à API + navigate após sucesso |
