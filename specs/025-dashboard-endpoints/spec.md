# Especificação de Funcionalidade: Dashboard com Dados Reais

**Branch da Funcionalidade**: `025-dashboard-endpoints`
**Criado em**: 2026-07-22
**Status**: Rascunho
**Entrada**: Descrição do usuário: "use os endpoints do serviço que foram criados para alimentar a dashboard"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Ver indicadores financeiros e operacionais reais (Prioridade: P1)

Como usuário autenticado (Administrador ou Colaborador) do licitante ativo, quero ver, ao acessar a tela inicial, os indicadores de Valor Total Contratado, Valor Total em Atas de Registro de Preços, Instrumentos Ativos e Pendências Financeiras com os números reais da minha empresa, para tomar decisões com informação confiável em vez de dados fictícios.

**Por que esta prioridade**: É a informação mais consultada da tela inicial e a que mais expõe o problema atual — os quatro indicadores exibem valores fixos e iguais para qualquer usuário, o que pode levar a decisões erradas.

**Teste Independente**: Pode ser testado acessando a tela inicial com um usuário de um licitante com dados cadastrados e conferindo que os quatro indicadores (incluindo a variação percentual em relação ao mês anterior, quando houver) correspondem aos dados reais daquele licitante.

**Cenários de Aceite**:

1. **Dado** que estou autenticado e meu licitante ativo possui contratos, atas, instrumentos e pendências cadastrados, **Quando** acesso a tela inicial, **Então** os quatro indicadores exibem os valores reais e atualizados do meu licitante.
2. **Dado** que meu licitante ativo possui histórico do mês anterior para comparação, **Quando** visualizo um indicador de valor (Contratado ou Atas), **Então** vejo a variação percentual real em relação ao mês anterior.
3. **Dado** que meu licitante ativo não possui base de comparação para o mês anterior (ex.: primeiro mês de operação), **Quando** visualizo um indicador de valor, **Então** o sistema não exibe uma variação percentual inventada, indicando que não há comparação disponível.
4. **Dado** que meu licitante ativo ainda não possui nenhum dado cadastrado, **Quando** acesso a tela inicial, **Então** os indicadores são exibidos zerados, sem mensagens de erro.

---

### História de Usuário 2 - Ver evolução mensal e distribuição de instrumentos reais (Prioridade: P2)

Como usuário autenticado, quero ver o gráfico de evolução mensal de valores e o gráfico de distribuição de instrumentos por status refletindo os dados reais da minha empresa, para identificar tendências e a situação atual dos meus instrumentos de forma confiável.

**Por que esta prioridade**: Complementa os indicadores da História 1 com visão de tendência e de composição da carteira; tem menor urgência porque o usuário já obtém o essencial (valores atuais) na P1.

**Teste Independente**: Pode ser testado acessando a tela inicial e comparando os pontos do gráfico de evolução mensal e as fatias do gráfico de status com os dados reais de contratos/atas e instrumentos do licitante no período.

**Cenários de Aceite**:

1. **Dado** que estou autenticado, **Quando** acesso a tela inicial, **Então** o gráfico de evolução mensal exibe os valores reais de contratos e atas dos últimos 6 meses (mês atual mais 5 anteriores), incluindo meses sem nenhum registro.
2. **Dado** que meu licitante ativo possui instrumentos em diferentes situações (vigente, próximo do vencimento, encerrado), **Quando** acesso a tela inicial, **Então** o gráfico de status exibe a distribuição real, mostrando apenas as situações que possuem ao menos um instrumento.
3. **Dado** que meu licitante ativo não possui nenhum instrumento cadastrado, **Quando** acesso a tela inicial, **Então** o gráfico de status é exibido de forma vazia/neutra, sem erro.

---

### História de Usuário 3 - Ver alertas e pendências recentes reais (Prioridade: P3)

Como usuário autenticado, quero ver, na tela inicial, os avisos e pendências mais recentes relacionados aos meus instrumentos e contratos, para identificar rapidamente o que precisa da minha atenção sem precisar navegar até a área de notificações.

**Por que esta prioridade**: É um atalho de conveniência sobre uma informação (notificações) que já existe em outro ponto da plataforma; agrega valor, mas o usuário não fica sem alternativa caso não veja isso na tela inicial.

**Teste Independente**: Pode ser testado gerando uma notificação (ex.: vencimento próximo de um contrato) e conferindo que ela aparece na lista de alertas da tela inicial, com o mesmo conteúdo mostrado na área de notificações.

**Cenários de Aceite**:

1. **Dado** que existem notificações registradas para o meu usuário no licitante ativo, **Quando** acesso a tela inicial, **Então** vejo as até 5 notificações mais recentes, com o mesmo texto e informações exibidos na área de notificações da plataforma.
2. **Dado** que não existe nenhuma notificação para o meu usuário no licitante ativo, **Quando** acesso a tela inicial, **Então** a seção de alertas é exibida de forma vazia, sem lista fictícia.

---

### Casos de Borda

