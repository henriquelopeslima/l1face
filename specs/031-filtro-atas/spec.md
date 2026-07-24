# Especificação de Funcionalidade: Filtros na Gestão de Atas

**Branch da Funcionalidade**: `031-filtro-atas`
**Criado em**: 2026-07-24
**Status**: Rascunho
**Entrada**: Descrição do usuário: "implemente os filtros na tela da gestão de atas."

## Cenários de Uso & Testes *(obrigatório)*

### História de Usuário 1 - Buscar atas por texto livre (Prioridade: P1)

Como usuário licitante, quero digitar um termo de busca na tela de gestão de atas e ver, entre **todas** as minhas atas cadastradas (não só as que já foram carregadas na tela), aquelas cujo número, órgão gerenciador ou objeto contenham esse termo, para localizar rapidamente uma ata específica sem precisar clicar em "carregar mais" repetidamente.

**Por que esta prioridade**: É a forma mais comum de localizar uma ata específica e hoje o campo de busca já existe na tela, mas só filtra as atas já carregadas na página — dando resultados incompletos ou "sumindo" com atas que ainda não foram buscadas. Corrigir isso é o valor central da funcionalidade.

**Teste Independente**: Pode ser testado cadastrando mais atas do que cabem em uma página, digitando um termo que só corresponda a uma ata fora das primeiras páginas carregadas, e confirmando que ela aparece no resultado.

**Cenários de Aceite**:

1. **Dado** que o licitante possui mais atas do que o tamanho de uma página, **Quando** o usuário digita um termo de busca que corresponde a uma ata ainda não carregada na tela, **Então** essa ata aparece nos resultados.
2. **Dado** que o usuário digitou um termo de busca, **Quando** nenhuma ata corresponde ao termo, **Então** a tela exibe uma mensagem de "nenhum resultado encontrado" em vez de lista vazia sem explicação.
3. **Dado** que o usuário tinha um termo de busca preenchido, **Quando** ele apaga o termo, **Então** a lista volta a mostrar todas as atas (comportamento padrão, paginado).

---

### História de Usuário 2 - Filtrar atas por status (Prioridade: P2)

Como usuário licitante, quero filtrar a lista de atas por status (Ativa, Próxima ao vencimento, Encerrada) considerando **todas** as minhas atas cadastradas, para focar apenas nas atas relevantes ao meu contexto (por exemplo, revisar rapidamente as que estão perto de vencer).

**Por que esta prioridade**: Já existe um seletor de status na tela, mas com a mesma limitação da busca textual — só filtra o que já foi carregado. É o segundo filtro mais valioso, mas depende do mesmo ajuste técnico da História 1.

**Teste Independente**: Pode ser testado cadastrando atas com os três status diferentes, escolhendo cada opção do filtro de status e confirmando que somente atas com aquele status aparecem, mesmo quando existem mais atas do que uma página.

**Cenários de Aceite**:

1. **Dado** que o licitante possui atas com os três status possíveis, **Quando** o usuário seleciona um status específico no filtro, **Então** somente atas com aquele status são exibidas, incluindo as que não estavam carregadas ainda.
2. **Dado** que um filtro de status está aplicado, **Quando** o usuário seleciona a opção "Todas", **Então** o filtro de status é removido e a lista volta a exibir atas de qualquer status.

---

### História de Usuário 3 - Combinar busca textual e filtro de status (Prioridade: P3)

Como usuário licitante, quero usar a busca por texto e o filtro de status ao mesmo tempo, para refinar ainda mais o resultado (por exemplo, encontrar atas de um órgão específico que estão próximas do vencimento).

**Por que esta prioridade**: É um refinamento sobre as duas histórias anteriores; agrega valor mas não é indispensável para o MVP da funcionalidade.

**Teste Independente**: Pode ser testado aplicando um termo de busca e um status simultaneamente e confirmando que somente atas que atendem às duas condições aparecem.

**Cenários de Aceite**:

1. **Dado** que o usuário aplicou um termo de busca e um filtro de status ao mesmo tempo, **Quando** a lista é atualizada, **Então** somente atas que atendem às duas condições (E lógico) são exibidas.

---

### Casos de Borda

