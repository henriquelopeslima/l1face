# Quickstart: Validando a Paginação em Gestão de Instrumentos e Gestão de Atas

Passos para validar manualmente a funcionalidade após a implementação (`/speckit-implement`),
cobrindo as três histórias de usuário da spec.

## Pré-requisitos

- Backend `l1core` rodando localmente com um usuário/licitante de teste com mais de 20 instrumentos
  (mistura de contratos e empenhos) e mais de 20 atas cadastradas, para garantir múltiplos lotes.
- Frontend `l1face` rodando (`npm run dev`), logado com esse usuário.

## História 1 — Carregar instrumentos em lotes (P1)

1. Abrir "Gestão de Instrumentos" (`/instrumentos/gestao`) — confirmar que apenas os primeiros 20
   instrumentos aparecem inicialmente e que a tela fica pronta rapidamente (sem esperar a base
   inteira carregar).
2. Clicar em "Carregar mais" — confirmar que o próximo lote é adicionado ao final da lista já
   exibida, sem recarregar nem resetar a rolagem.
3. Continuar clicando até esgotar os lotes — confirmar que o botão "Carregar mais" desaparece ou
   fica desabilitado quando não há mais registros.
4. Com um licitante de teste que tenha 20 instrumentos ou menos, confirmar que todos aparecem de
   uma vez e nenhum botão "Carregar mais" é exibido.
5. Confirmar que o cartão "Total na base" mostra o total real de instrumentos mesmo antes de
   carregar todos os lotes.

## História 2 — Carregar atas em lotes (P1)

1. Abrir "Gestão de Atas" — confirmar que apenas as primeiras 20 atas aparecem inicialmente.
2. Clicar em "Carregar mais" — confirmar acumulação sem perder a posição de rolagem.
3. Esgotar os lotes — confirmar que "Carregar mais" some/desabilita.
4. Confirmar que os seletores de Ata em "Cadastrar Contrato" e "Cadastrar Nota de Empenho"
   continuam mostrando a lista completa de atas (não paginada) — essa parte não deve mudar de
   comportamento.

## História 3 — Buscar e filtrar com paginação (P2)

1. Em Gestão de Instrumentos, digitar um termo de busca que corresponda a um instrumento já
   carregado — confirmar que o resultado aparece imediatamente.
2. Digitar um termo de busca que só existe em um lote ainda não carregado — confirmar que a lista
   filtrada aparece vazia (ou incompleta) e que "Carregar mais" continua disponível; clicar até o
   registro aparecer.
3. Aplicar o filtro "Contratos"/"Empenhos" (Instrumentos) ou o filtro de status (Atas), depois
   clicar em "Carregar mais" — confirmar que o filtro continua aplicado aos novos itens carregados.
4. Trocar de filtro (ex.: de "Contratos" para "Empenhos") com múltiplos lotes já carregados —
   confirmar que a listagem reinicia do primeiro lote do novo filtro.
5. Limpar busca/filtro — confirmar que a paginação acumulada permanece consistente (não duplica
   nem perde itens).

## Casos de borda a checar

- Simular falha de rede ao clicar em "Carregar mais" (DevTools offline) — confirmar mensagem de
  erro com opção de tentar novamente, preservando os itens já carregados.
- Licitante sem nenhum instrumento/ata cadastrada — confirmar estado vazio já existente, sem botão
  "Carregar mais".
- Cadastrar um novo instrumento/ata durante a navegação — confirmar que o novo registro só aparece
  ao recarregar a tela (sem necessidade de atualização em tempo real).

## Verificação automatizada

- `npm run test -- instrumentos` — roda os testes unitários de `ListarInstrumentosUseCase` e dos
  mappers do envelope paginado de instrumentos.
- `npm run test -- atas` — roda os testes unitários de `ListarAtasPaginadoUseCase` e dos mappers do
  envelope paginado de atas (confirma também que `ListarAtasUseCase`/`listarAtas()` permanecem
  inalterados).
