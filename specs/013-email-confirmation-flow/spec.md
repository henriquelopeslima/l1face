# Especificação de Funcionalidade: Fluxo de Confirmação de E-mail

**Branch da Funcionalidade**: `013-email-confirmation-flow`
**Criado em**: 2026-06-20
**Status**: Rascunho

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Cadastro com Instrução de Verificação (Prioridade: P1)

Após realizar o cadastro com sucesso, o usuário é informado de que precisa verificar seu e-mail antes de acessar o sistema. Uma tela clara instrui o usuário a acessar sua caixa de entrada (e verificar o spam) para encontrar o link de confirmação. O usuário não é redirecionado para o dashboard.

**Por que esta prioridade**: É o ponto de entrada do fluxo inteiro. Sem esta tela, o usuário não sabe o que fazer após o cadastro e pode tentar fazer login sem confirmar o e-mail.

**Teste Independente**: Pode ser testado preenchendo e enviando o formulário de cadastro e verificando que a tela de "verifique seu e-mail" é exibida com a mensagem correta, sem acesso ao dashboard.

**Cenários de Aceite**:

1. **Dado** que um usuário preencheu o formulário de cadastro com dados válidos, **Quando** o cadastro é concluído com sucesso, **Então** o sistema exibe uma tela informando que um e-mail foi enviado e que o usuário deve verificar sua caixa de entrada para confirmar a conta.
2. **Dado** que o cadastro foi realizado com sucesso, **Quando** a tela de verificação é exibida, **Então** a mensagem retornada pelo servidor é apresentada ao usuário e há uma sugestão de verificar também a pasta de spam.
3. **Dado** que o cadastro foi realizado com sucesso, **Quando** a tela de verificação é exibida, **Então** o usuário não é redirecionado automaticamente para o dashboard.
4. **Dado** que o e-mail ou CNPJ já está cadastrado, **Quando** o usuário tenta realizar o cadastro, **Então** o sistema exibe a mensagem de conflito sem criar uma nova conta.

---

### História de Usuário 2 - Confirmação de E-mail via Link (Prioridade: P1)

O usuário clica no link recebido por e-mail, que abre uma página do frontend contendo o token de confirmação na URL. A página processa automaticamente o token, confirma a conta e redireciona o usuário autenticado para o dashboard — sem ação manual adicional.

**Por que esta prioridade**: É o passo central do fluxo de verificação. Sem ele, nenhum usuário consegue acessar o sistema após o cadastro.

**Teste Independente**: Pode ser testado acessando diretamente a URL `/confirmar-email?token=<token-válido>` e verificando que o usuário é autenticado e redirecionado para o dashboard.

**Cenários de Aceite**:

1. **Dado** que um usuário acessa a URL de confirmação com um token válido, **Quando** a página carrega, **Então** a conta é confirmada automaticamente e o usuário é redirecionado para o dashboard já autenticado.
2. **Dado** que um usuário acessa a URL de confirmação com um token expirado (mais de 24h), **Quando** a página processa o token, **Então** o sistema exibe uma mensagem informando que o link expirou e apresenta um botão para solicitar novo e-mail de confirmação.
3. **Dado** que um usuário acessa a URL de confirmação com um token que já foi utilizado (conta já confirmada), **Quando** a página processa o token, **Então** o sistema exibe uma mensagem informando que a conta já está confirmada e direciona o usuário para a tela de login.
4. **Dado** que um usuário acessa a URL de confirmação com um token inválido ou malformado, **Quando** a página processa o token, **Então** o sistema exibe uma mensagem de erro genérica e oferece um link para a tela de login.
5. **Dado** que a URL de confirmação é acessada sem nenhum token, **Quando** a página carrega, **Então** o sistema exibe uma mensagem de erro e oferece um link para a tela de login.

---

### História de Usuário 3 - Login com Conta Não Confirmada (Prioridade: P2)

Um usuário que se cadastrou mas ainda não confirmou o e-mail tenta fazer login. O sistema informa que o e-mail ainda não foi verificado e apresenta, na própria tela de login, um botão para reenviar o e-mail de confirmação sem precisar navegar para outra página.

**Por que esta prioridade**: Sem esta experiência, o usuário recebe um erro genérico de acesso negado sem saber o motivo ou como resolver, levando ao abandono do sistema.

**Teste Independente**: Pode ser testado tentando fazer login com credenciais de uma conta cadastrada mas não confirmada e verificando que a mensagem específica e o botão de reenvio aparecem na tela de login.

**Cenários de Aceite**:

1. **Dado** que um usuário tenta fazer login com credenciais válidas de uma conta não confirmada, **Quando** o servidor retorna o erro de conta não confirmada, **Então** o sistema exibe a mensagem "Seu e-mail ainda não foi confirmado." e um botão "Reenviar e-mail de confirmação" na tela de login.
2. **Dado** que o botão de reenvio está visível, **Quando** o usuário clica nele, **Então** o sistema envia a requisição de reenvio utilizando o e-mail preenchido no formulário de login.
3. **Dado** que credenciais inválidas são fornecidas (e-mail ou senha incorretos), **Quando** o servidor retorna erro de credenciais, **Então** o sistema exibe mensagem de credenciais inválidas — sem mostrar o botão de reenvio de confirmação.

---

### História de Usuário 4 - Reenvio do E-mail de Confirmação (Prioridade: P2)

Após clicar no botão de reenvio exibido na tela de login, o usuário recebe feedback de que o e-mail foi enviado (quando o e-mail existir no sistema). Se o limite de reenvios for atingido, o botão é desabilitado e uma mensagem explicativa é exibida.

**Por que esta prioridade**: Garante que usuários que não receberam ou perderam o e-mail de confirmação possam concluir o fluxo sem precisar contatar suporte.

