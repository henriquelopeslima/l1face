# Especificação de Funcionalidade: Listagem de Atas com API Real

**Branch da Funcionalidade**: `004-atas-api-integration`  
**Criado em**: 2026-05-23  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Na página de listar as atas, use a api real. Liste as atas passando o identificador do licitante pelo header, utilizando a rota que não passa o identificador pelo path ou query."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Visualizar atas cadastradas (Prioridade: P1)

O licitante autenticado acessa a página de gestão de atas e vê a lista atualizada de atas diretamente do servidor, sem dados fictícios.

**Por que esta prioridade**: É o fluxo central da funcionalidade — sem dados reais, a página não tem valor para o usuário.

**Teste Independente**: Pode ser totalmente testado abrindo a página de gestão de atas após cadastrar ao menos uma ata real, e verificando que ela aparece na listagem.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado e tem um licitante ativo selecionado, **Quando** acessa a página de gestão de atas, **Então** a lista exibe as atas reais cadastradas para o licitante ativo.
2. **Dado** que o licitante ativo não possui nenhuma ata cadastrada, **Quando** o usuário acessa a página, **Então** a lista é exibida vazia com mensagem informativa.
3. **Dado** que a página está carregando os dados da API, **Quando** o usuário aguarda, **Então** um indicador de carregamento é exibido no lugar da tabela.

---

### História de Usuário 2 - Identificação automática do licitante (Prioridade: P1)

O sistema identifica automaticamente o licitante ativo da sessão e envia seu identificador para a API ao buscar as atas, sem exigir qualquer ação adicional do usuário.

**Por que esta prioridade**: A identificação do licitante é pré-requisito para buscar os dados corretos e garante que cada usuário veja apenas as atas do seu licitante.

**Teste Independente**: Pode ser testado verificando que, ao acessar a página, a requisição de atas inclui o identificador do licitante ativo no cabeçalho apropriado.

**Cenários de Aceite**:

1. **Dado** que o usuário tem um licitante ativo selecionado na sessão, **Quando** a página de atas é carregada, **Então** a requisição ao servidor inclui automaticamente o identificador do licitante no cabeçalho `X-Licitante-Id`.
2. **Dado** que o usuário não tem licitante ativo selecionado, **Quando** tenta acessar a página de atas, **Então** é redirecionado para selecionar um licitante antes de continuar.

---

### História de Usuário 3 - Tratamento de falha na busca (Prioridade: P2)

Quando a busca das atas na API falha, o usuário recebe uma mensagem de erro clara e informativa em vez de uma tela em branco ou quebrada.

**Por que esta prioridade**: Garante resiliência da interface e boa experiência mesmo em cenários de falha.

**Teste Independente**: Pode ser testado simulando falha de rede ou resposta de erro da API e verificando que uma mensagem de erro é exibida com opção de nova tentativa.

**Cenários de Aceite**:

1. **Dado** que a API retorna erro ao buscar as atas, **Quando** o usuário acessa a página, **Então** uma mensagem de erro é exibida informando que não foi possível carregar as atas.
2. **Dado** que ocorreu erro ao carregar as atas, **Quando** o usuário clica em tentar novamente, **Então** a página refaz a requisição à API.

---

### Casos de Borda

- O que acontece quando a API retorna `403` (usuário sem vínculo com o licitante informado)?
- O que acontece quando a API retorna `400` (cabeçalho `X-Licitante-Id` ausente)?
- Como a página se comporta quando o licitante ativo foi desconectado da sessão entre o login e o acesso à página de atas?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE buscar a lista de atas do servidor ao carregar a página de gestão de atas, substituindo os dados estáticos atualmente exibidos.
- **RF-002**: O sistema DEVE enviar o identificador do licitante ativo no cabeçalho `X-Licitante-Id` ao requisitar a listagem de atas.
- **RF-003**: O sistema DEVE exibir um indicador de carregamento enquanto aguarda a resposta da API.
- **RF-004**: O sistema DEVE exibir a lista de atas retornada pela API, mapeando os campos da resposta para a interface visual existente.
- **RF-005**: O sistema DEVE exibir uma mensagem informativa quando a lista de atas estiver vazia.
- **RF-006**: O sistema DEVE exibir uma mensagem de erro quando a busca falhar, com opção de nova tentativa.
- **RF-007**: O sistema DEVE mapear os valores de status retornados pela API (`ATIVA`, `PROXIMA_AO_VENCIMENTO`, `ENCERRADA`) para os rótulos visuais correspondentes exibidos na interface.
- **RF-008**: O sistema DEVE manter os filtros de busca por texto e por status funcionando sobre os dados retornados da API.

### Entidades Principais

- **Ata (Listagem)**: Representa uma ata de registro de preços do licitante, com campos: identificador, número da ata, objeto/descrição, órgão gerenciador (nome e CNPJ), data de início de vigência, data de fim de vigência, valor registrado, saldo disponível, quantidade de contratos vinculados, status calculado, indicação de aceite de adesão (carona) e renovabilidade.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: A página de gestão de atas exibe dados reais do servidor em 100% das visitas de usuários autenticados com licitante ativo, sem depender de dados estáticos.
- **CS-002**: Os dados da listagem refletem o estado atual do servidor a cada acesso à página.
- **CS-003**: O carregamento inicial da lista de atas é percebido pelo usuário em menos de 3 segundos em condições normais de rede.
- **CS-004**: Erros de comunicação com o servidor são comunicados ao usuário de forma clara em 100% dos casos de falha.

## Premissas

- O usuário sempre terá um licitante ativo selecionado ao acessar a página de atas (o fluxo de seleção de licitante existe e está funcional).
- O `apiClient` centralizado já gerencia o envio do cabeçalho `X-Licitante-Id` automaticamente quando há um licitante ativo na sessão.
- A estrutura visual e os filtros existentes na página serão preservados; apenas a fonte de dados muda de estática para dinâmica.
- Os campos `saldo` e `contratos` retornados pela API podem retornar `0` como implementação futura — a interface deve exibi-los como estão.
- A paginação não está no escopo desta funcionalidade; todos os registros retornados pela API serão exibidos de uma vez.
