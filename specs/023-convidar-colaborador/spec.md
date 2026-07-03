# Especificação de Funcionalidade: Convidar Colaborador

**Branch da Funcionalidade**: `023-convidar-colaborador`
**Criado em**: 2026-07-02
**Status**: Rascunho
**Entrada**: Descrição do usuário: "eu quero implementar o convite ao colaborador, na tela de configurações, para isso use a api e o endpoint de convites disponibilizado"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Convidar um novo colaborador por e-mail (Prioridade: P1)

Como Administrador de uma empresa licitante, quero convidar uma pessoa para colaborar na plataforma informando o e-mail e o nome dela, para que ela possa acessar o sistema em nome da minha empresa sem que eu precise criar ou compartilhar uma senha manualmente.

**Por que esta prioridade**: É a jornada central da funcionalidade — sem ela não existe forma de trazer novos colaboradores para o licitante, já que a criação direta de contas com senha não é mais oferecida.

**Teste Independente**: Pode ser totalmente testado informando um e-mail válido na tela de Configurações e confirmando que o Administrador recebe uma mensagem de sucesso indicando que o convite foi enviado.

**Cenários de Aceite**:

1. **Dado** que sou Administrador do licitante ativo, **Quando** informo um e-mail válido ainda não vinculado à empresa, o nome da pessoa convidada, e confirmo o convite, **Então** o sistema mostra uma confirmação de que o convite foi enviado para aquele e-mail.
2. **Dado** que o e-mail convidado já pertence a um usuário cadastrado na plataforma, **Quando** o convite é enviado, **Então** o sistema confirma o envio normalmente (o convidado poderá aceitar ou recusar o vínculo).
3. **Dado** que o e-mail convidado ainda não possui conta na plataforma, **Quando** o convite é aceito pelo convidado, **Então** uma conta é criada automaticamente para ele e ele passa a ter acesso como Colaborador do licitante.

---

### História de Usuário 2 - Impedir convite duplicado para quem já tem acesso (Prioridade: P2)

Como Administrador, quero ser avisado quando tento convidar alguém que já faz parte da minha empresa na plataforma, para não gerar confusão com convites desnecessários.

**Por que esta prioridade**: Evita erros silenciosos e mensagens técnicas confusas; protege a integridade da lista de acessos já existente (função de listar/revogar já implementada).

**Teste Independente**: Pode ser testado convidando o e-mail de um usuário que já aparece na lista de acessos do licitante e verificando que o sistema informa, de forma clara, que aquele e-mail já possui acesso.

**Cenários de Aceite**:

1. **Dado** que um e-mail já possui vínculo ativo (Administrador ou Colaborador) com o licitante, **Quando** tento enviar um convite para esse mesmo e-mail, **Então** o sistema recusa a ação e exibe uma mensagem explicando que esse e-mail já tem acesso à empresa.
2. **Dado** que informo um e-mail em formato inválido, **Quando** tento confirmar o convite, **Então** o sistema exibe uma mensagem de erro e não envia nada.

---

### História de Usuário 3 - Reenviar um convite ainda pendente (Prioridade: P3)

Como Administrador, quero conseguir reenviar um convite para alguém que ainda não respondeu (por exemplo, porque a pessoa não encontrou o e-mail ou o link expirou), sem precisar de nenhuma ação especial além de convidar novamente o mesmo e-mail.

**Por que esta prioridade**: Melhora a experiência para casos comuns (e-mail perdido, expiração), mas não bloqueia o valor entregue pela P1 — o convite original já resolve o caso principal.

**Teste Independente**: Pode ser testado enviando um convite para um e-mail que já possui um convite pendente para o mesmo licitante e confirmando que o sistema trata a ação como reenvio (nova confirmação de sucesso, sem erro de duplicidade).

**Cenários de Aceite**:

