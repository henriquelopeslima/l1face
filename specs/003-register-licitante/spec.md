# Especificação de Funcionalidade: Cadastro de Usuário e Licitante

**Branch da Funcionalidade**: `003-register-licitante`  
**Criado em**: 2026-05-21  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Criar tela de cadastro seguindo o padrão visual da LoginPage, usando o endpoint register_with_bidder, satisfazendo todos os campos exigidos, com login automático após cadastro."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Novo Usuário Realiza Cadastro Completo (Prioridade: P1)

Um visitante da plataforma que ainda não possui conta quer se registrar fornecendo seus dados pessoais e os dados da sua empresa. Após preencher e enviar o formulário, é automaticamente autenticado e redirecionado para a área logada.

**Por que esta prioridade**: É o único fluxo de onboarding disponível; sem ele, novos usuários não conseguem acessar a plataforma.

**Teste Independente**: Pode ser totalmente testado acessando a tela de cadastro, preenchendo todos os campos obrigatórios com dados válidos e verificando que o usuário é redirecionado para a área autenticada ao final.

**Cenários de Aceite**:

1. **Dado** que o visitante acessa a tela de cadastro, **Quando** preenche nome completo, e-mail, senha (≥8 caracteres), CNPJ e razão social válidos e submete o formulário, **Então** a conta é criada, o usuário é autenticado automaticamente e redirecionado para o painel principal.
2. **Dado** que o formulário foi submetido com sucesso, **Quando** o usuário navegar na plataforma, **Então** ele permanece autenticado (sessão ativa).

---

### História de Usuário 2 - Validação de Campos no Cadastro (Prioridade: P1)

O visitante tenta submeter o formulário com dados incompletos ou inválidos e recebe feedback claro sobre o que precisa corrigir antes de prosseguir.

**Por que esta prioridade**: Erros de validação devem ser capturados antes do envio para evitar chamadas desnecessárias ao servidor e oferecer boa experiência.

**Teste Independente**: Pode ser testado tentando submeter o formulário com cada campo vazio ou com valores inválidos individualmente e verificando as mensagens de erro exibidas.

**Cenários de Aceite**:

1. **Dado** que o campo nome está vazio, **Quando** o formulário é submetido, **Então** uma mensagem de erro "Informe seu nome completo." é exibida.
2. **Dado** que o e-mail está em formato inválido, **Quando** o formulário é submetido, **Então** uma mensagem "Informe um e-mail válido." é exibida.
3. **Dado** que a senha tem menos de 8 caracteres, **Quando** o formulário é submetido, **Então** uma mensagem "A senha deve ter ao menos 8 caracteres." é exibida.
4. **Dado** que o CNPJ fornecido não possui formato válido, **Quando** o formulário é submetido, **Então** uma mensagem "Informe um CNPJ válido." é exibida.
5. **Dado** que a razão social tem menos de 10 caracteres, **Quando** o formulário é submetido, **Então** uma mensagem "A razão social deve ter ao menos 10 caracteres." é exibida.
6. **Dado** que todos os campos estão corretos, **Quando** o formulário é submetido, **Então** nenhuma mensagem de validação é exibida e o cadastro prossegue.

---

### História de Usuário 3 - E-mail ou CNPJ Já Cadastrado (Prioridade: P2)

O visitante tenta se registrar com um e-mail ou CNPJ já existente na plataforma e recebe uma mensagem de erro contextual informando o conflito.

**Por que esta prioridade**: Conflitos de duplicidade são comuns e devem ter tratamento explícito para orientar o usuário.

**Teste Independente**: Pode ser testado submetendo o formulário com um e-mail ou CNPJ que já consta na base e verificando a mensagem de conflito retornada.

**Cenários de Aceite**:

1. **Dado** que o e-mail informado já está cadastrado, **Quando** o formulário é submetido, **Então** uma mensagem de erro indicando duplicidade de e-mail é exibida sem redirecionar o usuário.
2. **Dado** que o CNPJ informado já está cadastrado, **Quando** o formulário é submetido, **Então** uma mensagem de erro indicando duplicidade de CNPJ é exibida sem redirecionar o usuário.

---

### História de Usuário 4 - Navegação entre Cadastro e Login (Prioridade: P3)

O visitante que acessa a tela de cadastro deseja ir para a tela de login (pois já possui conta) e vice-versa, sem precisar usar o botão voltar do navegador.

**Por que esta prioridade**: Melhora a usabilidade mas não bloqueia o fluxo principal.

**Teste Independente**: Pode ser testado clicando no link "Já tenho uma conta" na tela de cadastro e verificando que a tela de login é exibida.

**Cenários de Aceite**:

1. **Dado** que o visitante está na tela de cadastro, **Quando** clica em "Já tenho uma conta", **Então** é direcionado para a tela de login.
2. **Dado** que o visitante está na tela de login, **Quando** clica em "Criar conta", **Então** é direcionado para a tela de cadastro.

