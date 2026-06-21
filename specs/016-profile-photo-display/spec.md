# Especificação de Funcionalidade: Exibição da Foto de Perfil na Navbar e Configurações

**Branch da Funcionalidade**: `016-profile-photo-display`
**Criado em**: 2026-06-21
**Status**: Rascunho
**Entrada**: Descrição do usuário: "na navbar e na tela de configuração eu quero usar a foto de perfil que é retornada pelo /api/me"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Foto exibida na navbar ao carregar a sessão (Prioridade: P1)

Ao fazer login, o usuário já tem uma foto de perfil salva na conta. A barra de navegação superior deve exibir essa foto em vez das iniciais do nome, desde o primeiro carregamento da sessão.

**Por que esta prioridade**: É a funcionalidade principal solicitada — o dado já existe no backend mas não está sendo carregado no momento do login.

**Teste Independente**: Pode ser testado fazendo login com uma conta que possui foto de perfil cadastrada e verificando se a navbar exibe a foto corretamente.

**Cenários de Aceite**:

1. **Dado** que o usuário possui foto de perfil cadastrada na conta, **Quando** ele faz login e a sessão é carregada, **Então** a navbar exibe a foto de perfil no lugar das iniciais
2. **Dado** que o usuário não possui foto de perfil, **Quando** ele faz login, **Então** a navbar continua exibindo o avatar com as iniciais do nome
3. **Dado** que a foto de perfil é uma URL válida, **Quando** a imagem não carrega (URL quebrada), **Então** o avatar com as iniciais é exibido como fallback

---

### História de Usuário 2 - Foto exibida na tela de configurações ao carregar a sessão (Prioridade: P1)

O usuário acessa a tela de configurações e a seção "Meu Perfil" deve exibir imediatamente a foto de perfil que já estava cadastrada na conta, sem necessidade de recarregar a página ou realizar nova ação.

**Por que esta prioridade**: Sem isso, a tela de configurações mostra as iniciais mesmo quando o usuário já tem uma foto — inconsistência visual e funcional.

**Teste Independente**: Acessar a tela de configurações com uma conta que possui foto cadastrada e verificar se a foto é exibida na seção "Meu Perfil".

**Cenários de Aceite**:

1. **Dado** que o usuário possui foto de perfil cadastrada, **Quando** acessa a tela de configurações, **Então** a seção "Meu Perfil" exibe a foto em vez das iniciais
2. **Dado** que o usuário faz upload de uma nova foto na tela de configurações, **Quando** a operação é concluída com sucesso, **Então** a foto atualizada é refletida tanto na seção de configurações quanto na navbar sem recarregar a página
3. **Dado** que o usuário remove a foto de perfil na tela de configurações, **Quando** a operação é concluída, **Então** ambas (navbar e seção de configurações) voltam a exibir as iniciais

---

### Casos de Borda

- A URL da foto é assinada e expira após 1 hora; quando isso ocorrer, o `<img>` falhará silenciosamente e o avatar com iniciais será exibido automaticamente — comportamento aceito sem lógica extra de refresh
- Se o campo `foto_perfil_url` vier como `null` ou ausente na resposta do servidor, o avatar com iniciais é exibido normalmente
- Falhas de rede ao carregar a imagem (URL inacessível por qualquer outro motivo) também resultam no fallback com iniciais

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE incluir o campo de foto de perfil retornado pelo endpoint `/api/me` ao construir os dados do usuário na sessão
- **RF-002**: A navbar DEVE exibir a foto de perfil do usuário autenticado quando esta estiver disponível na sessão
- **RF-003**: A tela de configurações, seção "Meu Perfil", DEVE exibir a foto de perfil do usuário autenticado quando esta estiver disponível na sessão
- **RF-004**: Quando a foto de perfil não estiver disponível (ausente, nula ou com erro de carregamento), o sistema DEVE exibir o avatar com as iniciais do nome do usuário como alternativa
- **RF-005**: Após o upload ou remoção de foto na tela de configurações, a foto DEVE ser atualizada em tempo real na navbar e na seção de perfil, sem recarregar a página

### Entidades Principais

- **Usuário**: Representa o usuário autenticado; possui os atributos nome completo, e-mail e URL da foto de perfil (opcional)
- **Sessão**: Estado da autenticação ativa, contendo os dados do usuário carregados no momento do login; deve refletir o campo de foto de perfil proveniente do servidor

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários com foto de perfil cadastrada visualizam a foto na navbar imediatamente após o login, sem necessidade de ação adicional
- **CS-002**: Usuários com foto de perfil cadastrada visualizam a foto na seção "Meu Perfil" da tela de configurações ao acessá-la pela primeira vez na sessão
- **CS-003**: A foto de perfil exibida na navbar e nas configurações reflete o estado atual da conta em 100% das sessões iniciadas após a implementação
- **CS-004**: Não há regressão no comportamento do avatar com iniciais para usuários sem foto cadastrada

## Premissas

- O endpoint `/api/me` retorna o campo `foto_perfil_url` (nullable) com a URL assinada da foto de perfil quando esta está cadastrada; a URL tem validade de 1 hora
- A expiração da URL assinada após 1 hora é comportamento aceito: não será implementada lógica de refresh automático; a foto é renovada no próximo reload ou re-login
- Os componentes visuais (navbar e seção de configurações) já estão preparados para exibir a foto quando o campo estiver disponível nos dados da sessão
- O mecanismo de atualização de foto em tempo real (upload/remoção) já está implementado e funciona corretamente; esta funcionalidade garante apenas que a foto seja carregada no início da sessão
- Usuários sem foto de perfil cadastrada não são impactados — continuam vendo o avatar com iniciais

## Clarificações

### Sessão 2026-06-21

- Q: Como o sistema deve tratar a expiração da URL assinada da foto de perfil (validade de 1 hora)? → A: Aceitar degradação natural — a foto some após 1h, as iniciais substituem automaticamente; a URL é renovada no próximo reload ou re-login, sem lógica extra de refresh
