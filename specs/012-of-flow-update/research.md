# Pesquisa: Atualização do Fluxo de Ordens de Fornecimento

## Análise do Estado Atual vs. Novo Backend

### 1. Endpoint de Criação de OF

**Antes (código atual):**
```
POST /api/instrumentos/{instrumentoId}/ordens-fornecimento
Body: { itens: [{ item_instrumento_id, quantidade_fornecida, valor_unitario }] }
```

**Depois (API nova):**
```
POST /api/instrumentos/{instrumentoId}/ordens-fornecimento
Body: { data_recebimento, prazo_entrega, itens: [{ item_instrumento_id, quantidade_fornecida }] }
```

- **Decisão**: Remover `valor_unitario` do body (derivado automaticamente pelo backend) e adicionar `data_recebimento` e `prazo_entrega` como campos obrigatórios.
- **Rationale**: O backend passou a derivar o valor unitário do instrumento. O frontend não precisa e não deve calcular/enviar esse valor.

---

### 2. Endpoints de Avanço de Status

**Antes (código atual):**
```
PATCH /api/ordens-fornecimento/{id}/status
Body: { status: 'em_separacao' | 'despachado' | 'entregue' }
```

**Depois (API nova — 3 endpoints separados):**
```
PATCH /api/ordens-fornecimento/{id}/separacao   → { data_separacao }
PATCH /api/ordens-fornecimento/{id}/despacho    → { data_despacho, codigo_rastreio?, numero_nf? }
PATCH /api/ordens-fornecimento/{id}/entrega     → { data_entrega, prazo_pagamento }
```

- **Decisão**: Substituir o use case genérico `AvancarStatusOrdemFornecimentoUseCase` por 3 use cases específicos: `IniciarSeparacaoUseCase`, `RegistrarDespachoUseCase`, `ConfirmarEntregaUseCase`.
- **Rationale**: Cada transição de status agora exige campos diferentes e obrigatórios. A abstração genérica de "avançar status" não é compatível com essa diversidade de dados de entrada.
- **Alternativa rejeitada**: Manter um único use case genérico com um campo `status` + campos opcionais — rejeitada porque forçaria tipagem unsafe e lógica condicional confusa.

---

### 3. Endpoint de Pagamento

**Antes (código atual):**
```
PATCH /api/ordens-fornecimento/{id}/pagamento
Verificava erro PAGAMENTO_REQUER_LIQUIDACAO
```

**Depois (API nova):**
```
PATCH /api/ordens-fornecimento/{id}/pagamento
Body: { data_pagamento_efetivo }
Pré-condição: status = 'entregue' (não requer liquidação)
Erro: TRANSICAO_STATUS_INVALIDA
```

- **Decisão**: Corrigir o tratamento de erro no repository — remover verificação de `PAGAMENTO_REQUER_LIQUIDACAO` e tratar `TRANSICAO_STATUS_INVALIDA`.
- **Rationale**: A API foi atualizada para não exigir liquidação como pré-condição do pagamento.

---

### 4. Campos Ausentes na Entidade OrdemFornecimento

O mapper e a entidade atual não incluem os campos que já existem na resposta do backend:

| Campo ausente         | Tipo           | Endpoint que retorna |
|-----------------------|----------------|----------------------|
| `prazo_entrega`       | `string (date)`| GET, POST, PATCH     |
| `data_separacao`      | `string | null`| GET, PATCH /separacao|
| `data_despacho`       | `string | null`| GET, PATCH /despacho |
| `codigo_rastreio`     | `string | null`| GET, PATCH /despacho |
| `numero_nf_despacho`  | `string | null`| GET, PATCH /despacho |

- **Decisão**: Adicionar esses campos à interface `OrdemFornecimento` e ao tipo `ApiOrdemFornecimento` no mapper.
- **Rationale**: São necessários para exibir as informações de rastreio e datas na interface. Sem eles, o usuário não vê a data de despacho nem o código de rastreio registrados.

---

### 5. Fluxo de Liquidação

O endpoint `/liquidacao` existe no backend mas está **fora do escopo desta feature**.

- **Decisão**: Manter o `RegistrarLiquidacaoUseCase`, o hook `useRegistrarLiquidacaoOrdemFornecimento` e o `registrarLiquidacaoOrdemFornecimento` no repository intactos (para não quebrar o código existente), mas remover o formulário de liquidação da interface visual nas páginas de detalhe.
- **Rationale**: O usuário explicitou que a liquidação não faz parte deste fluxo. A remoção da UI é suficiente para excluir essa funcionalidade da experiência do usuário nesta iteração.

