---
description: "Tarefas de implementação: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho"
---

# Tarefas: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

**Entrada**: Documentos de design em `specs/026-empenho-arp-obrigatorio/`
**Pré-requisitos**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api-contracts.md ✅
**Arquivos afetados**: `criarContrato.ts`, `criarEmpenhoMappers.ts`, `CriarEmpenhoUseCase.test.ts`, `CadastrarNotaEmpenho.tsx`
**Sem setup ou fundação necessários** — nenhum arquivo novo, nenhuma dependência nova, nenhuma mudança de backend (o backend `l1core` já valida as regras pedidas; ver `research.md`).

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2)

---

## Fase 1: História de Usuário 1 — Código do empenho obrigatório (Prioridade: P1) 🎯 MVP

**Objetivo**: O campo "Código do Empenho" passa a ser obrigatório na UI e a ser efetivamente enviado no payload de criação (`numero`), campo que o backend já exige e hoje é ignorado pelo frontend.

**Teste Independente**: Abrir `Instrumentos > Cadastrar > Nota de Empenho`, deixar o código vazio e tentar cadastrar — o envio deve ser bloqueado com mensagem indicando o campo obrigatório. Preencher o código e cadastrar um empenho sem ARP vinculada — o cadastro deve ser concluído com sucesso (sem erro 422 de `numero` ausente).

### Implementação para História de Usuário 1

- [X] T001 [US1] Adicionar `numero: string;` (obrigatório) à interface `CriarEmpenhoInput` em `src/features/instrumentos/domain/entities/criarContrato.ts`, logo após `numeroPncp`
- [X] T002 [US1] Em `src/features/instrumentos/data/mappers/criarEmpenhoMappers.ts`, adicionar `numero: input.numero` ao objeto `body` retornado por `mapCriarEmpenhoInputToApiRequest` (depende de T001 para o tipo compilar)
- [X] T003 [US1] Em `src/features/instrumentos/domain/useCases/CriarEmpenhoUseCase.test.ts`, adicionar `numero: '2026.000123'` ao objeto `inputMinimo` (depende de T001; sem essa mudança o arquivo deixa de compilar)
- [X] T004 [US1] Em `src/features/instrumentos/presentation/components/CadastrarNotaEmpenho.tsx`, atualizar o campo "Código do Empenho" (~linha 154-161): trocar o label `"Código do Empenho (opcional)"` por `"Código do Empenho"` com indicador `<span className="text-destructive">*</span>` (mesmo padrão de "Unidade / secretaria" e "Órgão / entidade" já na tela) e adicionar o atributo `required` ao `Input`
- [X] T005 [US1] Em `salvar` (`CadastrarNotaEmpenho.tsx`, ~linha 80-83), incluir `codigoEmpenho.trim()` na validação já existente — `if (!orgao.trim() || !secretaria.trim() || !objeto.trim() || !codigoEmpenho.trim())` — e atualizar a mensagem de erro para mencionar o código do empenho (depende de T004 para o campo já existir com `required` visual consistente)
- [X] T006 [US1] Em `salvar` (`CadastrarNotaEmpenho.tsx`, ~linha 99-107), incluir `numero: codigoEmpenho.trim()` (sempre presente, não condicional) no objeto `input: CriarEmpenhoInput` montado antes de `criarEmpenho(input)` (depende de T001 e T005)

**Checkpoint**: Após T001–T006, nenhum cadastro de empenho pode ser enviado sem código preenchido, e o código informado é persistido pelo backend (verificável na resposta 201 ou reabrindo o instrumento criado, se a tela de detalhe expuser `numero` — não é o caso hoje, fora de escopo desta feature).

---

## Fase 2: História de Usuário 2 — Itens do empenho vinculados obrigatoriamente à ARP selecionada (Prioridade: P1)

**Objetivo**: Quando uma ARP é selecionada no cadastro de empenho, os itens passam a ser carregados automaticamente da ARP (mesmo padrão já usado em `CadastrarContrato.tsx`), com descrição/unidade/valor bloqueados, quantidade limitada ao saldo disponível (órgão ou carona), e `item_ata_id` enviado ao backend — que já rejeita itens sem esse vínculo quando `ata_id` está presente.

