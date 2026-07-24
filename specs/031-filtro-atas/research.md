# Pesquisa: Filtros na Gestão de Atas

Nenhum item do Contexto Técnico ficou marcado como `NEEDS CLARIFICATION`. Este documento registra
as decisões de design derivadas do backend (`l1core/docs/openapi.yaml`) e do código atual do
frontend (`useListagemAtas`/`ArpGestaoPage`, introduzidos em 029-paginacao-instrumentos-atas).

## 1. `GET /api/atas` já suporta `geral` e `status` — filtros passam a ser resolvidos no servidor

- **Decision**: `listarAtasPaginado` passa a enviar os parâmetros de query opcionais `geral`
  (busca textual) e `status` para `GET /api/atas`, em vez de filtrar apenas em memória sobre os
  itens já acumulados.
- **Rationale**: `l1core/docs/openapi.yaml` (linhas ~2718-2724 e ~2757-2774) documenta que o
  endpoint já aceita `geral` (busca por trecho, case-insensitive, com OR entre `numero`,
  `orgao_gerenciador.nome` e `objeto`) e `status` (um único valor de `AtaStatus`), combináveis
  entre si e com a paginação — `meta.total`/`meta.totalPages` já refletem a contagem filtrada.
  Isso supera a decisão #2 de `specs/029-paginacao-instrumentos-atas/research.md`, que havia fixado
  filtro client-side por não existirem esses parâmetros na API **naquele momento**; a API evoluiu
  desde então especificamente para viabilizar esta feature.
- **Alternativas consideradas**:
  - *Manter filtro client-side sobre os itens acumulados (comportamento atual)*: rejeitado — é
    exatamente a limitação que esta feature existe para corrigir (RF-001/RF-002 da spec exigem
    considerar o conjunto completo de atas, não só as já carregadas).
  - *Buscar todas as páginas ao aplicar um filtro e filtrar em memória*: rejeitado — contradiz o
    objetivo da paginação em lotes (029) e gera N requisições em sequência para bases grandes,
    quando a API já resolve isso em uma única chamada por lote.

## 2. Status inválido (`422`) não deve ocorrer na prática, mas o repositório trata defensivamente

- **Decision**: `status` só é enviado quando o usuário seleciona um dos três valores reais de
  `AtaStatus` (o sentinel de UI `'todas'` nunca é enviado — vira `undefined`). Ainda assim,
  `AtasRepository.listarAtasPaginado` trata `response.status === 422` lançando `AtaError`, seguindo
  o mesmo padrão defensivo já usado nos demais métodos do repositório.
- **Rationale**: O `Select` de status da tela já restringe a escolha aos três valores válidos
  (`ATIVA`, `PROXIMA_AO_VENCIMENTO`, `ENCERRADA`) mais "Todas" — não há como o usuário digitar um
  valor arbitrário. O tratamento de `422` é defensivo (documentado pela API) e consistente com o
  restante do repositório, sem custo adicional de complexidade.
- **Alternativas consideradas**: nenhuma — é a extensão natural do padrão já usado nos demais
  métodos de `AtasRepository`.

## 3. Debounce da busca textual: hook novo e genérico em `shared/`, não lógica ad-hoc na página

- **Decision**: Criar `useDebouncedValue<T>(value: T, delayMs = 400): T` em
  `src/shared/hooks/useDebouncedValue.ts` e usá-lo **dentro** de `useListagemAtas`, não em
  `ArpGestaoPage`. A página permanece "burra": só chama `setSearchTerm`/`setStatusFilter`
  expostos pelo hook.
- **Rationale**: Não existe utilitário de debounce no projeto (`src/shared/hooks/` só tem
  `useMobile.ts`). Debounce é uma preocupação de UI genérica e reaproveitável (Princípio II —
  Open/Closed), então vira um hook próprio em vez de `setTimeout` inline. Centralizar o debounce
  dentro de `useListagemAtas` (em vez de na página) respeita o Princípio III da constituição —
  hooks customizados concentram toda lógica de estado/efeitos da feature, mantendo
  `ArpGestaoPage` puramente apresentacional.
- **Alternativas consideradas**:
  - *Debounce inline em `ArpGestaoPage` com `useEffect`+`setTimeout`*: rejeitado — mistura lógica
    de estado complexa no componente de página, violando o Princípio III (hooks customizados
    obrigatórios para lógica além de estado trivial).
  - *Bibliotecas externas de debounce (`lodash.debounce`, `use-debounce`)*: rejeitado — nenhuma
    dependência nova é necessária para uma função de ~10 linhas; o projeto não usa `lodash` hoje.

