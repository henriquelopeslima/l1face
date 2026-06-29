# Especificação de Funcionalidade: Ajuste do Fluxo de Criação de Instrumento com ARP

**Branch da Funcionalidade**: `017-ata-creation-flow`
**Criado em**: 2026-06-28
**Status**: Rascunho
**Entrada**: Ajustar o fluxo de criação de instrumento (contrato/empenho) vinculado a uma ARP para: (1) pré-selecionar "não adesão" no radio button, (2) limitar quantidade máxima dos itens ao saldo disponível conforme tipo de uso, e (3) exibir erros da API diretamente na etapa onde ocorrem.

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 — Padrão Não-Adesão ao Vincular ARP (Prioridade: P1)

Um usuário está cadastrando um contrato e seleciona uma ARP de origem. A maioria dos contratos são contratos do órgão gerenciador, não adesões (caronas). Ao selecionar a ARP, o sistema deve automaticamente marcar "Não" para adesão, evitando que o usuário esqueça de responder essa pergunta e envie dados inconsistentes.

**Por que esta prioridade**: A ausência de uma seleção padrão força o usuário a responder uma pergunta que muitas vezes não percebe. Além disso, o caso mais frequente (não-adesão) já ficaria pré-configurado corretamente.

**Teste Independente**: Pode ser testado selecionando qualquer ARP no formulário de cadastro de contrato e verificando se o radio "Não" fica marcado imediatamente, sem nenhuma interação adicional do usuário.

**Cenários de Aceite**:

1. **Dado** que o usuário está na etapa "Dados do Contrato" e não selecionou nenhuma ARP, **Quando** ele seleciona uma ARP pela primeira vez, **Então** o radio button "É uma adesão?" deve aparecer com a opção "Não" pré-selecionada.
2. **Dado** que o usuário selecionou "Sim" para adesão, **Quando** ele troca para outra ARP, **Então** a escolha anterior é mantida (sem reset, pois o usuário já fez uma escolha deliberada).
3. **Dado** que o usuário selecionou uma ARP mas não respondeu ainda (estado inicial), **Quando** ele avança para a próxima etapa, **Então** o valor enviado para a API deve ser `adesao: false`.

---

### História de Usuário 2 — Quantidade Máxima dos Itens Limitada ao Saldo Disponível (Prioridade: P1)

Um usuário está na etapa de itens do contrato com uma ARP vinculada. Os itens são pré-carregados da ARP, mas a quantidade que pode ser contratada está limitada ao saldo restante — não ao total registrado originalmente. O saldo varia conforme o tipo: se é contrato do órgão, o saldo é `qtd_registrada - qtd_consumida_orgao`; se é adesão (carona), o saldo é `qtd_para_carona - qtd_consumida_carona`.

**Por que esta prioridade**: Sem esse limite, o usuário pode informar quantidades maiores que o saldo disponível e o cadastro será rejeitado pela API, ou pior, será aceito criando inconsistência. A validação no frontend melhora a experiência e evita erros desnecessários.

**Teste Independente**: Pode ser testado selecionando uma ARP com itens de saldo conhecido, navegando até a etapa de itens e verificando se o campo de quantidade exibe e respeita o limite correto para cada tipo (orgão/carona).

**Cenários de Aceite**:

1. **Dado** que uma ARP está selecionada e o instrumento **não** é adesão, **Quando** o usuário chega à etapa de itens, **Então** cada item deve exibir o saldo do órgão (`qtd_registrada - qtd_consumida_orgao`) como valor máximo permitido no campo de quantidade, e a quantidade inicial pré-preenchida não deve ultrapassar esse saldo.
2. **Dado** que uma ARP está selecionada e o instrumento **é** adesão (carona), **Quando** o usuário chega à etapa de itens, **Então** cada item deve exibir o saldo carona (`qtd_para_carona - qtd_consumida_carona`) como valor máximo permitido no campo de quantidade, e a quantidade inicial pré-preenchida não deve ultrapassar esse saldo.
3. **Dado** que um item da ARP tem saldo zero para o tipo selecionado (orgão ou carona), **Quando** o usuário visualiza a etapa de itens, **Então** o campo de quantidade desse item deve estar desabilitado e indicar visualmente que não há saldo disponível.
4. **Dado** que o usuário tenta inserir uma quantidade maior que o saldo disponível, **Quando** ele altera o campo, **Então** o sistema deve impedir a entrada acima do máximo e/ou exibir uma mensagem de validação.
5. **Dado** que o usuário troca a resposta de adesão (de "Não" para "Sim" ou vice-versa), **Quando** a troca acontece, **Então** os limites de quantidade dos itens devem ser recalculados automaticamente usando o tipo correto de saldo.

---

### História de Usuário 3 — Exibição de Erro da API na Etapa Correta (Prioridade: P2)

Quando o usuário finaliza o cadastro e a API retorna um erro (ex.: saldo insuficiente, dados inválidos), o sistema deve exibir o erro de forma visível dentro do fluxo, sem remover o usuário da etapa de revisão ou ocultar o formulário. Atualmente, o erro `erroSalvar` só é visível quando `processandoCadastro` é true, o que pode causar exibição breve ou invisível.

**Por que esta prioridade**: O erro silencioso faz o usuário não saber o que aconteceu e potencialmente repetir a ação ou abandonar o cadastro.

**Teste Independente**: Pode ser testado simulando uma resposta de erro da API na etapa de finalização e verificando se um alerta descritivo é exibido na tela de revisão, abaixo do botão de confirmação, sem que o formulário desapareça.

