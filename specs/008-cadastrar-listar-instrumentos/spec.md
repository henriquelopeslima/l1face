# Especificação de Funcionalidade: Cadastrar e Listar Instrumentos

**Branch da Funcionalidade**: `008-cadastrar-listar-instrumentos`  
**Criado em**: 2026-05-31  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Eu quero cadastrar e listar os instrumentos usando a api"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Listar Instrumentos do Licitante (Prioridade: P1)

Como usuário autenticado de um licitante, quero visualizar todos os instrumentos (contratos e empenhos) cadastrados para minha empresa em uma lista consolidada, para ter visibilidade do portfólio de obrigações contratuais e acompanhar situações de vigência.

**Por que esta prioridade**: A listagem é o ponto de partida para toda gestão de instrumentos. Sem ela, o usuário não consegue navegar nem monitorar o que já foi cadastrado. É o MVP da funcionalidade.

**Teste Independente**: Pode ser totalmente testado criando instrumentos via API diretamente e verificando que a tela exibe a lista corretamente, com tipo, número, órgão, valor e status de vigência.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado e tem instrumentos cadastrados, **Quando** acessa a página de instrumentos, **Então** vê uma lista com todos os instrumentos (contratos e empenhos) do licitante, exibindo tipo, número, órgão, objeto, valor e status de vigência.
2. **Dado** que o usuário não tem nenhum instrumento cadastrado, **Quando** acessa a página de instrumentos, **Então** vê uma mensagem indicando que não há instrumentos e um caminho para cadastrar o primeiro.
3. **Dado** que a lista contém instrumentos com diferentes status, **Quando** o usuário visualiza a lista, **Então** cada instrumento exibe seu status de vigência (Ativa, Próxima ao Vencimento, Encerrada) de forma visualmente destacada.
4. **Dado** que um instrumento é do tipo Empenho (sem prazo_final), **Quando** exibido na lista, **Então** o campo de prazo final aparece como não aplicável e o status é calculado com base na ata vinculada (ou "Ativa" se sem ata).

---

### História de Usuário 2 - Cadastrar Instrumento do Tipo Contrato (Prioridade: P2)

Como usuário autenticado de um licitante, quero cadastrar um novo instrumento do tipo Contrato informando os dados contratuais (órgão, vigência, itens etc.), para registrar as obrigações de fornecimento assumidas com órgãos públicos.

**Por que esta prioridade**: O Contrato é o instrumento mais completo e comum, com vigência explícita e campos como prazos de entrega e pagamento. Deve ser implementado antes do Empenho por ter maior complexidade e cobertura de validação.

**Teste Independente**: Pode ser totalmente testado preenchendo o formulário de contrato com dados válidos e verificando que o instrumento aparece na listagem com os dados corretos.

**Cenários de Aceite**:

1. **Dado** que o usuário acessa o formulário de novo instrumento, **Quando** seleciona o tipo "Contrato" e preenche todos os campos obrigatórios (número, órgão contratante, unidade, objeto, datas de vigência, indicação de renovável), **Então** o contrato é salvo com sucesso e o usuário é redirecionado para a listagem.
2. **Dado** que o usuário preenche o formulário de contrato, **Quando** a data de vigência final é anterior à inicial, **Então** o sistema exibe uma mensagem de erro clara e não permite o envio.
3. **Dado** que o usuário deseja vincular o contrato a uma Ata existente, **Quando** informa o ID da ata e as vigências do contrato estão dentro do intervalo da ata, **Então** o vínculo é estabelecido com sucesso.
4. **Dado** que o usuário informa uma ata para vincular e as vigências do contrato estão fora do intervalo da ata, **Quando** tenta salvar, **Então** o sistema exibe um erro explicando que a vigência deve estar contida na vigência da ata.
5. **Dado** que o usuário deseja adicionar itens ao contrato, **Quando** preenche os campos de cada item (descrição, unidade, quantidade, valor unitário, valor total), **Então** os itens são salvos junto com o contrato.
6. **Dado** que o usuário preenche o código PNCP do contrato, **Quando** consulta o PNCP, **Então** os dados do contrato são pré-preenchidos automaticamente no formulário para revisão.

---

### História de Usuário 3 - Cadastrar Instrumento do Tipo Empenho (Prioridade: P3)

Como usuário autenticado de um licitante, quero cadastrar um instrumento do tipo Empenho (nota de empenho), para registrar aquisições por empenho vinculadas ou não a uma Ata de Registro de Preços.

**Por que esta prioridade**: O Empenho tem estrutura mais simples que o Contrato (sem vigência própria, sem prazos de entrega/pagamento) e é necessário para cobrir o portfólio completo de instrumentos.

**Teste Independente**: Pode ser totalmente testado preenchendo o formulário de empenho com órgão, unidade e objeto e verificando que aparece na listagem com tipo "EMPENHO".

**Cenários de Aceite**:

