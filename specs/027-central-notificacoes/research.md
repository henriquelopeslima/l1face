# Pesquisa: Central de Notificações no Frontend

Nenhum item do Contexto Técnico ficou marcado como `NEEDS CLARIFICATION` — o projeto já tem padrões
estabelecidos (feature `dashboard`, `AuthContext`, `apiClient`) que resolvem todas as decisões técnicas
necessárias. Este documento registra as decisões de design que não vêm diretamente da spec (que é
propositalmente agnóstica de tecnologia) e as alternativas descartadas.

## 1. Intervalo de polling (RF-009)

- **Decision**: Reconsultar `GET /api/notificacoes` (primeira página) a cada **60 segundos**, apenas
  enquanto houver uma sessão autenticada com licitante ativo (`NotificacoesProvider` montado).
- **Rationale**: 60s é um intervalo comum para indicadores "quase em tempo real" sem sobrecarregar o
  backend; a spec (CS-001) só exige que a contagem esteja correta "ao acessar qualquer tela", não
  necessariamente em tempo real. O usuário escolheu explicitamente "intervalo de tempo fixo" na
  clarificação da spec, descartando refetch por navegação ou só-ao-abrir.
- **Alternativas consideradas**:
  - *Refetch a cada navegação de rota*: rejeitado pela clarificação do usuário (spec.md, RF-009).
  - *WebSocket/push*: não há suporte no backend hoje (nenhum endpoint de push documentado na API);
    fora de escopo introduzir infraestrutura de tempo real nesta funcionalidade.
  - *Intervalo mais agressivo (ex.: 10s)*: descartado por gerar tráfego desnecessário sem benefício de
    UX perceptível para este domínio (notificações administrativas, não chat).

## 2. Compartilhamento de estado entre header e Configurações (RF-006)

- **Decision**: Um único `NotificacoesProvider` (React Context) monta o hook de polling/estado uma vez,
  na árvore autenticada (em torno de `RootLayout`, mesmo nível onde `AuthProvider` já envolve as rotas
  protegidas). `AppHeader` e `NotificacoesSection` consomem o mesmo `useNotificacoes()`.
- **Rationale**: Evita chamadas de rede duplicadas (uma por componente) e garante que marcar uma
  notificação como lida em uma tela atualize instantaneamente a contagem em qualquer outra tela — sem
  precisar sincronizar dois estados independentes. Segue o mesmo padrão já usado por `AuthContext`.
- **Alternativas consideradas**:
  - *Hook independente por componente (`useEffect` + `fetch` em cada um)*: rejeitado — duplicaria
    chamadas HTTP e criaria dessincronia de estado (RF-006 exige consistência).
  - *Estado global genérico (ex.: Redux/Zustand)*: rejeitado — o projeto não usa nenhuma lib de estado
    global hoje; Context Provider já é o padrão estabelecido (`AuthContext`) e é suficiente para o
    escopo (poucos consumidores, sem necessidade de seletores complexos).

## 3. Atualização otimista vs. re-fetch após marcar como lida

- **Decision**: Atualização otimista local do item no estado do Context (marca `lida: true` e
  decrementa a contagem imediatamente ao clicar), sem esperar a resposta do backend; em caso de erro na
  chamada `PATCH`, reverte o item para não lido e mantém erro silencioso (sem bloquear a UI).
- **Rationale**: A ação é idempotente e de baixo risco (spec, Cenário de Aceite 3 da História 2); UX
  melhor com feedback imediato. Evita esperar round-trip de rede para o usuário perceber o clique.
- **Alternativas consideradas**:
  - *Esperar resposta do backend antes de atualizar a UI*: rejeitado por adicionar latência perceptível
    sem ganho de correção (operação já é idempotente no backend).

## 4. Ícones/cores por `tipoOrigem`

- **Decision**: A feature `notificacoes` define seu próprio mapeamento local `tipoOrigem → ícone` na
  camada `presentation` (componente `NotificacaoItem`), replicando o padrão visual já usado em
  `DashboardPage.tsx` (que também mantém seu mapeamento local, não exportado).
- **Rationale**: O mapeamento é uma constante de 3 entradas (`instrumento`, `ata`, `of`); duplicá-la é
  mais barato e mais isolado (Princípio I da constituição) do que criar uma dependência cruzada entre as
  features `dashboard` e `notificacoes` só para reaproveitar 3 linhas. A cor de destaque em si já vem do
  backend (`conteudo.cor`), então o ícone é o único elemento puramente visual a decidir no frontend.
- **Alternativas consideradas**:
  - *Extrair o mapeamento para `shared/`*: rejeitado por ser prematuro — só há dois consumidores e a
    constituição favorece isolamento de feature sobre abstração antecipada.

## 5. Tratamento dos toggles de preferência em Configurações (RF-010)

- **Decision**: Os três toggles existentes em `NotificacoesSection` permanecem visíveis, porém
  renderizados em estado `disabled`, com um texto/badge "Em breve" ao lado da seção, sem qualquer
  chamada de API associada a eles.
- **Rationale**: Decisão explícita do usuário na clarificação da spec ("Manter, mas desabilitados com
  aviso"). Não requer nenhum novo endpoint nem estado — é puramente uma mudança de apresentação sobre
  o componente existente.
