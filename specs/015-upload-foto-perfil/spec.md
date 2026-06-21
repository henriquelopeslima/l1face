# Especificação de Funcionalidade: Upload de Foto de Perfil

**Branch da Funcionalidade**: `015-upload-foto-perfil`  
**Criado em**: 2026-06-21  
**Status**: Rascunho  

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Enviar Foto de Perfil (Prioridade: P1)

O usuário autenticado, na tela de Configurações > Meu Perfil, clica no botão "Alterar foto". Um seletor de arquivos é aberto e o usuário escolhe uma imagem JPEG ou PNG de até 5 MB. Após selecionar o arquivo, a foto é enviada e o avatar exibido na tela é atualizado imediatamente com a nova imagem.

**Por que esta prioridade**: É o fluxo principal e a única razão de existência da funcionalidade. Sem ele não há feature.

**Teste Independente**: Pode ser totalmente testado clicando em "Alterar foto", selecionando uma imagem válida e verificando que o avatar é atualizado na tela sem necessidade de recarregar a página.

**Cenários de Aceite**:

1. **Dado** que estou na tela de Configurações, **Quando** clico em "Alterar foto" e seleciono um arquivo JPEG ou PNG válido com até 5 MB, **Então** a foto é enviada, o avatar no perfil é atualizado com a nova imagem e uma mensagem de sucesso é exibida.
2. **Dado** que já possuo uma foto de perfil, **Quando** envio uma nova foto, **Então** a foto anterior é substituída e o avatar exibe a nova imagem.
3. **Dado** que estou na tela de Configurações, **Quando** o seletor de arquivos é aberto e eu cancelo sem selecionar nenhum arquivo, **Então** nada acontece e a foto atual permanece.

---

### História de Usuário 2 - Rejeição de Arquivo Inválido (Prioridade: P2)

O usuário tenta enviar um arquivo que não atende às regras de validação (formato errado ou tamanho acima de 5 MB). O sistema rejeita o arquivo e informa claramente o motivo, sem alterar a foto atual.

**Por que esta prioridade**: Garante integridade dos dados e boa experiência em casos de erro.

**Teste Independente**: Pode ser testado tentando enviar um PDF, um arquivo corrompido ou uma imagem acima de 5 MB e verificando que a mensagem de erro adequada é exibida.

**Cenários de Aceite**:

1. **Dado** que seleciono um arquivo com formato diferente de JPEG ou PNG (ex.: PDF, GIF, WebP), **Quando** o envio é processado, **Então** uma mensagem de erro informa que somente JPEG e PNG são aceitos.
2. **Dado** que seleciono uma imagem válida mas com tamanho acima de 5 MB, **Quando** o envio é processado, **Então** uma mensagem de erro informa que o limite é de 5 MB.
3. **Dado** que ocorre um erro, **Então** a foto de perfil atual permanece inalterada.

---

### História de Usuário 3 - Remover Foto de Perfil (Prioridade: P3)

O usuário deseja remover sua foto de perfil e voltar a exibir o avatar com suas iniciais. Um controle de remoção está disponível na mesma área de gerenciamento de foto.

**Por que esta prioridade**: Complementa o ciclo de vida da foto; o MVP funciona sem remoção.

**Teste Independente**: Pode ser testado clicando em "Remover foto" (quando o usuário já possui uma) e verificando que o avatar volta a exibir as iniciais.

**Cenários de Aceite**:

1. **Dado** que possuo uma foto de perfil, **Quando** clico em "Remover foto" e confirmo a ação, **Então** a foto é removida e o avatar passa a exibir as iniciais do meu nome.
2. **Dado** que não possuo foto de perfil, **Então** a opção de remover foto não está visível ou está desabilitada.

---

### Casos de Borda

- O que acontece se a conexão cair durante o upload? A foto anterior deve permanecer e uma mensagem de erro genérica deve ser exibida.
- O que acontece se o serviço de armazenamento estiver indisponível? O usuário deve ser informado de que o serviço está temporariamente fora do ar e orientado a tentar novamente.
- O que acontece se o usuário tentar enviar um arquivo com extensão válida mas conteúdo corrompido? O sistema deve rejeitar e informar que o arquivo não é uma imagem válida.
- O avatar no cabeçalho da aplicação (AppHeader) deve ser atualizado ao mesmo tempo que o avatar na tela de configurações?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE permitir que o usuário autenticado selecione e envie uma imagem de perfil a partir do botão "Alterar foto" na seção Meu Perfil das Configurações.
- **RF-002**: O sistema DEVE aceitar somente arquivos nos formatos JPEG e PNG.
- **RF-003**: O sistema DEVE rejeitar arquivos com tamanho superior a 5 MB e exibir mensagem de erro clara ao usuário.
- **RF-004**: O sistema DEVE rejeitar arquivos corrompidos ou cujo conteúdo não seja uma imagem válida.
- **RF-005**: O sistema DEVE atualizar o avatar exibido na tela imediatamente após o envio bem-sucedido, sem necessidade de recarregar a página.
- **RF-006**: O sistema DEVE substituir automaticamente a foto anterior quando uma nova for enviada.
- **RF-007**: O sistema DEVE exibir o estado de carregamento (loading) enquanto o upload estiver em andamento, impedindo envios duplicados.
- **RF-008**: O sistema DEVE exibir mensagem de sucesso após o envio bem-sucedido.
- **RF-009**: O sistema DEVE permitir que o usuário remova sua foto de perfil, retornando ao avatar de iniciais.
- **RF-010**: O sistema DEVE exibir o controle de remoção apenas quando o usuário já possuir uma foto de perfil.
- **RF-011**: O avatar do cabeçalho da aplicação DEVE refletir a foto atualizada sem recarregamento de página.

### Entidades Principais

- **FotoPerfil**: Imagem associada ao perfil do usuário. Atributos relevantes: URL temporária de acesso (válida por 1 hora), formato (JPEG ou PNG), tamanho máximo (5 MB). Quando ausente, o sistema exibe avatar com iniciais do nome do usuário.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: O usuário consegue trocar sua foto de perfil em menos de 30 segundos em condições normais de rede.
- **CS-002**: 100% das tentativas de envio com arquivo inválido resultam em mensagem de erro compreensível, sem alterar a foto atual.
- **CS-003**: A nova foto é exibida na tela imediatamente após o envio bem-sucedido, sem necessidade de recarregar a página.
- **CS-004**: O avatar no cabeçalho da aplicação é atualizado na mesma sessão, sem recarregamento.
- **CS-005**: O fluxo de remoção da foto funciona de forma idempotente — remover quando não há foto não gera erro para o usuário.

## Premissas

- O usuário já está autenticado; a funcionalidade não contempla acesso não autenticado.
- A pré-visualização da imagem antes do envio está fora do escopo desta versão.
- O recorte (crop) ou redimensionamento da imagem pelo usuário está fora do escopo desta versão.
- A URL da foto retornada pela API tem validade de 1 hora; o frontend deve lidar com expiração de forma transparente ao usuário (nova requisição quando necessário).
- O avatar com iniciais já existe como fallback e deve ser mantido quando não há foto.
- A confirmação de remoção será feita via diálogo simples para evitar remoção acidental.
