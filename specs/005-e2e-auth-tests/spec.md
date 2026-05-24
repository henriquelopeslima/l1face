# Especificação de Funcionalidade: Testes E2E de Autenticação

**Branch da Funcionalidade**: `005-e2e-auth-tests`  
**Criado em**: 2026-05-23  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Quero criar testes e2e para o login e o cadastro."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Cobertura E2E do fluxo de login (Prioridade: P1)

A equipe de desenvolvimento precisa de uma suíte automatizada que valide o fluxo de login de ponta a ponta: desde a abertura da tela até o redirecionamento após autenticação bem-sucedida, garantindo que regressões nos fluxos críticos sejam detectadas antes de chegarem à produção.

**Por que esta prioridade**: Login é o ponto de entrada da aplicação — qualquer regressão bloqueia todos os usuários. É o fluxo de maior impacto e de mais alto risco.

**Teste Independente**: Pode ser totalmente testado executando a suíte de testes E2E contra um ambiente com servidor disponível e verificando que todos os cenários de login passam sem intervenção manual.

**Cenários de Aceite**:

1. **Dado** que o usuário acessa `/login`, **Quando** preenche e-mail e senha válidos de uma conta existente e submete o formulário, **Então** é redirecionado para o dashboard (ou para a tela de seleção de vínculo, caso tenha mais de um licitante associado).

2. **Dado** que o usuário acessa `/login`, **Quando** preenche credenciais incorretas e submete o formulário, **Então** permanece na tela de login e uma mensagem de erro é exibida indicando credenciais inválidas.

3. **Dado** que o usuário está na tela de login com o formulário vazio, **Quando** tenta submeter sem preencher o e-mail, **Então** uma mensagem de validação é exibida e o formulário não é submetido ao servidor.

4. **Dado** que o usuário está na tela de login, **Quando** preenche um e-mail com formato inválido (sem @), **Então** uma mensagem de validação é exibida antes de qualquer chamada ao servidor.

5. **Dado** que o usuário está na tela de login, **Quando** preenche senha com menos de 8 caracteres, **Então** uma mensagem de validação é exibida antes de qualquer chamada ao servidor.

6. **Dado** que o usuário está na tela de login, **Quando** clica em "Criar conta", **Então** é navegado para a tela de cadastro em `/cadastro`.

---

### História de Usuário 2 - Cobertura E2E do fluxo de cadastro (Prioridade: P1)

A equipe precisa de testes automatizados que validem o fluxo completo de criação de conta: preenchimento do formulário com todos os campos, formatação do CNPJ, criação bem-sucedida com redirecionamento, e exibição de erros em casos de dados duplicados ou inválidos.

**Por que esta prioridade**: Cadastro é o ponto de entrada para novos usuários — falhas nesse fluxo impedem a aquisição de novos clientes e são difíceis de detectar manualmente.

**Teste Independente**: Pode ser totalmente testado executando a suíte contra um ambiente de teste limpo e verificando que todos os cenários de cadastro passam; cenários de duplicidade requerem dados pré-existentes no banco de teste.

**Cenários de Aceite**:

1. **Dado** que o usuário acessa `/cadastro`, **Quando** preenche todos os campos corretamente (nome, e-mail único, senha, CNPJ único, razão social) e submete, **Então** a conta é criada e o usuário é redirecionado para o dashboard (ou seleção de vínculo).

2. **Dado** que o usuário está na tela de cadastro, **Quando** tenta submeter com campos obrigatórios vazios, **Então** mensagens de validação são exibidas para cada campo inválido sem que uma requisição ao servidor seja feita.

3. **Dado** que o usuário está na tela de cadastro, **Quando** preenche um e-mail que já está cadastrado no sistema e submete, **Então** uma mensagem de erro informando que o e-mail já está em uso é exibida.

4. **Dado** que o usuário está na tela de cadastro, **Quando** preenche um CNPJ que já está cadastrado no sistema e submete, **Então** uma mensagem de erro informando que o CNPJ já está em uso é exibida.

5. **Dado** que o usuário está digitando no campo CNPJ, **Quando** digita apenas os dígitos numéricos, **Então** o campo exibe automaticamente a formatação `XX.XXX.XXX/XXXX-XX` enquanto o usuário digita.

