# Especificação de Funcionalidade: Visualizar Detalhes de uma Ata

**Branch da Funcionalidade**: `006-ata-detail-view`  
**Criado em**: 2026-05-24  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Na página de listar as atas existe um botão para ver uma ata em detalhes. Resgate a ata passando o identificador do licitante pelo header e o id da ata na query."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Acessar detalhes de uma ata a partir da listagem (Prioridade: P1)

Um licitante autenticado está na página de listagem de atas e clica no botão de detalhes de uma ata específica. O sistema exibe uma página (ou painel) com todas as informações completas daquela ata, incluindo seus itens.

**Por que esta prioridade**: É o fluxo central da funcionalidade — sem ele não há como visualizar os detalhes de uma ata específica.

**Teste Independente**: Pode ser totalmente testado clicando no botão de detalhes de qualquer ata na listagem e verificando que a tela de detalhes exibe as informações completas da ata correta.

**Cenários de Aceite**:

1. **Dado** que o licitante está autenticado e na página de listagem de atas, **Quando** clica no botão de detalhes de uma ata, **Então** o sistema navega para a página de detalhes daquela ata.
2. **Dado** que o licitante está na página de detalhes de uma ata, **Quando** a página carrega, **Então** são exibidos: número da ata, descrição/objeto, órgão gerenciador (nome e CNPJ), datas de vigência (início e fim), status calculado, se aceita adesão, se é renovável, número PNCP (se houver) e URL do anexo (se houver).
3. **Dado** que o licitante está na página de detalhes de uma ata, **Quando** a página carrega, **Então** a lista de itens da ata é exibida com: número do item, descrição, unidade de medida, valor estimado, quantidade registrada, quantidade para carona, quantidade consumida pelo órgão e quantidade consumida por carona.

---

### História de Usuário 2 - Retornar à listagem de atas (Prioridade: P2)

O licitante está visualizando os detalhes de uma ata e deseja voltar para a listagem.

**Por que esta prioridade**: Garante que o usuário não fique "preso" na tela de detalhes e consiga navegar fluidamente pela aplicação.

**Teste Independente**: Pode ser testado clicando no botão/link de retorno e verificando que a listagem de atas é exibida novamente com o estado anterior preservado.

**Cenários de Aceite**:

1. **Dado** que o licitante está na página de detalhes de uma ata, **Quando** clica no controle de navegação de retorno, **Então** é redirecionado para a página de listagem de atas.

---

### História de Usuário 3 - Lidar com falha ao carregar os detalhes (Prioridade: P3)

O sistema tenta carregar os detalhes de uma ata, mas a requisição falha (ata não encontrada, acesso negado ou erro de servidor).

**Por que esta prioridade**: Garante resiliência da interface e comunicação clara de erros ao usuário.

**Teste Independente**: Pode ser testado simulando falhas de rede ou acessando uma ata com ID inválido e verificando que uma mensagem de erro adequada é exibida.

**Cenários de Aceite**:

1. **Dado** que o licitante tenta visualizar uma ata que não existe ou à qual não tem acesso, **Quando** a página de detalhes tenta carregar, **Então** uma mensagem de erro clara é exibida informando que a ata não foi encontrada ou o acesso foi negado.
2. **Dado** que ocorre um erro inesperado ao carregar os detalhes, **Quando** a requisição falha, **Então** o sistema exibe uma mensagem de erro genérica com opção de tentar novamente.

---

### Casos de Borda

- O que acontece quando o licitante ativo muda enquanto a página de detalhes está carregada?
- Como o sistema trata um `id` de ata inválido (formato incorreto) na URL/query?
- Como são exibidos campos opcionais ausentes (número PNCP, URL do anexo)?
- O que acontece quando a ata tem uma lista de itens muito grande?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir um botão de acesso aos detalhes para cada ata na página de listagem.
- **RF-002**: Ao acionar o botão de detalhes, o sistema DEVE navegar para a visualização completa da ata selecionada.
- **RF-003**: O sistema DEVE buscar os dados detalhados da ata enviando o identificador do licitante ativo via header e o identificador da ata como parâmetro de consulta.
- **RF-004**: A página de detalhes DEVE exibir todos os campos de cabeçalho da ata: número, descrição/objeto, órgão gerenciador (nome e CNPJ), datas de vigência, status calculado, indicadores de adesão e renovação, número PNCP e URL do anexo.
- **RF-005**: A página de detalhes DEVE exibir a lista completa de itens da ata, com todos os campos de cada item: número, descrição, unidade de medida, valor estimado, quantidades registradas, disponíveis para carona e consumidas.
- **RF-006**: O sistema DEVE apresentar um indicador visual de carregamento enquanto os dados da ata são recuperados.
- **RF-007**: O sistema DEVE exibir mensagem de erro adequada quando a ata não for encontrada (recurso inexistente) ou o acesso for negado.
- **RF-008**: O sistema DEVE exibir mensagem de erro genérica com opção de nova tentativa em caso de falha inesperada.
- **RF-009**: A página de detalhes DEVE oferecer um mecanismo de retorno à listagem de atas.
- **RF-010**: O status da ata (`ATIVA`, `PROXIMA_AO_VENCIMENTO`, `ENCERRADA`) DEVE ser exibido com diferenciação visual.

### Entidades Principais

- **Ata**: Registro de Preços identificado por UUID, com campos de cabeçalho (número, descrição, órgão gerenciador, vigência, status, indicadores de adesão/renovação, referências externas opcionais) e lista de itens.
- **Item da Ata**: Produto ou serviço registrado na ata, identificado por UUID, contendo número do item, descrição, unidade de medida, valores estimados e quantidades (registrada, disponível para carona, consumida pelo órgão, consumida por carona).
- **Licitante**: Empresa representada pelo usuário autenticado; seu identificador é enviado no cabeçalho de cada requisição às atas para garantir que o usuário só acesse dados aos quais tem vínculo.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O licitante consegue navegar da listagem para os detalhes completos de uma ata em até 2 cliques.
- **CS-002**: Os detalhes da ata são exibidos em menos de 3 segundos em condições normais de rede.
- **CS-003**: 100% dos campos de cabeçalho e todos os itens da ata são apresentados na tela de detalhes sem perda de informação.
- **CS-004**: Erros de carregamento são comunicados ao usuário em 100% das ocorrências, sem deixar a tela em estado de carregamento indefinido.
- **CS-005**: O licitante consegue retornar à listagem de atas a partir da tela de detalhes sem perder o contexto de navegação.

## Premissas

- O usuário está autenticado e possui um licitante ativo selecionado no momento da navegação.
- O identificador do licitante ativo está disponível no estado da aplicação para ser enviado como header nas requisições.
- O identificador (UUID) da ata está disponível no contexto da listagem para ser passado como parâmetro de consulta.
- A resposta da API inclui os itens da ata embutidos na resposta de detalhes (não requer chamada separada).
- Campos opcionais ausentes (número PNCP, URL do anexo) são exibidos como "não informado" ou simplesmente omitidos da interface.
- O status da ata é calculado pelo servidor e retornado pronto; o frontend não precisa calculá-lo.
