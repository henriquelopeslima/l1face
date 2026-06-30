# Plano de Implementação: Atualização de Senha na Tela de Configurações

**Branch**: `020-password-update` | **Data**: 2026-06-30 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/020-password-update/spec.md`

**Nota**: Este template é preenchido pelo comando `/speckit-plan`. Consulte `.specify/templates/plan-template.md` para o fluxo de execução.

## Resumo

Implementar um formulário de alteração de senha integrado à página de Configurações (seção de Segurança), consumindo o endpoint `/api/auth/alterar-senha` do backend. A feature valida força de senha em tempo real, mantém isolamento de responsabilidades conforme a arquitetura Clean Architecture do projeto (domain/data/presentation), e reutiliza componentes UI existentes.

## Contexto Técnico

**Linguagem/Versão**: TypeScript/Vue 3 (React via SPA stack baseada em Vite)
**Dependências Principais**: React 18+, React Router, Iconoir (ícones), componentes UI genéricos (Card, Button, Input)
**Armazenamento**: N/A (camada cliente apenas; backend persiste via PostgreSQL/Symfony)
**Testes**: Vitest + React Testing Library (unit/integration); testes de aceitação em desenvolvimento
**Plataforma Alvo**: Browser Web (desktop + mobile responsivo)
**Tipo de Projeto**: SPA Web (Vue 3 + TypeScript consumindo API REST em Symfony/PHP)
**Metas de Performance**: Feedback visual < 200ms em validação; submissão HTTP < 2s fluxo completo
**Restrições**: Validação cliente espelha regras backend; JWT em cookie HttpOnly; sem localStorage para tokens; suportar CORS
**Escala/Scope**: Feature isolada em `src/features/configuracoes/`; reutiliza SegurancaSection existente; integra com autenticação existente

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

**Princípio I — Arquitetura e Estrutura de Pastas**: ✅ PASS  
A feature será implementada em `src/features/configuracoes/` seguindo Clean Architecture com separação estrita domain/data/presentation. Domain conterá Use Cases puros (ValidarSenha, AlterarSenha). Data conterá implementação da API. Presentation conterá componente React + hook customizado.

**Princípio II — SOLID e TypeScript**: ✅ PASS  
Tipagem explícita em TypeScript sem `any`. Use Cases isolados (Single Responsibility). Dependência de abstrações via interfaces de contratos (ex: `ChangePasswordRepository`). Componentes React serão apresentacionais puros.

**Princípio III — Boas Práticas React**: ✅ PASS  
Lógica complexa extraída para `useChangePassword` hook customizado. Validação em tempo real isolada em função pura (sem efeitos colaterais). Imutabilidade respeitada com `useState`. Performance monitorada para evitar re-renderizações desnecessárias.

**Princípio IV — Segurança (Security by Design)**: ✅ PASS  
Sem `dangerouslySetInnerHTML`. Tokens em cookie HttpOnly (gerenciado pelo backend). Mensagens de erro não revelam informações do sistema (ex: "Senha atual incorreta" genérica). Validação na apresentação + validação backend redundante.

**Princípio V — Testes**: ✅ PASS  
Use Cases de domínio com 100% cobertura unitária. Componentes testáveis com React Testing Library. Validadores de força de senha como funções puras testáveis.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/020-password-update/
├── spec.md              # Especificação da funcionalidade
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0 (decisões de design)
├── data-model.md        # Saída da Fase 1 (entidades e contratos)
├── quickstart.md        # Saída da Fase 1 (guia rápido)
├── contracts/           # Saída da Fase 1 (interfaces de API client)
├── checklists/
│   └── requirements.md  # Validação de qualidade da spec
└── tasks.md             # Saída da Fase 2 (tarefas de implementação)
```

### Código-Fonte (raiz do repositório)

```text
# Aplicação Web SPA (React/Vue + TypeScript)
l1face/src/
└── features/
    └── configuracoes/                    # Feature vertical slice existente
        ├── domain/
        │   ├── entities/
        │   │   └── AlterarSenhaRequest.ts         # Entity: requisição de alteração
        │   ├── usecases/
        │   │   ├── AlterarSenhaUseCase.ts          # Use Case: alterar senha
        │   │   └── ValidarForcaSenhaUseCase.ts     # Use Case: validar força
        │   └── repositories/
        │       └── IPasswordChangeRepository.ts    # Interface de contrato
        ├── data/
        │   ├── repositories/
        │   │   └── PasswordChangeRepository.ts     # Implementação: API HTTP
        │   ├── datasources/
        │   │   └── PasswordChangeAPI.ts            # Chamadas HTTP concretas
        │   └── mappers/
        │       └── PasswordChangeMapper.ts         # DTO ↔ Entity mapping
        ├── presentation/
        │   ├── hooks/
        │   │   └── useChangePassword.ts            # Custom hook: lógica de formulário
        │   ├── components/
        │   │   ├── AlterarSenhaForm.tsx            # Formulário UI (apresentacional)
        │   │   └── SenhaStrengthIndicator.tsx      # Indicador de força (apresentacional)
        │   └── pages/
        │       └── ConfiguracoesPage.tsx           # Página existente (modificada)
        └── __tests__/
            ├── domain/
            │   ├── usecases.test.ts
            │   └── entities.test.ts
            └── presentation/
                └── hooks.test.ts

# Backend (Symfony/PHP) — referência apenas (não modificado nesta feature)
l1core/
└── src/
    └── Controller/
        └── AuthController.php          # Endpoint /api/auth/alterar-senha (já existe)
```

**Decisão de Estrutura**: Feature isolada seguindo Clean Architecture (domain/data/presentation) dentro do vertical slice `configuracoes` existente. Reutiliza estrutura de pastas estabelecida no projeto. Backend (l1core) permanece inalterado — feature consome endpoint existente.

## Rastreamento de Complexidade

Nenhuma violação de constituição identificada. Implementação está totalmente em conformidade com todos os 5 princípios.