6. **Dado** que o usuário está na tela de cadastro, **Quando** clica em "Entrar", **Então** é navegado para a tela de login em `/login`.

---

### História de Usuário 3 - Navegação entre login e cadastro (Prioridade: P2)

A suíte deve validar que a navegação entre as telas de login e cadastro funciona corretamente em ambas as direções, garantindo que os links entre as páginas estejam operacionais.

**Por que esta prioridade**: Fluxo complementar ao P1 — sem ele, o caminho de aquisição de novos usuários fica incompleto, mas o impacto é menor que os fluxos principais.

**Teste Independente**: Pode ser testado verificando a presença e o funcionamento dos links de navegação cruzada em ambas as páginas, independente dos fluxos de autenticação.

**Cenários de Aceite**:

1. **Dado** que o usuário está em `/login`, **Quando** a página carrega, **Então** o link "Criar conta" está visível e acessível.

2. **Dado** que o usuário está em `/cadastro`, **Quando** a página carrega, **Então** o link "Entrar" está visível e acessível.

---

### Casos de Borda

- O que acontece quando o servidor está indisponível durante o submit do formulário de login?
- O que acontece quando o servidor está indisponível durante o submit do formulário de cadastro?
- Como os testes se comportam quando executados em paralelo contra o mesmo banco de dados de teste (conflito de dados únicos)?
- O que acontece se o usuário tenta acessar `/login` ou `/cadastro` já estando autenticado?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: A suíte DEVE cobrir o fluxo completo de login com credenciais válidas, verificando o redirecionamento pós-autenticação.
- **RF-002**: A suíte DEVE cobrir o fluxo de login com credenciais inválidas, verificando a exibição da mensagem de erro adequada.
- **RF-003**: A suíte DEVE cobrir a validação de campos obrigatórios no formulário de login antes de qualquer chamada ao servidor.
- **RF-004**: A suíte DEVE cobrir o fluxo completo de cadastro com dados válidos, verificando a criação de conta e o redirecionamento.
- **RF-005**: A suíte DEVE cobrir o cadastro com e-mail duplicado, verificando a mensagem de erro específica.
- **RF-006**: A suíte DEVE cobrir o cadastro com CNPJ duplicado, verificando a mensagem de erro específica.
- **RF-007**: A suíte DEVE cobrir a validação de todos os campos obrigatórios no formulário de cadastro.
- **RF-008**: A suíte DEVE cobrir a formatação automática do CNPJ durante a digitação.
- **RF-009**: A suíte DEVE cobrir a navegação entre as páginas de login e cadastro via links internos.
- **RF-010**: Os testes DEVEM ser executáveis de forma automatizada sem intervenção manual.
- **RF-011**: Os testes DEVEM ser isolados entre si — a falha de um não deve impedir a execução dos demais.
- **RF-012**: Os testes DEVEM produzir relatório de resultado indicando quais cenários passaram e quais falharam.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos cenários de aceite listados nas Histórias de Usuário 1, 2 e 3 possuem testes automatizados correspondentes.
- **CS-002**: A suíte completa executa em menos de 2 minutos em um ambiente de CI padrão.
- **CS-003**: Os testes não produzem falsos positivos — passam de forma confiável quando o comportamento está correto e falham de forma confiável quando o comportamento está quebrado.
- **CS-004**: Qualquer regressão nos fluxos de login ou cadastro é detectada pela suíte antes de chegar ao ambiente de produção.

## Premissas

- O ambiente de teste tem acesso ao servidor backend (l1core) funcionando com banco de dados populado com ao menos uma conta de teste válida para o fluxo de login.
- Existe uma estratégia de gerenciamento de dados de teste: ou um banco de dados isolado por execução, ou rotinas de seed/cleanup que garantem o estado esperado antes de cada teste.
- O servidor frontend está rodando e acessível durante a execução dos testes.
- Os testes E2E são executados em um navegador real (headless ou com interface gráfica), não simulados no nível de código.
- A suíte de E2E é independente dos testes unitários já existentes (Vitest) — não substitui, mas complementa a cobertura.
- Cenários que dependem de dados únicos (e-mail/CNPJ duplicado) assumem que os dados de conflito estão pré-cadastrados no banco de teste ou são criados pelo próprio teste antes da verificação.
