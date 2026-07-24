# Especificação de Funcionalidade: Paginação em Gestão de Instrumentos e Gestão de Atas

**Branch da Funcionalidade**: `029-paginacao-instrumentos-atas`
**Criado em**: 2026-07-24
**Status**: Rascunho
**Entrada**: Descrição do usuário: "eu quero implementar a paginação na tela gestão de instrumentos e na de ata"

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Carregar instrumentos em lotes (Prioridade: P1)

Como usuário responsável pela gestão de instrumentos (contratos e empenhos), eu quero que a tela de Gestão de Instrumentos carregue os registros em lotes menores em vez de carregar todos de uma vez, para que a tela abra rapidamente mesmo quando existem centenas de instrumentos cadastrados.

**Por que esta prioridade**: É o problema mais urgente hoje — a tela busca a lista completa em uma única chamada e renderiza tudo de uma vez, o que degrada o tempo de carregamento à medida que a base cresce. Resolver isso na tela de Instrumentos já entrega o ganho de performance mais crítico.

**Teste Independente**: Pode ser testado abrindo a tela de Gestão de Instrumentos com uma base de dados com centenas de instrumentos e verificando que apenas o primeiro lote é carregado inicialmente, que a tela fica pronta para uso rapidamente, e que é possível carregar os demais registros sob demanda.

**Cenários de Aceite**:

1. **Dado** que existem mais instrumentos cadastrados do que o tamanho de um lote, **Quando** o usuário abre a tela de Gestão de Instrumentos, **Então** apenas o primeiro lote de instrumentos é exibido inicialmente.
2. **Dado** que o primeiro lote de instrumentos está sendo exibido e existem mais registros disponíveis, **Quando** o usuário solicita ver mais resultados, **Então** o próximo lote de instrumentos é carregado e adicionado à lista já exibida, sem perder a posição de rolagem atual.
3. **Dado** que todos os instrumentos já foram carregados, **Quando** o usuário chega ao fim da lista, **Então** o sistema indica claramente que não há mais registros a carregar.
4. **Dado** que o total de instrumentos cabe em um único lote, **Quando** o usuário abre a tela, **Então** todos os instrumentos são exibidos e nenhuma ação de carregar mais é oferecida.

---

### História de Usuário 2 - Carregar atas em lotes (Prioridade: P1)

Como usuário responsável pela gestão de atas de registro de preços, eu quero que a tela de Gestão de Atas carregue os registros em lotes menores em vez de carregar todos de uma vez, para que a tela abra rapidamente mesmo quando existem centenas de atas cadastradas.

**Por que esta prioridade**: Mesma urgência da História 1, aplicada à tela de Atas, que sofre do mesmo problema de carregar toda a coleção de uma vez. As duas telas compartilham o mesmo padrão de solução e o mesmo nível de criticidade.

**Teste Independente**: Pode ser testado abrindo a tela de Gestão de Atas com uma base de dados com centenas de atas e verificando que apenas o primeiro lote é carregado inicialmente, que a tela fica pronta para uso rapidamente, e que é possível carregar os demais registros sob demanda.

**Cenários de Aceite**:

1. **Dado** que existem mais atas cadastradas do que o tamanho de um lote, **Quando** o usuário abre a tela de Gestão de Atas, **Então** apenas o primeiro lote de atas é exibido inicialmente.
2. **Dado** que o primeiro lote de atas está sendo exibido e existem mais registros disponíveis, **Quando** o usuário solicita ver mais resultados, **Então** o próximo lote de atas é carregado e adicionado à lista já exibida, sem perder a posição de rolagem atual.
3. **Dado** que todas as atas já foram carregadas, **Quando** o usuário chega ao fim da lista, **Então** o sistema indica claramente que não há mais registros a carregar.
4. **Dado** que o total de atas cabe em um único lote, **Quando** o usuário abre a tela, **Então** todas as atas são exibidas e nenhuma ação de carregar mais é oferecida.

---

### História de Usuário 3 - Buscar e filtrar continuam funcionando com paginação (Prioridade: P2)

Como usuário das telas de Gestão de Instrumentos e Gestão de Atas, eu quero continuar buscando por texto e aplicando filtros (tipo, status) depois que a paginação for introduzida, para que eu encontre um registro específico mesmo que ele esteja em um lote ainda não carregado.

**Por que esta prioridade**: A busca e os filtros já existem hoje e são essenciais para localizar registros específicos. Sem ajuste, paginar a listagem quebraria a busca atual (que hoje filtra sobre a lista inteira já carregada), então este comportamento precisa ser preservado ou conscientemente redefinido.

**Teste Independente**: Pode ser testado digitando um termo de busca ou aplicando um filtro de tipo/status que corresponda a um registro que estaria em um lote além do primeiro, e confirmando que o registro é encontrado e exibido.

**Cenários de Aceite**:

1. **Dado** que o usuário está na tela de Gestão de Instrumentos ou de Atas, **Quando** ele digita um termo de busca, **Então** o resultado exibido reflete todos os registros correspondentes, não apenas os já carregados na tela.
2. **Dado** que um filtro (tipo, status) está aplicado, **Quando** o usuário rola a lista e carrega mais resultados, **Então** o filtro continua aplicado aos novos registros carregados.
3. **Dado** que o usuário limpa a busca ou o filtro, **Quando** a lista é recarregada, **Então** a paginação reinicia a partir do primeiro lote.

