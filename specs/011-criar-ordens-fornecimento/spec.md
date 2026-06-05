# Especificação de Funcionalidade: Ordens de Fornecimento

**Branch da Funcionalidade**: `011-criar-ordens-fornecimento`  
**Criado em**: 2026-06-04  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "eu quero criar ordens de serviço usando o que foi feito pela api"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Emitir Ordem de Fornecimento (Prioridade: P1)

O licitante acessa a página de detalhes de um instrumento (contrato ou empenho) e emite uma nova
Ordem de Fornecimento (OF) selecionando os itens do instrumento, a quantidade a fornecer e o
valor unitário. A OF é criada com status inicial `pedido_recebido` e um código sequencial.

**Por que esta prioridade**: Sem a emissão de OFs, o licitante não consegue registrar entregas
parciais nem controlar o consumo do saldo do instrumento. É o ponto de entrada de todo o ciclo.

**Teste Independente**: Pode ser testado completamente criando um instrumento com itens e
emitindo uma OF — a OF aparece listada com código 1, status `pedido_recebido` e o saldo do
instrumento é reduzido proporcionalmente.

**Cenários de Aceite**:

1. **Dado** que o licitante está na página de detalhes de um contrato com itens e saldo disponível,
   **Quando** clica em "Emitir Ordem de Fornecimento" e preenche ao menos um item com quantidade e valor,
   **Então** a OF é criada, aparece na listagem com código sequencial e status `pedido_recebido`, e o saldo remanescente é atualizado.

2. **Dado** que o licitante tenta emitir uma OF cujo valor total excede o saldo remanescente do instrumento,
   **Quando** confirma a emissão,
   **Então** o sistema exibe uma mensagem de erro informando saldo insuficiente e não cria a OF.

3. **Dado** que o licitante está no formulário de emissão de OF,
   **Quando** não seleciona nenhum item,
   **Então** o botão de confirmação permanece desabilitado ou o sistema exibe uma mensagem de validação.

---

### História de Usuário 2 - Visualizar Ordens de Fornecimento do Instrumento (Prioridade: P1)

O licitante visualiza todas as OFs emitidas para um instrumento na página de detalhes, com o
saldo remanescente calculado em tempo real. Cada OF exibe seu código sequencial, status atual,
datas relevantes e valor total.

**Por que esta prioridade**: A listagem é o painel de controle das entregas — sem ela, o licitante
não sabe quais OFs existem nem quanto do instrumento já foi consumido.

**Teste Independente**: Pode ser testado acessando a página de detalhes de um instrumento que
já possui OFs criadas — a lista mostra todas com seus respectivos status e o saldo remanescente
correto.

**Cenários de Aceite**:

1. **Dado** que o instrumento possui três OFs emitidas,
   **Quando** o licitante acessa a página de detalhes do instrumento,
   **Então** as três OFs aparecem ordenadas por código (1, 2, 3) com status, valor total e datas.

2. **Dado** que o instrumento não possui nenhuma OF,
   **Quando** o licitante acessa a página de detalhes,
   **Então** é exibida uma mensagem indicando que ainda não há ordens de fornecimento.

3. **Dado** que OFs de valores diferentes foram emitidas,
   **Quando** o licitante visualiza a página,
   **Então** o saldo remanescente exibido corresponde ao valor total do instrumento menos a soma das OFs.

---

### História de Usuário 3 - Avançar Status Operacional da OF (Prioridade: P2)

O licitante avança o status de uma OF ao longo do ciclo de entrega:
`pedido_recebido → em_separacao → despachado → entregue`. Cada transição é irreversível e
sequencial. Ao atingir `entregue`, a data de entrega é registrada automaticamente.

**Por que esta prioridade**: O rastreamento do status permite ao licitante saber exatamente em
que ponto está cada entrega, mas pode ser usado sem os passos de liquidação/pagamento num primeiro
momento.

**Teste Independente**: Pode ser testado avançando uma OF recém-criada do status
`pedido_recebido` até `entregue` e verificando que cada transição é refletida na interface e que
tentativas de retroceder são bloqueadas.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `pedido_recebido`,
   **Quando** o licitante clica em "Avançar Status",
   **Então** o status muda para `em_separacao` e a interface é atualizada imediatamente.

2. **Dado** que uma OF está com status `entregue`,
   **Quando** o licitante tenta retroceder o status,
   **Então** a ação não está disponível (botão de avanço regressivo inexiste ou está desabilitado).

3. **Dado** que uma OF transita para `entregue`,
   **Quando** a atualização é concluída,
   **Então** a `data_entrega` é exibida automaticamente na interface.

---

### História de Usuário 4 - Registrar Liquidação e Pagamento (Prioridade: P3)

Após a entrega confirmada, o licitante registra a liquidação da despesa informando a data de
liquidação, o prazo final de pagamento e o número da NF-e (44 dígitos). Posteriormente, registra
a data do pagamento efetivo, finalizando o ciclo da OF com status `pago`.