## 4. Evitar condição de corrida entre "Carregar mais" e troca de filtro

- **Decision**: `useListagemAtas` mantém um contador de requisição (`requestIdRef`, incrementado
  a cada chamada de `carregarPagina`) e só aplica o resultado de uma resposta se o `requestId`
  capturado no início daquela chamada ainda for o mais recente quando a resposta chegar. Respostas
  desatualizadas (de uma busca de "Carregar mais" ou filtro anterior que resolveu depois de uma
  mais nova) são descartadas silenciosamente.
- **Rationale**: O caso de borda da spec ("o que acontece quando o usuário troca o filtro enquanto
  uma busca de 'carregar mais' está em andamento?") exige que o resultado final reflita sempre o
  filtro mais recente, mesmo que a requisição antiga responda depois da nova (rede lenta,
  reordenação). Um contador monotônico é a forma mais simples de garantir isso sem introduzir
  `AbortController` (que exigiria propagar `signal` por `apiFetch`, hoje sem esse suporte).
- **Alternativas consideradas**:
  - *`AbortController` cancelando a requisição anterior*: mais "correto" no sentido de nem gastar
    banda com a resposta descartada, mas exige estender `apiFetch`/`fetch` com `signal` em todo o
    projeto — fora do escopo desta feature pontual. Pode ser revisitado como melhoria futura
    transversal.
  - *Desabilitar os campos de filtro enquanto uma requisição está em andamento*: rejeitado —
    prejudica a UX de digitação contínua (o usuário não poderia continuar refinando o termo
    enquanto a busca anterior ainda carrega).

## 5. Reset de paginação ao trocar filtro: sempre volta para a página 1

- **Decision**: Toda mudança em `searchTerm` (após debounce) ou `statusFilter` dispara
  `carregarPagina(1, substituir=true)`, descartando os itens acumulados anteriores — mesmo padrão
  de "recarregar do zero" já usado por `refetch()`.
- **Rationale**: RF-004 da spec exige reiniciar a paginação ao trocar filtros; misturar itens de
  filtros diferentes na mesma lista acumulada não faz sentido (não existe uma "página 2 do filtro
  A" equivalente à "página 2 do filtro B").
- **Alternativas consideradas**: nenhuma alternativa razoável — é o comportamento exigido pela
  spec e o único que preserva a corretude da lista exibida.

## 6. `useListarAtas()` (lista completa, sem paginação/filtro) permanece intocado

- **Decision**: Os filtros desta feature existem só em `useListagemAtas` (usado por
  `ArpGestaoPage`). `useListarAtas()`/`ListarAtasUseCase`/`listarAtas()` — consumidos pelos
  seletores de Ata em `CadastrarContrato.tsx` e `CadastrarNotaEmpenho.tsx` — não são alterados.
- **Rationale**: Mesma decisão #4 de `specs/029-paginacao-instrumentos-atas/research.md`, ainda
  válida: esses formulários precisam da lista completa de atas para popular seletores, não de uma
  listagem filtrada/paginada.
- **Alternativas consideradas**: nenhuma — fora do escopo desta feature (que é só a tela de
  Gestão de Atas, conforme a entrada do usuário).

## 7. Construção da query string: `URLSearchParams` em vez de template literal manual

- **Decision**: `AtasRepository.listarAtasPaginado` monta a query string com `URLSearchParams`
  (`page`, `limit` sempre presentes; `geral`/`status` só quando informados), em vez de
  concatenação manual de template literal.
- **Rationale**: Com até 4 parâmetros opcionais/obrigatórios, `URLSearchParams` evita condicionais
  aninhadas na string e cuida do percent-encoding automaticamente (inclusive de `%`/`_`, que RF de
  `l1core` já trata como literais do lado do servidor — o encoding do transporte não afeta esse
  comportamento). É uma mudança local ao método, sem alterar a convenção dos demais métodos do
  repositório (que continuam usando template literal simples, por não terem parâmetros opcionais).
- **Alternativas consideradas**: *Concatenação manual condicional* (`` `/api/atas?page=${page}&limit=${limit}${geral ? ... : ''}...` ``) — rejeitada por ficar difícil de ler/manter com múltiplos
  parâmetros opcionais.
