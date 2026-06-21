# Plano de Implementação: Fluxo de Confirmação de E-mail

**Branch**: `013-email-confirmation-flow` | **Data**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

## Resumo

Adaptar a feature `auth` para suportar a confirmação obrigatória de e-mail antes do login. O backend já implementou os endpoints e o envio de e-mail. O frontend precisa: (1) parar de redirecionar para o dashboard após cadastro, exibindo em vez disso uma tela de instrução de verificação; (2) criar a página `/confirmar-email` que processa o token da URL e autentica o usuário; (3) detectar o erro `email_nao_confirmado` no login e exibir botão de reenvio inline; (4) implementar o endpoint de reenvio de confirmação.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode)
**Dependências Principais**: React 18, react-router v7, react-hook-form, Zod, Radix UI / shadcn-ui, Tailwind CSS
**Armazenamento**: N/A (estado de auth via cookie HttpOnly gerenciado pelo servidor)
**Testes**: Vitest + React Testing Library + Playwright (e2e)
**Plataforma Alvo**: SPA browser (Vite build)
**Tipo de Projeto**: Web SPA — frontend que consome API REST (l1core/Symfony)
**Metas de Performance**: Confirmação de e-mail processa e redireciona em < 3 segundos (incluindo chamada a getMe)
**Restrições**: Proibido armazenar JWT em localStorage/sessionStorage (constituição §IV). Sem `any` ou `as unknown` (constituição §II).
**Escala/Scope**: Feature isolada dentro de `src/features/auth/` — nenhuma outra feature é alterada.

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após o design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slices — domain/data/presentation | ✅ APROVADO | Todos os novos artefatos ficam em `src/features/auth/{domain,data,presentation}` |
| I. Regra de Isolamento (domain nunca importa data/presentation) | ✅ APROVADO | Novos use cases dependem apenas de `IAuthRepository` (interface do domain) |
| II. TypeScript estrito — sem `any` ou `as unknown` | ✅ APROVADO | Todos os tipos serão explícitos ou inferidos com segurança via type guards |
| II. SOLID — Single Responsibility | ✅ APROVADO | Cada use case tem uma única responsabilidade; hooks de view são independentes |
| II. SOLID — Dependency Inversion | ✅ APROVADO | Presentation depende de `IAuthRepository` via `AuthContext`, não de `AuthRepository` diretamente |
| III. Hooks Customizados para lógica de estado complexa | ✅ APROVADO | `useConfirmarEmail` e `useReenviarConfirmacao` extraem toda lógica das pages |
| IV. Sem JWT em localStorage/sessionStorage | ✅ APROVADO | Cookie HttpOnly gerenciado pelo servidor; frontend não toca no JWT |
| IV. Mascaramento de erros de infraestrutura | ✅ APROVADO | Erros HTTP mapeados para tipos de domínio; status codes não expostos na UI |
| V. Cobertura 100% dos Use Cases | ⚠️ REQUERIDO | `ConfirmarEmailUseCase` e `ReenviarConfirmacaoEmailUseCase` precisam de 100% de cobertura de testes unitários |

**Resultado**: Sem violações. Nenhuma justificativa de complexidade necessária.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/013-email-confirmation-flow/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões e mapeamento de impacto
├── data-model.md        # Fase 1 — entidades, interfaces, use cases, hooks
├── contracts/
│   └── api.md           # Contratos exatos dos endpoints da API
└── tasks.md             # Fase 2 (gerado por /speckit-tasks)
```

### Código-Fonte

```text
src/features/auth/
├── domain/
│   ├── errors/
│   │   └── authErrors.ts                        # ALTERAR: +5 novas classes de erro
│   ├── repositories/
│   │   └── IAuthRepository.ts                   # ALTERAR: register retorna {message}, +confirmarEmail, +reenviarConfirmacao
│   └── usecases/
│       ├── ConfirmarEmailUseCase.ts              # CRIAR
│       ├── ConfirmarEmailUseCase.test.ts         # CRIAR
│       ├── ReenviarConfirmacaoEmailUseCase.ts    # CRIAR
│       ├── ReenviarConfirmacaoEmailUseCase.test.ts # CRIAR
│       ├── RegisterUseCase.ts                   # ALTERAR: retorna {message}
│       └── RegisterUseCase.test.ts              # ALTERAR: atualizar asserções de retorno
├── data/
│   ├── mappers/
│   │   └── authMappers.ts                       # ALTERAR: ApiRegisterResponse += message
│   └── repositories/
│       └── AuthRepository.ts                    # ALTERAR: ajustar register, login + implementar confirmarEmail, reenviarConfirmacao
└── presentation/
    ├── context/
    │   └── AuthContext.tsx                      # ALTERAR: +confirmarEmail, register retorna {message}
    ├── hooks/
    │   ├── useConfirmarEmail.ts                 # CRIAR
    │   ├── useReenviarConfirmacao.ts            # CRIAR
    │   ├── useLogin.ts                          # ALTERAR: detectar EmailNaoConfirmadoError
    │   └── useRegister.ts                       # ALTERAR: retornar registrationMessage
    └── pages/
        ├── ConfirmarEmailPage.tsx               # CRIAR
        ├── RegisterPage.tsx                     # ALTERAR: exibir VerificarEmail inline após cadastro
        └── LoginPage.tsx                        # ALTERAR: exibir seção de reenvio inline

src/app/
└── routes.tsx                                   # ALTERAR: +rota pública /confirmar-email
```

## Rastreamento de Complexidade

*Sem violações — seção não aplicável.*