**Teste Independente**: Pode ser testado clicando no botão de reenvio na tela de login e verificando o feedback exibido ao usuário nos cenários de sucesso e de rate limit.

**Cenários de Aceite**:

1. **Dado** que o usuário clica em "Reenviar e-mail de confirmação", **Quando** o servidor processa a requisição com sucesso, **Então** o sistema exibe a mensagem de confirmação de envio retornada pelo servidor.
2. **Dado** que o usuário clica em "Reenviar e-mail de confirmação" com um e-mail que não existe no sistema, **Quando** o servidor responde, **Então** o sistema exibe a mesma mensagem de confirmação de envio (sem revelar se o e-mail existe ou não).
3. **Dado** que o usuário atingiu o limite de reenvios, **Quando** o servidor retorna erro de rate limit, **Então** o sistema exibe a mensagem de limite atingido e desabilita o botão de reenvio para evitar novas tentativas imediatas.

---

### Casos de Borda

- O que acontece quando o usuário acessa `/confirmar-email` sem o parâmetro `token` na URL?
- O que acontece se o usuário já estiver autenticado e acessar a URL de confirmação?
- O que acontece se o botão de reenvio for clicado múltiplas vezes rapidamente antes do rate limit ser atingido?
- Como o sistema se comporta se o e-mail no formulário de login estiver vazio quando o botão de reenvio é clicado?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: Após cadastro bem-sucedido, o sistema DEVE exibir uma tela de instrução de verificação de e-mail com a mensagem retornada pelo servidor e sugestão de verificar a pasta de spam.
- **RF-002**: O sistema NÃO DEVE redirecionar o usuário para o dashboard imediatamente após o cadastro — o acesso ao dashboard só é permitido após confirmação do e-mail.
- **RF-003**: A página `/confirmar-email` DEVE extrair o token do parâmetro de query string da URL e processá-lo automaticamente ao carregar.
- **RF-004**: Quando a confirmação for bem-sucedida, o sistema DEVE redirecionar o usuário para o dashboard como usuário autenticado.
- **RF-005**: Quando o token estiver expirado (erro 410), o sistema DEVE exibir mensagem de expiração e oferecer ação para solicitar novo e-mail de confirmação.
- **RF-006**: Quando o token já tiver sido utilizado (erro 409 — conta já confirmada), o sistema DEVE informar que a conta já está ativa e direcionar para a tela de login.
- **RF-007**: Quando o token for inválido ou ausente (erro 400), o sistema DEVE exibir mensagem de erro e oferecer link para a tela de login.
- **RF-008**: Na tela de login, quando o servidor retornar o erro de conta não confirmada, o sistema DEVE exibir mensagem específica e botão de reenvio inline — sem navegar para outra página.
- **RF-009**: O sistema DEVE diferenciar o erro de conta não confirmada do erro de credenciais inválidas com base no conteúdo da resposta do servidor.
- **RF-010**: O botão de reenvio DEVE utilizar o e-mail digitado pelo usuário no formulário de login ao fazer a requisição de reenvio.
- **RF-011**: Quando o limite de reenvios for atingido (erro 429), o sistema DEVE exibir a mensagem do servidor e desabilitar o botão de reenvio para evitar tentativas adicionais imediatas.
- **RF-012**: O sistema DEVE exibir o mesmo feedback positivo de reenvio independentemente de o e-mail existir no sistema ou não (segurança por obscuridade — comportamento definido pelo servidor).

### Entidades Principais

- **Usuário não confirmado**: Conta criada mas pendente de verificação de e-mail; pode fazer login apenas após confirmar.
- **Token de confirmação**: Identificador único, de uso único e com validade de 24 horas, enviado por e-mail ao usuário para confirmar a conta.
- **Sessão autenticada**: Estado resultante de login bem-sucedido ou confirmação de e-mail bem-sucedida; mantida via cookie HttpOnly gerenciado pelo servidor.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários que completam o cadastro conseguem entender o próximo passo (verificar e-mail) sem auxílio de suporte — zero dúvidas sobre o que fazer após o cadastro.
- **CS-002**: Usuários que clicam no link de confirmação são autenticados e redirecionados para o dashboard em menos de 3 segundos.
- **CS-003**: Usuários com conta não confirmada que tentam fazer login conseguem reenviar o e-mail de confirmação sem sair da tela de login.
- **CS-004**: 100% dos cenários de erro de token (expirado, usado, inválido) exibem uma mensagem compreensível e uma ação clara para o usuário continuar.
- **CS-005**: Usuários não conseguem acessar áreas protegidas do sistema antes de confirmar o e-mail.

## Premissas

- O backend já implementou todos os endpoints descritos e o comportamento de envio de e-mail está funcional.
- O link enviado por e-mail aponta para o frontend na rota `/confirmar-email?token=<token>`.
- A autenticação é mantida via cookie `BEARER` (HttpOnly, SameSite=Lax) gerenciado exclusivamente pelo servidor; o frontend não armazena nem manipula o JWT diretamente.
- Todas as requisições à API já utilizam `credentials: 'include'` (ou equivalente) para enviar o cookie automaticamente.
- A resposta de confirmação de e-mail bem-sucedida retorna o campo `nome_completo` (e não `nome`, como no cadastro) — o frontend deve tratar ambos os campos conforme o endpoint chamado.
- O reenvio de e-mail não possui página dedicada; o acesso é exclusivamente via botão inline na tela de login.
- O comportamento de desabilitação do botão após rate limit (429) persiste até o usuário recarregar a página ou por 60 minutos — o controle de tempo é de responsabilidade do frontend após receber o erro.
- Não há fluxo de confirmação de e-mail para usuários que já estavam cadastrados antes desta mudança (usuários legados são considerados já confirmados pelo backend).