1. **Dado** que existe um convite pendente (ainda não aceito nem recusado) para um e-mail e licitante, **Quando** um Administrador convida novamente o mesmo e-mail, **Então** o sistema reenvia o convite (renovando o prazo de validade) e confirma o sucesso ao Administrador.
2. **Dado** que um convite já foi aceito ou recusado anteriormente, **Quando** um Administrador tenta convidar novamente o mesmo e-mail, **Então** o sistema trata como um novo convite normal (não como reenvio de um convite já finalizado).

---

### Casos de Borda

- O que acontece quando o Administrador tenta convidar sem preencher o e-mail ou o nome? O sistema deve impedir o envio e sinalizar o(s) campo(s) obrigatório(s) pendente(s).
- Como o sistema trata a tentativa de convite por um usuário que não é Administrador do licitante ativo? A ação de convidar não deve ficar disponível para esse usuário.
- O que acontece se a sessão do Administrador expirar durante o envio do convite? O sistema deve orientar a pessoa a autenticar-se novamente.
- Como o sistema se comporta se o convite expirar (24 horas) antes de o convidado responder? O link deixa de ser válido e o Administrador precisa enviar um novo convite (tratado como reenvio, conforme História de Usuário 3).
- O que acontece se o licitante ativo do Administrador for alterado ou não existir mais no momento do convite? O sistema deve informar que não foi possível localizar a empresa e impedir o envio.
- Como o sistema trata falhas de comunicação (indisponibilidade momentânea) ao tentar enviar o convite? O Administrador deve ver uma mensagem de erro genérica e poder tentar novamente.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE permitir que um Administrador do licitante ativo envie um convite de colaboração informando o e-mail e o nome da pessoa convidada.
- **RF-002**: O sistema DEVE validar o formato do e-mail e a presença do nome informados antes do envio, exibindo mensagem de erro clara quando o e-mail estiver vazio/em formato inválido ou o nome estiver vazio.
- **RF-003**: O sistema DEVE exibir uma confirmação de sucesso ao Administrador imediatamente após o convite ser enviado, indicando para qual e-mail o convite foi despachado.
- **RF-004**: O sistema DEVE impedir o envio de convite para um e-mail que já possui vínculo ativo (Administrador ou Colaborador) com o licitante, exibindo uma mensagem explicando o motivo.
- **RF-005**: O sistema DEVE tratar o envio de um novo convite para um e-mail que já possui convite pendente do mesmo licitante como um reenvio, renovando o prazo de validade sem gerar erro de duplicidade.
- **RF-006**: O sistema DEVE conceder ao convidado o papel de Colaborador ao aceitar o convite; a concessão do papel de Administrador não faz parte deste fluxo.
- **RF-007**: O sistema DEVE ocultar ou bloquear a ação de convidar colaborador para usuários que não sejam Administradores do licitante ativo.
- **RF-008**: O sistema DEVE informar ao Administrador, de forma compreensível, quando o convite não puder ser enviado por erro de sistema, sessão expirada ou empresa não localizada, permitindo nova tentativa.
- **RF-009**: O sistema DEVE substituir a ação atual de "adicionar colaborador com senha definida manualmente" pelo fluxo de convite por e-mail, já que a criação direta de contas por um Administrador não é uma capacidade suportada pela plataforma.
- **RF-010**: O sistema DEVE exigir o e-mail e o nome da pessoa convidada para o envio do convite (nenhuma outra informação, como senha, é exigida). O campo `nome` é opcional na API (só tem efeito quando o e-mail ainda não pertence a um usuário cadastrado), mas o formulário de convite o trata como obrigatório para garantir consistência nos convites enviados.
- **RF-011**: O sistema DEVE fornecer uma página pública, acessível pelo link recebido por e-mail, em que o convidado consiga aceitar o convite; a página DEVE informar claramente o resultado (sucesso, convite expirado, já respondido ou link inválido) e, em caso de sucesso, orientar o convidado a fazer login (indicando se uma nova conta foi criada e que as credenciais foram enviadas por e-mail).
- **RF-012**: O sistema DEVE fornecer uma página pública equivalente para o convidado recusar o convite, com o mesmo tratamento de estados (sucesso, expirado, já respondido, inválido).

