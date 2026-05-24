# Especificação de Funcionalidade: Tela de Cadastro de Ata de Registro de Preços

**Branch da Funcionalidade**: `007-criar-ata`  
**Criado em**: 2026-05-24  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Eu quero criar a funcionalidade da tela de criar ata. Resgate a ata passando o identificador do licitante pelo header e o id da ata na query."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 — Cadastrar Ata Manualmente (Prioridade: P1)

Um usuário autenticado, vinculado a um licitante, acessa o formulário de cadastro de Ata de Registro de Preços (ARP) e preenche todos os dados manualmente. Ao submeter, a ata é criada com seus itens e o usuário é redirecionado à listagem de atas.

**Por que esta prioridade**: É o fluxo central da funcionalidade — sem ele, não há como cadastrar atas no sistema.

**Teste Independente**: Pode ser testado acessando o formulário de cadastro, preenchendo todos os campos obrigatórios com dados válidos, adicionando ao menos um item, e verificando que a ata aparece na listagem após a submissão.

**Cenários de Aceite**:

1. **Dado** que o usuário está autenticado e vinculado a um licitante ativo, **Quando** acessa a página de cadastro de ata e preenche todos os campos obrigatórios com dados válidos e adiciona pelo menos um item, **Então** o sistema cria a ata com seus itens e redireciona o usuário para a listagem de atas, exibindo a nova ata.
2. **Dado** que o usuário está no formulário de cadastro, **Quando** tenta submeter sem preencher um campo obrigatório (ex.: número da ata, órgão gerenciador, datas de vigência), **Então** o sistema exibe mensagens de erro específicas por campo sem submeter o formulário.
3. **Dado** que o usuário preencheu `data_fim_vigencia` anterior à `data_inicio_vigencia`, **Quando** tenta submeter, **Então** o sistema exibe erro informando que a data de fim deve ser posterior à data de início.
4. **Dado** que o usuário marcou "Aceita Adesão (Carona)" como falso, **Quando** tenta informar quantidade para carona maior que zero em algum item, **Então** o sistema exibe erro bloqueando a submissão.
5. **Dado** que o usuário adicionou dois itens com o mesmo número de item, **Quando** tenta submeter, **Então** o sistema exibe erro informando que números de item devem ser únicos dentro da ata.

---

### História de Usuário 2 — Pré-preencher Ata via Código PNCP (Prioridade: P2)

O usuário informa um código de controle PNCP no formulário de cadastro, e o sistema consulta a base do PNCP para pré-preencher automaticamente os campos da ata (órgão gerenciador, datas, descrição etc.), agilizando o cadastro.

**Por que esta prioridade**: Reduz significativamente o esforço de cadastro para atas já publicadas no PNCP, mas não bloqueia o fluxo principal se indisponível.

**Teste Independente**: Pode ser testado informando um código PNCP válido e verificando que os campos do formulário são preenchidos automaticamente com os dados retornados pelo serviço.

**Cenários de Aceite**:

1. **Dado** que o usuário está no formulário de cadastro, **Quando** informa um código PNCP válido e aciona a consulta, **Então** os campos de órgão gerenciador, datas de vigência, descrição e outros dados disponíveis são pré-preenchidos automaticamente no formulário.
2. **Dado** que o usuário informou um código PNCP inexistente, **Quando** aciona a consulta, **Então** o sistema exibe mensagem informando que nenhuma ata foi encontrada para o código informado.
3. **Dado** que o serviço do PNCP está indisponível, **Quando** o usuário aciona a consulta, **Então** o sistema exibe mensagem de serviço temporariamente indisponível, permitindo que o usuário preencha os dados manualmente.
4. **Dado** que o código PNCP retornou mais de um resultado, **Quando** a consulta é concluída, **Então** o sistema exibe mensagem solicitando um código mais específico.

---

### História de Usuário 3 — Gerenciar Itens da Ata no Formulário (Prioridade: P2)

O usuário pode adicionar múltiplos itens à ata dentro do formulário, editando ou removendo itens antes de submeter o cadastro. Cada item possui número, descrição, unidade de medida, valor estimado e quantidade registrada.

**Por que esta prioridade**: Uma ata sem itens não pode ser submetida; a gestão dos itens é parte essencial do formulário.

**Teste Independente**: Pode ser testado adicionando, editando e removendo itens no formulário sem submeter a ata, verificando que a lista de itens reflete as ações do usuário em tempo real.

**Cenários de Aceite**:

1. **Dado** que o usuário está no formulário de cadastro, **Quando** clica em "Adicionar Item", **Então** um novo campo de item é adicionado ao formulário com campos para número, descrição, unidade de medida, valor estimado e quantidade.
2. **Dado** que o formulário possui ao menos um item adicionado, **Quando** o usuário clica em "Remover" para um item específico, **Então** o item é removido da lista imediatamente.
3. **Dado** que a ata aceita adesão (carona), **Quando** o usuário adiciona um item, **Então** o campo "Quantidade para Carona" está habilitado e disponível para preenchimento.
4. **Dado** que a ata não aceita adesão (carona), **Quando** o usuário adiciona um item, **Então** o campo "Quantidade para Carona" está desabilitado ou oculto.