1. **Dado** que o usuário acessa o formulário de novo instrumento, **Quando** seleciona o tipo "Empenho" e preenche os campos obrigatórios (órgão contratante, unidade, objeto), **Então** o empenho é salvo e aparece na listagem.
2. **Dado** que o usuário cadastra um empenho sem vincular a uma ata, **Quando** o instrumento aparece na listagem, **Então** o status é exibido como "Ativa" e prazo final como não aplicável.
3. **Dado** que o usuário vincula o empenho a uma ata, **Quando** o instrumento aparece na listagem, **Então** o status é calculado com base na vigência da ata vinculada.
4. **Dado** que o usuário deseja adicionar itens ao empenho, **Quando** preenche os campos de cada item, **Então** os itens são salvos junto com o empenho.

---

### Casos de Borda

- O que acontece quando o usuário tenta cadastrar um contrato com número PNCP que retorna mais de um resultado na consulta?
- Como o sistema trata a listagem quando há muitos instrumentos (centenas)?
- O que acontece quando a ata vinculada ao empenho é encerrada — o status do empenho muda automaticamente na listagem?
- Como o sistema exibe o número de instrumento quando é um Empenho sem número PNCP cadastrado?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir uma lista consolidada de todos os instrumentos (contratos e empenhos) do licitante autenticado, incluindo tipo, número, órgão, unidade, objeto, prazo final, valor total, saldo e status de vigência.
- **RF-002**: O sistema DEVE calcular e exibir o status de vigência de cada instrumento dinamicamente: "Ativa" (mais de 30 dias para vencer), "Próxima ao Vencimento" (30 dias ou menos) e "Encerrada" (prazo já passou).
- **RF-003**: O sistema DEVE permitir cadastrar um novo instrumento do tipo Contrato com os campos: número, órgão contratante, unidade, objeto, datas de vigência (inicial e final), indicação de renovável, e opcionalmente: código PNCP, número PNCP, endereço, prazo de entrega, tipo de prazo de entrega, prazo de pagamento, tipo de prazo de pagamento, endereço de entrega, URL do anexo, itens e vínculo com ata.
- **RF-004**: O sistema DEVE permitir cadastrar um novo instrumento do tipo Empenho com os campos obrigatórios: órgão contratante, unidade e objeto, e opcionalmente: código PNCP, URL do anexo, itens e vínculo com ata.
- **RF-005**: O sistema DEVE validar que a data de vigência final do contrato é igual ou posterior à data inicial antes de salvar.
- **RF-006**: O sistema DEVE validar que, quando um contrato é vinculado a uma ata, a vigência do contrato está contida dentro da vigência da ata.
- **RF-007**: O sistema DEVE permitir ao usuário consultar o PNCP pelo código de controle para pré-preencher os dados do instrumento no formulário de cadastro.
- **RF-008**: O sistema DEVE exibir mensagens de erro claras quando dados inválidos forem informados (datas inconsistentes, campos obrigatórios ausentes, ata não pertencente ao licitante).
- **RF-009**: O sistema DEVE redirecionar o usuário para a listagem de instrumentos após um cadastro bem-sucedido.
- **RF-010**: O sistema DEVE exibir o valor total do instrumento (soma dos valores totais dos itens) na listagem.
- **RF-011**: O sistema DEVE permitir adicionar zero ou mais itens a um instrumento, com os campos: descrição, unidade de medida, quantidade total, valor unitário e valor total.

### Entidades Principais

- **Instrumento**: Agrupa um Contrato ou Empenho associado a um licitante. Possui tipo (CONTRATO ou EMPENHO), pode estar vinculado a uma Ata.
- **Contrato**: Instrumento com vigência explícita (inicial e final), número obrigatório, campos de prazos de entrega e pagamento, endereço e indicação de renovável.
- **Empenho**: Instrumento sem vigência própria, com órgão contratante, unidade e objeto obrigatórios. Status de vigência derivado da ata vinculada.
- **Item do Instrumento**: Detalha os produtos/serviços do instrumento. Contém descrição, unidade, quantidade, valor unitário e valor total.
- **Ata (Ata de Registro de Preços)**: Entidade pré-existente à qual um instrumento pode ser vinculado, influenciando a validação de vigência e o status de vigência do empenho.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um usuário consegue cadastrar um contrato completo (com itens e vínculo com ata) em menos de 3 minutos.
- **CS-002**: A listagem de instrumentos carrega e exibe todos os registros do licitante em menos de 2 segundos.
- **CS-003**: 100% dos campos obrigatórios ausentes ou inválidos são sinalizados com mensagem explicativa antes do envio do formulário.
- **CS-004**: O pré-preenchimento via PNCP reduz o tempo de cadastro manual eliminando a necessidade de digitação dos campos preenchidos automaticamente.
- **CS-005**: O status de vigência exibido na listagem reflete sempre a situação atual do instrumento sem necessidade de atualização manual pelo usuário.

## Premissas

- O usuário já está autenticado e tem um licitante ativo selecionado no contexto da sessão.
- As atas disponíveis para vínculo já foram previamente cadastradas no sistema e pertencem ao mesmo licitante.
- A consulta ao PNCP para pré-preenchimento é opcional — o usuário pode cadastrar instrumentos sem usar o PNCP.
- O saldo do instrumento é igual ao valor total enquanto a lógica de consumo não estiver implementada.
- A listagem não é paginada para a versão inicial — retorna todos os instrumentos do licitante.
- Instrumentos do tipo Empenho sem ata vinculada sempre aparecem com status "Ativa".
- A URL do anexo é informada manualmente pelo usuário (upload de arquivo está fora do escopo).
