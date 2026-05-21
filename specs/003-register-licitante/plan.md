# Plano de Implementação: Cadastro de Usuário e Licitante

**Branch**: `003-register-licitante` | **Data**: 2026-05-21 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/003-register-licitante/spec.md`

## Resumo

Adicionar fluxo de cadastro de novo usuário + licitante à feature `auth` existente, aproveitando o endpoint `POST /api/users/register-with-bidder`. Após o cadastro bem-sucedido, o cookie HttpOnly `BEARER` é definido pelo servidor; a aplicação chama `getMe()` para hidratar o estado de autenticação — o mesmo padrão já usado no login. Uma nova `RegisterPage` espelha o layout visual da `LoginPage` e o roteamento é estendido com `/cadastro`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0 / React ^19  
**Dependências Principais**: React Router DOM, Zod ^4, Vitest ^4, Tailwind CSS / shadcn-ui  
**Armazenamento**: N/A (sem persistência no frontend; autenticação via cookie HttpOnly gerido pelo servidor)  
**Testes**: Vitest (unitários puros para Use Cases, sem DOM)  
**Plataforma Alvo**: SPA web (desktop + mobile responsivo)  
**Tipo de Projeto**: web-app (frontend SPA)  
**Metas de Performance**: Resposta visual ao submit em < 300ms; formulário utilizável em conexões lentas com estado de carregamento claro  
**Restrições**: Nenhum token pode ser salvo em localStorage/sessionStorage (regra constitucional inviolável)  
**Escala/Scope**: Feature auto-contida dentro de `src/features/auth`; afeta apenas `routes.tsx` fora da feature

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture / Vertical Slices | ✅ PASS | Nova lógica fica inteiramente dentro de `src/features/auth/`; impacto externo limitado a `routes.tsx` |
| I. Isolamento domain → data/presentation | ✅ PASS | `RegisterUseCase` depende apenas de `IAuthRepository` (interface do domain) |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Todos os tipos serão explícitos; mapper com interfaces tipadas |
| III. Hooks customizados para lógica de estado | ✅ PASS | `useRegister` encapsula toda a lógica de chamada ao UseCase |
| IV. Tokens não em localStorage/sessionStorage | ✅ PASS | Autenticação via cookie HttpOnly; nenhum token armazenado no cliente |
| IV. Validação na borda (presentation) | ✅ PASS | Validação de formulário na `RegisterPage` antes de atingir o domain |
| V. 100% cobertura de Use Cases | ✅ PASS | `RegisterUseCase.test.ts` obrigatório |

**Resultado**: Nenhuma violação. Sem necessidade de Rastreamento de Complexidade.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/003-register-licitante/
├── plan.md              ← este arquivo
├── research.md          ← Fase 0
├── data-model.md        ← Fase 1
├── contracts/           ← Fase 1
└── tasks.md             ← gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/auth/
├── domain/
│   ├── entities/
│   │   ├── authSession.ts          (existente — sem alteração)
│   │   ├── licitante.ts            (existente — sem alteração)
│   │   ├── user.ts                 (existente — sem alteração)
│   │   └── registerCredentials.ts  [NOVO] — tipo RegisterCredentials
│   ├── errors/
│   │   └── authErrors.ts           (existente — sem alteração; AuthError reaproveitado)
│   ├── repositories/
│   │   └── IAuthRepository.ts      [ESTENDIDO] — adicionar método register()
│   └── usecases/
│       ├── LoginUseCase.ts         (existente — sem alteração)
│       ├── LoginUseCase.test.ts    (existente — sem alteração)
│       ├── GetMeUseCase.ts         (existente — sem alteração)
│       ├── LogoutUseCase.ts        (existente — sem alteração)
│       ├── RegisterUseCase.ts      [NOVO]
│       └── RegisterUseCase.test.ts [NOVO — 100% cobertura obrigatória]
├── data/
│   ├── mappers/
│   │   └── authMappers.ts          [ESTENDIDO] — adicionar mapApiRegisterResponse
│   └── repositories/
│       └── AuthRepository.ts       [ESTENDIDO] — implementar register()
└── presentation/
    ├── context/
    │   └── AuthContext.tsx          [ESTENDIDO] — adicionar register() ao contexto
    ├── hooks/
    │   ├── useLogin.ts             (existente — sem alteração)
    │   └── useRegister.ts          [NOVO]
    └── pages/
        ├── LoginPage.tsx           [ATUALIZADO] — link "Criar conta" navega para /cadastro
        └── RegisterPage.tsx        [NOVO]

src/app/
└── routes.tsx                      [ATUALIZADO] — adicionar rota /cadastro
```

