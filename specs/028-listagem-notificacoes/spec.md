# Especificação de Funcionalidade: Tela de Todas as Notificações

**Branch da Funcionalidade**: `028-listagem-notificacoes`
**Criado em**: 2026-07-23
**Status**: Rascunho
**Entrada**: Descrição do usuário: "Eu quero criar uma tela especifica para ver todas as notificaçoes de uma forma organizada."

## Contexto

Hoje as notificações do usuário só aparecem em três lugares, todos limitados às mais recentes: o
sino do cabeçalho, a seção "Alertas recentes" da tela de Configurações e o card de alertas da
dashboard. Não existe uma tela dedicada para o usuário ver o histórico completo de notificações,
filtrar por status de leitura ou por origem, nem localizar algo mais antigo que não coube nesses
recortes reduzidos.

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Ver todas as notificações organizadas por data (Prioridade: P1)

Como usuário autenticado, quero acessar uma tela dedicada que lista todas as minhas notificações
(não só as mais recentes), organizadas em seções por período (ex.: Hoje, Esta semana, Mais
antigas), para conseguir revisar meu histórico completo e localizar algo específico sem precisar
adivinhar em qual tela reduzida ele apareceria.

**Por que esta prioridade**: É o núcleo do pedido — sem esta tela e sua organização por data, as
demais histórias (filtros) não têm onde existir.

**Teste Independente**: Pode ser testado acessando a tela com uma conta que tenha notificações de
datas variadas e conferindo que todas aparecem, agrupadas corretamente por período e ordenadas da
mais recente para a mais antiga dentro de cada grupo.

**Cenários de Aceite**:

1. **Dado** um usuário autenticado com notificações de diferentes datas, **Quando** ele acessa a
   tela de todas as notificações, **Então** vê todas elas (não apenas as mais recentes),
   organizadas em seções por período (ex.: Hoje, Esta semana, Mais antigas).
2. **Dado** que o usuário tem mais notificações do que cabem em uma única carga, **Quando** ele
   continua navegando na tela, **Então** consegue acessar as notificações mais antigas
   adicionalmente, sem perder as já carregadas.
3. **Dado** um usuário sem nenhuma notificação, **Quando** ele acessa a tela, **Então** vê uma
   mensagem clara informando que não há notificações, em vez de uma tela vazia sem explicação.
4. **Dado** uma notificação referente a um instrumento ou ata, **Quando** o usuário interage com
   ela nesta tela, **Então** ela é marcada como lida e o usuário é levado à página de detalhes da
   entidade relacionada — mesmo comportamento já disponível no sino do cabeçalho.

---

### História de Usuário 2 - Filtrar por status de leitura (Prioridade: P2)

Como usuário autenticado, quero alternar entre ver "Todas" as notificações ou somente as "Não
lidas", para focar rapidamente no que ainda precisa da minha atenção.

**Por que esta prioridade**: Complementa a listagem completa (P1) com a forma de filtro mais usada
em centrais de notificação, mas a tela já entrega valor sem ela.

**Teste Independente**: Pode ser testado alternando entre os dois filtros e conferindo que a lista
exibida muda de acordo, mantendo a organização por data.

**Cenários de Aceite**:

1. **Dado** notificações lidas e não lidas, **Quando** o usuário seleciona o filtro "Não lidas",
   **Então** somente as não lidas são exibidas, mantendo o agrupamento por data.
2. **Dado** o filtro "Não lidas" ativo, **Quando** o usuário marca a última notificação não lida
   como lida, **Então** ela desaparece da visualização filtrada (mas continua acessível em
   "Todas").
3. **Dado** o usuário aciona "marcar todas como lidas" nesta tela, **Quando** a ação é concluída,
   **Então** todas as notificações do usuário no licitante ativo passam a constar como lidas,
   independentemente do filtro de leitura ou de origem ativo no momento.

---

### História de Usuário 3 - Filtrar por tipo de origem (Prioridade: P3)

Como usuário autenticado, quero filtrar as notificações por tipo de origem (instrumento, ata ou
ordem de fornecimento), para revisar rapidamente apenas o tipo de assunto que me interessa no
momento.

**Por que esta prioridade**: É um refinamento adicional sobre os filtros de leitura (P2); agrega
valor mas a tela já é útil sem ele.

**Teste Independente**: Pode ser testado selecionando cada tipo de origem isoladamente e
conferindo que somente notificações daquela origem aparecem, podendo ser combinado com o filtro de
leitura.

**Cenários de Aceite**:

1. **Dado** notificações de origens variadas, **Quando** o usuário filtra por um tipo específico
   de origem, **Então** somente notificações daquela origem são exibidas.
2. **Dado** um filtro de origem e um filtro de leitura ativos ao mesmo tempo, **Quando** a lista é
   exibida, **Então** ela respeita as duas condições combinadas.
3. **Dado** um filtro de origem sem nenhuma notificação correspondente, **Quando** aplicado,
   **Então** o sistema exibe uma mensagem indicando que não há notificações para aquele filtro
   (distinta da mensagem de "nenhuma notificação" geral).

---

### Casos de Borda

- O que acontece quando o usuário não tem nenhuma notificação (geral) versus quando o filtro
  aplicado é que não retorna resultados? As duas mensagens devem deixar claro qual é o caso.
