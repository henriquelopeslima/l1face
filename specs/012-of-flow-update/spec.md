# Especificação de Funcionalidade: Atualização do Fluxo de Ordens de Fornecimento

**Branch da Funcionalidade**: `012-of-flow-update`  
**Criado em**: 2026-06-15  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Eu quero alterar o fluxo de OF para obedecer as novas necessidades que foram implementadas pelo backend."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Emitir Ordem de Fornecimento com novos campos (Prioridade: P1)

O licitante acessa a página de detalhes de um instrumento e emite uma nova Ordem de Fornecimento (OF) informando a data de recebimento, o prazo de entrega e os itens a serem fornecidos com suas quantidades. O valor unitário de cada item é derivado automaticamente do instrumento — o licitante não precisa mais informá-lo manualmente.

**Por que esta prioridade**: É o ponto de entrada do ciclo de entrega. Sem a emissão correta da OF com os campos atualizados, nenhuma etapa subsequente pode ser realizada.

**Teste Independente**: Pode ser testado completamente criando uma OF com `data_recebimento`, `prazo_entrega` e ao menos um item (apenas `item_instrumento_id` + `quantidade_fornecida`). A OF deve aparecer listada com status `pedido_recebido` e valor total calculado automaticamente pelo backend.

**Cenários de Aceite**:

1. **Dado** que o licitante está na página de detalhes de um instrumento com itens cadastrados,
   **Quando** clica em "Emitir Ordem de Fornecimento" e informa `data_recebimento`, `prazo_entrega` e ao menos um item com quantidade,
   **Então** a OF é criada com status `pedido_recebido`, o valor total é calculado automaticamente e o saldo remanescente do instrumento é atualizado.

2. **Dado** que o licitante preenche o formulário de OF com `prazo_entrega` anterior a `data_recebimento`,
   **Quando** tenta confirmar,
   **Então** o sistema exibe uma mensagem de erro informando que o prazo de entrega deve ser igual ou posterior à data de recebimento.

3. **Dado** que o licitante tenta emitir uma OF sem selecionar nenhum item,
   **Quando** tenta confirmar,
   **Então** o botão de confirmação permanece desabilitado ou o sistema exibe validação impedindo o envio.

4. **Dado** que o licitante seleciona uma quantidade que excede o saldo disponível do item,
   **Quando** confirma a emissão,
   **Então** o sistema exibe mensagem de erro sobre quantidade insuficiente do item.

---

### História de Usuário 2 - Iniciar Separação da OF (Prioridade: P2)

O licitante acessa os detalhes de uma OF com status `pedido_recebido` e inicia a separação dos itens, informando a data de início da separação. A OF avança para o status `em_separacao`.

**Por que esta prioridade**: Representa a segunda etapa do ciclo de entrega. É necessária para que o fluxo progrida após a emissão da OF.

**Teste Independente**: Pode ser testado selecionando uma OF com status `pedido_recebido`, informando uma `data_separacao` válida e confirmando. A OF deve exibir status `em_separacao` e a data de separação registrada.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `pedido_recebido`,
   **Quando** o licitante informa uma `data_separacao` válida (>= `data_recebimento`) e confirma,
   **Então** a OF avança para `em_separacao` e a data de separação é exibida na interface.

2. **Dado** que uma OF não está com status `pedido_recebido`,
   **Quando** o licitante tenta iniciar a separação,
   **Então** a ação não está disponível na interface (botão oculto ou desabilitado).

3. **Dado** que o licitante informa uma `data_separacao` anterior à `data_recebimento`,
   **Quando** tenta confirmar,
   **Então** o sistema exibe mensagem de erro de validação de data.

---

### História de Usuário 3 - Registrar Despacho da OF (Prioridade: P2)

O licitante registra o despacho/envio dos itens informando a data de despacho (obrigatória) e opcionalmente o código de rastreio e o número da nota fiscal do despacho. A OF avança para o status `despachado`.

