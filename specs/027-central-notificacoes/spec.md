# Especificação de Funcionalidade: Central de Notificações no Frontend

**Branch da Funcionalidade**: `027-central-notificacoes`
**Criado em**: 2026-07-23
**Status**: Rascunho
**Entrada**: Descrição do usuário: "preciso implementar as notificações no frontend, tendo em vista que já estão implementadas no backend. Leia a doc da api. Temos notificações na dashboard no header e na tela de configuracao"

## Contexto

O backend já é capaz de fornecer as notificações reais de cada usuário (listagem, marcação de leitura individual e em lote), e a dashboard já exibe essas notificações reais (as 5 mais recentes). Porém, dois outros pontos do frontend ainda exibem notificações **fixas/fictícias** em vez de dados reais:

- O sino de notificações no cabeçalho (header), presente em todas as telas.
- A seção "Notificações" da tela de Configurações, especificamente a lista de "Alertas recentes".

Esta funcionalidade cobre a substituição desses dados fixos por dados reais vindos do backend, incluindo a contagem de não lidas e as ações de marcar como lida.

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Ver notificações reais no sino do cabeçalho (Prioridade: P1)

Como usuário autenticado, quero ver no sino de notificações do cabeçalho as notificações reais geradas para mim no licitante ativo, com a contagem correta de não lidas, para saber imediatamente se há algo que precisa da minha atenção, em qualquer tela do sistema.

**Por que esta prioridade**: É o ponto de maior visibilidade (aparece em todas as telas) e hoje mostra dados totalmente fictícios, o que pode induzir o usuário a erro (ex.: contagem "3" fixa mesmo sem notificações reais).

**Teste Independente**: Pode ser testado abrindo o sino do cabeçalho em uma conta com notificações reais cadastradas e conferindo que a lista e a contagem exibidas correspondem exatamente às notificações existentes para aquele usuário.

**Cenários de Aceite**:

1. **Dado** um usuário autenticado com notificações não lidas cadastradas no licitante ativo, **Quando** ele visualiza qualquer tela do sistema, **Então** o sino do cabeçalho exibe um indicador com a quantidade real de notificações não lidas.
2. **Dado** um usuário autenticado, **Quando** ele abre o sino de notificações, **Então** a lista exibida corresponde às notificações mais recentes retornadas pelo backend para aquele usuário e licitante ativo (título, descrição e cor conforme enviados pela API).
3. **Dado** um usuário sem nenhuma notificação, **Quando** ele abre o sino, **Então** o sistema exibe uma mensagem informando que não há notificações, em vez de lista vazia sem explicação.

---

### História de Usuário 2 - Marcar notificações como lidas (Prioridade: P2)

Como usuário autenticado, quero marcar notificações individuais como lidas (ao interagir com elas) ou marcar todas de uma vez, para que o indicador de não lidas reflita o que eu já vi.

**Por que esta prioridade**: Complementa a visualização (P1) fechando o ciclo de uso da notificação; sem isso, o indicador nunca zera e perde utilidade.

**Teste Independente**: Pode ser testado marcando uma notificação como lida e conferindo que ela deixa de contar no indicador; e usando a ação "marcar todas como lidas" e conferindo que o indicador zera.

**Cenários de Aceite**:

1. **Dado** uma notificação não lida visível no sino do cabeçalho, **Quando** o usuário interage com ela (ex.: clique), **Então** ela é marcada como lida e a contagem de não lidas é decrementada em 1.
2. **Dado** notificações não lidas, **Quando** o usuário aciona a ação "marcar todas como lidas" no sino do cabeçalho, **Então** todas as notificações do usuário no licitante ativo passam a constar como lidas e o indicador de não lidas é zerado.
3. **Dado** uma notificação já marcada como lida, **Quando** o usuário tenta marcá-la como lida novamente, **Então** o sistema não gera erro e o estado permanece "lida" (operação idempotente).

---

### História de Usuário 3 - Ver alertas reais na tela de Configurações (Prioridade: P3)

Como usuário autenticado, quero que a seção "Alertas recentes" da tela de Configurações mostre minhas notificações reais (as mesmas exibidas no cabeçalho/dashboard), para ter uma visão consistente do sistema em qualquer tela onde eu procure notificações.

**Por que esta prioridade**: Reforça a consistência de dados entre telas, mas é a superfície de menor visibilidade (usuário precisa entrar em Configurações), por isso prioridade menor que P1/P2.

**Teste Independente**: Pode ser testado comparando a lista de "Alertas recentes" na tela de Configurações com as notificações reais existentes para o mesmo usuário/licitante.

**Cenários de Aceite**:

1. **Dado** um usuário autenticado, **Quando** ele acessa a tela de Configurações, **Então** a seção "Alertas recentes" exibe notificações reais (título, descrição, cor) em vez da lista fixa atual.
2. **Dado** que o usuário marcou uma notificação como lida no cabeçalho, **Quando** ele acessa a tela de Configurações, **Então** o estado de leitura refletido é o mesmo (consistência entre telas).

---

### Casos de Borda

