# Especificação de Funcionalidade: Autenticação e Seleção de Licitante

**Branch da Funcionalidade**: `002-login-licitante`  
**Criado em**: 2026-05-19  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "quero consumir uma api e realizar o login, logo após quero salvar o usuário e escolher o licitante no fluxo de login, e modificar nos locais que está sendo usando o usuário hardcoded para utilizar o que está logado."

## Clarifications

### Session 2026-05-19

- Q: A substituição de dados hardcoded inclui integração funcional (ex.: usar ID do licitante em chamadas de API como CadastrarArp)? → A: Não. Substituir APENAS a exibição visual de nome e CNPJ/documento do usuário e licitante. Integração funcional com API permanece fora do escopo desta feature.

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Login com Credenciais (Prioridade: P1)

Um usuário cadastrado acessa a plataforma informando seu e-mail e senha. Após autenticação bem-sucedida, o sistema recupera o perfil do usuário com a lista de licitantes vinculados à sua conta.

**Por que esta prioridade**: É o ponto de entrada obrigatório para qualquer operação no sistema. Sem login funcional nada mais pode ser acessado.

**Teste Independente**: Pode ser totalmente testado abrindo a tela de login, informando credenciais válidas e verificando que o sistema exibe a tela de seleção de licitante com os dados do usuário.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de login, **Quando** informa e-mail e senha corretos e confirma, **Então** o sistema autentica o usuário, persiste a sessão e avança para a seleção de licitante.
2. **Dado** que o usuário está na tela de login, **Quando** informa credenciais incorretas, **Então** o sistema exibe mensagem de erro informativa e mantém o usuário na tela de login.
3. **Dado** que o usuário está na tela de login, **Quando** tenta confirmar sem preencher e-mail ou senha, **Então** o sistema exibe validação nos campos obrigatórios antes de enviar a requisição.

---

### História de Usuário 2 - Seleção de Licitante no Fluxo de Login (Prioridade: P1)

Após o login, o usuário visualiza todos os licitantes vinculados à sua conta e escolhe com qual deseja operar na sessão atual. A escolha fica registrada e é aplicada em todo o sistema.

**Por que esta prioridade**: O sistema opera no contexto de um licitante específico. Sem esta seleção, as operações subsequentes (cadastro de atas, consultas) não têm contexto válido.

**Teste Independente**: Pode ser totalmente testado verificando que, após o login, a lista de licitantes é exibida corretamente, a seleção persiste após navegação e o licitante selecionado aparece nas telas do sistema.

**Cenários de Aceite**:

1. **Dado** que o usuário realizou login com sucesso, **Quando** a tela de seleção de licitante é exibida, **Então** todos os licitantes vinculados à conta do usuário são listados com nome e CNPJ.
2. **Dado** que a tela de seleção de licitante está aberta, **Quando** o usuário seleciona um licitante e confirma, **Então** o sistema registra o licitante escolhido e redireciona para a tela principal da aplicação.
3. **Dado** que o usuário possui apenas um licitante vinculado, **Quando** completa o login, **Então** o sistema seleciona automaticamente o único licitante disponível, sem exigir interação adicional.
4. **Dado** que o usuário não possui nenhum licitante vinculado, **Quando** completa o login, **Então** o sistema exibe uma mensagem informativa explicando que é necessário estar vinculado a um licitante para operar.

---

### História de Usuário 3 - Exibição de Nome e CNPJ do Usuário Autenticado (Prioridade: P2)

Os componentes visuais da aplicação que exibem nome do usuário, nome do licitante ou CNPJ do licitante passam a mostrar os dados reais do usuário autenticado e do licitante selecionado, substituindo os valores fixos anteriores. A integração funcional (uso do ID do licitante em chamadas de API, como cadastro de atas) está fora do escopo desta feature.

**Por que esta prioridade**: Garante consistência visual da identidade do usuário logado e do licitante ativo em toda a interface, eliminando dados fictícios que confundem operadores distintos.

**Teste Independente**: Pode ser totalmente testado logando com usuários diferentes e verificando que nome e CNPJ exibidos no cabeçalho e demais componentes visuais correspondem ao usuário autenticado e ao licitante selecionado.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado e selecionou um licitante, **Quando** navega pela aplicação, **Então** os componentes que exibem nome do usuário mostram o nome real do usuário logado.
2. **Dado** que o usuário está autenticado e selecionou um licitante, **Quando** navega pela aplicação, **Então** os componentes que exibem nome ou CNPJ do licitante mostram o nome e CNPJ reais do licitante selecionado.
3. **Dado** que dois usuários diferentes fazem login em sessões distintas, **Quando** cada um visualiza a aplicação, **Então** cada sessão exibe exclusivamente o nome e CNPJ do seu respectivo usuário e licitante.

---

### História de Usuário 4 - Logout (Prioridade: P3)

O usuário autenticado pode encerrar sua sessão, o que limpa todas as informações de autenticação e licitante selecionado, retornando à tela de login.

**Por que esta prioridade**: Funcionalidade de segurança básica que permite que múltiplos usuários utilizem o mesmo dispositivo com segurança.