**Por que esta prioridade**: Terceira etapa do ciclo. Permite rastrear o envio com informações logísticas opcionais.

**Teste Independente**: Pode ser testado selecionando uma OF com status `em_separacao`, informando uma `data_despacho` válida e confirmando. O código de rastreio e NF são opcionais e devem ser exibidos quando presentes.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `em_separacao`,
   **Quando** o licitante informa a `data_despacho` e confirma (sem código de rastreio nem NF),
   **Então** a OF avança para `despachado` e a data de despacho é exibida.

2. **Dado** que o licitante também informa `codigo_rastreio` e `numero_nf` ao registrar o despacho,
   **Quando** confirma,
   **Então** a OF avança para `despachado` e os campos opcionais são exibidos nos detalhes da OF.

3. **Dado** que uma OF não está com status `em_separacao`,
   **Quando** o licitante tenta registrar o despacho,
   **Então** a ação não está disponível na interface.

---

### História de Usuário 4 - Confirmar Entrega da OF (Prioridade: P2)

O licitante confirma a entrega dos itens informando a data de entrega e o prazo de pagamento (ambos obrigatórios). A OF avança para `entregue` e o status de pagamento passa a `pendente`.

**Por que esta prioridade**: Quarta etapa do ciclo. A confirmação de entrega ativa o rastreamento do pagamento.

**Teste Independente**: Pode ser testado selecionando uma OF com status `despachado`, informando `data_entrega` e `prazo_pagamento` válidos e confirmando. A OF deve exibir status `entregue` e `status_pagamento: pendente`.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `despachado`,
   **Quando** o licitante informa `data_entrega` e `prazo_pagamento` válidos e confirma,
   **Então** a OF avança para `entregue`, exibe a data de entrega, o prazo de pagamento e `status_pagamento: pendente`.

2. **Dado** que o licitante informa um `prazo_pagamento` anterior à `data_entrega`,
   **Quando** tenta confirmar,
   **Então** o sistema exibe mensagem de erro de validação de data.

3. **Dado** que uma OF não está com status `despachado`,
   **Quando** o licitante tenta confirmar a entrega,
   **Então** a ação não está disponível na interface.

---

### História de Usuário 5 - Registrar Pagamento Efetivo da OF (Prioridade: P3)

O licitante registra a data do pagamento efetivo de uma OF com status `entregue`, finalizando o ciclo com status `pago`. Não é necessário registrar liquidação previamente.

**Por que esta prioridade**: Finaliza o ciclo financeiro da OF. Pode ser construído após as demais etapas estarem operacionais.

**Teste Independente**: Pode ser testado selecionando uma OF com status `entregue`, informando a `data_pagamento_efetivo` e confirmando. A OF deve exibir status `pago` e `status_pagamento: pago`.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `entregue`,
   **Quando** o licitante informa a `data_pagamento_efetivo` e confirma,
   **Então** a OF transita para status `pago` e exibe `status_pagamento: pago`.

2. **Dado** que uma OF não está com status `entregue`,
   **Quando** o licitante tenta registrar o pagamento,
   **Então** a ação não está disponível na interface.

---

### Casos de Borda

