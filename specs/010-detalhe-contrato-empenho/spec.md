# Especificação de Funcionalidade: Detalhes do Contrato e Empenho

**Branch da Funcionalidade**: `010-detalhe-contrato-empenho`
**Criado em**: 2026-06-04
**Status**: Rascunho

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 — Ver Detalhes do Contrato (Prioridade: P1)

Um licitante acessa a lista de instrumentos, clica em um contrato e vê uma tela completa com todos
os campos do contrato: órgão, unidade, objeto, vigência, prazos de entrega e pagamento, endereço,
valor global (soma dos itens), saldo, link para o anexo e — quando houver — um card de ARP de origem.
A tela também exibe a tabela de itens do contrato com paginação.
Campos nulos exibem um placeholder legível (ex.: "Não informado").

**Por que esta prioridade**: Contrato é o tipo de instrumento mais comum e fornece a visão operacional
completa (vigência, prazos, endereço) que o licitante consulta diariamente.

**Teste Independente**: Pode ser testado acessando `/instrumentos/contratos/:id` com um contrato real
cadastrado via API. A tela deve exibir todos os campos sem mock data.

**Cenários de Aceite**:

1. **Dado** um contrato existente com todos os campos preenchidos, **Quando** o usuário acessa a tela
   de detalhes, **Então** vê número do instrumento, órgão, unidade, objeto, vigência inicial/final,
   prazo de entrega (com tipo: dias úteis ou corridos), prazo de pagamento (com tipo), endereço,
   endereço de entrega, indicador renovável e badge de status.

2. **Dado** um contrato com `ata_id` preenchido, **Quando** o usuário acessa a tela, **Então** um card
   "ARP de Origem" é exibido com link de navegação para a tela de detalhes da ARP.

3. **Dado** um contrato com `ata_id = null`, **Quando** o usuário acessa a tela, **Então** o card
   de ARP de Origem não é exibido.

4. **Dado** um contrato com campo `anexo_url` preenchido, **Quando** o usuário vê a seção
   Documentos, **Então** há um botão de download/link para o PDF do contrato.

5. **Dado** um contrato com `anexo_url = null`, **Quando** o usuário vê a seção Documentos,
   **Então** aparece a mensagem "Nenhum anexo disponível" (sem erro de interface).

6. **Dado** um contrato com `vigencia_final` nos próximos 30 dias, **Quando** o usuário acessa a tela,
   **Então** um alerta de vigência próxima ao fim é exibido no topo.

7. **Dado** um contrato com 0 itens, **Quando** o usuário acessa a tela, **Então** a tabela de itens
   exibe um estado vazio ("Nenhum item registrado").

8. **Dado** um ID de instrumento que não existe ou pertence a outro licitante, **Quando** o usuário
   acessa a tela, **Então** vê uma mensagem de erro 404 com botão para voltar à listagem.

---

### História de Usuário 2 — Ver Detalhes do Empenho (Prioridade: P2)

Um licitante acessa a lista de instrumentos, clica em uma nota de empenho e vê os campos disponíveis:
órgão, unidade, objeto, número PNCP (quando disponível), status e tabela de itens.
A tela é mais simples que a do contrato (sem vigência, sem prazos, sem endereço).
Quando houver ARP vinculada, exibe card de ARP de Origem com link de navegação.

**Por que esta prioridade**: Empenho tem estrutura mais simples que o contrato; é implementado
segundo após a fundação do contrato para reutilizar a mesma camada de dados.

**Teste Independente**: Pode ser testado acessando `/instrumentos/empenhos/:id` com um empenho real.

**Cenários de Aceite**:

1. **Dado** um empenho existente, **Quando** o usuário acessa a tela de detalhes, **Então** vê
   órgão contratante, unidade, objeto, número PNCP (ou "Não informado" se null) e badge de status.

2. **Dado** um empenho com `ata_id` preenchido, **Quando** o usuário acessa a tela, **Então** um
   card "ARP de Origem" é exibido com link para a ARP.

3. **Dado** um empenho com `anexo_url` preenchido, **Quando** o usuário vê documentos,
   **Então** há botão de link/download para o anexo.

4. **Dado** um empenho com `anexo_url = null`, **Quando** o usuário vê documentos,
   **Então** aparece "Nenhum anexo disponível".

5. **Dado** um empenho com itens, **Quando** o usuário vê a tabela de itens, **Então** cada linha
   mostra: descrição, unidade de medida, quantidade total, valor unitário e valor total.

6. **Dado** um ID inexistente ou de outro licitante, **Quando** o usuário acessa a tela,
   **Então** vê mensagem 404 com botão de retorno.

---

### Casos de Borda

- O que acontece quando a API retorna erro 401 (sessão expirada)? → Redirecionar para login.
- O que acontece quando a API retorna erro 500? → Exibir mensagem de erro genérica com botão de retry.
- Contrato com `prazo_entrega = null` e `tipo_prazo_entrega = null` → seção de prazos exibe "Não informado".
- Empenho com `numero_pncp = null` → exibir "Número PNCP não informado".

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE buscar os dados do instrumento via `GET /api/instrumentos/{id}` ao
  carregar a tela, usando o UUID da URL.
