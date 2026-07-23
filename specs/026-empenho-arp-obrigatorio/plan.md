# Plano de Implementação: Código Obrigatório e Itens Vinculados à ARP no Cadastro de Empenho

**Branch**: `026-empenho-arp-obrigatorio` | **Data**: 2026-07-22 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/026-empenho-arp-obrigatorio/spec.md`

## Resumo

O formulário de cadastro de nota de empenho (`CadastrarNotaEmpenho.tsx`) hoje captura um "Código do Empenho" na tela mas nunca o envia à API — e o backend (`l1core`) já trata esse campo (`numero`) como obrigatório, retornando 422 quando ausente. Da mesma forma, o backend já impõe, quando uma ARP é vinculada ao empenho, que cada item informe `item_ata_id` referenciando um item real da ARP, com quantidade limitada ao saldo disponível (de órgão ou de carona/adesão) — mas a tela atual permite digitar itens livremente mesmo com uma ARP selecionada, o que hoje já resulta em erro 422 silencioso e confuso para o usuário. A implementação corrige os dois pontos inteiramente no frontend, sem exigir mudança de backend: (1) tornar o código do empenho obrigatório na UI e incluí-lo no payload; (2) replicar em `CadastrarNotaEmpenho.tsx` o mecanismo de carregamento e bloqueio de itens a partir da ARP já existente e validado em `CadastrarContrato.tsx` (mesma tela, mesmo padrão, para o cadastro de contratos).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode), React 19
**Dependências Principais**: `AtasRepository` + `GetAtaUseCase` (já existentes, reutilizados de `atas/domain`), `InstrumentosRepository` (já existente), shadcn/ui, iconoir-react
**Armazenamento**: N/A — leitura via HTTP API (`GET` de ARP para carregar itens) e escrita via `POST /api/instrumentos/empenhos`; nenhum novo armazenamento local
**Testes**: Vitest, testes colocalizados (`*.test.ts`), seguindo o padrão de `instrumentos`
**Plataforma Alvo**: Web SPA (l1face)
**Tipo de Projeto**: Mudança pontual na feature `instrumentos` (frontend); backend (`l1core`) já suporta o comportamento pedido e não é alterado
**Metas de Performance**: N/A — mudança de validação/formulário, sem impacto de performance
**Restrições**: Proibido `any`; domain não pode importar de data/presentation; `numero` e vínculo de itens à ARP devem refletir exatamente as regras já impostas pelo backend (ver `contracts/api-contracts.md`)
**Escala/Scope**: 1 entidade de domínio (`CriarEmpenhoInput`), 1 mapper (`criarEmpenhoMappers.ts`), 1 teste de Use Case existente (`CriarEmpenhoUseCase.test.ts`), 1 componente de apresentação (`CadastrarNotaEmpenho.tsx`)

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slice / Isolamento de camadas | ✅ PASS | Mudanças ficam dentro de `src/features/instrumentos/`; `domain` (`CriarEmpenhoInput`) não importa de `data`/`presentation`; `presentation` continua acessando a API só via `useCriarEmpenho` → `CriarEmpenhoUseCase` → `IInstrumentosRepository` |
| II. TypeScript estrito (sem `any`) | ✅ PASS | `numero: string` tipado explicitamente; `itemAtaId`/`saldoOrgao`/`saldoCarona` tipados como `string`/`number` opcionais, mesmo padrão já usado em `CadastrarContrato.tsx` |
| II. Dependency Inversion | ✅ PASS | `CadastrarNotaEmpenho.tsx` depende de `GetAtaUseCase` (já abstrai `AtasRepository` via `IAtasRepository`), não de chamada HTTP direta |
| III. Lógica extraída para hook customizado | ⚠️ PASS COM RESSALVA | O carregamento de itens da ARP (`carregarItensDaArp`) permanece como `useCallback` local ao componente, replicando o padrão já existente (não extraído para hook) em `CadastrarContrato.tsx` — ver justificativa em `research.md` ("Reuso do carregamento de itens da ARP"); não é uma nova violação, é consistência com o precedente já aceito no projeto |
| III. Componentes puros | ✅ PASS | `CadastrarNotaEmpenho.tsx` continua responsável só por renderização e coleta de estado; toda regra de negócio (validação de saldo, obrigatoriedade de `item_ata_id`) é imposta pelo backend, a UI apenas reflete essa regra |
| IV. Mascaramento de erros | ✅ PASS | Erros 422 do backend (ex.: saldo insuficiente) já chegam como mensagem amigável via `InstrumentosRepository.criarEmpenho` existente — nenhuma mudança necessária |
| V. Use Cases com 100% cobertura de testes unitários | ✅ PASS | `CriarEmpenhoUseCase.test.ts` já existe e cobre `execute`; será atualizado (não expandido em escopo) para refletir `numero` obrigatório no tipo `CriarEmpenhoInput` |

**Resultado**: Nenhuma violação bloqueante. Prosseguir para pesquisa.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/026-empenho-arp-obrigatorio/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── checklists/
    └── requirements.md
```

### Código-Fonte (arquivos a modificar)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   └── criarContrato.ts                    [MODIFICAR — CriarEmpenhoInput ganha `numero: string`]
│   └── useCases/
│       └── CriarEmpenhoUseCase.test.ts          [MODIFICAR — inputMinimo passa a incluir `numero`]
├── data/
│   └── mappers/
│       └── criarEmpenhoMappers.ts               [MODIFICAR — envia `numero` e `item_ata_id` por item]
└── presentation/
    └── components/
        └── CadastrarNotaEmpenho.tsx             [MODIFICAR — código obrigatório; itens vinculados à ARP]