---

### 6. Componente CriarOrdemFornecimento

O componente atual:
- Inclui um campo "Número do Empenho" que não existe na nova API
- Exibe "Valor Unit." como coluna editável no Step 2
- Não inclui campo de `prazo_entrega`
- Não envia `data_recebimento` no payload (presente na interface mas não mapeado corretamente para o request)

- **Decisão**: Remover o campo "Número do Empenho", remover a coluna "Valor Unit." do Step 2, adicionar campo `prazo_entrega` obrigatório no Step 1, e atualizar o submit para enviar `data_recebimento` e `prazo_entrega`.
- **Rationale**: Alinhamento com a nova API. O total da OF não pode ser calculado localmente sem o `valor_unitario`, portanto a exibição do total deve ser removida ou exibida como "calculado pelo servidor".

---

### 7. Estratégia de UI para as Transições de Status

**Situação atual**: Um único botão "Avançar Status" + modal de confirmação genérico.

**Nova situação**: Cada transição exige campos específicos:
- `pedido_recebido → em_separacao`: precisa de `data_separacao`
- `em_separacao → despachado`: precisa de `data_despacho` + campos opcionais de rastreio/NF
- `despachado → entregue`: precisa de `data_entrega` + `prazo_pagamento`
- `entregue → pago`: precisa de `data_pagamento_efetivo` (já implementado)

- **Decisão**: Substituir o modal genérico de confirmação por formulários inline (já usados para liquidação/pagamento nas páginas) com os campos específicos de cada transição. Cada transição terá seu próprio estado de formulário aberto/fechado na página.
- **Rationale**: O padrão de formulário inline já é usado nas páginas para liquidação e pagamento. É consistente com o design existente e mais eficiente do que criar modais separados para cada transição.
- **Alternativa rejeitada**: Criar um modal/dialog separado para cada transição — rejeitada pela complexidade adicional e inconsistência com o padrão inline já estabelecido nas páginas.

---

### 8. Arquivos Afetados (mapa de mudanças)

| Arquivo | Tipo de mudança |
|---------|-----------------|
| `domain/entities/instrumentoContratual.ts` | Adicionar campos à `OrdemFornecimento`, atualizar `EmitirOrdemFornecimentoInput`, remover `AvancarStatusOrdemFornecimentoInput`, adicionar novos inputs de transição |
| `domain/contracts/IInstrumentosRepository.ts` | Substituir `avancarStatusOrdemFornecimento` por 3 métodos específicos |
| `domain/useCases/AvancarStatusOrdemFornecimentoUseCase.ts` | Remover |
| `domain/useCases/AvancarStatusOrdemFornecimentoUseCase.test.ts` | Remover |
| `domain/useCases/EmitirOrdemFornecimentoUseCase.ts` | Manter (sem mudanças) |
| `domain/useCases/IniciarSeparacaoOrdemFornecimentoUseCase.ts` | Criar |
| `domain/useCases/RegistrarDespachoOrdemFornecimentoUseCase.ts` | Criar |
| `domain/useCases/ConfirmarEntregaOrdemFornecimentoUseCase.ts` | Criar |
| `data/mappers/ordemFornecimentoMappers.ts` | Adicionar campos ausentes ao mapper e tipos API |
| `data/repositories/InstrumentosRepository.ts` | Atualizar `emitirOrdemFornecimento`, substituir `avancarStatusOrdemFornecimento`, corrigir `registrarPagamentoOrdemFornecimento` |
| `presentation/hooks/useAvancarStatusOrdemFornecimento.ts` | Remover |
| `presentation/hooks/useIniciarSeparacaoOrdemFornecimento.ts` | Criar |
| `presentation/hooks/useRegistrarDespachoOrdemFornecimento.ts` | Criar |
| `presentation/hooks/useConfirmarEntregaOrdemFornecimento.ts` | Criar |
| `presentation/components/CriarOrdemFornecimento.tsx` | Remover campo empenho, remover coluna valorUnitario, adicionar prazo_entrega, corrigir payload |
| `presentation/pages/ContratoDetalhesPage.tsx` | Substituir lógica de avanço de status genérico por 3 formulários específicos, remover formulário de liquidação |
| `presentation/pages/NotaEmpenhoDetalhesPage.tsx` | Idem ContratoDetalhesPage |
