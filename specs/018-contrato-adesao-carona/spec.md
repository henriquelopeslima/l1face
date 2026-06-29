# Especificação de Funcionalidade: Exibição de Saldo de Carona nos Itens do Contrato de Adesão

**Branch da Funcionalidade**: `018-contrato-adesao-carona`  
**Criado em**: 2026-06-29  
**Status**: Rascunho

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Itens mostram saldo de carona quando contrato é adesão (Prioridade: P1)

Um usuário está cadastrando um contrato vinculado a uma ARP e marca que é uma adesão (carona). Ao avançar para a etapa de itens, cada item deve exibir o saldo disponível para carona — e não o saldo disponível para o órgão gerenciador. Itens sem saldo de carona devem ser claramente identificados como indisponíveis para adesão.

**Por que esta prioridade**: É o coração da melhoria solicitada. Sem isso, o usuário pode tentar alocar quantidade maior do que o saldo de carona permite, gerando inconsistências no contrato cadastrado.

**Teste Independente**: Pode ser testado abrindo o fluxo de cadastro de contrato, selecionando uma ARP que aceita adesão, marcando "Sim" em "É uma adesão?", avançando para a etapa de itens e verificando se os saldos exibidos correspondem à coluna carona e não à coluna órgão da ARP.

**Cenários de Aceite**:

1. **Dado** que o usuário selecionou uma ARP que aceita adesão e marcou o contrato como adesão, **Quando** avança para a etapa de itens, **Então** cada item carregado da ARP exibe o saldo disponível para carona (`qtd_para_carona - qtd_consumida_carona`), não o saldo do órgão.
2. **Dado** que um item da ARP tem `qtd_para_carona = 0` (não alocado para carona), **Quando** o contrato está marcado como adesão, **Então** esse item é exibido como "Sem saldo" na coluna de quantidade e não pode receber quantidade.
3. **Dado** que um item da ARP tem `saldo_carona = 50`, **Quando** o usuário tenta inserir quantidade 60, **Então** o valor é limitado automaticamente a 50.
4. **Dado** que o contrato **não** é adesão (campo marcado como "Não"), **Quando** o usuário visualiza os itens, **Então** o saldo exibido é o saldo do órgão (`qtd_registrada - qtd_consumida_orgao`), sem alteração do comportamento atual.

---

### História de Usuário 2 - Indicação visual clara do tipo de saldo exibido (Prioridade: P2)

O usuário consegue identificar visualmente, na etapa de itens do contrato, se o saldo exibido é "Saldo Órgão" ou "Saldo Carona", sem necessidade de voltar à etapa anterior para conferir se marcou adesão.

**Por que esta prioridade**: Reduz erros de preenchimento e dúvidas sobre qual saldo está sendo consumido. É uma melhoria de usabilidade que complementa o comportamento correto.

**Teste Independente**: Pode ser testado verificando se há um rótulo ou indicação diferenciada no cabeçalho ou na célula de quantidade da tabela de itens, que muda de acordo com o estado de adesão.

**Cenários de Aceite**:

1. **Dado** que o contrato está marcado como adesão, **Quando** o usuário visualiza a tabela de itens, **Então** a coluna de quantidade exibe um rótulo como "Qtd. / Saldo Carona" (ou equivalente) ao invés de apenas "Quantidade".
2. **Dado** que o contrato **não** é adesão, **Quando** o usuário visualiza a tabela de itens com ARP vinculada, **Então** a coluna exibe "Qtd. / Saldo Órgão" (ou equivalente).
3. **Dado** que não há ARP vinculada, **Quando** o usuário visualiza a tabela de itens, **Então** a coluna exibe simplesmente "Quantidade", sem referência a saldo.

---

### História de Usuário 3 - Validação de avanço considera saldo de carona (Prioridade: P3)

Ao tentar avançar da etapa de itens para revisão em um contrato de adesão, a validação impede o avanço se todos os itens vinculados à ARP estiverem sem saldo de carona disponível.

**Por que esta prioridade**: Garante que contratos de adesão inválidos (sem nenhum item com saldo de carona) não avancem para finalização.

**Teste Independente**: Pode ser testado selecionando uma ARP onde todos os itens têm `qtd_para_carona = 0`, marcando como adesão, e verificando se o botão "Avançar" permanece desabilitado.

**Cenários de Aceite**:

1. **Dado** que todos os itens da ARP têm saldo de carona igual a zero e o contrato é adesão, **Quando** o usuário está na etapa de itens, **Então** o botão "Avançar" está desabilitado.
2. **Dado** que ao menos um item tem saldo de carona disponível e quantidade preenchida, **Quando** o usuário está na etapa de itens, **Então** o botão "Avançar" está habilitado.