- Como o sistema trata falha ao carregar a lista (erro de rede)? Deve exibir um estado de erro com
  opção de tentar novamente, sem quebrar a tela.
- O que acontece quando o usuário troca de licitante ativo enquanto está nesta tela? A lista deve
  ser recarregada do zero para o novo licitante, descartando filtros aplicados a notificações do
  licitante anterior (mistura de dados de licitantes diferentes nunca deve ocorrer).
- O que acontece com uma notificação cuja entidade de origem (instrumento/ata) não existe mais?
  A interação não deve quebrar a tela (mesmo tratamento já usado no sino e em Configurações).
- O que acontece se o usuário aplicar um filtro de origem e depois um filtro de leitura em
  sequência rápida? O resultado final deve refletir a combinação mais recente de ambos os filtros.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE prover uma tela dedicada que lista todas as notificações do usuário
  autenticado no licitante ativo, não se limitando às notificações mais recentes já exibidas no
  sino do cabeçalho, em Configurações ou na dashboard.
- **RF-002**: A tela DEVE organizar as notificações em seções por período relativo à data atual
  (ex.: Hoje, Esta semana, Mais antigas), mantendo a ordem da mais recente para a mais antiga
  dentro de cada seção.
- **RF-003**: O sistema DEVE permitir ao usuário continuar acessando notificações além da carga
  inicial (notificações mais antigas), sem perder o que já foi carregado.
- **RF-004**: Os usuários DEVEM conseguir alternar a visualização entre "Todas" as notificações e
  somente as "Não lidas".
- **RF-005**: Os usuários DEVEM conseguir filtrar as notificações exibidas por tipo de origem
  (instrumento, ata, ordem de fornecimento), combinável com o filtro de status de leitura.
- **RF-006**: Ao interagir com uma notificação nesta tela, o sistema DEVE marcá-la como lida e,
  quando a origem for um instrumento ou uma ata, navegar até a página de detalhes da entidade
  relacionada — mesmo comportamento das demais superfícies de notificação já existentes.
- **RF-007**: Os usuários DEVEM conseguir marcar todas as suas notificações como lidas a partir
  desta tela, com efeito sobre todas as notificações do licitante ativo, independentemente dos
  filtros de leitura/origem aplicados no momento.
- **RF-008**: O sistema DEVE exibir mensagens distintas para "nenhuma notificação existente" e
  "nenhuma notificação para o filtro atual".
- **RF-009**: O sistema DEVE recarregar a lista (e limpar o estado de carregamento incremental)
  sempre que o licitante ativo do usuário mudar.
- **RF-010**: O sistema DEVE oferecer um caminho de acesso a esta tela a partir dos pontos onde já
  existe hoje um atalho relacionado a "ver todas as notificações" (o link "Ver todos" do card de
  alertas da dashboard, hoje apontando para um destino não relacionado, passa a apontar para esta
  tela) e a partir do sino de notificações do cabeçalho.

### Entidades Principais

- **Notificação**: mesma entidade já usada pela Central de Notificações existente (título,
  descrição, cor, origem, status de leitura, data de criação) — esta funcionalidade não introduz
  novos dados, apenas uma superfície de visualização mais completa com filtros.
- **Filtro de visualização**: combinação de status de leitura ("Todas"/"Não lidas") e tipo de
  origem, aplicada sobre a mesma lista de notificações; não é persistida entre sessões.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% das notificações do usuário no licitante ativo ficam acessíveis nesta tela, não
  apenas as mais recentes.
- **CS-002**: Usuários conseguem restringir a visualização a apenas notificações não lidas em uma
  única ação.
- **CS-003**: Usuários conseguem restringir a visualização por tipo de origem em uma única ação,
  combinável com o filtro de leitura.
- **CS-004**: A partir de qualquer notificação relacionada a um instrumento ou ata nesta tela, o
  usuário chega à página de detalhes correspondente sem etapas adicionais além do clique.
- **CS-005**: Usuários que hoje clicam em "Ver todos" no card de alertas da dashboard chegam a uma
  tela de notificações coerente com o que clicaram, em vez de uma tela não relacionada.

## Premissas

- Esta funcionalidade reaproveita o mesmo conceito de notificação e as mesmas ações (marcar como
  lida, marcar todas como lidas, navegar até a entidade relacionada) já implementados na Central de
  Notificações existente — não há mudança no que uma notificação representa, apenas uma nova
  superfície de visualização mais completa com filtros e organização por data.
- A ação "marcar todas como lidas" nesta tela afeta todas as notificações do usuário no licitante
  ativo, independentemente do filtro de leitura/origem ativo no momento — comportamento consistente
  com o já existente no sino do cabeçalho.
- O agrupamento por data usa categorias relativas ao momento de acesso (ex.: Hoje, Esta semana,
  Mais antigas); os limites exatos de cada categoria seguem convenções comuns de calendário, sem
  ser configurável pelo usuário.
- Notificações além da carga inicial são obtidas sob demanda (ex.: ao rolar a lista ou acionar
  explicitamente "carregar mais"), sem exigir uma única carga de todo o histórico de uma vez.
- Autenticação e o contexto de licitante ativo já são resolvidos por mecanismos existentes,
  reaproveitados sem alteração nesta funcionalidade.
