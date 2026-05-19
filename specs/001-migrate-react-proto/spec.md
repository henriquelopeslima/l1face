# Especificação de Funcionalidade: Migração do Protótipo React para l1face

**Branch da Funcionalidade**: `001-migrate-react-proto`
**Criado em**: 2026-05-18
**Status**: Rascunho
**Entrada**: Migrar o protótipo de interface criado em ferramenta de prototipação (react-proto) para o projeto l1face, mantendo a interface exatamente igual e seguindo as boas práticas.

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Autenticação e Seleção de Entidade (Prioridade: P1)

O usuário acessa o sistema e realiza login com suas credenciais. Após autenticar, seleciona o vínculo institucional (órgão/entidade) com o qual deseja operar antes de acessar as demais funcionalidades.

**Por que esta prioridade**: É o ponto de entrada obrigatório do sistema. Sem autenticação e seleção de vínculo, nenhuma outra funcionalidade é acessível.

**Teste Independente**: Pode ser totalmente testado abrindo a aplicação, inserindo credenciais e selecionando um vínculo — entregando acesso ao Dashboard.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de Login, **Quando** insere credenciais válidas e confirma, **Então** é redirecionado para a tela de Seleção de Vínculo.
2. **Dado** que o usuário está na tela de Seleção de Vínculo, **Quando** seleciona um vínculo institucional, **Então** é redirecionado para o Dashboard.
3. **Dado** que o usuário está em qualquer rota protegida sem autenticação, **Quando** tenta acessar, **Então** é redirecionado para a tela de Login.

---

### História de Usuário 2 - Dashboard e Navegação Principal (Prioridade: P1)

O usuário visualiza um painel inicial com resumo das informações relevantes do sistema e navega entre as seções principais usando a barra lateral (desktop) ou navegação inferior (mobile).

**Por que esta prioridade**: O Dashboard é a tela central após login e a navegação principal é essencial para uso de todas as demais funcionalidades.

**Teste Independente**: Pode ser testado verificando que o Dashboard exibe conteúdo, que a sidebar aparece no desktop, que a navegação inferior aparece no mobile, e que os links redirecionam corretamente.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado, **Quando** acessa a página inicial, **Então** vê o Dashboard com o painel de informações.
2. **Dado** que o usuário está no Desktop, **Quando** visualiza o layout, **Então** a barra lateral de navegação está visível com as seções do sistema.
3. **Dado** que o usuário está em dispositivo mobile, **Quando** visualiza o layout, **Então** a navegação inferior está visível e a sidebar está oculta.
4. **Dado** que o usuário clica em um item do menu, **Quando** navega, **Então** o breadcrumb no cabeçalho reflete a seção atual.

---

### História de Usuário 3 - Gestão de Instrumentos Contratuais (Prioridade: P1)

O usuário visualiza a lista de instrumentos contratuais (contratos, notas de empenho e outros) gerenciados pelo seu vínculo, pode cadastrar novos instrumentos e visualizar os detalhes de cada um.

**Por que esta prioridade**: É o módulo principal de negócio da aplicação — gestão de contratos públicos é o propósito central do sistema.

**Teste Independente**: Pode ser testado acessando a listagem de instrumentos, cadastrando cada tipo (contrato, nota de empenho, outro) e abrindo a tela de detalhes de um registro existente.

**Cenários de Aceite**:

1. **Dado** que o usuário acessa Instrumentos > Gestão, **Quando** a tela carrega, **Então** visualiza a lista de instrumentos contratuais com seus dados resumidos.
2. **Dado** que o usuário acessa Instrumentos > Cadastrar, **Quando** a tela carrega, **Então** vê as opções de tipo: Contrato, Nota de Empenho, Outro Instrumento.
3. **Dado** que o usuário seleciona "Contrato" no cadastro, **Quando** preenche e envia o formulário, **Então** o instrumento é registrado e uma confirmação de sucesso é exibida.
4. **Dado** que o usuário seleciona "Nota de Empenho" no cadastro, **Quando** preenche e envia o formulário, **Então** o instrumento é registrado com sucesso.
5. **Dado** que o usuário clica em um contrato na listagem, **Quando** a tela de detalhes abre, **Então** visualiza todas as informações do contrato selecionado.
6. **Dado** que o usuário clica em uma nota de empenho na listagem, **Quando** a tela de detalhes abre, **Então** visualiza todos os dados da nota de empenho.

