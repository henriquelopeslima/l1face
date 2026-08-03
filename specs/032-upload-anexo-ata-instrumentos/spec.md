# Especificação de Funcionalidade: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho

**Branch da Funcionalidade**: `032-upload-anexo-ata-instrumentos`
**Criado em**: 2026-08-03
**Status**: Rascunho
**Entrada**: Descrição do usuário: "Melhorar o fluxo de anexar documentos à Ata e a Instrumentos (Contrato/Empenho): após criar o registro, subir automaticamente o anexo selecionado usando o id retornado pela criação, habilitar os campos de arquivo hoje desabilitados, remover o campo de texto legado de URL do anexo, e tratar falha de upload como falha parcial (registro criado, anexo não enviado) em vez de erro total."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Enviar o anexo automaticamente ao concluir o cadastro (Prioridade: P1)

Um usuário está cadastrando uma Ata, um Contrato ou um Empenho e, no formulário, seleciona um arquivo PDF para anexar (ex.: o edital, o termo do contrato ou a nota de empenho digitalizada). Ao confirmar o cadastro, o sistema primeiro cria o registro e, em seguida, envia automaticamente o arquivo selecionado como anexo desse registro — sem exigir uma ação separada do usuário para "enviar o anexo depois".

**Por que esta prioridade**: É o valor central da funcionalidade. Hoje o usuário só consegue anexar o documento em uma etapa manual posterior (ou, no caso da Ata, apenas colando uma URL de texto); unificar criação e anexo em um único fluxo de cadastro elimina passos e erros de digitação.

**Teste Independente**: Pode ser totalmente testado cadastrando uma nova Ata (ou Contrato/Empenho) com um arquivo PDF selecionado no formulário e verificando que, ao final, o registro existe e a página de detalhes exibe o link para o anexo enviado.

**Cenários de Aceite**:

1. **Dado** que o usuário preencheu o formulário de cadastro (Ata, Contrato ou Empenho) e selecionou um arquivo PDF válido, **Quando** ele confirma o cadastro, **Então** o registro é criado e, em seguida, o arquivo é enviado automaticamente como anexo desse registro, sem etapa adicional.
2. **Dado** que o upload foi concluído com sucesso, **Quando** o usuário é redirecionado para a página de detalhes do registro criado, **Então** o link do anexo enviado aparece disponível para visualização/download.
3. **Dado** que o usuário não selecionou nenhum arquivo, **Quando** ele confirma o cadastro, **Então** o registro é criado normalmente, sem anexo, e nenhuma tentativa de upload é disparada.

---

### História de Usuário 2 - Continuar normalmente quando a criação funciona mas o envio do anexo falha (Prioridade: P1)

O registro (Ata/Contrato/Empenho) foi criado com sucesso, mas o envio do arquivo falhou por algum motivo (arquivo corrompido, formato inesperado, instabilidade momentânea do serviço de armazenamento, conexão perdida). O usuário não deve perder o cadastro que já foi feito nem receber uma mensagem que sugira que tudo falhou.

**Por que esta prioridade**: Sem esse tratamento, uma falha isolada no envio do arquivo (evento reconhecidamente mais instável que o cadastro em si) faria o usuário acreditar que precisa refazer todo o cadastro, arriscando duplicidade de registros, ou o deixaria sem saber que o registro já existe.

**Teste Independente**: Pode ser testado forçando uma falha no envio do arquivo (ex.: simulando indisponibilidade do serviço de armazenamento) após uma criação bem-sucedida, e verificando que o usuário vê uma mensagem específica sobre o anexo e é levado à página de detalhes do registro já criado.

**Cenários de Aceite**:

