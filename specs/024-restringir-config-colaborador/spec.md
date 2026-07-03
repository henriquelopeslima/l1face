# Especificação de Funcionalidade: Restringir Configurações para Colaborador

**Branch da Funcionalidade**: `024-restringir-config-colaborador`
**Criado em**: 2026-07-03
**Status**: Rascunho
**Entrada**: Descrição do usuário: "eu preciso melhorar a visualização da tela de configuração, se o usuario for colaborador no licitante em questão, ele não deve ter algumas coisas referente as configurações, como Assinatura e cobrança e Gestão de acessos."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Colaborador não vê seções restritas (Prioridade: P1)

Como colaborador de uma empresa licitante, ao acessar a tela de Configurações não devo ver as seções "Assinatura e cobrança" e "Gestão de acessos", para que eu não me depare com opções que não tenho permissão de usar.

**Por que esta prioridade**: É a jornada central da funcionalidade — sem ela, colaboradores continuam vendo controles de administração que não conseguem operar, gerando confusão e tentativas de ação que resultam em erro de permissão.

**Teste Independente**: Pode ser totalmente testado autenticando como colaborador de um licitante, abrindo a tela de Configurações e confirmando que as seções "Assinatura e cobrança" e "Gestão de acessos" não aparecem.

**Cenários de Aceite**:

1. **Dado** que sou colaborador do licitante ativo, **Quando** acesso a tela de Configurações, **Então** a seção "Assinatura e cobrança" não é exibida.
2. **Dado** que sou colaborador do licitante ativo, **Quando** acesso a tela de Configurações, **Então** a seção "Gestão de acessos" não é exibida.
3. **Dado** que sou colaborador do licitante ativo, **Quando** acesso a tela de Configurações, **Então** as demais seções (Perfil, Aparência, Notificações, Segurança) e a opção de sair da conta continuam sendo exibidas normalmente.

---

### História de Usuário 2 - Administrador continua vendo todas as seções (Prioridade: P2)

Como administrador de uma empresa licitante, quero continuar vendo todas as seções da tela de Configurações, incluindo Assinatura e cobrança e Gestão de acessos, para seguir gerenciando plenamente minha empresa.

**Por que esta prioridade**: Garante que a restrição criada para colaboradores não afete administradores por engano — uma regressão aqui bloquearia o acesso a funções administrativas essenciais.

**Teste Independente**: Pode ser totalmente testado autenticando como administrador de um licitante, abrindo a tela de Configurações e confirmando que todas as seções aparecem normalmente.

**Cenários de Aceite**:

1. **Dado** que sou administrador do licitante ativo, **Quando** acesso a tela de Configurações, **Então** vejo todas as seções, incluindo "Assinatura e cobrança" e "Gestão de acessos".

---

### História de Usuário 3 - Acesso direto a uma seção restrita não a expõe (Prioridade: P3)

Como colaborador, se eu tentar acessar diretamente um link ou atalho que aponta para uma seção restrita da tela de Configurações (por exemplo, um link salvo ou compartilhado anteriormente), o sistema não deve exibir essa seção mesmo assim.

**Por que esta prioridade**: Fecha uma brecha de experiência em que um link direto (favoritado, compartilhado ou reaproveitado do histórico do navegador) poderia contornar a ocultação baseada em papel aplicada na História de Usuário 1.

**Teste Independente**: Pode ser totalmente testado autenticando como colaborador e navegando diretamente para o link/âncora de uma seção restrita, confirmando que ela continua oculta.

**Cenários de Aceite**:

1. **Dado** que sou colaborador do licitante ativo, **Quando** acesso a tela de Configurações através de um link que aponta diretamente para uma seção restrita, **Então** essa seção não é exibida.

---

### Casos de Borda

