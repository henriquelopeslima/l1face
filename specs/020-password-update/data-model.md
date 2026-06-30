# Fase 1: Modelo de Dados e Contratos

**Data**: 2026-06-30 | **Feature**: Atualização de Senha na Tela de Configurações

## Entidades de Domínio

### 1. ChangePasswordRequest

**Propósito**: Representar uma requisição de alteração de senha com validações de regra de negócio.

**Campos**:
```typescript
interface ChangePasswordRequest {
  currentPassword: string;      // Senha atual (mín: 1 char, não validado aqui — backend valida)
  newPassword: string;          // Nova senha (8-20 chars, letras + números obrigatórios)
}
```

**Validações de Domínio** (Pure Business Rules):
- `newPassword` comprimento: ≥ 8 e ≤ 20 caracteres
- `newPassword` conteúdo: MUST contain at least one letter (a-z, A-Z)
- `newPassword` conteúdo: MUST contain at least one digit (0-9)
- `currentPassword` não pode ser vazio (string vazia é inválida)

**Regras Adicionais** (Não implementadas em cliente, apenas backend):
- `currentPassword` MUST match user's current password (verificação backend apenas)
- `newPassword` não pode ser igual a `currentPassword` (verificação backend opcional)

**Responsabilidade**:
- Domínio puro: sem dependências de React, HTTP ou frameworks
- Usado por Use Cases para validação antes de submissão
- Testável independentemente via Jest

---

### 2. ChangePasswordResponse

**Propósito**: Representar a resposta do servidor após tentativa de alteração.

**Campos**:
```typescript
interface ChangePasswordResponse {
  success: boolean;             // true = operação bem-sucedida
  error: string | null;         // Mensagem de erro específica (null se success=true)
}
```

**Valores Esperados de `error`** (conforme API OpenAPI):
- `null` quando `success = true`
- `"Senha atual incorreta"` — senha fornecida não corresponde à atual
- `"Senha deve ter no mínimo 8 caracteres"` — nova senha < 8 chars
- `"Senha deve ter no máximo 20 caracteres"` — nova senha > 20 chars
- `"Senha deve conter letras"` — nova senha sem letras
- `"Senha deve conter números"` — nova senha sem dígitos

**Responsabilidade**:
- DTO (Data Transfer Object) — representa exatamente o contrato da API
- Não contém lógica de negócio
- Mapeado da resposta HTTP para entidade de domínio no repositório

---

## Relacionamentos e Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                              │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ AlterarSenhaForm (Componente Puro)                       │    │
│ │ - Renderiza inputs, botão submit, mensagens de erro      │    │
│ │ - Chama hook: useChangePassword                          │    │
│ └──────────────────────────────────────────────────────────┘    │
│          │                                                       │
│          ▼                                                       │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ useChangePassword (Hook Customizado)                     │    │
│ │ - Gerencia estado: formData, loading, errors             │    │
│ │ - Valida em tempo real (chama ValidarForcaSenhaUseCase)  │    │
│ │ - Submete (chama AlterarSenhaUseCase)                    │    │
│ │ - Mapeia resultados para UI (messages, feedback)         │    │
│ └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                          │
                          │ chama
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│ DOMAIN LAYER (Regras de Negócio Puras)                           │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ AlterarSenhaUseCase                                      │    │
│ │ execute(req: ChangePasswordRequest)                      │    │
│ │ - Valida req (força de senha)                            │    │
│ │ - Chama repository.changePassword(req)                   │    │
│ │ - Retorna resultado (success/error)                      │    │
│ └──────────────────────────────────────────────────────────┘    │
│          │                                                       │
│          │ usa interface                                         │
│          ▼                                                       │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ IChangePasswordRepository (Interface)                    │    │
│ │ changePassword(req): Promise<ChangePasswordResponse>     │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ ValidarForcaSenhaUseCase                                 │    │
│ │ validate(password: string): ValidationResult             │    │
│ │ - Verifica comprimento (8-20)                            │    │
│ │ - Verifica letras                                        │    │
│ │ - Verifica números                                       │    │
│ │ - Retorna erros/warnings de forma estruturada            │    │
│ └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                          │
                          │ implementa
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│ DATA LAYER (Infraestrutura)                                       │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ ChangePasswordRepository                                 │    │
│ │ implements IChangePasswordRepository                     │    │
│ │ - Injeta ChangePasswordAPI (DataSource)                  │    │
│ │ - Chama API.changePassword(req)                          │    │
│ │ - Mapeia resposta DTO → entity                           │    │
│ │ - Trata erros HTTP (401, 400, 5xx, timeout)             │    │
│ └──────────────────────────────────────────────────────────┘    │
│          │                                                       │
│          │ usa                                                   │
│          ▼                                                       │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ ChangePasswordAPI (DataSource / HTTP Client)             │    │
│ │ POST /api/auth/alterar-senha                             │    │
│ │ - Faz requisição HTTP real ao backend                    │    │
│ │ - Headers: Content-Type: application/json                │    │
│ │ - Cookie HttpOnly automático (browser)                   │    │
│ └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST
                          ▼
                    Backend (Symfony)
                    /api/auth/alterar-senha