1. **Dado** que o registro foi criado com sucesso, **Quando** o envio do anexo falha por qualquer motivo (formato rejeitado, arquivo inválido, indisponibilidade do serviço, falha de rede), **Então** o sistema exibe uma mensagem específica informando que o registro foi criado mas o anexo não foi enviado, orientando o usuário a reenviá-lo pela página de detalhes.
2. **Dado** que essa falha parcial ocorreu, **Quando** a mensagem é exibida, **Então** o usuário é levado à página de detalhes do registro recém-criado (mesmo comportamento de quando tudo dá certo), e não a uma tela de erro genérica.
3. **Dado** que a própria criação do registro falha (antes de qualquer tentativa de anexo), **Quando** isso acontece, **Então** o comportamento de erro permanece o atual (o usuário permanece no formulário e vê o erro de criação), já que não há registro criado para anexar nada.

---

### História de Usuário 3 - Selecionar um arquivo para anexar em qualquer um dos três cadastros (Prioridade: P2)

Hoje, o campo de seleção de arquivo já existe visualmente nos formulários de Contrato e de Empenho, mas está desabilitado com um aviso de "Em breve!"; no formulário de Ata, não existe campo de arquivo algum — apenas um campo de texto legado para colar uma URL. O usuário precisa conseguir escolher um arquivo PDF do próprio computador nos três formulários de cadastro.

**Por que esta prioridade**: É pré-requisito de UI para que as Histórias 1 e 2 sejam alcançáveis pelo usuário; sem o campo habilitado/criado, não há como selecionar o arquivo a ser enviado.

**Teste Independente**: Pode ser testado abrindo cada um dos três formulários de cadastro (Ata, Contrato, Empenho) e confirmando que é possível selecionar um arquivo PDF do computador, sem avisos de indisponibilidade.

**Cenários de Aceite**:

1. **Dado** que o usuário está no formulário de cadastro de Contrato ou de Empenho, **Quando** ele acessa o campo de seleção de arquivo, **Então** o campo está habilitado (sem aviso "Em breve!") e aceita a seleção de um arquivo PDF do computador.
2. **Dado** que o usuário está no formulário de cadastro de Ata, **Quando** ele chega à etapa correspondente, **Então** encontra um campo de seleção de arquivo (não mais um campo de texto para URL) para escolher um PDF do computador.
3. **Dado** que o usuário seleciona um arquivo em qualquer um dos três formulários, **Quando** ele revisa os dados antes de confirmar (etapa de revisão), **Então** não há mais nenhuma exibição do antigo campo de texto de URL do anexo.

---

### Casos de Borda

- O que acontece quando o usuário seleciona um arquivo que não é PDF? O sistema deve impedir o envio e avisar antes mesmo de tentar o cadastro, indicando que apenas PDF é aceito.
- O que acontece quando o usuário seleciona um PDF maior que o limite de tamanho aceito (10 MB)? O sistema deve impedir o envio e avisar sobre o limite antes de tentar o cadastro.
- O que acontece se o usuário trocar o arquivo selecionado várias vezes antes de confirmar o cadastro? Apenas o último arquivo selecionado é considerado no envio.
- O que acontece se a conexão cair exatamente durante o envio do anexo, mas depois do registro já ter sido criado? Trata-se como falha parcial (História 2): o registro existe, o usuário é avisado e levado aos detalhes para tentar reenviar.
- O que acontece com um registro que nunca teve anexo enviado (nem no cadastro, nem depois)? A página de detalhes continua funcionando como hoje, sem exibir link de anexo.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE, ao confirmar o cadastro de uma Ata, Contrato ou Empenho, criar o registro primeiro e, apenas se um arquivo tiver sido selecionado, enviar em seguida esse arquivo como anexo do registro recém-criado.
- **RF-002**: O sistema DEVE remover o campo de texto para inserção manual de URL do anexo do formulário de cadastro de Ata, incluindo qualquer exibição relacionada na etapa de revisão.
- **RF-003**: O sistema DEVE permitir a seleção de um arquivo PDF do computador do usuário nos três formulários de cadastro (Ata, Contrato, Empenho), sem bloqueios ou avisos de indisponibilidade.
- **RF-004**: O sistema DEVE validar, antes de tentar enviar, que o arquivo selecionado é do tipo PDF e não excede 10 MB, informando o usuário imediatamente caso contrário, sem exigir uma tentativa de cadastro para descobrir o problema.
- **RF-005**: O sistema DEVE, quando a criação do registro for bem-sucedida mas o envio do anexo falhar por qualquer motivo (formato rejeitado pelo servidor, conteúdo inválido, indisponibilidade do serviço, falha de rede), exibir ao usuário uma mensagem distinta da de erro de criação, informando que o registro foi criado mas o anexo não foi enviado e que pode ser reenviado pelos detalhes do registro.
- **RF-006**: O sistema DEVE, no cenário do RF-005, encaminhar o usuário para a página de detalhes do registro recém-criado, da mesma forma que faria em caso de sucesso completo.
- **RF-007**: O sistema DEVE manter o comportamento atual quando a própria criação do registro falha: o usuário permanece no formulário e vê o erro de criação, sem qualquer tentativa de envio de anexo.
- **RF-008**: O sistema NÃO DEVE alterar o comportamento das páginas de detalhes (Ata, Contrato, Empenho) quanto à exibição do link do anexo — elas continuam exibindo o anexo quando presente, sem link quando ausente.
- **RF-009**: O sistema DEVE permitir que o usuário prossiga com o cadastro normalmente quando nenhum arquivo for selecionado, criando o registro sem anexo, sem exigir que um arquivo seja fornecido.