---

### Casos de Borda

- O que acontece quando não existe nenhum instrumento ou nenhuma ata cadastrada? A tela deve exibir o estado vazio já existente, sem oferecer ação de carregar mais.
- O que acontece se o carregamento de um lote adicional falhar (erro de rede ou do servidor)? O usuário deve ver uma mensagem de erro e poder tentar novamente sem perder os registros já carregados.
- O que acontece se um novo instrumento ou ata for criado por outro usuário enquanto a lista está sendo navegada? Não é necessário atualizar a lista em tempo real; o registro aparecerá ao recarregar a tela.
- O que acontece com os totais exibidos nos cartões de resumo (ex.: total de contratos, total de empenhos, saldo) quando nem todos os registros foram carregados? Os totais devem continuar representando o total real de registros, não apenas os já carregados na tela.
- O que acontece ao trocar de aba/filtro (ex.: de "Contratos" para "Empenhos") enquanto múltiplos lotes já foram carregados? A lista deve reiniciar a partir do primeiro lote do novo filtro.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: A tela de Gestão de Instrumentos DEVE carregar os registros em lotes, exibindo inicialmente apenas o primeiro lote em vez da coleção completa.
- **RF-002**: A tela de Gestão de Atas DEVE carregar os registros em lotes, exibindo inicialmente apenas o primeiro lote em vez da coleção completa.
- **RF-003**: Em ambas as telas, o usuário DEVE conseguir solicitar explicitamente o carregamento do próximo lote de registros, que é adicionado à lista já exibida.
- **RF-004**: Em ambas as telas, o sistema DEVE indicar de forma clara quando não há mais registros a carregar (ex.: ocultando ou desabilitando a ação de carregar mais).
- **RF-005**: O tamanho do lote de carregamento DEVE ser o mesmo já adotado na tela de listagem de notificações (20 registros por lote), para manter consistência de experiência entre as telas do sistema.
- **RF-006**: A busca por texto e os filtros (tipo, status) existentes em ambas as telas DEVEM continuar permitindo localizar qualquer registro correspondente, mesmo que ele ainda não tenha sido carregado na tela.
- **RF-007**: Ao aplicar ou alterar um termo de busca ou filtro, a listagem DEVE reiniciar a partir do primeiro lote de resultados correspondentes.
- **RF-008**: Os cartões de resumo/estatísticas (totais, contagens, saldos agregados) exibidos nas duas telas DEVEM continuar refletindo o total real de registros correspondentes, independentemente de quantos lotes já foram carregados na tela.
- **RF-009**: Em caso de falha ao carregar um lote adicional, o sistema DEVE exibir uma mensagem de erro e permitir que o usuário tente novamente, preservando os registros já carregados.
- **RF-010**: Ao trocar de filtro principal (ex.: tipo de instrumento, status da ata), a listagem DEVE reiniciar a partir do primeiro lote do novo filtro.

### Entidades Principais

- **Instrumento**: Contrato ou empenho gerenciado na tela de Gestão de Instrumentos; possui número, cliente/órgão, objeto, prazo, valor, saldo e status.
- **Ata de Registro de Preços**: Registro gerenciado na tela de Gestão de Atas; possui número, órgão gerenciador, objeto, vigência, valor registrado, saldo e status.
- **Lote de Resultados**: Conjunto de registros retornado a cada carregamento, com indicação de posição (qual lote) e se existem mais lotes disponíveis.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: A tela de Gestão de Instrumentos fica pronta para uso em menos de 2 segundos mesmo quando existem centenas de instrumentos cadastrados.
- **CS-002**: A tela de Gestão de Atas fica pronta para uso em menos de 2 segundos mesmo quando existem centenas de atas cadastradas.
- **CS-003**: Usuários conseguem localizar por busca ou filtro qualquer instrumento ou ata cadastrada, independentemente de quantos lotes já foram carregados na tela.
- **CS-004**: 100% dos totais exibidos nos cartões de resumo continuam corretos (refletindo o total real de registros) após a introdução da paginação.

## Premissas

- O padrão de "carregar mais" (carregamento incremental sob demanda, sem números de página nem seletor de itens por página) já validado na tela de listagem de notificações será reaproveitado nas duas telas, mantendo consistência de experiência no sistema.
- O tamanho de lote de 20 registros, já usado na listagem de notificações, é adequado também para instrumentos e atas.
- A busca e os filtros passarão a ser resolvidos considerando toda a base de registros (não apenas os já carregados), o que pode exigir que a busca/filtro seja processada nos mesmos moldes da paginação (por registro completo, não apenas pelos itens já exibidos na tela).
- As APIs consumidas por estas telas serão estendidas (ou já preveem extensão) para suportar parâmetros de paginação, seguindo o mesmo padrão já usado pela API de notificações.
- Não é necessário suporte a atualização em tempo real (real-time) da lista enquanto o usuário navega pelos lotes.
- Suporte a acessibilidade e navegação por teclado da ação "carregar mais" deve seguir os mesmos padrões já usados na tela de notificações.
