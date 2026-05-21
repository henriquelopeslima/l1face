# Pesquisa: Cadastro de Usuário e Licitante

**Feature**: `003-register-licitante`  
**Data**: 2026-05-21  
**Status**: Completo — todas as dúvidas resolvidas

## D-01: Autenticação automática pós-cadastro

**Decisão**: Após `POST /api/users/register-with-bidder` retornar 201, chamar `getMe()` para hidratar o estado de autenticação.

**Rationale**: O endpoint define o cookie HttpOnly `BEARER` na resposta. `getMe()` é a fonte canônica do perfil autenticado, já usada no fluxo de login (`AuthContext.login()`). Reutilizar esse caminho evita divergência de normalização.

**Alternativas consideradas**:
- Hidratar direto da resposta 201 (user + licitante): rejeitado — criaria dois caminhos de normalização; `getMe()` é a fonte de verdade.
- Chamar `/api/login` após cadastro: rejeitado — desnecessário, o cookie já é definido pelo endpoint de registro.

---

## D-02: Localização do RegisterUseCase

**Decisão**: `src/features/auth/domain/usecases/RegisterUseCase.ts` — dentro da feature `auth` existente.

**Rationale**: Cadastro compartilha repositório, erros e contexto de autenticação. Criar feature separada seria sobre-engenharia sem ganho de coesão.

**Alternativas consideradas**:
- Feature separada `registration/`: rejeitado — multiplica infraestrutura sem benefício real; viola coesão do contexto de autenticação.

---

## D-03: Validação de CNPJ no cliente

**Decisão**: Validar presença e formato básico (remove formatação → verifica 14 dígitos numéricos) via regex. Validação semântica (dígitos verificadores) delegada ao servidor.

**Rationale**: A API aceita CNPJ com ou sem formatação. Validação de dígitos verificadores no cliente duplicaria lógica de negócio; a API é a fonte de verdade para validade semântica.

**Regex usada**: `/^\d{14}$/` após `replace(/[.\-\/]/g, '')`

**Alternativas consideradas**:
- Implementar algoritmo de verificação de CNPJ no cliente: rejeitado — duplicação de regra de negócio; fora do princípio de validação na borda (apresentação apenas verifica formato obvio).

---

## D-04: Tratamento de erro 409 (duplicidade)

**Decisão**: Usar o status HTTP 409 como discriminador; ler o campo `error` da resposta e expor como `AuthError` (mesmo tipo já usado no login).

**Rationale**: O servidor retorna mensagens em português adequadas para o usuário. O status 409 é o identificador confiável de conflito; a mensagem é o detalhe.

**Alternativas consideradas**:
- Introduzir `ConflictError` como tipo separado: avaliado mas rejeitado — a `RegisterPage` só precisa exibir a mensagem; distinção de tipo não agrega valor na camada de apresentação desta feature.
- Detectar duplicidade por keyword na mensagem: rejeitado — frágil e acoplado à implementação do servidor.

---

## D-05: Integração com AuthContext

**Decisão**: Adicionar método `register(credentials: RegisterCredentials): Promise<void>` ao `AuthContext` e ao seu `AuthContextValue`. O método executa o `RegisterUseCase` e, em sucesso, chama `getMeUseCase.execute()` para hidratar o estado — replicando o padrão de `login()`.

**Rationale**: O contexto já instancia `getMeUseCase`; reutilizá-lo é consistente e evita duplicação de lógica de hidratação.

---

## D-06: Navegação pós-cadastro

**Decisão**: Após cadastro e hidratação do estado, o hook `useRegister` navega para `/selecionar-vinculo` — o mesmo destino do login.

**Rationale**: A rota `/selecionar-vinculo` já lida com o caso de usuário com um único licitante (redirecionamento automático) e com múltiplos licitantes (seleção manual). Reutilizar essa lógica evita duplicação do guard de seleção.