- O que acontece quando o usuário aplica um filtro e depois clica em "carregar mais"? A paginação deve continuar buscando mais resultados **dentro do conjunto já filtrado**, sem duplicar nem misturar atas fora do filtro.
- O que acontece quando o usuário troca o filtro de status ou o termo de busca enquanto uma busca de "carregar mais" está em andamento? A lista deve reiniciar da primeira página com o novo filtro, descartando resultados da busca anterior.
- O que acontece quando o usuário aplica um filtro que não corresponde a nenhuma ata? A tela exibe uma mensagem de "nenhum resultado encontrado" com opção de limpar os filtros.
- O que acontece se a busca textual contiver caracteres especiais (ex.: `%`, `_`)? Devem ser tratados como texto literal, sem efeito especial de busca.
- O que acontece durante o tempo de carregamento de uma nova busca/filtro? A tela indica visualmente que está carregando, sem mostrar dados desatualizados ou piscar a lista vazia antes de retornar os resultados.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE permitir que o usuário digite um termo de busca livre que filtre as atas por número, nome do órgão gerenciador ou objeto, considerando o conjunto completo de atas do licitante (não apenas as já carregadas na tela).
- **RF-002**: O sistema DEVE permitir que o usuário filtre as atas por um único status (Ativa, Próxima ao vencimento ou Encerrada), considerando o conjunto completo de atas do licitante.
- **RF-003**: O sistema DEVE permitir combinar o filtro de busca textual com o filtro de status, retornando apenas atas que atendem a ambos simultaneamente.
- **RF-004**: O sistema DEVE reiniciar a paginação (voltar à primeira página de resultados) sempre que o termo de busca ou o filtro de status forem alterados.
- **RF-005**: O botão "carregar mais" DEVE continuar buscando resultados adicionais respeitando os filtros ativos no momento.
- **RF-006**: O sistema DEVE exibir uma mensagem clara de "nenhum resultado encontrado" quando os filtros aplicados não corresponderem a nenhuma ata.
- **RF-007**: O sistema DEVE permitir que o usuário limpe os filtros aplicados (busca e/ou status) e volte a ver a lista completa de atas.
- **RF-008**: O sistema DEVE aguardar uma breve pausa na digitação do termo de busca antes de buscar novos resultados, evitando disparar uma busca a cada tecla pressionada.
- **RF-009**: O sistema DEVE indicar visualmente ao usuário quando uma busca/filtro está em andamento (carregando).

### Entidades Principais

- **Ata**: Registro de preços do licitante, já existente na tela de gestão de atas; possui número, objeto, órgão gerenciador e status (calculado a partir das datas de vigência).
- **Filtro de Atas**: Critério de refinamento composto por termo de busca textual (opcional) e status (opcional), aplicado sobre o conjunto completo de atas do licitante.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Um usuário consegue localizar uma ata específica por meio da busca textual em menos de 10 segundos, independentemente de quantas atas existam ou de quantas páginas já foram carregadas.
- **CS-002**: 100% das atas que atendem a um filtro aplicado (texto e/ou status) aparecem no resultado, mesmo quando não estavam entre as atas inicialmente carregadas na tela.
- **CS-003**: Ao limpar os filtros, o usuário volta a ver a lista completa de atas sem precisar recarregar a página manualmente.
- **CS-004**: Nenhum resultado incorreto (ata fora do critério do filtro) é exibido quando um filtro está ativo.

## Premissas

- A tela de gestão de atas já possui os campos de interface para busca textual e filtro de status (implementados na funcionalidade atual); esta funcionalidade ajusta o comportamento desses campos para considerar o conjunto completo de atas, e não apenas as já carregadas.
- Os filtros aplicam-se apenas às atas do licitante atualmente selecionado, seguindo a mesma regra de escopo já usada na listagem de atas.
- Não é necessário permitir múltiplos status selecionados simultaneamente (multi-seleção) — apenas um status por vez, conforme o comportamento hoje existente na interface.
- Não é necessário persistir os filtros na URL ou entre sessões — o comportamento padrão de filtros locais à sessão de navegação é suficiente para esta versão.
- O tempo de pausa antes de buscar (debounce) da busca textual segue práticas comuns de UX (algumas centenas de milissegundos), sem necessidade de um valor exato definido pelo negócio.