**Decisão de Estrutura**: Extensão da feature `auth` existente. O cadastro é tratado como parte do mesmo contexto de autenticação, reaproveitando repositório, contexto e erros já definidos. Nenhuma nova feature slice é necessária.

---

## Fase 0: Pesquisa

*Ver [research.md](./research.md) para detalhes completos.*

### Decisões-chave

**D-01: Autenticação automática pós-cadastro**
- **Decisão**: Após `POST /api/users/register-with-bidder` retornar 201, chamar `getMe()` para hidratar o estado — mesmo padrão do fluxo de login.
- **Rationale**: O endpoint define o cookie `BEARER` automaticamente. Não é necessário chamar `/api/login` separadamente. Reaproveita `getMeUseCase.execute()` já existente em `AuthContext`.
- **Alternativa rejeitada**: Usar os dados retornados pelo 201 (user + licitante) para hidratar o estado diretamente — rejeitado pois criaria dois caminhos de normalização de dados divergentes; `getMe()` é a fonte canônica de verdade do perfil autenticado.

**D-02: Localização do RegisterUseCase**
- **Decisão**: `src/features/auth/domain/usecases/RegisterUseCase.ts` dentro da feature `auth` existente.
- **Rationale**: Cadastro é parte do contexto de autenticação — compartilha repositório, erros e contexto. Criar uma feature separada seria sobre-engenharia.
- **Alternativa rejeitada**: Feature separada `registration/` — viola o princípio de coesão; multiplica arquivos de infraestrutura sem ganho real.

**D-03: Validação de CNPJ no frontend**
- **Decisão**: Validar apenas a presença e formato básico (14 dígitos numéricos, com ou sem pontuação) via regex no cliente. Validação semântica (dígitos verificadores) fica a cargo do servidor.
- **Rationale**: A API aceita CNPJ com ou sem formatação e já valida semanticamente. A validação no cliente serve apenas para feedback imediato de formato obviamente errado.
- **Alternativa rejeitada**: Implementar validação completa de dígitos verificadores no cliente — duplicaria lógica de negócio; a API é fonte de verdade.

**D-04: Tratamento de erro 409 (duplicidade)**
- **Decisão**: Mapear o campo `error` da resposta 409 diretamente como mensagem de erro no estado (mesma abordagem de `AuthError` no login).
- **Rationale**: O servidor retorna mensagens em português já adequadas para o usuário ("Email já cadastrado.", "CNPJ já cadastrado."). Não há necessidade de internacionalização própria.
- **Alternativa rejeitada**: Detectar duplicidade por keyword na mensagem do servidor — frágil; usar o status HTTP 409 como discriminador principal.

---

## Fase 1: Design e Contratos

*Ver [data-model.md](./data-model.md) e [contracts/](./contracts/) para detalhes completos.*

### Sumário de Artefatos

- **Entidade nova**: `RegisterCredentials` — payload de cadastro validado
- **Contrato novo**: `IAuthRepository.register()` — interface do repositório estendida
- **Resposta da API mapeada**: `ApiRegisterResponse` → descartar após `getMe()` (não hidratamos diretamente)
- **Erro novo de domínio**: `ConflictError` — diferencia duplicidade de erros genéricos de servidor
