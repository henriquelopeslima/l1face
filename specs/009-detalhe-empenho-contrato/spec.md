# Especificação de Funcionalidade: Visualizar Detalhes de Instrumento

**Branch da Funcionalidade**: `009-detalhe-empenho-contrato`  
**Criado em**: 2026-06-01  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Eu quero listar em detalhes o Empenho e o Contrato, após selecionar um instrumento na tela de gestão de instrumentos."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Visualizar Detalhes de um Contrato (Prioridade: P1)

Como usuário autenticado de um licitante, quero clicar em um instrumento do tipo Contrato na lista de instrumentos e ver todas as suas informações completas (vigências, prazos, itens, ata vinculada etc.), para acompanhar os detalhes e obrigações do contrato sem precisar navegar para fora da plataforma.

**Por que esta prioridade**: O Contrato é o instrumento mais completo e comum, com o maior volume de campos. A tela de detalhe do contrato entrega o MVP da funcionalidade e é o caso de uso mais frequente dos usuários.

**Teste Independente**: Pode ser totalmente testado selecionando um instrumento do tipo Contrato existente na lista e verificando que todos os campos (vigência, prazos, itens, etc.) são exibidos corretamente na tela de detalhes.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de gestão de instrumentos com contratos listados, **Quando** clica em um instrumento do tipo Contrato, **Então** é exibida uma tela (ou painel lateral) com todos os dados do contrato: número, órgão contratante, unidade, objeto, vigência inicial, vigência final, status, valor total, saldo, indicação de renovável e, quando preenchidos, endereço, prazo de entrega, tipo de prazo de entrega, prazo de pagamento, tipo de prazo de pagamento, endereço de entrega e URL do anexo.
2. **Dado** que o contrato exibido possui itens cadastrados, **Quando** o usuário visualiza os detalhes, **Então** os itens são listados com descrição, unidade de medida, quantidade total, valor unitário e valor total de cada item.
3. **Dado** que o contrato está vinculado a uma Ata de Registro de Preços, **Quando** o usuário visualiza os detalhes, **Então** as informações da ata vinculada são exibidas (identificador/número da ata).
4. **Dado** que o contrato possui URL de anexo, **Quando** o usuário visualiza os detalhes, **Então** um link ou botão para acessar o documento anexo é exibido.
5. **Dado** que o usuário está visualizando os detalhes de um contrato, **Quando** clica na ação de fechar/voltar, **Então** retorna para a listagem de instrumentos sem perder o estado da lista (posição de scroll, filtros ativos).

---

### História de Usuário 2 - Visualizar Detalhes de um Empenho (Prioridade: P2)

Como usuário autenticado de um licitante, quero clicar em um instrumento do tipo Empenho na lista e ver seus dados completos, para entender o escopo do empenho e verificar os itens e a ata vinculada sem precisar sair da plataforma.

**Por que esta prioridade**: O Empenho tem estrutura mais simples que o Contrato (sem vigência própria), mas é essencial para cobrir o portfólio completo. Vem após o Contrato porque o detalhe do empenho é um subconjunto do detalhe do contrato.

**Teste Independente**: Pode ser totalmente testado selecionando um instrumento do tipo Empenho existente na lista e verificando que órgão, unidade, objeto e itens são exibidos corretamente, sem campos de vigência.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de gestão de instrumentos com empenhos listados, **Quando** clica em um instrumento do tipo Empenho, **Então** é exibida uma tela (ou painel lateral) com os dados do empenho: órgão contratante, unidade, objeto, status e saldo, e — quando preenchidos — número PNCP e URL do anexo. Campos exclusivos de contrato (vigências, prazos de entrega/pagamento, renovável) não são exibidos.
2. **Dado** que o empenho exibido possui itens cadastrados, **Quando** o usuário visualiza os detalhes, **Então** os itens são listados com descrição, unidade de medida, quantidade total, valor unitário e valor total.
3. **Dado** que o empenho está vinculado a uma Ata de Registro de Preços, **Quando** o usuário visualiza os detalhes, **Então** as informações da ata vinculada são exibidas.
4. **Dado** que o empenho não está vinculado a nenhuma ata, **Quando** o usuário visualiza os detalhes, **Então** o campo de ata é omitido ou exibido como "Não vinculado".