---

### Casos de Borda

- O que acontece se o CNPJ do órgão gerenciador for inválido (não tiver 14 dígitos numéricos)?
- Como o sistema trata a tentativa de cadastro quando o licitante autenticado não possui vínculo com o `X-Licitante-Id` informado?
- O que acontece se o usuário tentar submeter a ata sem nenhum item na lista?
- Como o formulário se comporta quando há erro de rede durante a submissão?
- O que acontece quando o código PNCP contém caracteres especiais como `/` que precisam de codificação na URL?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir um formulário de cadastro de Ata de Registro de Preços com todos os campos necessários: número da ata, descrição/objeto, CNPJ do órgão gerenciador, nome do órgão gerenciador, data de início de vigência, data de fim de vigência, indicadores de aceite a adesão (carona) e renovabilidade, código PNCP (opcional), URL do anexo (opcional) e lista de itens.
- **RF-002**: O sistema DEVE identificar o licitante do usuário autenticado via header `X-Licitante-Id` em todas as requisições de criação e consulta de atas.
- **RF-003**: O sistema DEVE obrigar ao menos um item por ata, com os campos: número do item (único dentro da ata), descrição, unidade de medida, valor estimado e quantidade registrada.
- **RF-004**: O sistema DEVE validar no cliente que `data_fim_vigencia` é posterior a `data_inicio_vigencia` antes de submeter.
- **RF-005**: O sistema DEVE validar no cliente que o CNPJ do órgão gerenciador possui exatamente 14 dígitos numéricos (com ou sem formatação).
- **RF-006**: O sistema DEVE desabilitar ou ocultar o campo "Quantidade para Carona" em cada item quando a ata não aceita adesão, e garantir que seu valor seja zero nesses casos.
- **RF-007**: O sistema DEVE impedir a submissão se dois ou mais itens possuírem o mesmo número de item.
- **RF-008**: O sistema DEVE permitir ao usuário informar um código PNCP para pré-preenchimento dos dados da ata via consulta ao serviço PNCP, mantendo a possibilidade de edição manual dos campos pré-preenchidos.
- **RF-009**: O sistema DEVE exibir mensagens de erro claras e específicas por campo em caso de falha de validação, tanto no cliente quanto retornadas pelo servidor.
- **RF-010**: Após criação bem-sucedida da ata, o sistema DEVE redirecionar o usuário para a listagem de atas ou para a tela de detalhes da ata recém-criada.
- **RF-011**: O sistema DEVE recuperar os detalhes de uma ata existente passando o `X-Licitante-Id` no header e o `id` da ata como parâmetro de rota (`/api/atas/{id}`).

### Entidades Principais

- **Ata de Registro de Preços (ARP)**: Documento que registra preços acordados com fornecedores. Possui número identificador, objeto/descrição, órgão gerenciador (CNPJ e nome), datas de vigência, indicadores de aceite a carona e renovabilidade, código PNCP opcional, URL de anexo opcional e lista de itens.
- **Item de Ata**: Produto ou serviço registrado na ata. Possui número único dentro da ata, descrição, unidade de medida, valor unitário estimado, quantidade registrada e quantidade disponível para carona.
- **Licitante**: Empresa vinculada ao usuário autenticado, identificada pelo `licitanteId`. A ata é criada e vinculada ao licitante.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um usuário consegue cadastrar uma ata com múltiplos itens em menos de 5 minutos quando possui os dados em mãos.
- **CS-002**: O pré-preenchimento via código PNCP preenche todos os campos disponíveis em menos de 3 segundos após a consulta.
- **CS-003**: 100% dos erros de validação do servidor são apresentados ao usuário com mensagens compreensíveis, sem exposição de detalhes técnicos.
- **CS-004**: O formulário permite adicionar, editar e remover itens sem recarregar a página, com resposta visual imediata a cada ação.
- **CS-005**: A ata criada aparece imediatamente na listagem de atas do licitante após a confirmação do cadastro.

## Premissas

- O usuário já está autenticado e possui pelo menos um licitante ativo vinculado à sua conta.
- O `licitanteId` ativo é armazenado no estado global da aplicação (contexto/store), disponível para ser enviado via header `X-Licitante-Id` em todas as requisições de atas.
- O formulário de cadastro de ata é acessível a partir da listagem de atas (botão "Nova Ata" ou similar).
- A consulta ao PNCP é feita sob demanda pelo usuário (não automática ao carregar o formulário).
- A edição de atas existentes está fora do escopo desta funcionalidade (apenas criação).
- Upload de arquivo de anexo está fora do escopo — o campo `anexo_url` aceita apenas uma URL informada manualmente.
- A listagem de atas (`/api/atas`) já existe e está funcional (implementada na feature 004).
- A tela de detalhes da ata (`/api/atas/{id}`) já existe e está funcional (implementada na feature 006).
