# Pesquisa: Paginação em Gestão de Instrumentos e Gestão de Atas

Nenhum item do Contexto Técnico ficou marcado como `NEEDS CLARIFICATION`. Este documento registra
as decisões de design derivadas de restrições reais do backend (`l1core/docs/openapi.yaml`) e do
código atual do frontend, além de uma decisão confirmada com o usuário durante o planejamento.

## 1. Backend já suporta paginação opcional — sem mudança de contrato

- **Decision**: Os dois novos métodos de listagem paginada chamam `GET /api/instrumentos` e
  `GET /api/atas` sempre com `page` e `limit` explícitos (nunca omitidos), o que ativa o modo
  paginado da resposta (`{ data: [...], meta: { page, limit, total, totalPages } }`).
- **Rationale**: `l1core/docs/openapi.yaml` documenta que ambos os endpoints já aceitam `page`
  (padrão 1) e `limit` (padrão 10, teto 100) como query params opcionais — "informar este
  parâmetro ativa o modo paginado da resposta" (linhas ~2701-2748 para atas, ~3341-3390 para
  instrumentos). Sem esses parâmetros, a resposta é o array simples de sempre (comportamento atual,
  preservado para os consumidores que ainda precisam da lista completa — ver decisão #4).
- **Alternativas consideradas**:
  - *Pedir extensão de backend para paginação*: descartado — já existe, nenhuma mudança necessária
    em `l1core`.
  - *Usar o limite padrão da API (10)*: descartado em favor de 20, para manter consistência com o
    tamanho de lote já usado em `notificacoes` (028) — ver decisão #3.

## 2. Busca e filtros continuam client-side, apenas sobre os itens já carregados

- **Decision**: Assim como em 028, a busca por texto e os filtros (tipo em Instrumentos, status em
  Atas) são aplicados no frontend sobre o conjunto acumulado de itens já buscados via "Carregar
  mais". Nenhum novo parâmetro de busca/filtro é adicionado a `GET /api/instrumentos` ou
  `GET /api/atas`.
- **Rationale**: Confirmado nesta sessão de planejamento — a spec inicial assumia busca sobre "toda
  a base", mas nem `/api/instrumentos` nem `/api/atas` documentam parâmetros de busca ou filtro por
  tipo/status (só `X-Licitante-Id`, `page`, `limit`). Estender o backend para isso está fora do
  escopo desta feature (frontend-only, mesma decisão já tomada em 028 e agora explicitamente
  confirmada com o usuário do produto antes de prosseguir com o design). A spec (`spec.md`) foi
  atualizada para refletir essa decisão (RF-006, RF-007, RF-008, CS-003, CS-004 e o caso de borda de
  totais).
- **Implicação de UX documentada**: se o usuário buscar/filtrar um registro que só existe em um lote
  ainda não carregado, o resultado pode aparecer vazio (ou incompleto) até o usuário clicar em
  "Carregar mais" o suficiente. O botão "Carregar mais" continua disponível com base em
  `totalPaginas` (não no total pós-filtro), assim como em 028.
- **Alternativas consideradas**:
  - *Estender o backend com filtros de busca/tipo/status*: rejeitado nesta rodada — fora do escopo
    frontend-only desta feature; pode ser revisitado como uma feature de backend separada se o
    volume real de instrumentos/atas tornar a limitação inaceitável na prática.
  - *Buscar todas as páginas de uma vez ao digitar uma busca*: rejeitado — contradiz o objetivo
    central da feature (evitar carregar a coleção inteira) e poderia gerar N requisições em
    sequência para bases grandes.

## 3. Tamanho de lote: 20 registros, botão "Carregar mais" (não rolagem infinita nem paginação numerada)

- **Decision**: Ambas as telas usam `limit=20` por carregamento e um botão explícito "Carregar
  mais", reaproveitando exatamente o padrão de `useListagemNotificacoes` (028).
- **Rationale**: Nenhuma tela no projeto usa rolagem infinita; "Carregar mais" já é o padrão
  estabelecido para acumulação incremental sob demanda. Usar o mesmo tamanho de lote (20, acima do
  padrão de 10 da API, mas bem abaixo do teto de 100) mantém consistência perceptível de UX entre
  telas de listagem do sistema, sem exigir nova decisão de design.
- **Alternativas consideradas**:
  - *Paginação numérica clássica (com números de página)*: rejeitada pelo mesmo motivo de 028 —
    misturaria "página do servidor" com "resultado pós-filtro" exibido, confundindo o usuário
    quando busca/filtro reduz a lista visível.
  - *Usar o `limit` padrão da API (10)*: rejeitado — quebraria a consistência de UX com a tela de
    notificações sem ganho claro.

## 4. `useListarAtas()` (lista completa) precisa continuar existindo — Atas ganha um hook/método paralelo

- **Decision**: Ao contrário de Instrumentos (onde o único consumidor de `listarInstrumentos()` é a
  própria tela de Gestão, podendo ser substituído diretamente), `useListarAtas()` também é usado por
  `CadastrarContrato.tsx` e `CadastrarNotaEmpenho.tsx` para popular seletores de Ata — esses fluxos
  precisam da lista completa de atas, não de um lote paginado. Por isso, a feature `atas` ganha um
  método de repositório novo e segregado (`listarAtasPaginado`), um novo Use Case
  (`ListarAtasPaginadoUseCase`) e um novo hook (`useListagemAtas`), em vez de alterar a assinatura
  ou o comportamento de `listarAtas()`/`useListarAtas()`, que permanecem intocados.
- **Rationale**: Alterar `listarAtas()` para retornar um envelope paginado (ou um tipo de retorno
  ambíguo `Ata[] | ListaAtas`) quebraria silenciosamente os dois formulários de cadastro, que
  esperam sempre o array completo. Interface Segregation (Princípio II da constituição) recomenda
  métodos granulares por formato de consumo em vez de uma única interface "genérica e abrangente".
- **Alternativas consideradas**:
  - *Sobrecarregar `listarAtas(params?)` com retorno condicional*: rejeitado — união de tipos de
    retorno dependente de parâmetro de entrada é um padrão frágil em TypeScript estrito (o chamador
    precisa de type narrowing manual) e viola a preferência por tipagem explícita e previsível.
  - *Fazer os formulários de Cadastro também paginarem/carregarem sob demanda*: rejeitado — está
    fora do escopo desta feature (que é sobre as telas de Gestão) e mudaria o comportamento de
    seletores que hoje esperam a lista completa disponível de imediato.

## 5. Cartões de resumo da tela de Instrumentos: "Total na base" exato, contagem por tipo aproximada

- **Decision**: O cartão "Total na base" usa `meta.total` da resposta paginada (sempre exato,
  independente de quantos lotes foram carregados). Os cartões "Contratos" e "Notas de empenho"
  (contagem por tipo) passam a refletir a contagem entre os itens já carregados no cliente, não o
  total real por tipo na base.
- **Rationale**: Nem `/api/instrumentos` nem `/api/atas` oferecem um endpoint de contagem agregada
  por tipo/status, e essa feature não introduz um. `meta.total` do envelope paginado dá o total
  geral de forma exata sem custo extra (já vem em toda resposta paginada); uma contagem exata por
  tipo exigiria uma chamada adicional dedicada (fora do escopo, já que a decisão #2 confirmou que
  filtros por tipo não fazem parte desta feature no backend). Isso é consistente com a mesma escolha
  frontend-only aplicada à busca/filtro.
- **Alternativas consideradas**:
  - *Adicionar endpoint de contagem agregada por tipo em `l1core`*: rejeitado — expande o escopo
    para o backend, mesma razão da decisão #2.
  - *Remover os cartões de contagem por tipo*: rejeitado — remove informação hoje visível ao
    usuário sem necessidade; manter com rótulo/indicação de que é sobre os itens carregados é menos
    disruptivo.