- O que acontece quando o usuário não possui nenhuma notificação? O sino e a seção de Configurações devem exibir estado vazio claro (sem indicador de contagem, sem lista fictícia).
- Como o sistema trata falha de rede/erro ao buscar notificações? O sino e a seção de Configurações devem degradar graciosamente (ex.: ocultar contagem/lista) sem quebrar o restante da tela.
- O que acontece quando o usuário troca de licitante ativo? As notificações exibidas devem ser recarregadas para refletir o novo licitante, nunca misturando dados do licitante anterior.
- O que acontece quando uma notificação se refere a uma entidade (instrumento, ata ou OF) que não existe mais? A interação com a notificação não deve quebrar a tela.
- O que acontece se o usuário tentar marcar como lida uma notificação que não é dele ou de outro licitante? O sistema deve tratar como não encontrada, sem revelar a existência da notificação de terceiros.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE substituir a lista fixa/fictícia de notificações do sino do cabeçalho por dados reais das notificações do usuário autenticado no licitante ativo.
- **RF-002**: O sistema DEVE exibir no sino do cabeçalho a contagem real de notificações não lidas do usuário no licitante ativo, ocultando ou zerando o indicador quando não houver nenhuma.
- **RF-003**: Os usuários DEVEM conseguir marcar uma notificação individual como lida ao interagir com ela no sino do cabeçalho.
- **RF-003a**: Ao interagir com uma notificação cuja origem seja um instrumento ou uma ata, o sistema DEVE, além de marcá-la como lida, navegar o usuário até a página de detalhes daquele instrumento/ata (`entidadeId`). Notificações de outras origens (ex.: ordem de fornecimento) apenas são marcadas como lidas, sem navegação. Esse comportamento de navegação é válido no sino do cabeçalho, na tela de Configurações e na dashboard, e permanece disponível mesmo após a notificação já estar lida (o clique nunca fica inerte).
- **RF-004**: Os usuários DEVEM conseguir marcar todas as suas notificações como lidas de uma só vez a partir do sino do cabeçalho.
- **RF-005**: O sistema DEVE substituir a lista fixa/fictícia de "Alertas recentes" na tela de Configurações por dados reais das notificações do usuário no licitante ativo.
- **RF-006**: O estado de leitura de uma notificação (lida/não lida) DEVE ser consistente entre o sino do cabeçalho, a tela de Configurações e a dashboard.
- **RF-007**: O sistema DEVE exibir uma mensagem apropriada quando não houver notificações, tanto no sino do cabeçalho quanto na tela de Configurações.
- **RF-008**: O sistema DEVE recarregar as notificações exibidas sempre que o licitante ativo do usuário mudar.
- **RF-009**: O sistema DEVE reconsultar a contagem e a lista de notificações automaticamente em um intervalo de tempo fixo, enquanto o usuário estiver com o sistema aberto, sem exigir que ele recarregue a página manualmente.
- **RF-010**: A tela de Configurações DEVE manter visíveis os controles de preferência de notificação atualmente exibidos (ex.: alternar "Contratos próximos ao vencimento", "Pendências financeiras", "E-mail diário"), porém desabilitados e com uma indicação de que a funcionalidade estará disponível em breve, já que não há suporte de backend para salvar essas preferências no momento.

### Entidades Principais

- **Notificação**: representa um alerta gerado pelo sistema para um usuário, originado de um instrumento, uma ata ou uma ordem de fornecimento. Contém um conteúdo (título, descrição e cor de destaque), um estado de leitura (lida/não lida, com data de leitura quando aplicável) e a data de criação. Pertence a um usuário dentro do contexto de um licitante específico.
- **Contagem de não lidas**: indicador numérico derivado da quantidade de notificações não lidas do usuário no licitante ativo, exibido no sino do cabeçalho.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Ao acessar qualquer tela do sistema, o usuário vê a contagem de notificações não lidas correspondente exatamente ao que existe no backend, sem discrepância.
- **CS-002**: 100% das notificações marcadas como lidas (individualmente ou em lote) deixam de ser contadas como não lidas em todas as telas do sistema (cabeçalho, Configurações, dashboard) na mesma sessão.
- **CS-003**: O usuário consegue marcar todas as notificações pendentes como lidas em uma única ação, sem etapas adicionais.
- **CS-004**: A lista de "Alertas recentes" da tela de Configurações corresponde exatamente aos dados retornados pelo backend para o usuário e licitante ativo (zero dados fictícios remanescentes).
- **CS-005**: Nenhuma notificação de outro usuário ou de outro licitante é exibida em qualquer uma das três superfícies (cabeçalho, Configurações, dashboard).

## Premissas

- A dashboard já exibe as 5 notificações mais recentes via `GET /api/dashboard` (campo `alertas`) e está fora do escopo desta funcionalidade — nenhuma alteração é necessária ali.
- O cabeçalho e a tela de Configurações exibirão as notificações mais recentes (primeira página do endpoint `GET /api/notificacoes`); uma tela dedicada de listagem completa/paginada de notificações não faz parte desta fase, a menos que indicado de outra forma.
- Para notificações de origem "instrumento", o tipo concreto (contrato ou empenho) é resolvido sob demanda ao clicar, reaproveitando a busca de instrumento já usada pelas páginas de detalhe existentes — não é necessário que a notificação em si carregue essa informação.
- O contexto do licitante ativo (header `X-Licitante-Id`) já está disponível no frontend através do mecanismo existente de seleção/troca de licitante.
- Cores e categorização por origem (instrumento, ata, ordem de fornecimento) seguem o mesmo padrão visual já utilizado na dashboard.
- Autenticação (cookie `BEARER`) já está implementada e será reutilizada para todas as chamadas de notificações.