---

### História de Usuário 4 - Gestão de Atas de Registro de Preços (Prioridade: P2)

O usuário gerencia Atas de Registro de Preços (ARPs): visualiza a lista, cadastra novas atas, consulta detalhes, gera contratos a partir da ata, registra adesões e visualiza a ata completa.

**Por que esta prioridade**: É um módulo crítico para gestão de compras públicas mas depende do módulo de instrumentos já estar funcionando para fazer sentido no fluxo.

**Teste Independente**: Pode ser testado navegando até Atas > Gestão, cadastrando uma ARP, abrindo os detalhes e testando cada sub-ação disponível (gerar contrato, registrar adesão, visualizar).

**Cenários de Aceite**:

1. **Dado** que o usuário acessa Atas > Gestão, **Quando** a tela carrega, **Então** visualiza a lista de ARPs cadastradas.
2. **Dado** que o usuário acessa Atas > Cadastrar, **Quando** preenche e envia o formulário, **Então** a ARP é registrada com sucesso.
3. **Dado** que o usuário acessa os detalhes de uma ARP, **Quando** a tela carrega, **Então** visualiza todas as informações e as ações disponíveis.
4. **Dado** que o usuário acessa "Gerar Contrato" a partir de uma ARP, **Quando** conclui o fluxo, **Então** um instrumento contratual é gerado vinculado à ARP.
5. **Dado** que o usuário acessa "Registrar Adesão" em uma ARP, **Quando** preenche e confirma, **Então** a adesão é registrada na ARP.
6. **Dado** que o usuário acessa "Visualizar" em uma ARP, **Quando** a tela abre, **Então** pode ver o conteúdo completo da ata.

---

### História de Usuário 5 - Suporte e Configurações (Prioridade: P3)

O usuário acessa a seção de suporte para obter ajuda e a seção de configurações para gerenciar preferências da conta e do sistema.

**Por que esta prioridade**: Funcionalidades de suporte ao uso, importantes mas não bloqueantes para o core do sistema.

**Teste Independente**: Pode ser testado acessando as rotas de suporte e configurações e verificando que as telas renderizam corretamente com seus respectivos conteúdos.

**Cenários de Aceite**:

1. **Dado** que o usuário acessa a seção Suporte, **Quando** a tela carrega, **Então** visualiza as opções e informações de ajuda disponíveis.
2. **Dado** que o usuário acessa Configurações, **Quando** a tela carrega, **Então** visualiza e pode interagir com as preferências do sistema.
3. **Dado** que o usuário está em qualquer tela autenticada, **Quando** clica no botão flutuante de suporte, **Então** o chatbot de suporte é exibido.

---

### Casos de Borda

