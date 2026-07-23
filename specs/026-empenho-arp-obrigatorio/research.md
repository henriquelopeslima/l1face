# Research: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

## Campo `numero` (código do empenho) já é exigido e aceito pelo backend

**Decision**: Adicionar `numero: string` (obrigatório) a `CriarEmpenhoInput` e enviá-lo como `numero` no corpo da requisição `POST /api/instrumentos/empenhos`, exatamente como já é feito para `CriarContratoInput`.

**Rationale**: Inspecionando o backend (`l1core`), `CriarInstrumentoEmpenhoController::__invoke` (`l1core/src/Presentation/Symfony/Controller/Instrumento/CriarInstrumentoEmpenhoController.php:36`) já valida `$requiredFields = ['numero', 'orgao_contratante', 'unidade', 'objeto']` e retorna 422 (`"Missing required field: numero"`) se ausente — o backend já trata esse campo como obrigatório hoje. O `docs/openapi.yaml` do `l1core` está desatualizado (não documenta `numero` no endpoint de empenho, apenas no de contrato), mas o código-fonte é a fonte da verdade. Isso significa que o formulário atual de `l1face` (`CadastrarNotaEmpenho.tsx`) já está gerando empenhos que **falhariam** ao vincular a um número de fato — o campo `codigoEmpenho` existe na tela mas nunca é enviado (`criarEmpenhoMappers.ts` não tem `numero`), então hoje ele funciona por sorte apenas enquanto o backend aceitar ausência do campo — o que, pela leitura do controller, **não é o caso**: qualquer empenho cadastrado por essa tela hoje deveria já estar recebendo 422 do backend em produção, a menos que o ambiente de teste use um mock. Esta mudança apenas alinha o frontend ao contrato real já imposto pelo backend.

**Alternatives considered**: Manter `numero` opcional no tipo TypeScript e confiar apenas na validação de UI. Rejeitado — o backend rejeitaria a requisição de qualquer forma; expor a obrigatoriedade no tipo (`numero: string`, sem `?`) torna o contrato explícito em tempo de compilação e evita reintroduzir o mesmo bug (campo capturado na UI mas nunca enviado).

---

## Vínculo obrigatório de itens à ARP (`item_ata_id`) já é validado pelo backend, incluindo saldo de órgão

**Decision**: Adicionar `item_ata_id` ao payload de cada item enviado por `criarEmpenhoMappers.ts` (mesmo padrão já usado em `criarContratoMappers.ts`), e replicar no `CadastrarNotaEmpenho.tsx` o mesmo mecanismo de carregamento/bloqueio de itens a partir da ARP já usado em `CadastrarContrato.tsx`.

**Rationale**: `InstrumentoService::criarComEmpenho` (`l1core/src/Domain/Service/InstrumentoService.php:197-225`) já impõe, no backend, exatamente a regra pedida pelo usuário: quando `ata_id` está presente, cada item **deve** informar `item_ata_id` (senão `InvalidArgumentException: "Cada item deve informar item_ata_id quando o empenho está vinculado a uma Ata."`, HTTP 422) e a quantidade não pode exceder o saldo disponível — calculado tanto para adesão/carona (`getQtdCarona() - sumQuantidadeCaronaByItemAtaId()`) quanto para órgão (`getQtdOrgao() - sumQuantidadeOrgaoByItemAtaId()`), lançando `QuantidadeInsuficienteException` (422) em ambos os casos. Ou seja: a trava que o usuário pediu ("itens devem obrigatoriamente vir da ARP") já existe no backend — o frontend hoje simplesmente não a respeita, porque `CadastrarNotaEmpenho.tsx` nunca carrega itens da ARP nem envia `item_ata_id`. Qualquer tentativa atual de cadastrar um empenho com ARP selecionada e itens digitados manualmente já falha silenciosamente com 422 (a mensagem de erro do backend aparece no formulário via `erroSalvar`, mas o usuário não entende por quê, já que a tela não dá nenhuma pista de que os itens precisam vir da ARP). Replicar o padrão já usado e validado em `CadastrarContrato.tsx` resolve isso na UI, sem exigir nenhuma mudança de backend.