### Entidades Principais

- **Convite de Colaborador**: Representa uma solicitação de vínculo enviada a um e-mail específico em nome de um licitante. Possui um status (pendente, aceito ou recusado), uma data de criação e um prazo de validade de 24 horas. Um novo convite para o mesmo par e-mail/licitante, enquanto pendente, renova esse mesmo convite em vez de criar um novo.
- **Vínculo Usuário-Licitante**: Relação já existente entre um usuário e um licitante, com papel de Administrador ou Colaborador. É criada automaticamente quando um convite é aceito (reaproveitando a conta existente do convidado ou criando uma nova conta, conforme o caso).

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um Administrador consegue enviar um convite de colaboração em menos de 30 segundos, do início do preenchimento até a confirmação de sucesso.
- **CS-002**: 100% das tentativas de convite com e-mail em formato válido resultam em uma confirmação visível (sucesso ou mensagem de erro de negócio, como vínculo já existente).
- **CS-003**: Tentativas de convite para e-mails já vinculados ao licitante são bloqueadas e comunicadas em linguagem simples em 100% dos casos, sem exibir erros técnicos.
- **CS-004**: Administradores conseguem reenviar um convite pendente executando a mesma ação de convite, sem etapas adicionais ou treinamento específico.

## Premissas

- O convite concede exclusivamente o papel de Colaborador; a atribuição do papel de Administrador via convite está fora do escopo desta funcionalidade.
- O prazo de validade do convite é de 24 horas, alinhado ao comportamento já adotado em outros fluxos de confirmação por e-mail da plataforma.
- Esta primeira versão não inclui uma lista persistente de convites pendentes entre sessões — o Administrador recebe a confirmação no momento em que envia ou reenvia o convite, mas não visualiza um histórico consultável posteriormente.
- A ação atual de "adicionar usuário" com senha definida manualmente é descontinuada nesta tela e substituída integralmente pelo fluxo de convite por e-mail.
- Apenas Administradores do licitante ativo podem enviar ou reenviar convites, seguindo as mesmas regras de permissão já aplicadas às demais ações de gestão de acessos (por exemplo, revogar acesso).
- O aceite ou recusa do convite pelo destinatário ocorre fora da tela de Configurações (por meio do link recebido por e-mail), em páginas públicas dedicadas (`/convites/aceitar` e `/convites/recusar`).

> **Correção pós-implementação (2026-07-02)**: a premissa original desta seção afirmava que o aceite/recusa do convite "não faz parte do escopo desta funcionalidade". Isso se mostrou incorreto na prática — o e-mail de convite envia um link real para `/convites/aceitar` (e, quando o convidado já possui conta, também `/convites/recusar`), e sem essas páginas o convite é um beco sem saída (404). RF-011/RF-012 e as páginas `AceitarConvitePage`/`RecusarConvitePage` foram adicionados para fechar esse ciclo.

> **Correção pós-implementação (2026-07-03)**: o endpoint `POST /api/licitantes/{licitanteId}/convites` passou a aceitar um campo `nome` no corpo da requisição, opcional na API — ele só tem efeito quando o e-mail convidado ainda não pertence a um usuário cadastrado (personaliza o e-mail de convite e nomeia a conta criada automaticamente no aceite); é ignorado se o e-mail já pertencer a um usuário existente, e um nome provisório é derivado da parte local do e-mail quando omitido. Por decisão de produto, o formulário de "Convidar colaborador" trata o campo "Nome do colaborador" como **obrigatório** (mesma validação aplicada ao e-mail), mesmo sendo opcional no contrato da API — isso garante que todo convite enviado pela tela de Configurações tenha um nome associado. RF-001, RF-002 e RF-010 foram atualizados para refletir essa exigência.
