# Especificação de Funcionalidade: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

**Branch da Funcionalidade**: `026-empenho-arp-obrigatorio`
**Criado em**: 2026-07-22
**Status**: Rascunho
**Entrada**: Descrição do usuário: "eu quero atualizar a criação do empenho baseado nas novas condições. O código agora deve ser obrigatorio e quando selecionar um ARP os itens empenhados devem obrigatoriamente vir da ARP."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Código do empenho obrigatório (Prioridade: P1)

Ao cadastrar uma nova nota de empenho, o usuário deve informar obrigatoriamente o código do empenho. O cadastro não pode ser concluído sem esse dado, pois ele identifica o empenho junto ao órgão.

**Por que esta prioridade**: Sem o código do empenho, o registro fica incompleto e não pode ser localizado ou referenciado de forma confiável nos processos administrativos e de auditoria. É a mudança mais simples e de maior impacto imediato na integridade dos dados.

**Teste Independente**: Pode ser testado tentando finalizar o cadastro de uma nota de empenho sem preencher o código; o sistema deve impedir o envio e sinalizar o campo como obrigatório. Preenchendo o código, o cadastro deve prosseguir normalmente.

**Cenários de Aceite**:

1. **Dado** que o usuário está preenchendo o formulário de cadastro de nota de empenho, **Quando** ele tenta cadastrar sem informar o código do empenho, **Então** o sistema impede o envio e exibe uma mensagem indicando que o código é obrigatório.
2. **Dado** que o usuário preencheu todos os campos obrigatórios incluindo o código do empenho, **Quando** ele confirma o cadastro, **Então** o empenho é criado com o código informado associado ao registro.
3. **Dado** que o usuário está preenchendo o código do empenho, **Quando** ele digita caracteres não numéricos, **Então** o sistema aceita apenas dígitos no campo.

---

### História de Usuário 2 - Itens do empenho vinculados obrigatoriamente à ARP selecionada (Prioridade: P1)

Quando o usuário seleciona uma ARP de origem para o empenho, os itens empenhados devem vir obrigatoriamente da lista de itens dessa ARP, com quantidade limitada ao saldo disponível (do órgão ou da adesão/carona, conforme aplicável). O usuário não pode mais digitar itens manuais quando uma ARP estiver vinculada.

**Por que esta prioridade**: Garante que o valor e a quantidade empenhados nunca ultrapassem o que foi efetivamente registrado e ainda está disponível na ARP, evitando empenhos divergentes do instrumento de origem — mesmo risco de integridade que já motivou essa regra no cadastro de contratos.

**Teste Independente**: Pode ser testado selecionando uma ARP com itens cadastrados no formulário de nota de empenho e verificando que a lista de itens é carregada automaticamente a partir da ARP, com descrição, unidade e valor unitário bloqueados para edição e quantidade limitada ao saldo disponível. Também pode ser testado confirmando que, ao remover a ARP selecionada, o usuário volta a poder informar itens manualmente.

**Cenários de Aceite**:

1. **Dado** que o usuário selecionou uma ARP com itens cadastrados, **Quando** a seleção é confirmada, **Então** os itens do empenho são preenchidos automaticamente com os itens da ARP (descrição, unidade de medida e valor unitário), e a opção de adicionar item manual fica indisponível.
2. **Dado** que uma ARP está selecionada e os itens foram carregados a partir dela, **Quando** o usuário tenta editar a descrição, a unidade de medida ou o valor unitário de um item, **Então** o sistema não permite a alteração desses campos.
3. **Dado** que uma ARP está selecionada, **Quando** o usuário informa a quantidade de um item, **Então** o sistema impede valores acima do saldo disponível para aquele item (saldo do órgão ou saldo de carona/adesão, conforme a resposta à pergunta "é uma adesão?").
4. **Dado** que uma ARP está selecionada e algum item dela não possui saldo disponível, **Quando** o usuário visualiza a lista de itens, **Então** o item aparece identificado como sem saldo e não pode receber quantidade.
5. **Dado** que o usuário tinha uma ARP selecionada com itens carregados, **Quando** ele desfaz a seleção da ARP (volta para "Nenhuma ARP"), **Então** a lista de itens é limpa e o cadastro manual de itens volta a ficar disponível.
6. **Dado** que o usuário tenta cadastrar o empenho sem selecionar uma ARP, **Quando** ele preenche os itens manualmente, **Então** o comportamento atual é preservado (itens digitados livremente, sem vínculo obrigatório com uma ARP).
7. **Dado** que uma ARP está selecionada e os itens foram carregados a partir dela, **Quando** o usuário remove um item específico da lista, **Então** esse item deixa de fazer parte do empenho (os demais itens carregados permanecem vinculados à ARP normalmente).

---

### Casos de Borda