**Teste Independente**: Pode ser totalmente testado executando o logout e verificando que o acesso às telas protegidas é redirecionado para login.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado, **Quando** aciona o logout, **Então** a sessão é encerrada, o licitante selecionado é removido e o usuário é redirecionado para a tela de login.
2. **Dado** que a sessão foi encerrada, **Quando** o usuário tenta acessar uma tela protegida diretamente pela URL, **Então** é redirecionado para a tela de login.

---

### Casos de Borda

- O que acontece quando a sessão do usuário expira enquanto ele está navegando na aplicação?
- Como o sistema se comporta quando o serviço de autenticação está indisponível?
- O que ocorre quando o usuário tem licitantes vinculados mas nenhum deles está ativo?
- Como o sistema trata uma tentativa de acesso a recursos de outro licitante que não o selecionado?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir uma tela de login com campos de e-mail e senha antes de permitir acesso a qualquer funcionalidade protegida.
- **RF-002**: O sistema DEVE validar os campos de e-mail e senha localmente (formato e preenchimento) antes de enviar as credenciais para autenticação.
- **RF-003**: O sistema DEVE autenticar o usuário mediante e-mail e senha válidos e manter a sessão de forma segura durante a navegação.
- **RF-004**: Após autenticação bem-sucedida, o sistema DEVE recuperar o perfil do usuário contendo seu nome, e-mail e a lista de licitantes aos quais pertence.
- **RF-005**: O sistema DEVE apresentar a tela de seleção de licitante imediatamente após o login, quando o usuário possuir mais de um licitante vinculado.
- **RF-006**: O sistema DEVE selecionar automaticamente o licitante quando o usuário possuir exatamente um licitante vinculado, avançando diretamente para a aplicação.
- **RF-007**: O sistema DEVE exibir mensagem orientativa quando o usuário não possuir nenhum licitante vinculado à sua conta.
- **RF-008**: O sistema DEVE persistir o licitante selecionado durante toda a sessão do usuário, tornando-o disponível globalmente na aplicação.
- **RF-009**: Os componentes visuais que exibem nome do usuário, nome do licitante ou CNPJ do licitante DEVEM mostrar os dados reais do usuário autenticado e do licitante selecionado, substituindo valores fixos. Componentes identificados: cabeçalho da aplicação (`AppHeader`). O uso do ID do licitante em chamadas de API (ex.: cadastro de atas) está fora do escopo desta feature.
- **RF-010**: O sistema DEVE disponibilizar uma ação de logout que encerre a sessão e remova todos os dados de autenticação e seleção de licitante.
- **RF-011**: O sistema DEVE redirecionar para a tela de login qualquer tentativa de acesso a telas protegidas sem sessão ativa.
- **RF-012**: Em caso de falha na autenticação, o sistema DEVE exibir mensagem de erro clara e manter o usuário na tela de login sem expor detalhes técnicos.

### Entidades Principais

- **Usuário**: Pessoa autenticada na plataforma. Possui identificador único, nome completo e e-mail. Pode estar vinculado a um ou mais licitantes.
- **Licitante**: Empresa registrada na plataforma (identificada por CNPJ e razão social) à qual o usuário pertence. É o contexto principal de operação do sistema.
- **Sessão**: Estado da autenticação ativa do usuário. Contém os dados do usuário autenticado e o licitante selecionado para a sessão em curso.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários conseguem completar o fluxo de login (credenciais + seleção de licitante) em menos de 60 segundos.
- **CS-002**: Os componentes que exibiam nome fixo de usuário ou nome/CNPJ fixo de licitante passam a exibir exclusivamente os dados do usuário autenticado e licitante selecionado. Componente identificado: `AppHeader`.
- **CS-003**: Tentativas de acesso não autenticado a telas protegidas são bloqueadas em 100% dos casos e redirecionadas para login.
- **CS-004**: Erros de autenticação (credenciais inválidas, serviço indisponível) exibem mensagens compreensíveis em 100% das ocorrências, sem expor informações técnicas.
- **CS-005**: A seleção do licitante persiste corretamente em todas as navegações dentro da mesma sessão.

## Premissas

- O servidor de autenticação está disponível e funcional no ambiente de desenvolvimento e produção.
- Os usuários que farão login já possuem cadastro no sistema — o fluxo de registro não está no escopo desta funcionalidade.
- A sessão é mantida de forma segura pelo servidor por meio de cookie HttpOnly, sem exposição de credenciais no lado do cliente.
- Um usuário pode estar vinculado a zero, um ou mais licitantes — todos os casos são tratados.
- O licitante selecionado na sessão permanece o mesmo até que o usuário faça logout; não há troca de licitante dentro da mesma sessão nesta versão.
- A substituição de dados hardcoded limita-se à exibição visual de nome e CNPJ. O uso do ID do licitante em chamadas de API (ex.: `CadastrarArp`) está explicitamente fora do escopo desta feature e será tratado em feature subsequente.
- O cadastro de novo licitante (registro) está fora do escopo desta funcionalidade.
