# Quickstart: Validando a Central de Notificações

Passos para validar manualmente a funcionalidade após a implementação (`/speckit-implement`), cobrindo
as três histórias de usuário da spec.

## Pré-requisitos

- Backend `l1core` rodando localmente com um usuário de teste que tenha notificações reais cadastradas
  para o licitante ativo (ao menos uma lida e uma não lida, de origens diferentes: `instrumento`, `ata`,
  `of`).
- Frontend `l1face` rodando (`npm run dev`), logado com esse usuário.

## História 1 — Sino do cabeçalho com dados reais (P1)

1. Fazer login e aguardar a dashboard carregar.
2. Abrir o sino de notificações no cabeçalho.
3. Verificar que:
   - A quantidade no badge do sino corresponde exatamente ao número de notificações não lidas do
     usuário (comparar com `GET /api/notificacoes` via ferramenta de rede do navegador).
   - Os itens exibidos (título, descrição, cor) correspondem aos dados retornados pelo backend — não
     há mais os três itens fixos ("Contrato 042/2024...", "Ata de registro...", "Pagamento
     processado...").
4. Com um usuário sem nenhuma notificação: abrir o sino e confirmar que aparece uma mensagem de "sem
   notificações" (não uma lista vazia sem explicação) e nenhum badge de contagem.

## História 2 — Marcar como lida (P2)

1. Com notificações não lidas visíveis no sino, clicar em uma delas.
2. Confirmar que o badge de contagem decrementa em 1 imediatamente.
3. Recarregar a página (F5) e reabrir o sino — confirmar que a notificação clicada continua marcada
   como lida (persistiu no backend, não é só um efeito visual local).
4. Clicar em "marcar todas como lidas" (ou ação equivalente no sino) e confirmar que o badge zera.
5. Repetir o clique em "marcar todas como lidas" sem notificações pendentes — confirmar que não há erro
   (operação idempotente).

## História 3 — Alertas reais em Configurações (P3)

1. Acessar Configurações → seção "Notificações".
2. Confirmar que a lista "Alertas recentes" mostra as mesmas notificações reais (não mais os três itens
   fixos), com o mesmo estado de lida/não lida do sino do cabeçalho.
3. Marcar uma notificação como lida a partir do sino do cabeçalho, navegar até Configurações e confirmar
   que ela já aparece como lida ali (consistência entre telas — RF-006, sem precisar recarregar a
   página).
4. Confirmar que os três toggles de preferência ("Contratos próximos ao vencimento", "Pendências
   financeiras", "E-mail diário") aparecem desabilitados, com indicação de "em breve", e que nenhuma
   chamada de rede é feita ao clicar neles.

## Casos de borda a checar

- Trocar de licitante ativo (menu "Mudar licitante") e confirmar que o sino/Configurações recarregam
  para mostrar apenas notificações do novo licitante (nunca uma mistura).
- Simular falha de rede (offline no DevTools) ao abrir o sino — confirmar que a UI não quebra e mostra
  um estado de erro/vazio gracioso.

## Verificação automatizada

- `npm run test:watch -- notificacoes` — roda os testes unitários dos Use Cases
  (`ListarNotificacoesUseCase`, `MarcarNotificacaoLidaUseCase`, `MarcarTodasNotificacoesLidasUseCase`).