- O que acontece quando o usuário tenta acessar uma rota com ID de ARP ou contrato inexistente?
- Como o sistema se comporta quando a lista de instrumentos ou ARPs está vazia?
- Como a interface se adapta em telas de tamanho intermediário (tablets)?
- O que acontece ao recarregar a página em uma rota protegida sem sessão ativa?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir uma tela de Login como ponto de entrada para usuários não autenticados.
- **RF-002**: O sistema DEVE exibir uma tela de Seleção de Vínculo após autenticação, antes de liberar acesso às funcionalidades principais.
- **RF-003**: O sistema DEVE exibir um Dashboard na página inicial após o usuário selecionar seu vínculo.
- **RF-004**: O sistema DEVE exibir uma barra lateral de navegação em dispositivos desktop.
- **RF-005**: O sistema DEVE exibir uma barra de navegação inferior em dispositivos mobile.
- **RF-006**: O sistema DEVE exibir um cabeçalho com breadcrumb dinâmico refletindo a seção atual de navegação.
- **RF-007**: O sistema DEVE permitir listar instrumentos contratuais na seção Instrumentos > Gestão.
- **RF-008**: O sistema DEVE permitir cadastrar novos instrumentos contratuais com formulários distintos por tipo: Contrato, Nota de Empenho e Outro Instrumento.
- **RF-009**: O sistema DEVE exibir tela de detalhes para cada contrato cadastrado.
- **RF-010**: O sistema DEVE exibir tela de detalhes para cada nota de empenho cadastrada.
- **RF-011**: O sistema DEVE permitir listar Atas de Registro de Preços (ARPs) na seção Atas > Gestão.
- **RF-012**: O sistema DEVE permitir cadastrar novas ARPs.
- **RF-013**: O sistema DEVE exibir tela de detalhes de uma ARP individual.
- **RF-014**: O sistema DEVE permitir gerar um contrato a partir de uma ARP.
- **RF-015**: O sistema DEVE permitir registrar adesão em uma ARP.
- **RF-016**: O sistema DEVE permitir visualizar o conteúdo completo de uma ARP.
- **RF-017**: O sistema DEVE exibir uma tela de Suporte com informações de ajuda ao usuário.
- **RF-018**: O sistema DEVE exibir uma tela de Configurações com preferências do usuário e do sistema.
- **RF-019**: O sistema DEVE exibir um botão flutuante de chatbot de suporte acessível em todas as telas autenticadas.
- **RF-020**: O sistema DEVE exibir uma tela de confirmação de sucesso após cadastros concluídos, com validação básica dos campos obrigatórios antes da submissão.
- **RF-021**: O sistema DEVE redirecionar as rotas legadas de contratos para as rotas equivalentes de instrumentos.

### Entidades Principais

- **Instrumento Contratual**: Representa um documento jurídico de contratação pública. Pode ser do tipo Contrato, Nota de Empenho ou Outro Instrumento. Possui identificador único, partes envolvidas, valores e vigência.
- **Ata de Registro de Preços (ARP)**: Documento que formaliza os preços registrados após processo licitatório. Pode gerar contratos e receber adesões de outros órgãos.
- **Vínculo Institucional**: Representa o órgão ou entidade ao qual o usuário está associado para operar no sistema, definindo o escopo dos dados visíveis.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Todas as telas do protótipo (18 rotas) são renderizadas corretamente no projeto l1face com aparência visual idêntica ao protótipo original.
- **CS-002**: A navegação entre todas as rotas funciona sem erros em 100% dos fluxos definidos no protótipo.
- **CS-003**: A interface se adapta corretamente a dispositivos desktop e mobile, com sidebar e navegação inferior aparecendo nos contextos corretos.
- **CS-004**: O tempo de carregamento inicial da aplicação não excede o tempo observado no protótipo original.
- **CS-005**: Nenhuma regressão visual é identificada em nenhuma das telas após a migração.

## Clarificações

### Session 2026-05-18

- Q: A migração deve incluir todos os componentes UI do protótipo (~60), ou apenas os ativamente usados nas páginas e layouts? → A: Apenas componentes ativamente usados nas páginas e layouts (Opção A).
- Q: Qual o nível de interatividade esperado nos formulários migrados? → A: Fluxo completo do protótipo — validação básica + navegação para tela de sucesso ao submeter, sem integração com API (Opção B).
- Q: Assets com nomes gerados automaticamente pelo protótipo devem ser renomeados ou mantidos como estão? → A: Renomear para nomes descritivos durante a migração (Opção B).

## Premissas

- O projeto l1face utilizará o mesmo stack do protótipo, adaptado para as versões mais recentes disponíveis.
- O protótipo usa dados mockados/estáticos; a migração mantém os mesmos dados estáticos sem conexão real com API nesta fase.
- A fidelidade visual é prioritária — layout, cores, tipografia e componentes devem ser idênticos ao protótipo.
- Somente os componentes de UI efetivamente utilizados nas páginas e layouts serão migrados; componentes presentes no protótipo mas sem uso ativo são excluídos do escopo.
- Assets estáticos (imagens, SVGs, fontes) serão migrados para o projeto l1face com nomes descritivos e significativos — os nomes gerados automaticamente pela ferramenta de prototipação serão substituídos por nomes que reflitam o conteúdo ou propósito do asset.
- A migração não inclui integração com o backend nesta fase — toda lógica de dados permanece mockada.
- O sistema de temas (claro/escuro) presente no protótipo será mantido.