**Teste Independente**: No cadastro de empenho, selecionar uma ARP com itens cadastrados e saldo disponível — a lista de itens deve ser preenchida automaticamente, com campos bloqueados e "Adicionar item" indisponível. Informar quantidade acima do saldo de um item — o sistema deve impedir. Desfazer a seleção da ARP — os itens devem ser limpos e o cadastro manual voltar a ficar disponível.

### Implementação para História de Usuário 2

- [X] T007 [P] [US2] Em `src/features/instrumentos/data/mappers/criarEmpenhoMappers.ts`, no mapeamento de `input.itens`, adicionar `if (item.itemAtaId != null) apiItem.item_ata_id = item.itemAtaId;` (mesmo trecho de `criarContratoMappers.ts:34`) — arquivo diferente de T008-T013, pode ser feito em paralelo
- [X] T008 [US2] Em `CadastrarNotaEmpenho.tsx`, estender a interface local `ItemLinha` (~linha 25-31) com `itemAtaId?: string`, `saldoOrgao?: number`, `saldoCarona?: number`
- [X] T009 [US2] Em `CadastrarNotaEmpenho.tsx`, importar e instanciar `AtasRepository` + `GetAtaUseCase` no nível do módulo (mesmo padrão de `CadastrarContrato.tsx:19-20,69-70`), e adicionar os estados `isCarregandoItensArp: boolean` e `erroItensArp: string | null` ao componente (depende de T008)
- [X] T010 [US2] Em `CadastrarNotaEmpenho.tsx`, implementar `carregarItensDaArp` (`useCallback`, mesmo padrão de `CadastrarContrato.tsx:165-189`): busca a ARP via `getAtaUseCase.execute(ataId)`, mapeia `ata.itens` para `ItemLinha[]` (ver `data-model.md` para o mapeamento de campos), chama `setItens(...)`; em falha, seta `erroItensArp` com mensagem amigável (depende de T009)
- [X] T011 [US2] Em `CadastrarNotaEmpenho.tsx`, no `onValueChange` do `Select` de ARP (~linha 195-201): quando `ataId` for limpo (`'none'`), além de já limpar `isAdesao`, limpar também `itens` (`setItens([])`) e `erroItensArp`; quando um `ataId` for selecionado, chamar `carregarItensDaArp(ataId)` (depende de T010)
- [X] T012 [US2] Em `CadastrarNotaEmpenho.tsx`, derivar `const isItensVinculadosArp = Boolean(ataId);` e usar essa flag na seção "Itens empenhados" (~linha 259-310): campos Descrição/Unidade/Valor unit. ficam `readOnly` com a mesma classe visual de desabilitado já usada em `CadastrarContrato.tsx`; botão "Adicionar item" desabilitado quando `isItensVinculadosArp` (depende de T008). Botão de remover item (`Trash`) permanece **habilitado** mesmo com ARP vinculada — corrigido após feedback do usuário pós-implementação (ver Notas)
- [X] T013 [US2] Em `CadastrarNotaEmpenho.tsx`, na coluna de quantidade da tabela de itens, exibir `/ saldo disponível` (usando `saldoCarona` quando `isAdesao` for `true`, senão `saldoOrgao`) e limitar o `max` do input de quantidade a esse saldo, desabilitando o input quando o saldo for `0` (mesmo padrão de `CadastrarContrato.tsx:856-878`) (depende de T012)
- [X] T014 [US2] Em `CadastrarNotaEmpenho.tsx`, adicionar acima da tabela de itens: um `Alert` de carregamento quando `isCarregandoItensArp`, um `Alert` destrutivo quando `erroItensArp`, e um `Alert` informativo quando `isItensVinculadosArp && itens.length === 0 && !isCarregandoItensArp && !erroItensArp` avisando que a ARP selecionada não possui itens cadastrados (RF-013) (depende de T009)
- [X] T015 [US2] Em `salvar` (`CadastrarNotaEmpenho.tsx`, ~linha 85-97), incluir `itemAtaId: i.itemAtaId` no objeto `ItemInstrumentoInput` mapeado a partir de cada linha, quando presente (mesmo padrão condicional de `criarContratoMappers.ts` — só inclui a chave quando o valor existe) (depende de T008)

**Checkpoint**: Após T007–T015, um empenho vinculado a uma ARP só pode ser cadastrado com itens 100% originados da ARP, dentro do saldo disponível — a requisição chega ao backend com `item_ata_id` em cada item, evitando o 422 silencioso que ocorre hoje.

---

## Fase Final: Polimento & Validação