---

### Casos de Borda

- O que acontece quando a API retorna erro desconhecido (ex.: 500)? A mensagem genérica "Ocorreu um erro. Tente novamente." deve ser exibida.
- O que acontece quando o usuário submete o formulário múltiplas vezes rapidamente? O botão deve ser desabilitado enquanto a requisição está em andamento para evitar submissões duplicadas.
- O que acontece com espaços extras no início/fim dos campos de texto? Devem ser removidos (trim) antes da validação e envio.
- O que acontece se o CNPJ for fornecido com ou sem formatação (pontos, barras, traços)? Ambos os formatos devem ser aceitos; a API já lida com isso.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir um formulário de cadastro com os campos: nome completo, e-mail, senha, CNPJ e razão social.
- **RF-002**: O sistema DEVE validar, no lado do cliente, que todos os campos obrigatórios estão preenchidos antes de enviar o formulário.
- **RF-003**: O sistema DEVE validar que o e-mail possui formato válido (padrão RFC).
- **RF-004**: O sistema DEVE validar que a senha possui ao menos 8 caracteres.
- **RF-005**: O sistema DEVE validar que o CNPJ possui formato válido (14 dígitos, com ou sem formatação).
- **RF-006**: O sistema DEVE validar que a razão social possui entre 10 e 255 caracteres.
- **RF-007**: O sistema DEVE validar que o nome completo possui entre 3 e 255 caracteres.
- **RF-008**: O sistema DEVE exibir mensagens de erro individuais por campo quando a validação falhar.
- **RF-009**: O sistema DEVE desabilitar o botão de envio enquanto a requisição de cadastro está em andamento e exibir indicador de carregamento.
- **RF-010**: Após cadastro bem-sucedido, o sistema DEVE autenticar o usuário automaticamente (sem exigir login manual).
- **RF-011**: Após autenticação automática, o sistema DEVE redirecionar o usuário para a área autenticada da plataforma.
- **RF-012**: O sistema DEVE exibir erro contextual quando o servidor retornar conflito de e-mail já cadastrado.
- **RF-013**: O sistema DEVE exibir erro contextual quando o servidor retornar conflito de CNPJ já cadastrado.
- **RF-014**: O sistema DEVE exibir mensagem genérica de erro para falhas de servidor não mapeadas.
- **RF-015**: A tela de cadastro DEVE conter link de navegação para a tela de login.
- **RF-016**: A tela de login existente DEVE conter link de navegação para a tela de cadastro.
- **RF-017**: O campo senha DEVE ter opção de alternar visibilidade (mostrar/ocultar).
- **RF-018**: O layout da tela de cadastro DEVE seguir o padrão visual da tela de login: painel esquerdo com branding/recursos (oculto em mobile) e painel direito com o formulário.

### Entidades Principais

- **Usuário**: Pessoa física que acessa a plataforma. Atributos relevantes ao cadastro: nome completo, e-mail, senha.
- **Licitante**: Empresa representada pelo usuário na plataforma. Atributos relevantes ao cadastro: CNPJ, razão social.
- **Sessão**: Estado de autenticação estabelecido automaticamente após cadastro bem-sucedido. Mantido via cookie HttpOnly gerenciado pelo servidor.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um novo visitante consegue criar conta e acessar a plataforma em menos de 3 minutos preenchendo o formulário pela primeira vez.
- **CS-002**: 100% dos campos obrigatórios são validados antes do envio, impedindo requisições com dados incompletos ou inválidos.
- **CS-003**: O usuário é autenticado e redirecionado automaticamente após cadastro bem-sucedido, sem nenhuma etapa manual adicional.
- **CS-004**: Erros de duplicidade (e-mail ou CNPJ já cadastrado) são apresentados ao usuário com mensagem clara, sem perder os dados já preenchidos no formulário.
- **CS-005**: O formulário de cadastro é utilizável em dispositivos móveis (layout responsivo) sem necessidade de rolagem horizontal.

## Premissas

- O endpoint de cadastro (`/api/users/register-with-bidder`) está disponível e retorna cookie HttpOnly `BEARER` automaticamente após criação bem-sucedida, sem exigir chamada adicional de login.
- A autenticação automática pós-cadastro é realizada aproveitando o cookie retornado pelo endpoint de registro; não é necessário chamar `/api/login` separadamente.
- O campo CNPJ aceita entrada com ou sem formatação (pontos, barras, traços) — a normalização é responsabilidade do servidor conforme documentado na API.
- O fluxo de cadastro com Google e Microsoft (OAuth) está fora do escopo desta funcionalidade; os botões correspondentes, se exibidos, devem indicar funcionalidade indisponível.
- A tela de cadastro é acessível publicamente (sem autenticação prévia).
- Usuários já autenticados acessando a tela de cadastro devem ser redirecionados para a área autenticada (comportamento idêntico ao da tela de login existente).
