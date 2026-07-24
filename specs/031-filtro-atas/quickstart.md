# Quickstart: Validando os Filtros na Gestão de Atas

Passos para validar manualmente a funcionalidade após a implementação (`/speckit-implement`),
cobrindo as três histórias de usuário da spec.

## Pré-requisitos

- Backend `l1core` rodando localmente com um usuário/licitante de teste com mais de 10 atas
  cadastradas (mais de um lote de 10), incluindo atas com os três status (`ATIVA`,
  `PROXIMA_AO_VENCIMENTO`, `ENCERRADA`), e pelo menos uma ata cujo número/órgão/objeto só
  apareceria em um lote além do primeiro (posição > 10 na ordenação por vigência final).
- Frontend `l1face` rodando (`npm run dev`), logado com esse usuário, na tela "Gestão de Atas"
  (`/atas/gestao`).

## História 1 — Buscar atas por texto livre (P1)

1. Sem nenhum filtro, confirmar que a tela mostra o primeiro lote (10 atas) como hoje.
2. Digitar um termo que só corresponde a uma ata **fora** do primeiro lote (ex.: um número ou
   trecho de objeto de uma ata na posição 15+) — confirmar que ela aparece no resultado sem
   precisar clicar em "Carregar mais" antes.
3. Digitar um termo que não corresponde a nenhuma ata — confirmar a mensagem "nenhum resultado
   encontrado" (não uma tabela vazia sem explicação).
4. Apagar o termo — confirmar que a lista volta a mostrar o primeiro lote completo, sem filtro.
5. Digitar rapidamente várias letras em sequência — confirmar (na aba Network do navegador) que
   apenas uma requisição é disparada após parar de digitar, não uma por tecla.

## História 2 — Filtrar atas por status (P2)

1. Selecionar cada uma das três opções de status (Ativas, Próximas ao Vencimento, Encerradas) —
   confirmar que só atas daquele status aparecem, incluindo atas que não estavam no primeiro lote.
2. Selecionar "Todas" — confirmar que o filtro de status é removido e a lista volta a incluir
   atas de qualquer status.

## História 3 — Combinar busca textual e filtro de status (P3)

1. Aplicar um termo de busca e um status ao mesmo tempo — confirmar que só atas que atendem às
   duas condições aparecem.
2. Trocar apenas o status mantendo o termo de busca — confirmar que o resultado se atualiza
   considerando os dois filtros juntos.

## Casos de borda a checar

- Aplicar um filtro (texto ou status) e clicar em "Carregar mais" — confirmar que o próximo lote
  buscado respeita o filtro ativo (não mistura atas fora do filtro).
- Com "Carregar mais" em andamento (rede lenta — simular em DevTools), trocar o filtro de status
  antes da resposta anterior chegar — confirmar que a lista final reflete só o filtro mais
  recente, sem itens duplicados ou do filtro anterior.
- Simular falha de rede ao aplicar um filtro (DevTools offline) — confirmar mensagem de erro
  amigável, sem travar a tela.
- Testar um termo de busca contendo `%` ou `_` — confirmar que é tratado como texto literal (não
  gera erro nem comportamento de wildcard inesperado).
- Confirmar que a tela de "Gestão de Instrumentos" e os seletores de Ata em "Cadastrar Contrato"/
  "Cadastrar Nota de Empenho" continuam funcionando exatamente como antes (fora do escopo desta
  feature).

## Verificação automatizada

- `npm run test -- atas` — roda os testes unitários de `AtasRepository.listarAtasPaginado`
  (query string com/sem `geral`/`status`), `useDebouncedValue` e o comportamento de
  `useListagemAtas` (reset de página ao trocar filtro, descarte de resposta desatualizada).
