# Pesquisa: Recuperação de Senha

## Contexto

Feature simples sem incógnitas técnicas significativas. Todas as decisões foram resolvidas a partir
do código existente e da documentação da API.

---

## Decisão 1: Fluxo de recuperação (link-token vs. senha temporária)

- **Decisão**: Senha temporária enviada por e-mail (sem link de reset)
- **Rationale**: O endpoint `POST /api/auth/recuperar-senha` gera uma nova senha aleatória de 12
  caracteres e a envia por e-mail. Não há endpoint de "redefinir senha por token". O frontend
  deve se adaptar a esse modelo de backend.
- **Alternativas consideradas**: Fluxo de link com token (mais seguro, UX melhor) — rejeitado
  porque não existe suporte no backend atual. Pode ser evoluído futuramente.

---

## Decisão 2: Tela dedicada vs. modal inline

- **Decisão**: Tela dedicada (`/recuperar-senha`) seguindo o padrão das demais páginas de auth
  (`/login`, `/cadastro`, `/confirmar-email`).
- **Rationale**: Consistência com `RegisterPage`, `ConfirmarEmailPage` e o layout de duas colunas
  existente. Modais inline complicariam o routing e o estado de formulário.
- **Alternativas consideradas**: Modal no `LoginPage` — rejeitado por inconsistência com o
  design atual e complexidade de estado.

---

## Decisão 3: Localização no auth feature slice

- **Decisão**: Estender o `auth` feature slice existente em
  `src/features/auth/` (não criar um novo slice).
- **Rationale**: Recuperação de senha é parte do contexto de autenticação. O `IAuthRepository`
  e `AuthRepository` já agrupam todas as operações de auth. Criar um slice separado fragmentaria
  um domínio coeso.
- **Alternativas consideradas**: Feature slice separado `src/features/recuperar-senha/` —
  rejeitado por overhead desnecessário e violação de coesão de domínio.

---

## Decisão 4: Resposta genérica (sem feedback diferenciado por e-mail existente/inexistente)

- **Decisão**: Exibir a mesma mensagem de sucesso independentemente de o e-mail existir ou não.
- **Rationale**: O backend sempre retorna 200 com mensagem genérica para evitar enumeração de
  usuários. O frontend não deve tentar diferenciar — mensagem: "Se o e-mail existir, você
  receberá uma nova senha em instantes."
- **Alternativas consideradas**: Mensagem diferenciada por e-mail válido — rejeitado por violar
  o modelo de segurança do backend.

---

## Ponto de integração existente

`LoginPage.tsx:116-120` já possui o botão "Esqueceu a senha?" com `onClick={() => alert('...')}`.
Este onClick será substituído por `navigate('/recuperar-senha')` — mudança cirúrgica, sem
redesenho da página de login.