- O que acontece se a tela de Configurações abrir antes de o sistema confirmar se o usuário é Administrador ou Colaborador do licitante ativo? As seções restritas não devem aparecer brevemente antes de serem ocultadas ("flash" de conteúdo indevido).
- Como o sistema se comporta quando o usuário participa de múltiplos licitantes, sendo Administrador em um e Colaborador em outro? A visibilidade das seções deve refletir sempre o papel do usuário no licitante atualmente ativo, não em outros licitantes aos quais ele também pertence.
- O que acontece se o usuário trocar de licitante ativo enquanto a tela de Configurações está aberta? A visibilidade das seções restritas deve se atualizar de acordo com o papel do usuário no novo licitante ativo.
- Como o sistema trata uma falha ao determinar o papel do usuário no licitante ativo? Por segurança, as seções restritas não devem ser exibidas enquanto o papel não for confirmado com sucesso.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE ocultar a seção "Assinatura e cobrança" da tela de Configurações para usuários cujo papel no licitante ativo seja Colaborador.
- **RF-002**: O sistema DEVE ocultar a seção "Gestão de acessos" da tela de Configurações para usuários cujo papel no licitante ativo seja Colaborador.
- **RF-003**: O sistema DEVE exibir normalmente todas as seções da tela de Configurações, incluindo "Assinatura e cobrança" e "Gestão de acessos", para usuários cujo papel no licitante ativo seja Administrador.
- **RF-004**: O sistema NÃO DEVE exibir as seções restritas a um Colaborador mesmo quando acessadas por meio de um link direto ou âncora específica.
- **RF-005**: O sistema DEVE basear a decisão de exibir ou ocultar as seções restritas exclusivamente no papel do usuário no licitante atualmente ativo, ignorando papéis que o usuário possua em outros licitantes.
- **RF-006**: O sistema DEVE atualizar a visibilidade das seções restritas sempre que o licitante ativo do usuário for alterado durante a sessão.
- **RF-007**: O sistema NÃO DEVE exibir as seções restritas enquanto o papel do usuário no licitante ativo ainda estiver sendo carregado ou não puder ser confirmado.
- **RF-008**: O sistema DEVE continuar exibindo, para todos os papéis, as demais seções já existentes na tela de Configurações (Perfil, Aparência, Notificações, Segurança) e a opção de sair da conta.

### Entidades Principais

- **Seção de Configurações**: Bloco de funcionalidades exibido na tela de Configurações (ex.: Perfil, Aparência, Notificações, Assinatura e cobrança, Segurança, Gestão de acessos). Algumas seções são restritas conforme o papel do usuário no licitante ativo.
- **Papel do Usuário no Licitante** *(já existente)*: Classifica o vínculo do usuário com um licitante como Administrador ou Colaborador; é o mesmo conceito já usado para liberar ações de convite e remoção de acesso em Gestão de acessos, agora reaproveitado para decidir a visibilidade de seções inteiras.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos acessos de usuários com papel Colaborador à tela de Configurações não exibem as seções "Assinatura e cobrança" e "Gestão de acessos".
- **CS-002**: 100% dos acessos de usuários com papel Administrador à tela de Configurações continuam exibindo todas as seções, sem nenhuma regressão perceptível.
- **CS-003**: Em 100% das tentativas de acesso direto via link/âncora para uma seção restrita, um usuário com papel Colaborador não consegue visualizar essa seção.
- **CS-004**: Nenhum usuário com papel Colaborador relata ter visto, mesmo que brevemente, uma seção restrita ao carregar a tela de Configurações.

## Premissas

- As seções restritas nesta primeira versão são exatamente "Assinatura e cobrança" e "Gestão de acessos"; nenhuma outra seção hoje existente na tela de Configurações (Perfil, Aparência, Notificações, Segurança) é afetada.
- A autorização no backend para as ações restritas (como convidar colaborador) já existe e continua sendo a barreira de segurança real; esta funcionalidade trata apenas da exibição na interface, evitando que colaboradores vejam controles que não têm permissão de usar.
- O papel do usuário (Administrador ou Colaborador) é sempre avaliado em relação ao licitante atualmente ativo na sessão, reaproveitando o mesmo conceito de papel já usado na funcionalidade de Gestão de acessos.
- Colaboradores não recebem nenhuma mensagem explicativa sobre a ausência das seções restritas — elas simplesmente não aparecem, seguindo o mesmo padrão de ocultação por permissão já adotado hoje (ex.: botão "Convidar colaborador" oculto para não administradores).

> **Correção pós-implementação (2026-07-03)**: a implementação inicial de RF-001/RF-002 só ocultava as seções restritas dentro do conteúdo da própria tela de Configurações. Verificação manual mostrou que o menu lateral (`AppSidebar`) tem sua própria lista de atalhos para as mesmas seções ("Assinatura e cobrança", "Gestão de acessos"), que continuava visível para Colaboradores independentemente do conteúdo da página. RF-001/RF-002 abrangem qualquer superfície de navegação para essas seções, não apenas o corpo da página — o menu lateral foi corrigido para aplicar a mesma regra de visibilidade.