**Cenários de Aceite**:

1. **Dado** que o usuário está na etapa de revisão e clica em "Finalizar Cadastro", **Quando** a API retorna um erro, **Então** um alerta de erro deve ser exibido na própria etapa de revisão, mantendo todos os dados do formulário visíveis.
2. **Dado** que um erro foi exibido, **Quando** o usuário corrige os dados e tenta novamente, **Então** o alerta de erro anterior deve desaparecer enquanto a nova tentativa está em progresso.
3. **Dado** que a API retorna uma mensagem de erro específica (ex.: "Saldo insuficiente para o item X"), **Quando** o erro é exibido, **Então** a mensagem original da API deve aparecer no alerta para orientar o usuário.

---

### Casos de Borda

- O que acontece quando o saldo de **todos** os itens da ARP é zero para o tipo selecionado? O usuário deve ser avisado antes de avançar para a etapa de itens.
- O que acontece se o usuário remover a seleção da ARP após chegar na etapa de itens? Os itens pré-carregados devem ser limpos ou permitidos para edição livre novamente.
- O que acontece quando a ARP selecionada não aceita adesão (`aceitaAdesao: false`) mas o usuário marca "Sim" para adesão? Essa combinação não deve ser possível — a opção "Sim" deve ser desabilitada quando a ARP não aceita adesão.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: Quando o usuário selecionar uma ARP de origem pela primeira vez, o sistema DEVE pré-selecionar automaticamente "Não" para a pergunta "É uma adesão?", caso o usuário ainda não tenha feito uma escolha explícita.
- **RF-002**: Quando a ARP selecionada não aceita adesão (`aceitaAdesao: false`), o sistema DEVE desabilitar a opção "Sim" no radio de adesão e manter "Não" como única opção selecionável.
- **RF-003**: Na etapa de itens, quando uma ARP está vinculada e o instrumento **não** é adesão, o sistema DEVE calcular o saldo disponível de cada item como `qtd_registrada - qtd_consumida_orgao` e usá-lo como limite máximo do campo de quantidade.
- **RF-004**: Na etapa de itens, quando uma ARP está vinculada e o instrumento **é** adesão, o sistema DEVE calcular o saldo disponível de cada item como `qtd_para_carona - qtd_consumida_carona` e usá-lo como limite máximo do campo de quantidade.
- **RF-005**: O sistema DEVE exibir o saldo disponível calculado para cada item próximo ao campo de quantidade, para que o usuário saiba qual é o limite máximo.
- **RF-006**: Itens com saldo zero para o tipo de uso selecionado DEVEM ter o campo de quantidade desabilitado e apresentar indicação visual clara de indisponibilidade.
- **RF-007**: Quando o usuário trocar a resposta de adesão (Sim/Não), o sistema DEVE recalcular automaticamente os limites de quantidade de todos os itens para o novo tipo de saldo correspondente.
- **RF-008**: Quando a API retornar um erro ao finalizar o cadastro, o sistema DEVE exibir um alerta com a mensagem de erro diretamente na etapa de revisão (etapa 4), sem ocultá-la ou substituí-la pela tela de processamento.
- **RF-009**: O alerta de erro da etapa de revisão DEVE desaparecer quando o usuário iniciar uma nova tentativa de envio.

### Entidades Principais

- **ItemAta**: Representa um item da ARP com os campos `qtdRegistrada`, `qtdParaCarona`, `qtdConsumidaOrgao`, `qtdConsumidaCarona`. O saldo disponível para orgão é `qtdRegistrada - qtdConsumidaOrgao`; para carona, é `qtdParaCarona - qtdConsumidaCarona`.
- **ItemContrato (local)**: Representação dos itens no formulário de cadastro de contrato. Quando vinculado a uma ARP, deve armazenar também o `saldoDisponivel` calculado conforme o tipo de adesão, para permitir validação em tempo real.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O usuário consegue avançar do passo de seleção de ARP para o passo de itens sem precisar responder manualmente à pergunta de adesão no caso mais comum (não-adesão), reduzindo o número de interações necessárias nessa etapa.
- **CS-002**: Nenhuma quantidade de item informada no formulário excede o saldo real disponível na ARP, eliminando rejeições da API por saldo insuficiente causadas por entrada do usuário.
- **CS-003**: Quando a API retorna um erro ao finalizar o cadastro, o usuário vê a mensagem de erro sem perder o contexto do formulário preenchido, podendo corrigir e reenviar sem recomeçar o fluxo.
- **CS-004**: A mudança de tipo de instrumento (adesão vs. orgão) atualiza os limites de quantidade de forma imediata e sem necessidade de recarregar a página ou a etapa.

## Premissas

- O formulário de cadastro de instrumento (`CadastrarContrato`) é o escopo principal desta especificação. O componente de nota de empenho (`CadastrarNotaEmpenho`) pode receber as mesmas correções se compartilhar o mesmo padrão de vinculação de ARP.
- A entidade `ItemAta` já expõe os campos `qtdConsumidaOrgao` e `qtdConsumidaCarona` via API (`GET /atas/{id}`), tornando possível calcular o saldo no frontend sem chamadas adicionais.
- A pergunta "É uma adesão?" só aparece quando uma ARP está selecionada — o comportamento de reset do radio ao trocar de ARP só se aplica quando o usuário não fez escolha explícita ainda (estado `undefined`).
- A ARP selecionada é carregada detalhadamente via `GetAtaUseCase`, que já retorna os itens com todos os campos de quantidade necessários.