```

Nenhum arquivo novo é criado. Nenhuma mudança em `l1core` (backend) é necessária — o backend já expõe e valida o contrato descrito em `contracts/api-contracts.md`.

**Decisão de Estrutura**: Mudança cirúrgica dentro da feature `instrumentos` já existente, sem novos arquivos nem nova estrutura de pastas. Segue o padrão de camadas já estabelecido (`domain/entities` + `domain/useCases`, `data/mappers`, `presentation/components`) usado por `CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx` e demais telas da feature.

## Detalhes de Implementação por Camada

### Domain — `criarContrato.ts`

Adicionar `numero: string;` (obrigatório, sem `?`) à interface `CriarEmpenhoInput`, logo após `numeroPncp`, espelhando a posição/nome já usados em `CriarContratoInput`. `ItemInstrumentoInput` (compartilhada entre contrato e empenho) não muda — já tem `itemAtaId?: string`.

### Data — `criarEmpenhoMappers.ts`

- Adicionar `numero: input.numero` ao objeto `body` (campo sempre presente, sem checagem de `!= null`, já que agora é obrigatório no tipo).
- No mapeamento de `input.itens`, adicionar `if (item.itemAtaId != null) apiItem.item_ata_id = item.itemAtaId;` — mesmo trecho já usado em `criarContratoMappers.ts:34`.

### Domain (teste) — `CriarEmpenhoUseCase.test.ts`

Atualizar `inputMinimo` para incluir `numero: '2026.000123'` (ou similar), já que o tipo `CriarEmpenhoInput` deixa de compilar sem esse campo. Nenhuma outra mudança de teste é necessária — `CriarEmpenhoUseCase` continua um passthrough sem lógica própria, então não há novo caminho de código para cobrir ali (a lógica de vínculo obrigatório vive inteiramente no backend, já testado no `l1core`).

### Presentation — `CadastrarNotaEmpenho.tsx`

**Código do empenho obrigatório**:
- Label passa de `"Código do Empenho (opcional)"` para `"Código do Empenho"` com indicador `*` (mesmo padrão visual de "Unidade / secretaria" e "Órgão / entidade" já na tela).
- Adicionar `required` ao `Input`.
- Em `salvar`, incluir `codigoEmpenho.trim()` na verificação já existente (`if (!orgao.trim() || !secretaria.trim() || !objeto.trim())`) → passa a ser `if (!orgao.trim() || !secretaria.trim() || !objeto.trim() || !codigoEmpenho.trim())`, com mensagem de erro atualizada para mencionar o código.
- Incluir `numero: codigoEmpenho.trim()` (sempre, não condicional) no objeto `input: CriarEmpenhoInput` montado em `salvar`.

**Itens vinculados à ARP** (réplica do padrão de `CadastrarContrato.tsx`, adaptado ao shape local `ItemLinha`):
- `ItemLinha` ganha `itemAtaId?: string`, `saldoOrgao?: number`, `saldoCarona?: number`.
- Instanciar `AtasRepository` + `GetAtaUseCase` no módulo (mesmo padrão de `CadastrarContrato.tsx`, fora do componente).
- Novos estados: `isCarregandoItensArp: boolean`, `erroItensArp: string | null`.
- `carregarItensDaArp(ataId)` (`useCallback`): busca a ARP via `getAtaUseCase.execute(ataId)`, mapeia `ata.itens` para `ItemLinha[]` (ver `data-model.md`), seta `setItens(...)`; em falha, seta `erroItensArp`.
- `useEffect` disparado por mudança de `ataId`: se vazio, limpa `itens`, `erroItensArp` e `isAdesao` (mantendo o `useEffect` de adesão já existente no `onValueChange` do `Select` — ver abaixo); se preenchido, chama `carregarItensDaArp(ataId)`.
- `isItensVinculadosArp = Boolean(ataId)` — deriva se a UI de itens deve ficar bloqueada.
- Tabela de itens: quando `isItensVinculadosArp`, os campos Descrição/Unidade/Valor unit. ficam `readOnly`, a coluna Qtd. exibe `/ saldo disponível` (órgão ou carona conforme `isAdesao`) e limita o `max` do input ao saldo. O botão de remover linha (`Trash`) permanece habilitado mesmo com ARP vinculada — o usuário pode excluir individualmente itens da ARP que não deseje incluir neste empenho (correção pós-implementação: a primeira versão desabilitava o botão, mas isso impedia excluir itens indesejados; ver `research.md`). O botão "Adicionar item" continua desabilitado quando `isItensVinculadosArp` (não é permitido incluir item que não venha da ARP).
- Estado vazio: se `isItensVinculadosArp && itens.length === 0 && !isCarregandoItensArp && !erroItensArp`, exibir um `Alert` informando que a ARP não possui itens cadastrados (cobre RF-013 — comportamento levemente diferente do precedente de `CadastrarContrato.tsx`, que não tinha essa mensagem explícita, mas é exigido por esta spec).
- Exibir `Alert` de carregamento (`isCarregandoItensArp`) e de erro (`erroItensArp`, com o mesmo texto de "não foi possível carregar os itens da ARP selecionada") acima da tabela — mesmo padrão visual de `CadastrarContrato.tsx`.
- No `onValueChange` do `Select` de ARP já existente (linha ~195-201), ao trocar para `'none'`: além de já limpar `isAdesao`, também limpar `itens` e `erroItensArp` (hoje esse `Select` não mexe em `itens` — passa a mexer).
- Ao montar o objeto `itensInput` em `salvar`, incluir `itemAtaId: i.itemAtaId` no item mapeado quando presente (hoje o filtro/map de `itens` não propaga nenhum id de origem).

## Rastreamento de Complexidade

*Nenhuma violação de constituição identificada. Seção não aplicável.*
