# Especificação de Funcionalidade: Recuperação de Senha

**Branch da Funcionalidade**: `019-recuperar-senha`  
**Criado em**: 2026-06-29  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "eu quero implementar a feature de resetar senha"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Solicitar nova senha por e-mail (Prioridade: P1)

Um usuário que esqueceu sua senha acessa a tela de login, clica em "Esqueci minha senha", informa seu e-mail e recebe uma nova senha temporária por e-mail para conseguir acessar o sistema.

**Por que esta prioridade**: É o fluxo principal de recuperação de acesso. Sem isso, o usuário fica impedido de acessar a plataforma indefinidamente.

**Teste Independente**: Pode ser testado acessando a tela de login, clicando em "Esqueci minha senha", informando um e-mail cadastrado e verificando que o e-mail com a nova senha temporária é recebido.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de login, **Quando** clica em "Esqueci minha senha", **Então** é exibida a tela de recuperação de senha com um campo para informar o e-mail.
2. **Dado** que o usuário está na tela de recuperação de senha e informa um e-mail cadastrado, **Quando** confirma o envio, **Então** o sistema exibe uma mensagem de sucesso genérica informando que, se o e-mail existir, a nova senha será enviada em instantes.
3. **Dado** que o usuário está na tela de recuperação de senha e informa um e-mail NÃO cadastrado, **Quando** confirma o envio, **Então** o sistema exibe a mesma mensagem de sucesso genérica (sem revelar se o e-mail existe ou não).
4. **Dado** que o e-mail foi enviado com a nova senha temporária, **Quando** o usuário tenta fazer login com a nova senha, **Então** consegue acessar o sistema normalmente.

---

### História de Usuário 2 - Navegar de volta ao login (Prioridade: P2)

O usuário que acessou a tela de recuperação de senha por engano, ou que já se lembrou da senha, consegue retornar facilmente à tela de login.

**Por que esta prioridade**: Melhora a usabilidade e evita que o usuário fique preso na tela de recuperação.

**Teste Independente**: Pode ser testado clicando em "Voltar ao login" na tela de recuperação e verificando que o usuário é redirecionado para a tela de login.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de recuperação de senha, **Quando** clica em "Voltar ao login", **Então** é redirecionado para a tela de login.

---

### Casos de Borda

- O que acontece quando o usuário informa um e-mail com formato inválido? O sistema deve exibir mensagem de validação antes de enviar.
- O que acontece quando o usuário tenta enviar o formulário sem preencher o e-mail? O campo deve ser obrigatório com mensagem de validação.
- O que acontece quando o usuário clica em enviar múltiplas vezes rapidamente? O botão deve ser desabilitado durante o processamento para evitar múltiplos envios.
- O que acontece quando há uma falha de conexão? O sistema deve exibir uma mensagem de erro genérica e permitir nova tentativa.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE disponibilizar na tela de login um link ou botão "Esqueci minha senha" visível e acessível.
- **RF-002**: O sistema DEVE exibir uma tela de recuperação de senha com um campo para o usuário informar seu endereço de e-mail.
- **RF-003**: O sistema DEVE validar que o campo de e-mail não está vazio antes de enviar a solicitação.
- **RF-004**: O sistema DEVE validar que o valor informado tem formato de e-mail válido antes de enviar a solicitação.
- **RF-005**: O sistema DEVE enviar a solicitação de recuperação de senha ao backend ao confirmar o envio.
- **RF-006**: O sistema DEVE exibir uma mensagem de sucesso genérica após o envio, sem revelar se o e-mail existe no sistema (proteção contra enumeração de usuários).
- **RF-007**: O sistema DEVE desabilitar o botão de envio durante o processamento da solicitação para evitar múltiplos envios acidentais.
- **RF-008**: O sistema DEVE exibir uma mensagem de erro amigável caso a solicitação falhe por problema de conexão ou indisponibilidade.
- **RF-009**: O sistema DEVE oferecer ao usuário uma forma de retornar à tela de login a partir da tela de recuperação de senha.
- **RF-010**: O usuário DEVE conseguir fazer login normalmente com a nova senha temporária recebida por e-mail.

### Entidades Principais

- **Usuário**: Pessoa com conta cadastrada no sistema que deseja recuperar o acesso à plataforma. Identificado pelo endereço de e-mail.
- **Solicitação de recuperação**: Ação do usuário de pedir uma nova senha temporária. Contém apenas o e-mail informado; o backend gerencia a geração e envio da nova senha.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários conseguem completar o fluxo de recuperação de senha (da tela de login até receber a confirmação na tela) em menos de 1 minuto.
- **CS-002**: 100% das solicitações de recuperação exibem a mensagem genérica de sucesso, independentemente de o e-mail existir ou não no sistema.
- **CS-003**: 0% de vazamento de informação sobre existência de e-mails — a resposta visual é idêntica para e-mails cadastrados e não cadastrados.
- **CS-004**: O formulário bloqueia envio com e-mail em formato inválido em 100% das tentativas, antes mesmo de contatar o servidor.
- **CS-005**: Redução de tickets de suporte por usuários sem acesso ao sistema, com usuários conseguindo recuperar o acesso de forma autônoma.

## Premissas

- O backend já disponibiliza o endpoint de recuperação de senha, que gera uma nova senha temporária aleatória e a envia por e-mail ao usuário.
- A resposta do backend é sempre genérica (mesma mensagem de sucesso independentemente de o e-mail existir), por razões de segurança.
- O usuário receberá a nova senha no e-mail e deverá usá-la para fazer login normalmente.
- Não há fluxo de "alterar senha" nesta feature — a senha temporária recebida por e-mail é a nova senha definitiva até que o usuário a altere por outros meios.
- O campo de e-mail requer validação de formato apenas no lado do cliente; a lógica de geração e envio de senha é responsabilidade exclusiva do backend.
- A feature é destinada a usuários que já possuem conta cadastrada e confirmada no sistema.
