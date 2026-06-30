# Plano de Implementação: Recuperação de Senha

**Branch**: `019-recuperar-senha` | **Data**: 2026-06-29 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/019-recuperar-senha/spec.md`

## Resumo

Implementar o fluxo completo de recuperação de senha: o botão "Esqueceu a senha?" já existe em
`LoginPage.tsx:116` com um `alert` placeholder. Esta feature substitui esse placeholder por
navegação para uma nova página `/recuperar-senha`, onde o usuário informa seu e-mail e recebe
uma nova senha temporária por e-mail. O backend (`POST /api/auth/recuperar-senha`) já está
disponível e retorna sempre uma resposta genérica de sucesso (proteção contra enumeração).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (strict mode)  
**Dependências Principais**: React 18, React Router, Zod (validação de formulários)  
**Armazenamento**: N/A (nenhum estado persistido — operação stateless)  
**Testes**: Vitest + React Testing Library  
**Plataforma Alvo**: SPA web (browser)  
**Tipo de Projeto**: Web app (SPA — frontend consome API REST)  
**Metas de Performance**: Resposta da UI imediata (< 100ms para feedback visual); resposta de
rede dentro do SLA padrão do backend  
**Restrições**: TypeScript estrito (sem `any`/`as unknown`); Clean Architecture com Vertical
Slices; validação de formulário antes de atingir o domínio  
**Escala/Scope**: Feature isolada no slice `auth` existente; ~6 arquivos novos, ~4 arquivos
modificados

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Arquitetura (Vertical Slices) | ✅ PASS | Feature reside em `src/features/auth/` existente, dividida em `domain/`, `data/`, `presentation/` |
| I. Regra de Isolamento | ✅ PASS | `domain` não importa `data` ou `presentation`; `presentation` acessa apenas Use Cases |
| II. TypeScript Estrito | ✅ PASS | Sem `any`/`as unknown`; tipagem explícita em todos os contratos |
| II. SOLID | ✅ PASS | `RecuperarSenhaUseCase` (SRP); `IAuthRepository` estendida (OCP); injeção via Context (DIP) |
| III. Hooks Customizados | ✅ PASS | `useRecuperarSenha.ts` extrai toda lógica de estado e submit |
| IV. Validação na Borda | ✅ PASS | Validação de e-mail em `RecuperarSenhaPage` antes de chamar Use Case |
| IV. Mascaramento de Erros | ✅ PASS | Mensagem genérica de sucesso; erros de infraestrutura não expostos |
| V. Cobertura de Use Cases | ✅ PASS | `RecuperarSenhaUseCase.test.ts` com 100% de cobertura |

**Resultado**: Nenhuma violação. Sem necessidade de Rastreamento de Complexidade.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/019-recuperar-senha/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (Fase 0)
├── data-model.md        # Entidades e relacionamentos (Fase 1)
├── quickstart.md        # Guia de início rápido (Fase 1)
├── contracts/
│   └── api-recuperar-senha.md   # Contrato do endpoint (Fase 1)
└── tasks.md             # (gerado por /speckit-tasks)
```

### Código-Fonte

```text
# Arquivos NOVOS
src/features/auth/domain/entities/
└── recuperacaoSenha.ts                    # Entidade RecuperacaoSenhaRequest

src/features/auth/domain/usecases/
├── RecuperarSenhaUseCase.ts               # Use Case de recuperação
└── RecuperarSenhaUseCase.test.ts          # Testes unitários (100% cobertura)

src/features/auth/presentation/hooks/
└── useRecuperarSenha.ts                   # Hook: estado + submit

src/features/auth/presentation/pages/
└── RecuperarSenhaPage.tsx                 # Página /recuperar-senha

# Arquivos MODIFICADOS
src/features/auth/domain/repositories/
└── IAuthRepository.ts                     # + recuperarSenha(email: string): Promise<void>

src/features/auth/data/repositories/
└── AuthRepository.ts                      # + implementação de recuperarSenha()

src/features/auth/presentation/pages/
└── LoginPage.tsx                          # Substituir alert por navigate('/recuperar-senha')

src/app/
└── routes.tsx                             # + rota { path: '/recuperar-senha', Component: RecuperarSenhaPage }
```

**Decisão de Estrutura**: Opção SPA (frontend puro). Todo código reside sob `src/features/auth/`
seguindo a estrutura `domain/` → `data/` → `presentation/` já estabelecida.
