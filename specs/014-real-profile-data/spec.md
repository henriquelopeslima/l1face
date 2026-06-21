# Especificação de Funcionalidade: Dados Reais no Perfil de Configurações

**Branch da Funcionalidade**: `014-real-profile-data`
**Criado em**: 2026-06-21
**Status**: Rascunho
**Entrada**: Descrição do usuário: "na tela de configurações as informações que estão sendo colocadas no perfil estão estaticas, eu quero colocar os dados reais e não mocks, caso não exista valor para o campo coloque um valor um tração."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Perfil exibe dados reais do usuário autenticado (Prioridade: P1)

O usuário acessa a tela de Configurações e vê seu próprio nome completo, e-mail e organização — não mais dados fictícios hardcoded. Os dados refletem exatamente o que foi cadastrado na conta.

**Por que esta prioridade**: É o núcleo do problema relatado. A tela de configurações precisa ser confiável; exibir dados falsos confunde o usuário e gera desconfiança no sistema.

**Teste Independente**: Acessar Configurações com um usuário autenticado real e verificar que o nome, e-mail e nome da empresa exibidos correspondem aos dados da conta.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado com nome "João Silva", e-mail "joao@empresa.com" e empresa "Empresa Ltda", **Quando** navega para Configurações, **Então** o perfil exibe exatamente "João Silva", "joao@empresa.com" e "Empresa Ltda".
2. **Dado** que o usuário está autenticado, **Quando** a tela de Configurações carrega, **Então** nenhum dado fictício (ex: "Lisvalder Paz", "lisvalder.paz@lpsolucoes.com.br") é exibido.

---

### História de Usuário 2 - Campos sem valor exibem traço (Prioridade: P2)

Campos do perfil que não possuem valor cadastrado (ex: telefone, que não existe na entidade de usuário) exibem um traço "—" em vez de espaço em branco, string vazia ou valor mock.

**Por que esta prioridade**: Garante consistência visual e comunica claramente ao usuário que o campo existe mas não está preenchido, sem confundi-lo com dados incorretos.

**Teste Independente**: Verificar os campos que não têm correspondência na entidade de usuário (ex: telefone) e confirmar que exibem "—".

**Cenários de Aceite**:

1. **Dado** que o campo de telefone não existe na entidade do usuário, **Quando** o perfil é exibido, **Então** o campo mostra "—".
2. **Dado** que qualquer campo opcional sem valor é exibido, **Quando** o perfil carrega, **Então** o valor mostrado é "—" (nunca vazio, nulo ou texto fictício).

---

### Casos de Borda

- O que acontece se o usuário não tiver um `licitante` vinculado na sessão? O nome da empresa deve exibir "—".
- O que acontece se `nomeCompleto` estiver vazio ou nulo? Exibir "—".
- O que acontece se o componente renderizar antes do carregamento da sessão estar completo? Exibir estado de carregamento (spinner ou skeleton) em vez de dados.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir o `nomeCompleto` do usuário autenticado no campo de nome do perfil.
- **RF-002**: O sistema DEVE exibir o `email` do usuário autenticado no campo de e-mail do perfil.
- **RF-003**: O sistema DEVE exibir o `nomeEmpresa` do licitante da sessão ativa no campo de organização do perfil.
- **RF-004**: O sistema DEVE exibir "—" em qualquer campo do perfil cujo valor não esteja disponível na entidade do usuário ou licitante (ex: telefone).
- **RF-005**: O sistema NÃO DEVE exibir nenhum valor hardcoded ou fictício no perfil.
- **RF-006**: O sistema DEVE tratar a ausência de licitante na sessão exibindo "—" nos campos relacionados à empresa.

### Entidades Principais

- **User**: Usuário autenticado com campos `nomeCompleto` (string), `email` (string), `fotoPerfil` (string | null | undefined), `licitantes` (array).
- **Licitante**: Empresa vinculada à sessão com campos `cnpj` (string), `nomeEmpresa` (string). Disponível via `session.licitante` no contexto de autenticação.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos campos do perfil exibem dados reais do usuário autenticado ou "—" — nenhum valor fictício visível.
- **CS-002**: O nome, e-mail e organização exibidos correspondem ao cadastro do usuário em 100% das sessões testadas.
- **CS-003**: Campos sem dado disponível exibem "—" consistentemente, sem espaços em branco ou strings vazias.

## Premissas

- O escopo desta funcionalidade é restrito à **seção de perfil** da tela de Configurações (nome, e-mail, telefone, organização). Outras seções (notificações, assinatura, gestão de acessos) permanecem inalteradas.
- Os dados do usuário e do licitante já estão disponíveis no contexto de autenticação (`AuthContext`) após o login — não é necessário novo endpoint.
- O campo de telefone não existe na entidade `User`; portanto, sempre exibirá "—" nesta versão.
- A tela de Configurações não edita os dados do perfil nesta versão — é apenas leitura.
- O CNPJ do licitante está disponível mas não é listado explicitamente nos campos de perfil visíveis atualmente; mantém-se o mapeamento apenas para os campos já exibidos na UI.