- [X] T016 Rodar `npx tsc --noEmit` (ou o script de typecheck do projeto) e `npx vitest run src/features/instrumentos` para confirmar que `CriarEmpenhoUseCase.test.ts` e o restante da suíte de `instrumentos` continuam passando após as mudanças de tipo em `CriarEmpenhoInput`
- [X] T017 Validar manualmente os cenários da spec: (1) cadastrar empenho sem ARP e sem código → bloqueado; (2) cadastrar empenho sem ARP com código → sucesso; (3) selecionar ARP com itens e saldo → itens carregados e bloqueados, quantidade limitada; (4) selecionar ARP sem itens → alerta de ARP sem itens; (5) trocar de ARP → itens substituídos; (6) desfazer seleção de ARP → itens limpos e cadastro manual liberado
- [X] T018 Confirmar que a mensagem de erro do backend (`erroSalvar`) aparece de forma legível caso, por qualquer motivo, uma requisição ainda chegue sem `item_ata_id` ou com quantidade acima do saldo (ex.: erro de rede reordenando estados) — nenhuma mudança de código esperada aqui, apenas validação do tratamento de erro já existente em `InstrumentosRepository.criarEmpenho`

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Fase 1 (US1)**: Sem dependência de outra fase — pode começar imediatamente
- **Fase 2 (US2)**: Independente de US1 em termos de regra de negócio, mas toca o mesmo arquivo (`CadastrarNotaEmpenho.tsx`) e o mesmo mapper (`criarEmpenhoMappers.ts`) — recomenda-se concluir a Fase 1 primeiro para evitar conflitos de edição simultânea no mesmo arquivo, mesmo não havendo dependência lógica real
- **Fase Final**: Depende da conclusão de US1 e US2

### Dentro de Cada História de Usuário

- **US1**: T001 → T002/T003 (paralelo entre si, ambos dependem de T001) → T004 → T005 → T006
- **US2**: T007 é independente (arquivo próprio); T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 (sequencial, mesmo arquivo)

### Oportunidades de Paralelismo

```bash
# Dentro de US1, após T001:
Task: "Adicionar numero ao body em criarEmpenhoMappers.ts" (T002)
Task: "Adicionar numero ao inputMinimo em CriarEmpenhoUseCase.test.ts" (T003)

# T007 (US2, mapper) pode ser feito a qualquer momento, em paralelo com qualquer
# tarefa de US1 ou com o início de US2 em CadastrarNotaEmpenho.tsx — arquivo isolado
```

---

## Estratégia de Implementação

### MVP (apenas US1 — T001–T006)

1. Implementar T001–T006
2. **PARAR e VALIDAR**: Cadastrar um empenho sem ARP, confirmar que o código é obrigatório e é persistido
3. Fazer commit se estiver correto

### Entrega Completa

1. US1 (T001–T006) → Código obrigatório e persistido
2. US2 (T007–T015) → Itens vinculados obrigatoriamente à ARP
3. T016–T018 → Validação final (typecheck, testes automatizados, roteiro manual)

---

## Notas

- Nenhum arquivo de `l1core` (backend) é alterado — o contrato já existente lá (`numero` obrigatório, `item_ata_id` obrigatório com validação de saldo) é a fonte da verdade documentada em `contracts/api-contracts.md`
- `CriarEmpenhoUseCase` (domain) não ganha lógica nova — continua um passthrough; a única mudança de teste (T003) é para manter o arquivo compilando com o novo campo obrigatório do tipo
- T008–T015 tocam o mesmo arquivo (`CadastrarNotaEmpenho.tsx`) em regiões distintas mas relacionadas (estado, carregamento, tabela) — seguir a ordem sequencial evita retrabalho, já que T012/T013 dependem do estado introduzido em T008
- Nenhuma mudança na tela de detalhe do empenho (`NotaEmpenhoDetalhesPage.tsx`) — fora de escopo, ver `research.md`
- **Correção pós-implementação (RF-006)**: a primeira versão implementada desabilitava o botão de remover item quando a ARP estava vinculada, seguindo `CadastrarContrato.tsx` à risca. O usuário corrigiu esse comportamento: itens carregados da ARP devem poder ser removidos individualmente (o usuário pode não querer incluir todos os itens da ARP neste empenho específico), só não pode incluir item que não venha da ARP. `spec.md` (RF-006) e `plan.md` foram atualizados para refletir essa correção.
