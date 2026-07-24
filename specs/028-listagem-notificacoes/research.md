# Pesquisa: Tela de Todas as Notificações

Nenhum item do Contexto Técnico ficou marcado como `NEEDS CLARIFICATION` — a organização da tela já
foi decidida com o usuário antes da spec (agrupamento por data + filtro de leitura + filtro de
origem). Este documento registra as decisões de design derivadas dessa escolha e de restrições reais
da API já documentada.

## 1. Filtros são client-side sobre as páginas já carregadas

- **Decision**: Os filtros "Todas/Não lidas" e por tipo de origem são aplicados no frontend, sobre
  o conjunto de notificações já buscado (acumulado por "Carregar mais"). Cada clique em "Carregar
  mais" busca a próxima página via `GET /api/notificacoes?page=N&limit=20` e adiciona ao conjunto
  acumulado antes de os filtros serem reaplicados.
- **Rationale**: `l1core/docs/openapi.yaml` (endpoint `GET /api/notificacoes`, linhas ~4302-4357)
  só documenta os parâmetros `X-Licitante-Id`, `page` e `limit` — não há filtro por `lida` nem por
  `tipoOrigem` no backend hoje. Implementar esse filtro no servidor está fora do escopo desta
  funcionalidade (frontend-only, sem mudança de API).
- **Implicação de UX documentada**: se o usuário aplicar "Não lidas" e a página atual carregada não
  tiver nenhuma correspondência, a lista pode aparecer vazia mesmo havendo não lidas mais antigas
  ainda não buscadas — o botão "Carregar mais" continua disponível (baseado em `totalPaginas` da
  resposta, não no total pós-filtro) para o usuário continuar buscando até esgotar o histórico.
  Isso é aceitável para o escopo atual (Premissa da spec: sem exigência de busca "instantânea" em
  todo o histórico).
- **Alternativas consideradas**:
  - *Adicionar filtros ao backend*: rejeitado — exigiria mudança de contrato de API, fora do escopo
    desta spec, que é explicitamente frontend-only.
  - *Buscar todas as páginas de uma vez ao aplicar um filtro*: rejeitado — contradiz a Premissa da
    spec de carregamento incremental sob demanda, e poderia gerar N requisições em sequência para
    usuários com muito histórico.

## 2. Mecanismo de carregamento incremental: botão "Carregar mais"

- **Decision**: Botão explícito "Carregar mais", não rolagem infinita (`IntersectionObserver`).
- **Rationale**: Nenhuma tela hoje no projeto usa rolagem infinita; o padrão existente para "mais
  itens" é sempre um controle explícito (`ContratoDetalhesPage.tsx`, paginação com botões
  Anterior/Próxima). Um botão "Carregar mais" é o mais simples de implementar corretamente com
  filtros client-side (evita disparar buscas automáticas repetidas ao rolar uma lista já filtrada
  para poucos itens) e é consistente com a preferência do projeto por interações explícitas.
- **Alternativas consideradas**:
  - *Rolagem infinita*: rejeitada — sem precedente no código, adiciona complexidade
    (`IntersectionObserver`, cálculo de viewport) sem necessidade clara para o volume esperado de
    notificações administrativas.
  - *Paginação clássica com números de página*: rejeitada para esta tela — faz sentido para uma
    tabela com dataset fixo já carregado (como em `ContratoDetalhesPage`), mas aqui os dados vêm
    paginados do servidor incrementalmente; misturar "página do servidor" com "página exibida
    pós-filtro" confundiria o usuário.

## 3. Sincronização de estado "lida" entre esta tela e o sino/Configurações

- **Decision**: A tela mantém sua própria lista acumulada (potencialmente grande, com filtros e
  agrupamento — responsabilidade distinta do `NotificacoesContext`, que só cobre a primeira página
  para o sino/Configurações). Marcar como lida (individual ou em lote) continua delegado ao
  `useNotificacoes()` compartilhado — que já faz a chamada real à API e atualiza o sino/Configurações
  — e a tela espelha a mesma mudança otimista na sua lista local (`lida: true` no item ou em todos).
  Não há uma segunda chamada de API: a tela reaproveita a mutação já existente, só duplicando a
  atualização de estado local para sua própria exibição.
- **Rationale**: Evita que duas fontes de verdade divirjam sobre "o que está lido" e evita duplicar
  chamadas de rede a cada clique. `useAbrirNotificacao()` (de 027) já delega a `marcarComoLida` do
  Context compartilhado — reaproveitado sem alteração para o clique que marca e navega. Para "marcar
  todas como lidas" nesta tela, chama-se `useNotificacoes().marcarTodasComoLidas()` (mesma função do
  sino) e localmente marca-se `lida: true` em todos os itens já acumulados.
- **Alternativas consideradas**:
  - *Tela com sua própria chamada de API independente para marcar como lida*: rejeitado — duplicaria
    lógica de rollback otimista já existente no Context e poderia dessincronizar o sino se as duas
    chamadas ocorressem em momentos diferentes.
  - *Estender o `NotificacoesContext` compartilhado para também guardar a lista paginada/filtrada
    completa*: rejeitado — sobrecarregaria a responsabilidade do Context (que hoje é deliberadamente
    simples: primeira página + polling de 60s para o sino) e violaria Single Responsibility
    (Princípio III da constituição).

## 4. UI dos filtros: segmented buttons (não `Select`)

- **Decision**: Tanto o filtro de leitura (Todas/Não lidas) quanto o de origem (Todos/Instrumento/
  Ata/Ordem de fornecimento) usam o padrão de "segmented buttons" (`Button` com
  `variant={ativo ? 'default' : 'outline'}`) já usado em `InstrumentosGestaoPage.tsx` para o filtro
  de tipo.
- **Rationale**: Mesmo padrão visual já estabelecido no projeto para filtros de poucas opções fixas
  (aqui, no máximo 4 opções de origem); evita introduzir um `Select` só para esta tela quando um
  padrão mais simples e já testado está disponível.
- **Alternativas consideradas**:
  - *`Select`/dropdown (como em `ArpGestaoPage.tsx`)*: viável, mas esse padrão no projeto é usado
    quando há mais opções (status + busca textual combinados); com poucas opções fixas, segmented
    buttons são mais diretos e visíveis sem exigir um clique extra para abrir o menu.

## 5. Agrupamento por período

- **Decision**: Três seções fixas — "Hoje" (mesma data do dispositivo do usuário), "Esta semana"
  (últimos 7 dias corridos, excluindo hoje) e "Mais antigas" (o restante). Implementado como função
  pura `agruparPorPeriodo(notificacoes, agora): { titulo: string; itens: Notificacao[] }[]`, testável
  isoladamente sem necessidade de mocks de API.
- **Rationale**: Convenção comum de calendário (mesma lógica usada por centrais de notificação
  populares), simples de testar unitariamente por ser uma função pura independente de React.
- **Alternativas consideradas**:
  - *Seções por mês/ano*: mais adequado a históricos muito longos; descartado por adicionar
    complexidade não pedida — pode ser revisitado se o volume real de notificações mostrar
    necessidade.