- O que acontece quando o licitante informa uma data de separação igual à data de recebimento? (deve ser aceita — a regra é >= e não >)
- Como o sistema exibe o `status_pagamento: em_atraso` quando o prazo de pagamento for ultrapassado sem pagamento efetivo?
- O que ocorre se o código de rastreio for uma string vazia ao registrar o despacho?
- Como o fluxo se comporta se o backend retorna um erro de transição inválida (ex.: tentar separação em uma OF já despachada)?
- O formulário de emissão de OF deve bloquear a seleção de itens sem saldo disponível?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE permitir a emissão de uma OF informando apenas `data_recebimento`, `prazo_entrega` e os itens com `item_instrumento_id` e `quantidade_fornecida` — o valor unitário é derivado automaticamente do instrumento pelo backend.
- **RF-002**: O sistema DEVE validar que `prazo_entrega` é igual ou posterior à `data_recebimento` antes de enviar a requisição.
- **RF-003**: O sistema DEVE permitir iniciar a separação de uma OF no status `pedido_recebido`, exigindo o campo `data_separacao` (>= `data_recebimento`).
- **RF-004**: O sistema DEVE permitir registrar o despacho de uma OF no status `em_separacao`, exigindo `data_despacho` (obrigatória) e permitindo `codigo_rastreio` e `numero_nf` (opcionais).
- **RF-005**: O sistema DEVE permitir confirmar a entrega de uma OF no status `despachado`, exigindo `data_entrega` e `prazo_pagamento` (ambos obrigatórios e em ordem cronológica).
- **RF-006**: O sistema DEVE permitir registrar o pagamento efetivo de uma OF no status `entregue`, exigindo `data_pagamento_efetivo`, transitando a OF para `pago`.
- **RF-007**: O sistema DEVE exibir apenas as ações disponíveis para o status atual de cada OF, ocultando ou desabilitando ações não aplicáveis ao status corrente.
- **RF-008**: O sistema DEVE exibir erros retornados pelo backend de forma compreensível ao usuário, sem expor códigos técnicos como `TRANSICAO_STATUS_INVALIDA` ou `DATA_CRONOLOGICA_INVALIDA`.
- **RF-009**: O sistema NÃO DEVE incluir o fluxo de liquidação (endpoint `/liquidacao`) nesta iteração — este passo está fora do escopo.
- **RF-010**: O sistema DEVE remover o campo de valor unitário do formulário de emissão de OF, pois este passa a ser calculado automaticamente pelo backend.

### Entidades Principais

- **OrdemFornecimento**: Representa uma entrega parcial ou total de um instrumento. Possui código sequencial por instrumento, status operacional (`pedido_recebido`, `em_separacao`, `despachado`, `entregue`, `pago`), datas (recebimento, separação, despacho, entrega, pagamento), prazo de entrega, prazo de pagamento, código de rastreio, número de NF do despacho, status de pagamento (`pendente`, `em_atraso`, `pago`), valor total e itens fornecidos.
- **ItemOrdemFornecimento**: Item de uma OF com referência ao item do instrumento, quantidade fornecida, valor unitário (derivado do instrumento) e valor total.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O licitante consegue emitir uma OF preenchendo apenas data de recebimento, prazo de entrega e itens com quantidade, sem precisar informar valor unitário manualmente.
- **CS-002**: O ciclo completo `emissão → separação → despacho → entrega → pagamento` pode ser concluído inteiramente pela interface sem necessidade de suporte.
- **CS-003**: Cada transição de status é refletida na interface em menos de 3 segundos após confirmação.
- **CS-004**: O sistema impede visualmente (oculta ou desabilita botões) que o usuário tente executar transições de status inválidas para o estado atual da OF.
- **CS-005**: Mensagens de erro de validação de datas e de saldo/quantidade são exibidas de forma clara antes do envio da requisição ao backend sempre que possível.

## Premissas

- O licitante já possui instrumentos cadastrados com itens antes de emitir OFs.
- A autenticação e o contexto do licitante (`X-Licitante-Id`) são gerenciados pela infraestrutura existente.
- Todos os novos endpoints de OF (`/separacao`, `/despacho`, `/entrega`, `/pagamento`) estão implementados e operacionais no backend conforme o OpenAPI especificado.
- O endpoint de criação de OF foi atualizado no backend para aceitar apenas `data_recebimento`, `prazo_entrega` e `itens` (sem `valor_unitario`).
- O fluxo de liquidação (`/liquidacao`) está fora do escopo desta especificação e não será implementado agora.
- A interface existente de detalhes do instrumento (contratos e empenhos) será estendida — não será criada uma nova página separada.
- A arquitetura Clean Architecture existente no projeto (domain/data/presentation) será seguida de forma consistente.