**Alternatives considered**: Adicionar apenas validação client-side sem enviar `item_ata_id` (deixar o backend rejeitar). Rejeitado — o backend já rejeita hoje; sem enviar `item_ata_id`, mesmo um usuário que selecione itens "certos" da ARP manualmente teria a requisição recusada. É necessário enviar o identificador real.

---

## Reuso do carregamento de itens da ARP: duplicar a lógica de `CadastrarContrato.tsx` em vez de extrair um hook compartilhado

**Decision**: Replicar em `CadastrarNotaEmpenho.tsx` a mesma lógica local (`useCallback` + `GetAtaUseCase` instanciado no módulo) já usada em `CadastrarContrato.tsx`, em vez de extrair um hook compartilhado (`useItensDaArp`) para as duas telas.

**Rationale**: As duas telas têm formatos de estado local diferentes para os itens (`ItemContrato` no contrato, com `id/itemAtaId/descricao/unidadeMedida/quantidadeTotal/valorUnitario/valorTotal/saldoOrgao/saldoCarona`; a versão nova de `ItemLinha` no empenho precisa do mesmo shape). `CadastrarContrato.tsx` não foi construído com essa extração — é o próprio precedente que esta feature está seguindo — e a Constituição só exige migrar código legado em não-conformidade *na feature que o tocar* (`CadastrarContrato.tsx` não é tocado por esta mudança). Extrair um hook compartilhado agora seria refatorar um arquivo fora do escopo desta feature para economizar ~25 linhas, o que fere a orientação de não introduzir abstrações além do necessário. Caso uma terceira tela precise do mesmo carregamento futuramente, a extração pode ser feita nesse momento com mais contexto sobre a forma final da abstração.

**Alternatives considered**: Extrair `useItensDaArp(ataId, isAdesao)` compartilhado em `src/features/atas/presentation/hooks/`. Rejeitado por ora — exigiria tocar `CadastrarContrato.tsx` fora do escopo da spec e generalizar um formato de item que hoje só existe de forma ad-hoc em cada tela.

---

## Comportamento quando nenhuma ARP está selecionada

**Decision**: Não alterar o comportamento atual de itens manuais e opcionais quando `ataId` está vazio.

**Rationale**: A spec (Premissas) e o backend (`itens` continuam opcionais e livres quando `ata_id` é `null`) concordam: a trava de vínculo só se aplica quando existe uma Ata associada. Fora desse caso, o comportamento de hoje já está correto e não precisa mudar.

**Alternatives considered**: Nenhuma — não há ambiguidade aqui.

---

## Escopo: tela de detalhe do empenho (leitura) fica de fora

**Decision**: Não alterar `EmpenhoDetalhe` (entidade de leitura) nem `NotaEmpenhoDetalhesPage.tsx` para exibir o código do empenho, mesmo o backend já retornando `numero` também no detalhe (`InstrumentoDetalhesResponseDto.php:69`).

**Rationale**: A spec desta feature (`spec.md`) é focada exclusivamente no fluxo de **criação** do empenho (`História de Usuário 1` e `2`, ambas sobre o formulário de cadastro). Exibir o código na tela de detalhe é uma mudança de leitura, não de escrita, e não foi pedida pelo usuário. Mesmo escopo de exclusão já usado por `018-contrato-adesao-carona`, que explicitamente deixou `CadastrarNotaEmpenho` de fora do seu próprio escopo por não ter sido pedido.

**Alternatives considered**: Incluir a exibição no detalhe já que é trivial (`empenho.numero`). Rejeitado — mantém o princípio de só mudar o que a spec pede; pode ser uma feature futura de "exibir código do empenho no detalhe" caso seja necessário.

---

## Estrutura de arquivos afetados

| Camada | Arquivo | Ação |
|--------|---------|------|
| domain/entities | `criarContrato.ts` | MODIFICAR — adicionar `numero: string` a `CriarEmpenhoInput` |
| data/mappers | `criarEmpenhoMappers.ts` | MODIFICAR — enviar `numero` e `item_ata_id` por item |
| domain/useCases | `CriarEmpenhoUseCase.test.ts` | MODIFICAR — `inputMinimo` passa a incluir `numero` |
| presentation/components | `CadastrarNotaEmpenho.tsx` | MODIFICAR — código obrigatório na UI; carregamento/bloqueio de itens a partir da ARP |