**Por que esta prioridade**: Encerra o ciclo financeiro da OF e é necessário para conformidade
fiscal, mas pode ser construído após os demais fluxos estarem operacionais.

**Teste Independente**: Pode ser testado pegando uma OF com status `entregue`, registrando
liquidação e depois pagamento — ao fim, a OF exibe status `pago` e `status_pagamento: pago`.

**Cenários de Aceite**:

1. **Dado** que uma OF está com status `entregue`,
   **Quando** o licitante informa data de liquidação, prazo de pagamento e NF-e válida (44 dígitos) e confirma,
   **Então** a liquidação é registrada e o `status_pagamento` passa a `pendente`.

2. **Dado** que a liquidação foi registrada,
   **Quando** o licitante informa a data do pagamento efetivo e confirma,
   **Então** a OF transita para status `pago` e `status_pagamento: pago`.

3. **Dado** que uma OF ainda não está com status `entregue`,
   **Quando** o licitante tenta registrar a liquidação,
   **Então** a opção de liquidação não está disponível na interface.

---

### Casos de Borda

- O que acontece quando o instrumento não possui itens cadastrados e o licitante tenta emitir uma OF?
- Como o sistema trata uma OF com `status_pagamento: em_atraso` (prazo de pagamento ultrapassado)?
- O que ocorre se a NF-e informada tiver um número diferente de 44 dígitos?
- O que acontece quando dois usuários do mesmo licitante tentam emitir OFs simultaneamente e o saldo é insuficiente para ambas?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE permitir que o licitante emita uma Ordem de Fornecimento vinculada a um instrumento existente (contrato ou empenho), informando ao menos um item com quantidade e valor unitário.
- **RF-002**: O sistema DEVE validar que o valor total da OF não excede o saldo remanescente do instrumento antes de confirmar a criação.
- **RF-003**: O sistema DEVE exibir a listagem de todas as OFs de um instrumento com código sequencial, status atual, valor total, datas relevantes e saldo remanescente calculado.
- **RF-004**: O sistema DEVE permitir avançar o status operacional de uma OF na sequência `pedido_recebido → em_separacao → despachado → entregue`, bloqueando transições retroativas ou de salto.
- **RF-005**: O sistema DEVE registrar a liquidação de uma OF (data de liquidação, prazo de pagamento e NF-e de 44 dígitos) somente quando ela estiver com status `entregue`.
- **RF-006**: O sistema DEVE registrar o pagamento efetivo de uma OF (data do pagamento) somente após a liquidação ter sido registrada, transitando a OF para status `pago`.
- **RF-007**: O sistema DEVE exibir o `status_pagamento` calculado dinamicamente (`pendente`, `em_atraso` ou `pago`) para OFs que já passaram pela liquidação.
- **RF-008**: O sistema DEVE exibir as ações disponíveis para cada OF de acordo com seu status atual, ocultando ou desabilitando ações não aplicáveis.

### Entidades Principais

- **OrdemFornecimento**: Representa uma entrega parcial ou total de um instrumento. Possui código sequencial por instrumento, status operacional, datas (recebimento, entrega, liquidação, pagamento), status de pagamento, NF-e, valor total e lista de itens fornecidos.
- **ItemOrdemFornecimento**: Item específico de uma OF, com referência ao item do instrumento, quantidade fornecida, valor unitário e valor total calculado.
- **InstrumentoComOFs**: Visão do instrumento incluindo o saldo remanescente após descontar todas as OFs emitidas.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O licitante consegue emitir uma Ordem de Fornecimento em menos de 2 minutos a partir da página de detalhes do instrumento.
- **CS-002**: O saldo remanescente do instrumento é exibido corretamente e atualizado imediatamente após a emissão de cada OF.
- **CS-003**: Todas as transições de status são refletidas na interface em menos de 3 segundos após a confirmação do usuário.
- **CS-004**: O ciclo completo (emissão → separação → despacho → entrega → liquidação → pagamento) pode ser concluído inteiramente pela interface sem necessidade de suporte.
- **CS-005**: Erros de validação (saldo insuficiente, NF-e inválida, status incorreto) são apresentados de forma clara ao usuário, sem exibir detalhes técnicos.

## Premissas

- O licitante já possui pelo menos um instrumento cadastrado com itens antes de emitir OFs.
- A autenticação e o contexto do licitante (`X-Licitante-Id`) já estão gerenciados pela infraestrutura existente do projeto.
- Os endpoints de Ordens de Fornecimento da API já estão implementados e operacionais conforme especificado no OpenAPI.
- O padrão de arquitetura Clean Architecture do projeto (domain/data/presentation) será seguido, consistente com as funcionalidades de instrumentos já implementadas.
- A interface será integrada às páginas de detalhes de contrato e empenho já existentes (não será uma página separada).
- Não há paginação na listagem de OFs — a API retorna todas as OFs de um instrumento em uma única resposta.
