# Especificação de Funcionalidade: Atualização de Senha na Tela de Configurações

**Branch da Funcionalidade**: `020-password-update`  
**Criado em**: 2026-06-30  
**Status**: Rascunho  
**Entrada**: Implementar atualização de senha integrada com a API no formulário de segurança da página ConfiguracoesPage

## Cenários de Uso & Testes

### História de Usuário 1 - Alterar senha com sucesso (Prioridade: P1)

Um usuário autenticado deseja alterar sua senha por motivos de segurança ou esquecimento. O usuário acessa a seção de Segurança nas Configurações, preenche o formulário com sua senha atual e a nova senha, e vê uma confirmação de sucesso.

**Por que esta prioridade**: Esta é a funcionalidade principal e de maior valor. Permite que usuários gerenciem sua segurança pessoal — essencial para qualquer aplicação com autenticação.

**Teste Independente**: A mudança de senha funciona completamente ao preencher o formulário com valores válidos e clicar em salvar, mostrando feedback visual de sucesso.

**Cenários de Aceite**:

1. **Dado** usuário está autenticado e na seção de Segurança, **Quando** preenche senha atual correta, nova senha válida (8-20 caracteres, com letras e números), e clica em "Salvar", **Então** a API retorna sucesso e o usuário vê mensagem "Senha alterada com sucesso"
2. **Dado** senha foi alterada, **Quando** o usuário faz logout e tenta fazer login com a senha antiga, **Então** recebe "Credenciais inválidas" (a senha antiga não funciona mais)
3. **Dado** senha foi alterada, **Quando** o usuário tenta fazer login com a nova senha, **Então** a sessão é iniciada com sucesso

---

### História de Usuário 2 - Validação em tempo real de força de senha (Prioridade: P2)

O usuário vê feedback imediato sobre os requisitos de força da nova senha conforme digita, facilitando o cumprimento dos critérios antes de submeter o formulário.

**Por que esta prioridade**: Melhora a experiência do usuário, reduzindo erros de submissão e frustrações. Educação preventiva sobre requisitos.

**Teste Independente**: O validador de força funciona independentemente através de feedback visual enquanto o usuário digita a nova senha.

**Cenários de Aceite**:

1. **Dado** campo de nova senha está vazio, **Quando** usuário começa a digitar uma senha, **Então** o sistema exibe indicadores visuais (ex: barra de força) e lista dos requisitos faltantes
2. **Dado** nova senha "abc", **Quando** exibida, **Então** mostra erro "Senha deve ter no mínimo 8 caracteres"
3. **Dado** nova senha "abcdefgh" (sem números), **Quando** exibida, **Então** mostra erro "Senha deve conter números"
4. **Dado** nova senha "AbcDefgh1" (válida), **Quando** exibida, **Então** todos os requisitos aparecem como cumpridos

---

### História de Usuário 3 - Tratamento de erros de senha atual (Prioridade: P2)

Quando o usuário fornece a senha atual incorreta, o sistema mostra um erro claro sem revelar se a senha está correta (proteção contra força bruta).

**Por que esta prioridade**: Segurança essencial — evita que alguém que ganhe acesso temporário à sessão altere a senha sem saber a atual.

**Teste Independente**: O validador de senha atual funciona corretamente rejeitando senhas incorretas com mensagem apropriada.

**Cenários de Aceite**:

1. **Dado** usuário digita uma senha atual incorreta, **Quando** clica em "Salvar", **Então** recebe erro genérico "Senha atual incorreta" e a mudança NÃO é processada
2. **Dado** um ataque de força bruta, **Quando** múltiplas tentativas com senhas incorretas são feitas, **Então** o sistema não expõe qualquer informação adicional (não diferencia entre "usuário não existe" e "senha incorreta")

---

### Casos de Borda

- O que acontece quando a API retorna um erro inesperado durante a submissão?
- Como o sistema trata o caso de usuário tentar alterar para a mesma senha que já possui?
- Como o formulário se comporta quando o JWT expira durante o preenchimento?
- O que acontece se o usuário alterna entre abas durante a alteração de senha?

## Requisitos

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir um formulário de alteração de senha na seção de Segurança da página Configurações com campos para "Senha Atual" e "Nova Senha"
- **RF-002**: O sistema DEVE validar a nova senha em tempo real enquanto o usuário digita, mostrando:
  - Comprimento mínimo de 8 caracteres
  - Comprimento máximo de 20 caracteres
  - Presença de pelo menos uma letra (maiúscula ou minúscula)
  - Presença de pelo menos um número (0-9)
- **RF-003**: O sistema DEVE enviar uma requisição POST para `/api/auth/alterar-senha` com os campos `senhaAtual` e `novaSenha` quando o usuário submeter o formulário
- **RF-004**: O sistema DEVE validar a resposta da API e exibir uma mensagem de sucesso "Senha alterada com sucesso" quando a operação retornar `success: true`
- **RF-005**: O sistema DEVE exibir mensagens de erro específicas da API quando `success: false`, mostrando o campo `error` retornado
- **RF-006**: O sistema DEVE desabilitar o botão de submissão enquanto a requisição está sendo processada
- **RF-007**: O sistema DEVE limpar o formulário (zerar campos) após uma alteração bem-sucedida
- **RF-008**: O usuário DEVE estar autenticado para acessar e usar esta funcionalidade

### Entidades Principais

- **Usuário Autenticado**: Entidade que possui uma senha e pode alterá-la. Identificado pelo JWT no cookie/header.
- **Requisição de Alteração de Senha**: Dados contendo senha atual (para validação) e nova senha (que será hash e armazenada).
- **Resposta da API**: Booleano indicando sucesso e campo opcional de erro com mensagem específica.

## Critérios de Sucesso

### Resultados Mensuráveis

- **CS-001**: Usuários conseguem alterar a senha em menos de 2 minutos (fluxo feliz com valores válidos)
- **CS-002**: 100% das tentativas com senha nova inválida são rejeitadas antes da submissão à API
- **CS-003**: 100% das tentativas com senha atual incorreta retornam erro apropriado sem processar a alteração
- **CS-004**: Sistema fornece feedback visual em menos de 200ms enquanto o usuário digita (validação em tempo real)
- **CS-005**: Implementação se integra perfeitamente com o componente SegurancaSection existente, sem quebrar layout ou estilos

## Premissas

- Usuários possuem conexão estável com a internet para fazer requisições à API
- O JWT no cookie HttpOnly `BEARER` permanece válido durante a sessão de alteração de senha
- A API `/api/auth/alterar-senha` está operacional e retorna os códigos de status e mensagens de erro documentados
- Validações de força de senha no frontend devem espelhar os requisitos da API (8-20 caracteres, letras e números)
- O componente SegurancaSection já existe e está sendo utilizado na página de Configurações
- Estilos e componentes de UI já disponíveis no projeto serão reutilizados (inputs, botões, cards, etc.)
- Mensagens de erro retornadas pela API em português serão exibidas conforme enviadas (sem tradução adicional do frontend)
