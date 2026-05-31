# Pesquisa: Cadastrar e Listar Instrumentos

## Visão Geral do Contexto Existente

A feature `src/features/instrumentos/` já possui uma estrutura completa de UI com dados
mockados. O objetivo desta feature é substituir os mocks pelos dados reais da API, seguindo
exatamente o padrão já estabelecido na feature `atas` (que passou pelo mesmo processo).

---

## Decisão 1: Mapeamento de Status

**Decisão**: Atualizar `InstrumentoListagem.status` para os valores retornados pela API.

**Situação atual**: O campo `status` usa `'em-execucao' | 'proximo-vencimento' | 'encerrado' | 'renovavel'`.

**API retorna**: `'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'`

**Alternativas consideradas**:
- Manter os tipos antigos e mapear no mapper → introduz camada de complexidade sem valor; a UI já precisará de ajuste para mostrar labels em PT-BR independentemente
- Atualizar o tipo de domínio para espelhar a API → escolhida; mais simples, sem mapping bidirecional desnecessário

**Rationale**: O tipo de domínio representa o estado real do negócio; os labels visuais em PT-BR ficam na camada `presentation` (função auxiliar `getStatusBadge`). O campo `renovavel` do mock não existe na API e deve ser removido do tipo.

---

## Decisão 2: Mapeamento de Tipo de Instrumento

**Decisão**: Atualizar `TipoInstrumentoContratual` para `'CONTRATO' | 'EMPENHO'`.

**Situação atual**: `'contrato' | 'nota-empenho' | 'outro'` (tipos manuais do mock)

**API retorna**: `'CONTRATO' | 'EMPENHO'`

**Alternativas consideradas**:
- Manter tipos antigos e mapear → desnecessário; a UI só precisa diferenciar Contrato de Empenho
- Remover o tipo `outro` → escolhida; não existe na API e os dados mockados que o usavam serão removidos

**Rationale**: Alinhamento direto com o contrato da API elimina conversões desnecessárias.

---

## Decisão 3: Seletor de ARP no formulário de Contrato e Empenho

**Decisão**: Usar `useListarAtas` da feature `atas` na camada `presentation` de `instrumentos` para popular o seletor de ARP.

**Situação atual**: `CadastrarContrato` usa `arpsDisponiveis` (array mock hardcoded). `CadastrarNotaEmpenho` não tem seletor de ARP.

**Alternativas consideradas**:
- Criar um novo use case em `instrumentos` que busca atas → duplicação desnecessária; `ListarAtasUseCase` já existe e está testado
- Usar `useListarAtas` diretamente na camada `presentation` de `instrumentos` → escolhida; a constituição proíbe `presentation` de importar de `data`, mas não proíbe reuso de hooks de outras features
- Criar um shared hook → over-engineering para dois consumidores

**Rationale**: A constituição não veda reuso de hooks entre features na camada `presentation`. A alternativa de duplicação violaria DRY sem ganho de isolamento real.

---

## Decisão 4: Campo `enderecoEntrega` no formulário de Contrato

**Decisão**: O campo "Endereço de Entrega" do formulário mapeia para `endereco_entrega` (opcional) na API, não para `endereco` (endereço do contratante). Ambos são opcionais.

**API suporta dois campos de endereço**:
- `endereco`: endereço do contratante (opcional)
- `endereco_entrega`: endereço de entrega dos produtos (opcional)

**Decisão**: Manter o campo `enderecoEntrega` no estado do formulário mapeando para `endereco_entrega`. Remover a obrigatoriedade atual do campo (a API não o exige). A validação `validarEtapaDados()` que o torna obrigatório deve ser relaxada.

---

## Decisão 5: Campos obrigatórios vs. opcionais no formulário de Contrato

**Campos obrigatórios pela API** (`POST /api/instrumentos/contratos`):
`numero`, `orgao_contratante`, `unidade`, `objeto`, `vigencia_inicial`, `vigencia_final`, `renovavel`

**Campos atualmente obrigatórios no formulário mas que são opcionais na API**:
- `prazoEntrega` e `prazoPagamento`: validados como obrigatórios na UI, mas opcionais na API
- `enderecoEntrega`: validado como obrigatório na UI, mas opcional na API

**Decisão**: Relaxar as validações do formulário para alinhar com o contrato da API. Remover a obrigatoriedade de `prazoEntrega`, `prazoPagamento` e `enderecoEntrega` no `validarEtapaDados()`.

---

## Decisão 6: Estrutura de entities para criação

**Decisão**: Adicionar `CriarContratoInput` e `CriarEmpenhoInput` em `criarContrato.ts`.

O arquivo `domain/entities/criarContrato.ts` já existe com `DadosContratoPncp`. Os novos tipos de input para criação serão adicionados ao mesmo arquivo, seguindo o padrão de `atas/domain/entities/criarAta.ts`.

---

## Decisão 7: Respostas de criação (ContratoResponse / EmpenhoResponse)

**Decisão**: As respostas de `POST /api/instrumentos/contratos` e `POST /api/instrumentos/empenhos` incluem o objeto criado completo. O frontend após criação redireciona para `/instrumentos/gestao` — não há necessidade de modelar entidades de detalhe nesta feature (fora de escopo). Os mappers de resposta de criação retornam apenas o `instrumento_id` necessário para redirecionamento futuro.

---

## Decisão 8: Itens do instrumento — obrigatoriedade

**Situação atual**: `CadastrarContrato` valida que deve haver ao menos 1 item (`validarEtapaItens()`). A API aceita lista vazia.

**Decisão**: Relaxar a validação — itens são opcionais tanto no Contrato quanto no Empenho, conforme a API. Manter o fluxo de etapas existente, mas não bloquear o avanço se não houver itens.