- O que acontece quando a ARP selecionada não possui nenhum item cadastrado? O sistema deve informar que não há itens disponíveis para vínculo e impedir a inclusão de itens manuais enquanto a ARP estiver selecionada.
- Como o sistema trata a troca de uma ARP selecionada por outra? Os itens anteriormente carregados devem ser substituídos pelos itens da nova ARP, descartando quantidades já informadas.
- O que acontece se o usuário alternar a resposta "é uma adesão?" depois de já ter informado quantidades nos itens? O saldo de referência (órgão ou carona) muda e as quantidades já informadas que excederem o novo saldo devem ser ajustadas ou sinalizadas como inválidas.
- Como o sistema trata a falha ao carregar os itens da ARP selecionada (ex.: erro de rede)? O usuário deve ser informado do erro e poder tentar novamente, sem conseguir avançar com o cadastro do empenho vinculado a essa ARP até que os itens sejam carregados com sucesso.
- O que acontece se o usuário informar um código de empenho que já existe? Trata-se de uma regra de validação de duplicidade a cargo do sistema; o usuário deve receber uma mensagem clara caso o código já esteja em uso.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exigir o preenchimento do código do empenho como condição para concluir o cadastro de uma nota de empenho.
- **RF-002**: O sistema DEVE aceitar somente caracteres numéricos no campo de código do empenho.
- **RF-003**: O sistema DEVE impedir o envio do formulário de cadastro de empenho e sinalizar visualmente o campo quando o código do empenho estiver vazio.
- **RF-004**: O sistema DEVE persistir o código do empenho informado junto com os demais dados do registro criado.
- **RF-005**: Quando uma ARP de origem for selecionada no cadastro de empenho, o sistema DEVE carregar automaticamente os itens dessa ARP como os itens do empenho.
- **RF-006**: Quando uma ARP estiver selecionada, o sistema DEVE impedir a inclusão de itens manuais (não provenientes da ARP), mas DEVE permitir que o usuário remova individualmente itens carregados da ARP que não deseje incluir neste empenho.
- **RF-007**: Quando uma ARP estiver selecionada, o sistema DEVE impedir a edição da descrição, unidade de medida e valor unitário dos itens carregados a partir da ARP.
- **RF-008**: Quando uma ARP estiver selecionada, o sistema DEVE limitar a quantidade informável em cada item ao saldo disponível do respectivo item na ARP (saldo do órgão ou saldo de carona, conforme a indicação de adesão).
- **RF-009**: O sistema DEVE identificar visualmente os itens da ARP que não possuem saldo disponível e impedir que recebam quantidade.
- **RF-010**: Quando o usuário desfizer a seleção de uma ARP previamente escolhida, o sistema DEVE limpar os itens carregados e permitir novamente o cadastro manual de itens.
- **RF-011**: Quando o usuário trocar a ARP selecionada por outra, o sistema DEVE substituir os itens carregados pelos itens da nova ARP.
- **RF-012**: Quando nenhuma ARP estiver selecionada, o sistema DEVE manter o comportamento atual de cadastro de itens manuais e opcionais.
- **RF-013**: O sistema DEVE informar ao usuário quando a ARP selecionada não possuir itens disponíveis para vínculo.
- **RF-014**: O sistema DEVE informar ao usuário quando ocorrer falha ao carregar os itens da ARP selecionada, permitindo nova tentativa.

### Entidades Principais

- **Nota de Empenho**: Registro financeiro criado a partir de um órgão, unidade, objeto e, opcionalmente, uma ARP de origem. Passa a exigir um código de empenho obrigatório e, quando vinculada a uma ARP, seus itens ficam restritos aos itens dessa ARP.
- **ARP (Ata de Registro de Preços)**: Instrumento de origem que pode ser selecionado no cadastro do empenho. Possui uma lista de itens com quantidade e saldo disponível, tanto para o órgão gerenciador quanto para adesões (carona).
- **Item da ARP**: Item pertencente a uma ARP, com descrição, unidade de medida, valor unitário e saldo disponível (do órgão e de carona). Serve como origem obrigatória dos itens do empenho quando uma ARP é selecionada.
- **Item do Empenho**: Linha de item vinculada a uma nota de empenho, contendo descrição, unidade de medida, quantidade e valor unitário. Quando originado de uma ARP, mantém a referência ao item de origem e tem sua quantidade limitada pelo saldo correspondente.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos empenhos cadastrados após a mudança possuem um código de empenho preenchido.
- **CS-002**: 100% dos empenhos cadastrados com ARP de origem possuem itens integralmente originados da lista de itens dessa ARP, sem itens digitados manualmente.
- **CS-003**: Nenhum empenho vinculado a uma ARP é cadastrado com quantidade de item superior ao saldo disponível correspondente.
- **CS-004**: Usuários conseguem concluir o cadastro de um empenho vinculado a uma ARP sem precisar digitar manualmente descrição, unidade ou valor de nenhum item.

## Premissas

- O comportamento de cadastro de itens manuais permanece inalterado quando nenhuma ARP é selecionada, incluindo a opcionalidade dos itens nesse caso.
- A regra de vínculo obrigatório de itens à ARP e o bloqueio de edição de campos seguem o mesmo padrão já adotado no cadastro de contratos vinculados a uma ARP.
- A definição de saldo disponível (órgão ou carona) depende da resposta à pergunta existente "é uma adesão?", já presente no fluxo de seleção de ARP.
- O código do empenho aceita apenas dígitos numéricos, mantendo a sanitização de entrada já existente no campo.
- Validação de duplicidade do código do empenho, caso exista, é responsabilidade de regras de negócio já estabelecidas e não faz parte do escopo desta mudança.