---

### Casos de Borda

- O que acontece quando o usuário acessa diretamente a URL de detalhe de um instrumento que foi excluído ou ao qual não tem acesso?
- Como o sistema se comporta quando o instrumento não possui itens cadastrados — a seção de itens é ocultada ou exibida vazia?
- O que acontece quando o usuário tenta abrir os detalhes de um instrumento enquanto os dados ainda estão sendo carregados?
- Como a tela de detalhe se comporta em caso de erro ao buscar os dados do instrumento?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: Ao selecionar um instrumento na listagem, o sistema DEVE exibir uma tela de detalhes com todas as informações do instrumento selecionado, diferenciando os campos disponíveis por tipo (Contrato ou Empenho).
- **RF-002**: Para instrumentos do tipo **Contrato**, o sistema DEVE exibir: número, órgão contratante, unidade, objeto, vigência inicial, vigência final, status de vigência, valor total, saldo, indicação de renovável; e opcionalmente (quando presentes): número PNCP, endereço, prazo de entrega com tipo (úteis/corridos), prazo de pagamento com tipo (úteis/corridos), endereço de entrega, URL de anexo, ata vinculada e itens.
- **RF-003**: Para instrumentos do tipo **Empenho**, o sistema DEVE exibir: órgão contratante, unidade, objeto, status, valor total e saldo; e opcionalmente (quando presentes): número PNCP, URL de anexo, ata vinculada e itens. Campos exclusivos de contrato (vigências, prazos, renovável) não devem ser exibidos.
- **RF-004**: Quando o instrumento possuir itens, o sistema DEVE exibi-los em formato de tabela ou lista com: descrição, unidade de medida, quantidade total, valor unitário e valor total.
- **RF-005**: O sistema DEVE exibir o status de vigência do instrumento com destaque visual consistente com a listagem ("Ativa", "Próxima ao Vencimento", "Encerrada").
- **RF-006**: O usuário DEVE conseguir retornar à listagem de instrumentos a partir da tela de detalhes.
- **RF-007**: O sistema DEVE exibir indicação de carregamento enquanto os dados do instrumento estão sendo buscados.
- **RF-008**: O sistema DEVE exibir uma mensagem de erro amigável caso a busca dos dados do instrumento falhe, com opção de tentar novamente.

### Entidades Principais

- **InstrumentoDetalhe**: Representação completa de um instrumento com todos os campos disponíveis (superconjunto de `InstrumentoListagem`), incluindo itens, ata vinculada, prazos e endereços.
- **ItemInstrumento**: Item de fornecimento vinculado ao instrumento, com descrição, unidade de medida, quantidade, valor unitário e valor total.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários conseguem acessar os detalhes completos de um instrumento em até 2 cliques a partir da listagem.
- **CS-002**: Os detalhes do instrumento são exibidos em menos de 2 segundos após a seleção.
- **CS-003**: 100% dos campos cadastrados para o instrumento são exibidos na tela de detalhe — nenhuma informação preenchida no cadastro fica inacessível ao usuário.
- **CS-004**: Campos não aplicáveis ao tipo do instrumento (ex.: vigência para Empenho) nunca aparecem na tela de detalhe, reduzindo ruído visual.
- **CS-005**: Usuários conseguem retornar à listagem e o estado da lista (scroll, filtros) é preservado.

## Premissas

- O usuário já realizou o cadastro do instrumento (Contrato ou Empenho) via a funcionalidade da spec 008.
- A API fornece um endpoint para buscar os detalhes completos de um instrumento por ID, retornando todos os campos incluindo itens e ata vinculada.
- A tela de detalhe é acessada a partir da tela de gestão de instrumentos (`InstrumentosGestaoPage`), podendo ser uma nova página ou um painel lateral/modal — a escolha de padrão de navegação (página dedicada vs. drawer) é definida na fase de planejamento.
- Os itens do instrumento já foram cadastrados junto ao instrumento na fase de criação.
- A funcionalidade de edição ou exclusão de instrumento está fora do escopo desta feature.
