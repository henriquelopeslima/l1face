# Especificação de Funcionalidade: Listar e Revogar Usuários do Licitante

**Branch da Funcionalidade**: `022-listar-usuarios-licitante`  
**Criado em**: 2026-06-30  
**Status**: Rascunho  

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Visualizar Usuários da Empresa (Prioridade: P1)

Um administrador acessa a seção "Gestão de Acessos" dentro da tela de Configurações e vê a lista de todos os usuários vinculados ao licitante ativo, com seus nomes, e-mails, papéis (ADMIN ou COLABORADOR) e data de ingresso.

**Por que esta prioridade**: Sem visibilidade dos usuários, o administrador não pode gerenciar quem tem acesso à empresa. É o pré-requisito para qualquer ação de gestão.

**Teste Independente**: Pode ser testado acessando a tela de Configurações com um usuário ADMIN e verificando que a lista de membros é exibida corretamente com dados reais da API.

**Cenários de Aceite**:

1. **Dado** que sou um usuário ADMIN do licitante, **Quando** acesso a seção de Gestão de Acessos em Configurações, **Então** vejo uma lista com todos os usuários vinculados ao meu licitante, exibindo nome completo, e-mail, papel e data de ingresso.
2. **Dado** que a lista foi carregada, **Quando** observo os dados de cada usuário, **Então** o papel é exibido de forma legível ("Administrador" para ADMIN, "Colaborador" para COLABORADOR).
3. **Dado** que a requisição para a API está em andamento, **Quando** a lista ainda não foi carregada, **Então** um indicador de carregamento é exibido no lugar da lista.
4. **Dado** que ocorreu um erro na API, **Quando** a lista não pode ser carregada, **Então** uma mensagem de erro amigável é exibida.

---

### História de Usuário 2 - Revogar Acesso de um Usuário (Prioridade: P2)

Um administrador deseja remover o acesso de um membro da empresa. Ele clica em uma ação de remoção ao lado do usuário desejado, confirma a ação em um diálogo de confirmação e o usuário é removido da lista.

**Por que esta prioridade**: Permite ao administrador manter a segurança revogando acessos desnecessários ou indevidos.

**Teste Independente**: Pode ser testado clicando em "Remover" ao lado de um usuário COLABORADOR, confirmando o diálogo e verificando que o usuário desaparece da lista sem recarregar a página.

**Cenários de Aceite**:

1. **Dado** que sou um usuário ADMIN e a lista de usuários está carregada, **Quando** clico na ação de remover ao lado de um usuário, **Então** um diálogo de confirmação é exibido com o nome do usuário e uma advertência clara sobre a irreversibilidade da ação.
2. **Dado** que o diálogo de confirmação está aberto, **Quando** confirmo a remoção, **Então** o usuário é removido da lista e uma mensagem de sucesso é exibida.
3. **Dado** que o diálogo de confirmação está aberto, **Quando** cancelo a ação, **Então** o diálogo é fechado sem nenhuma alteração na lista.
4. **Dado** que sou o único ADMIN do licitante, **Quando** a API retorna erro 409 ao tentar me remover, **Então** uma mensagem de erro explicativa é exibida informando que não é possível remover o último administrador.
5. **Dado** que sou um usuário ADMIN, **Quando** visualizo meu próprio registro na lista, **Então** a ação de remover está desabilitada ou oculta para mim mesmo (não deve ser possível auto-remoção via interface).

---

### Casos de Borda

- O que acontece se a lista de usuários retornar vazia (apenas o próprio admin)?
- O que acontece se a conexão cair durante a operação de remoção?
- O que acontece se dois administradores tentam remover o mesmo usuário simultaneamente (o segundo recebe 404)?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir a lista de usuários vinculados ao licitante ativo ao carregar a seção de Gestão de Acessos.
- **RF-002**: Cada item da lista DEVE exibir: nome completo, e-mail, papel do usuário (legível) e data de ingresso formatada.
- **RF-003**: O sistema DEVE exibir um indicador de carregamento enquanto a lista é obtida da API.
- **RF-004**: O sistema DEVE exibir uma mensagem de erro amigável caso a API retorne falha ao listar usuários.
- **RF-005**: Cada usuário na lista DEVE ter uma ação de remoção disponível, exceto para o próprio usuário autenticado.
- **RF-006**: Ao acionar a remoção, o sistema DEVE exibir um diálogo de confirmação com o nome do usuário antes de executar a operação.
- **RF-007**: Após confirmação, o sistema DEVE chamar a API de revogação e, em caso de sucesso, remover o item da lista sem recarregar a página inteira.
- **RF-008**: Em caso de erro na revogação (incluindo tentativa de remover o último ADMIN), o sistema DEVE exibir uma mensagem de erro adequada sem alterar a lista.
- **RF-009**: A funcionalidade de revogação DEVE estar disponível apenas para usuários com papel ADMIN.

### Entidades Principais

- **UsuarioLicitante**: Vínculo entre um usuário e um licitante. Possui id do vínculo, id do usuário, nome completo, e-mail, id do licitante, papel (ADMIN | COLABORADOR) e data de criação do vínculo.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um administrador consegue visualizar todos os membros da empresa em menos de 3 segundos após abrir a seção de Gestão de Acessos.
- **CS-002**: Um administrador consegue revogar o acesso de um colaborador em no máximo 3 interações (clique em remover → confirmar → feedback de sucesso).
- **CS-003**: Após revogação bem-sucedida, a lista é atualizada sem necessidade de recarregar a página.
- **CS-004**: Erros de API são comunicados ao usuário de forma compreensível, sem termos técnicos.

## Premissas

- O usuário autenticado já selecionou um licitante ativo (disponível via contexto da aplicação).
- A funcionalidade de listagem e revogação está disponível apenas para usuários com papel ADMIN — colaboradores não veem as ações de gestão.
- A seção de Gestão de Acessos já existe como componente (`GestaoAcessosSection`) na tela de Configurações; a implementação ocorre dentro desse componente.
- Não serão implementadas nesta iteração: convidar novos usuários, editar papéis, filtros ou paginação da lista.
- A autenticação já está implementada e o token é enviado automaticamente via cookie HttpOnly.