### Entidades Principais

- **Ata**: Registro de Preços cadastrado pelo usuário; passa a receber um anexo (documento PDF) por meio de uma etapa separada de envio após sua criação, em vez de receber uma URL informada manualmente.
- **Instrumento (Contrato ou Empenho)**: Registro de execução vinculado ou não a uma Ata; passa a receber um anexo (documento PDF) por meio de uma etapa separada de envio após sua criação.
- **Anexo**: Documento PDF de até 10 MB associado a uma Ata ou a um Instrumento, substituindo qualquer anexo anterior quando reenviado.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um usuário consegue cadastrar uma Ata, Contrato ou Empenho e ter o documento anexado em uma única submissão de formulário, sem nenhuma etapa manual adicional após a criação.
- **CS-002**: 100% dos cadastros bem-sucedidos com arquivo selecionado resultam em anexo visível na página de detalhes imediatamente após a criação, quando o envio do arquivo é bem-sucedido.
- **CS-003**: Quando o envio do anexo falha após uma criação bem-sucedida, o usuário reconhece claramente (pela mensagem exibida) que o registro existe e que apenas o anexo precisa ser reenviado, sem necessidade de contatar suporte para confirmar se o cadastro foi perdido.
- **CS-004**: Nenhum usuário consegue mais inserir uma URL de anexo digitada manualmente no cadastro de Ata; a única forma de associar um documento passa a ser o envio de um arquivo real.

## Premissas

- O limite de tamanho (10 MB) e o formato aceito (somente PDF) para os três tipos de anexo (Ata, Contrato, Empenho) seguem o mesmo padrão já validado hoje no envio de outros tipos de arquivo do sistema (ex.: foto de perfil), aplicado no lado do usuário antes do envio.
- O envio do anexo é sempre feito para o mesmo registro recém-criado na mesma submissão — reenvios posteriores (troca do anexo já existente) continuam acontecendo pela página de detalhes, que já suporta essa exibição e não faz parte do escopo desta funcionalidade.
- Usuários têm conectividade estável o suficiente para a maioria dos envios; o tratamento de falha parcial cobre os casos de exceção (rede instável, serviço de armazenamento indisponível), não o caso comum.
- Não há mudança de escopo quanto a quem pode cadastrar Ata/Contrato/Empenho — a funcionalidade apenas altera o que acontece com o anexo durante um cadastro já permitido.
