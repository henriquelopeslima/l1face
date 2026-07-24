# Quickstart: Validando a Tela de Todas as Notificações

Passos para validar manualmente a funcionalidade após a implementação (`/speckit-implement`),
cobrindo as três histórias de usuário da spec.

## Pré-requisitos

- Backend `l1core` rodando localmente com um usuário de teste com notificações suficientes para
  cobrir múltiplas páginas (mais de 20) e datas variadas (hoje, esta semana, mais antigas), lidas e
  não lidas, de origens diferentes (instrumento, ata, ordem de fornecimento).
- Frontend `l1face` rodando (`npm run dev`), logado com esse usuário.

## História 1 — Ver todas as notificações organizadas por data (P1)

1. A partir da dashboard, clicar em "Ver todos" no card "Alertas e pendências" — confirmar que leva
   à nova tela de notificações (não mais para `/instrumentos/gestao`).
2. Confirmar que a tela mostra notificações agrupadas em seções (ex.: Hoje, Esta semana, Mais
   antigas), com a mais recente primeiro dentro de cada seção.
3. Clicar em "Carregar mais" (se houver mais de uma página) e confirmar que os itens já visíveis
   permanecem e novos itens mais antigos são adicionados às seções corretas.
4. Com um usuário sem nenhuma notificação, confirmar que aparece uma mensagem clara de "nenhuma
   notificação", sem seções vazias.
5. Clicar em uma notificação de instrumento ou ata: confirmar que ela é marcada como lida e o
   usuário é levado à página de detalhes correspondente.
6. A partir do sino do cabeçalho, confirmar que existe um atalho ("Ver todas") levando à mesma tela.

## História 2 — Filtrar por status de leitura (P2)

1. Selecionar o filtro "Não lidas" e confirmar que só notificações não lidas aparecem, mantendo o
   agrupamento por data.
2. Marcar uma notificação como lida enquanto o filtro "Não lidas" está ativo — confirmar que ela
   some da lista filtrada.
3. Voltar para "Todas" e confirmar que a notificação marcada aparece, já como lida.
4. Acionar "Marcar todas como lidas" nesta tela e confirmar que a contagem de não lidas no sino do
   cabeçalho também zera (sem precisar recarregar a página).

## História 3 — Filtrar por tipo de origem (P3)

1. Selecionar cada filtro de origem (Instrumento, Ata, Ordem de fornecimento) isoladamente e
   confirmar que só notificações daquela origem aparecem.
2. Combinar um filtro de origem com o filtro "Não lidas" e confirmar que a lista respeita as duas
   condições.
3. Escolher uma combinação de filtros sem nenhum resultado e confirmar que a mensagem exibida é
   específica ("nenhuma notificação para este filtro"), distinta da mensagem de "nenhuma
   notificação" geral.

## Casos de borda a checar

- Trocar de licitante ativo enquanto está nesta tela — confirmar que a lista recarrega do zero para
  o novo licitante, sem misturar notificações do licitante anterior nem manter páginas antigas
  acumuladas.
- Simular falha de rede ao carregar (DevTools offline) — confirmar estado de erro com opção de
  tentar novamente, sem quebrar a tela.
- Notificação cujo instrumento/ata foi excluído — confirmar que o clique não quebra a tela (mesmo
  tratamento já validado em 027).

## Verificação automatizada

- `npm run test -- notificacoes` — roda os testes unitários da extensão do
  `ListarNotificacoesUseCase` e da função pura `agruparPorPeriodo`.