```

---

## Validações por Camada

| Validação | Camada | Quando | O Quê |
|-----------|--------|--------|-------|
| Comprimento 8-20 | Presentation | Enquanto digita (onChange) | Feedback visual imediato |
| Contém letras | Presentation | Enquanto digita (onChange) | Feedback visual imediato |
| Contém números | Presentation | Enquanto digita (onChange) | Feedback visual imediato |
| Senha atual != vazio | Presentation | Antes de submeter | Validação básica |
| **Todas as acima** | Domain (Use Case) | Antes de chamar API | Validação redundante (segura) |
| Senha atual correta | Backend | Após receber POST | Verificação criptográfica |
| Senha != atual | Backend | Após receber POST | Regra de negócio (opcional) |

**Racional**: Validação duplicada é segurança por design. Cliente nunca é confiável.

---

## Estado Previsível e Transições

```
Estados possíveis da Operação:
┌─────────────┐
│  INITIAL    │ (form vazio, nenhuma tentativa)
└──────┬──────┘
       │ usuário clica "Salvar"
       ▼
┌─────────────┐
│  SUBMITTING │ (requisição em progresso, botão desabilitado)
└──────┬──────┘
       │
       ├─ resposta bem-sucedida ─┐
       │                          ▼
       │                    ┌──────────────┐
       │                    │  SUCCESS     │ (mostra toast, limpa form)
       │                    └──────────────┘
       │
       └─ erro ─┐
               ▼
        ┌──────────────┐
        │    ERROR     │ (mostra mensagem específica, form preservado)
        └──────────────┘
              │
              │ usuário corrige e tenta novamente
              └──> volta para SUBMITTING
```

---

## Tipos TypeScript Completos

```typescript
// Domain
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  error: string | null;
}

export type PasswordValidationError = 
  | 'MIN_LENGTH'       // < 8 chars
  | 'MAX_LENGTH'       // > 20 chars
  | 'NO_LETTERS'       // sem a-z ou A-Z
  | 'NO_NUMBERS'       // sem 0-9
  | null;              // válida

export interface ValidationResult {
  isValid: boolean;
  errors: PasswordValidationError[];
  message: string;  // mensagem amigável (ex: "Mínimo 8 caracteres")
}

export interface IChangePasswordRepository {
  changePassword(
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse>;
}

// Presentation/Hook
export interface UseChangePasswordState {
  formData: {
    currentPassword: string;
    newPassword: string;
  };
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: PasswordValidationError[];
}

export interface UseChangePasswordActions {
  updateCurrentPassword(pwd: string): void;
  updateNewPassword(pwd: string): void;
  submit(): Promise<void>;
  reset(): void;
}
```

---

## Suposições Documentadas

1. HTTP client do projeto (axios ou equivalente) está em `src/shared/services/http.ts` e já incluí baseURL + interceptadores de erro
2. Cookies HttpOnly são gerenciados pelo backend (Set-Cookie no login)
3. Componentes UI genéricos existem: `<Input />`, `<Button />`, `<Card />` com theming apropriado
4. React Router está configurado para redirecionar `/login` em 401
5. Projeto utiliza React 18+ com Hooks estáveis

---

## Próxima Etapa

Phase 1 continua com:
- `contracts/` — Definição formal de API contracts (OpenAPI-like para referência)
- `quickstart.md` — Guia rápido de implementação
- Atualização de `CLAUDE.md` com plan context