- **RF-002**: O sistema DEVE exibir um indicador de carregamento enquanto a requisição está em andamento.
- **RF-003**: O sistema DEVE discriminar o tipo do instrumento (`CONTRATO` ou `EMPENHO`) para exibir
  os campos específicos de cada tipo.
- **RF-004**: O sistema DEVE exibir o badge de status (`ATIVA` → "Em Execução", `PROXIMA_AO_VENCIMENTO`
  → "Próximo ao Vencimento", `ENCERRADA` → "Encerrado") com a cor correspondente.
- **RF-005**: O sistema DEVE exibir um alerta de vigência próxima ao fim quando o status for
  `PROXIMA_AO_VENCIMENTO` na tela de detalhes do Contrato.
- **RF-006**: O sistema DEVE exibir o card "ARP de Origem" apenas quando `ata_id` não for nulo,
  com link de navegação para `/atas/detalhes/{ata_id}`.
- **RF-007**: O sistema DEVE exibir a tabela de itens com colunas: Descrição, Unid. Med., Qtd. Total,
  Valor Unitário, Valor Total.
- **RF-008**: O sistema DEVE calcular e exibir o valor total do instrumento como soma de
  `valor_total` de todos os itens.
- **RF-009**: O sistema DEVE exibir a seção de Ordens de Fornecimento em estado vazio
  ("Nenhuma ordem cadastrada — funcionalidade em breve").
- **RF-010**: O sistema DEVE exibir um botão "Voltar" que navega para `/instrumentos/gestao`.
- **RF-011**: O sistema DEVE exibir valores monetários no formato moeda brasileira (R$ 1.234,56).
- **RF-012**: O sistema DEVE exibir datas no formato dd/mm/aaaa.
- **RF-013**: Para campos nulos ou ausentes, o sistema DEVE exibir "Não informado" em vez de
  deixar o campo vazio ou quebrar a interface.
- **RF-014**: O sistema DEVE exibir uma tela de erro 404 com botão de retorno quando o instrumento
  não for encontrado.
- **RF-015**: O sistema DEVE exibir o tipo de prazo ("dias úteis" ou "dias corridos") junto ao
  valor numérico do prazo de entrega/pagamento no Contrato.

### Entidades Principais

- **InstrumentoDetalhe**: Agrupador com `instrumento_id`, `licitante_id`, `ata_id`, `criado_em`,
  `tipo`, e sub-objeto `contrato` ou `empenho` (apenas um deles preenchido), mais lista `itens`.
- **ContratoDetalhe**: `numero`, `orgao_contratante`, `unidade`, `objeto`, `vigencia_inicial`,
  `vigencia_final`, `endereco`, `prazo_entrega`, `tipo_prazo_entrega`, `prazo_pagamento`,
  `tipo_prazo_pagamento`, `endereco_entrega`, `renovavel`, `anexo_url`, `status`, `criado_em`.
- **EmpenhoDetalhe**: `numero_pncp`, `orgao_contratante`, `unidade`, `objeto`, `anexo_url`,
  `status`, `criado_em`.
- **ItemInstrumentoDetalhe**: `id`, `descricao`, `unidade_medida`, `quantidade_total`,
  `valor_unitario`, `valor_total`.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O usuário consegue visualizar todos os campos de um contrato em menos de 3 segundos
  após acessar a URL (em conexão normal).
- **CS-002**: 100% dos campos disponíveis na API são exibidos na tela (sem campos "perdidos" no
  mapeamento).
- **CS-003**: Nenhum campo nulo ou ausente causa quebra visual na interface — todos exibem fallback
  "Não informado".
- **CS-004**: A tela de empenho exibe corretamente os campos específicos do empenho sem mostrar
  campos de contrato (e vice-versa).
- **CS-005**: A navegação de volta para a listagem e para a ARP vinculada funciona em 100% dos casos.
- **CS-006**: A tela é responsiva e utilizável em dispositivos móveis (telas ≥ 375px de largura).

## Premissas

- O endpoint `GET /api/instrumentos/{id}` já está implementado e disponível no backend.
- As páginas `ContratoDetalhesPage.tsx` e `NotaEmpenhoDetalhesPage.tsx` já existem com UI completa
  usando mock data — o trabalho é substituir os mocks por dados reais da API.
- As rotas `/instrumentos/contratos/:id` e `/instrumentos/empenhos/:id` já estão configuradas no router.
- A seção "Ordens de Fornecimento" permanece em estado vazio (empty state) pois esta funcionalidade
  será implementada em sprint futura.
- Campos como `qtdEntregue` e `qtdReservada` da visão consolidada de itens não estão disponíveis
  na API atual — a tabela de itens exibirá apenas os dados disponíveis (`quantidade_total`,
  `valor_unitario`, `valor_total`).
- O card de ARP de Origem usa apenas o `ata_id` para navegação; o número/nome da ARP não é retornado
  no endpoint de instrumento, então o card exibirá apenas "Ata de Registro de Preços" com o link.