- O que acontece se a tela inicial for acessada antes dos dados terminarem de carregar? O sistema deve indicar visualmente que os dados estão sendo carregados, sem exibir valores fixos ou inconsistentes enquanto isso.
- Como o sistema trata a indisponibilidade momentânea do serviço que fornece os dados da tela inicial? O usuário deve ver uma mensagem de erro compreensível, com a possibilidade de tentar novamente, em vez de uma tela quebrada ou com dados desatualizados sem aviso.
- O que acontece se a sessão do usuário expirar ao acessar a tela inicial? O sistema deve orientar o usuário a autenticar-se novamente.
- Como o sistema trata um usuário sem vínculo válido com o licitante ativo no momento da consulta? O acesso à tela inicial deve ser bloqueado com uma mensagem explicando o motivo, seguindo o mesmo tratamento já aplicado em outras áreas da plataforma.
- O que acontece se o licitante ativo do usuário não for mais encontrado? O sistema deve informar que não foi possível carregar os dados da empresa, em vez de exibir uma tela com valores zerados enganosos.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE substituir todos os valores fixos atualmente exibidos na tela inicial (indicadores, gráfico de evolução mensal, gráfico de status de instrumentos e lista de alertas) pelos dados reais do licitante ativo do usuário autenticado.
- **RF-002**: O sistema DEVE exibir os quatro indicadores — Valor Total Contratado, Valor Total em Atas, Instrumentos Ativos e Pendências Financeiras — com os valores reais e, quando aplicável, a quantidade complementar (instrumentos próximos ao vencimento; pendências aguardando processamento).
- **RF-003**: O sistema DEVE exibir a variação percentual real em relação ao mês anterior para os indicadores de valor (Contratado e Atas) quando essa comparação existir, e DEVE omitir a variação (sem inventar um valor) quando não houver base de comparação.
- **RF-004**: O sistema DEVE exibir a evolução mensal real de valores de contratos e atas para os últimos 6 meses (mês atual e 5 anteriores), incluindo meses sem nenhum registro no período.
- **RF-005**: O sistema DEVE exibir a distribuição real de instrumentos por situação (vigente, próximo do vencimento, encerrado), listando apenas as situações com ao menos um instrumento.
- **RF-006**: O sistema DEVE exibir as até 5 notificações mais recentes do usuário autenticado para o licitante ativo na seção de alertas da tela inicial, com o mesmo conteúdo exibido na área de notificações da plataforma.
- **RF-007**: O sistema DEVE exibir a tela inicial com todos os indicadores zerados e as listas vazias — sem erro — quando o licitante ativo não possuir nenhum dado cadastrado.
- **RF-008**: O sistema DEVE indicar visualmente o carregamento dos dados da tela inicial enquanto a consulta estiver em andamento.
- **RF-009**: O sistema DEVE exibir uma mensagem de erro compreensível e permitir nova tentativa quando os dados da tela inicial não puderem ser obtidos por falha de comunicação, sessão expirada, falta de vínculo com o licitante ou licitante não encontrado.

### Entidades Principais

- **Indicadores da Dashboard**: Conjunto de métricas agregadas do licitante ativo (valor total contratado, valor total em atas, quantidade de instrumentos ativos e quantidade próxima do vencimento, valor e quantidade de pendências financeiras), incluindo a variação percentual mês a mês quando disponível.
- **Ponto de Evolução Mensal**: Registro de um mês específico com os valores agregados de contratos e de atas naquele período, usado para compor a série histórica de 6 meses.
- **Distribuição de Status de Instrumentos**: Contagem de instrumentos agrupados por situação (vigente, próximo do vencimento, encerrado) do licitante ativo.
- **Alerta/Notificação**: Aviso recente relacionado a um instrumento, ata ou ordem de fornecimento do usuário no licitante ativo, já existente na área de notificações da plataforma e reutilizado na tela inicial.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos valores exibidos na tela inicial (indicadores, gráfico de evolução, gráfico de status e alertas) refletem os dados reais e atuais do licitante ativo do usuário, sem nenhum valor fixo remanescente.
- **CS-002**: A tela inicial carrega e exibe os dados reais em até 3 segundos em condições normais de rede.
- **CS-003**: Usuários de licitantes sem dados cadastrados veem a tela inicial normalmente (indicadores zerados), sem telas de erro, em 100% dos acessos.
- **CS-004**: Em caso de falha na obtenção dos dados, 100% dos usuários veem uma mensagem de erro compreensível com opção de tentar novamente, em vez de dados desatualizados sem aviso.

## Premissas

- A tela inicial (dashboard) já existe na plataforma; esta funcionalidade substitui os dados fixos atualmente exibidos por dados reais, sem alterar o layout ou a composição visual das seções já existentes.
- Os dados exibidos refletem sempre o licitante que está ativo para o usuário no momento do acesso, seguindo a mesma noção de "licitante ativo" já usada em outras áreas da plataforma.
- A lista de alertas da tela inicial reutiliza o mesmo conteúdo e regras de exibição já usados na área de notificações da plataforma, limitada às 5 notificações mais recentes.
- Não faz parte do escopo desta funcionalidade permitir que o usuário marque notificações como lidas diretamente pela tela inicial, nem personalizar quais indicadores são exibidos — esses fluxos, se existirem, pertencem a outras áreas da plataforma.
- A atualização dos dados ocorre ao carregar a tela inicial; não é exigida atualização automática em tempo real enquanto o usuário permanece na tela.