---

### Casos de Borda

- O que acontece quando a ARP aceita adesão mas todos os itens têm `qtd_para_carona = 0`? → O contrato deve ser marcável como adesão, mas todos os itens aparecerão como "Sem saldo" e o botão "Avançar" ficará desabilitado até que ao menos um item tenha saldo e quantidade preenchida.
- O que acontece se o usuário alterna entre "Sim" e "Não" em adesão após já ter preenchido quantidades? → Os saldos exibidos devem atualizar imediatamente para o tipo correspondente (carona ou órgão), e quantidades que excedam o novo saldo devem ser zeradas ou limitadas ao novo máximo.
- O que acontece quando o contrato não tem ARP vinculada e o campo adesão não é exibido? → Sem ARP, nenhuma referência a saldo de carona ou órgão é exibida — comportamento inalterado.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: Quando o contrato estiver marcado como adesão, os itens vinculados à ARP DEVEM exibir o saldo disponível para carona (`qtd_para_carona - qtd_consumida_carona`) como limite de quantidade.
- **RF-002**: Quando o contrato **não** estiver marcado como adesão, os itens vinculados à ARP DEVEM exibir o saldo disponível para o órgão (`qtd_registrada - qtd_consumida_orgao`) como limite de quantidade, mantendo o comportamento atual.
- **RF-003**: A tabela de itens DEVE diferenciar visualmente o tipo de saldo exibido (carona vs. órgão) quando uma ARP estiver vinculada.
- **RF-004**: Itens com saldo de carona igual a zero DEVEM ser exibidos como indisponíveis ("Sem saldo") quando o contrato for adesão, mesmo que o saldo do órgão seja maior que zero.
- **RF-005**: A quantidade inserida por item NÃO DEVE exceder o saldo disponível para o tipo selecionado (carona ou órgão), com limitação automática no campo de entrada.
- **RF-006**: Ao alternar entre "adesão" e "não adesão", os limites de quantidade e os indicadores de saldo DEVEM ser recalculados imediatamente para todos os itens.
- **RF-007**: A validação que habilita o botão "Avançar" da etapa de itens DEVE usar o saldo correto (carona ou órgão) conforme o tipo do contrato.
- **RF-008**: A entidade `ItemAta` no sistema já contém todos os campos necessários (`qtd_para_carona`, `qtd_consumida_carona`, `qtd_registrada`, `qtd_consumida_orgao`); nenhuma alteração na API ou no mapeamento de dados é necessária.

### Entidades Principais

- **ItemAta**: Representa um item de uma Ata de Registro de Preços. Campos relevantes: `qtdRegistrada`, `qtdParaCarona`, `qtdConsumidaOrgao`, `qtdConsumidaCarona`. O saldo disponível para o órgão é `qtdRegistrada - qtdConsumidaOrgao`; o saldo disponível para carona é `qtdParaCarona - qtdConsumidaCarona`.
- **ItemContrato** (estrutura interna do formulário): Representa um item sendo configurado no contrato. Já possui os campos `saldoOrgao` e `saldoCarona` calculados a partir do `ItemAta`.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um usuário consegue cadastrar um contrato de adesão inserindo quantidades corretamente limitadas ao saldo de carona de cada item, sem conseguir ultrapassar esse limite.
- **CS-002**: Um usuário não consegue avançar para a etapa de revisão em um contrato de adesão quando todos os itens da ARP têm saldo de carona igual a zero.
- **CS-003**: Ao alternar entre "adesão" e "não adesão", a troca de saldo exibido ocorre imediatamente, sem necessidade de recarregar a página ou re-selecionar a ARP.
- **CS-004**: O tipo de saldo exibido (carona ou órgão) é legível e identificável sem ambiguidade na etapa de itens do formulário.

## Premissas

- A entidade `ItemAta` e o mapeamento da API já incluem todos os campos de saldo necessários (`qtdParaCarona`, `qtdConsumidaCarona`); nenhuma alteração na camada de dados é necessária.
- A lógica de saldo calculado (`saldoOrgao`, `saldoCarona`) já é populada corretamente ao carregar itens de uma ARP; apenas a apresentação e a validação precisam ser ajustadas.
- O campo `isAdesao` no formulário já é gerenciado corretamente e reflete o estado atual de adesão do contrato.
- A ARP só permite marcação como adesão (`isAdesao = true`) se `aceita_adesao = true` na ARP; essa regra já está implementada e não muda.
- A mesma melhoria pode se aplicar ao fluxo de cadastro de Nota de Empenho, mas está fora do escopo desta especificação (pode ser tratada em uma feature separada ou como extensão).
