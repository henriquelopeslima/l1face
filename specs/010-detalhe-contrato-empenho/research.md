# Research: Detalhes do Contrato e Empenho

## Decisão 1: Estrutura das Entidades de Detalhe

**Decision**: Adicionar quatro tipos ao arquivo existente `instrumentoContratual.ts`:
`ItemInstrumentoDetalhe`, `TipoPrazo`, `ContratoDetalhe`, `EmpenhoDetalhe` e o tipo
discriminado `InstrumentoDetalhe = { tipo: 'CONTRATO'; contrato: ContratoDetalhe; empenho: null; ... }
| { tipo: 'EMPENHO'; empenho: EmpenhoDetalhe; contrato: null; ... }`.

**Rationale**: A spec 009 (feature anterior relacionada) já tomou essa decisão e está documentada.
O padrão de union discriminada por `tipo` permite narrowing seguro em TypeScript sem `any`.
Co-localizar tudo em `instrumentoContratual.ts` mantém o padrão existente do projeto
(todos os tipos de instrumentos estão neste arquivo).

**Alternatives considered**:
- Arquivo separado `instrumentoDetalhe.ts`: rejeitado — fragmenta o modelo sem ganho real.
- Tipo genérico `Instrumento<T>`: rejeitado — prejudica legibilidade e narrowing automático.

---

## Decisão 2: Use Case "Fino" para BuscarInstrumento

**Decision**: `BuscarInstrumentoUseCase` será um thin wrapper sem regras de negócio:
`execute(id: string) → Promise<InstrumentoDetalhe>`.

**Rationale**: O endpoint `GET /api/instrumentos/{id}` não requer transformações de negócio
no frontend (status é calculado pela API). Seguindo o padrão estabelecido em
`GetAtaUseCase.ts` e `ListarInstrumentosUseCase.ts` — ambos são delegadores puros.

**Alternatives considered**:
- Lógica de "calcular dias restantes" no use case: rejeitado — é lógica de apresentação,
  vai no componente/hook.

---

## Decisão 3: Hook Compartilhado para Ambas as Páginas

**Decision**: Um único hook `useBuscarInstrumento(id: string)` retornando
`{ instrumento: InstrumentoDetalhe | null, isLoading: boolean, error: string | null, refetch: () => void }`.
Tanto `ContratoDetalhesPage` quanto `NotaEmpenhoDetalhesPage` usam o mesmo hook.

**Rationale**: O endpoint é o mesmo — `GET /api/instrumentos/{id}` — independente do tipo.
A distinção CONTRATO vs EMPENHO ocorre na camada de apresentação via discriminated union.
Padrão idêntico ao `useGetAta.ts` existente.

**Alternatives considered**:
- Hooks separados `useBuscarContrato` / `useBuscarEmpenho`: rejeitado — duplicação desnecessária,
  mesmo endpoint.

---

## Decisão 4: Refatorar Páginas Existentes (não recriar)

**Decision**: Refatorar `ContratoDetalhesPage.tsx` e `NotaEmpenhoDetalhesPage.tsx` in-place,
removendo mock data e conectando ao hook real.

**Rationale**: As páginas já têm UI completa modelada no protótipo. Recriar do zero seria
desperdício. As interfaces locais (mock) serão substituídas pelas entidades do domínio.

**Specific changes for ContratoDetalhesPage**:
- Remover: interfaces `ContratoDetalhado`, `ItemContrato`, `MovimentacaoItem`, `OrdemFornecimento`
  e todos os mocks hardcoded
- Remover: campo `isARP` (não existe na API; usar `ata_id !== null` do `InstrumentoDetalhe`)
- Remover: campo `secretaria` → usar `unidade`
- Remover: `valorGlobal`/`saldoAtual` → calcular da lista `itens` (soma de `valor_total`)
- Ajustar: `prazoEntrega` + `tipoPrazoEntrega` ("UTEIS"→"dias úteis", "CORRIDOS"→"dias corridos")
- Simplificar: tabela de itens remove colunas `qtdEntregue`, `qtdReservada`, `saldoDisponivel`
  (não existem na API)
- Manter: visão extrato → empty state (movimentações não existem na API ainda)
- Manter: Ordens de Fornecimento → empty state com mensagem "Em breve"

**Specific changes for NotaEmpenhoDetalhesPage**:
- Remover: interfaces e mocks locais
- Remover: campos não-API: `tipoEmpenho`, `dataEmissao`, `dataVencimento`, `enderecoEntrega`,
  `prazoEntrega`, `prazoPagamento` (não existem em `EmpenhoDetalhes` da API)
- Simplificar: tabela de itens igual ao contrato (sem colunas de saldo)
- Manter: ARP card condicional, Ordens de Fornecimento → empty state

---

## Decisão 5: Mapeamento da API

**Decision**: O mapper `mapApiInstrumentoDetalhesToInstrumentoDetalhe` seguirá o padrão
snake_case → camelCase já estabelecido em `mapApiInstrumentoListagemToInstrumentoListagem`.

**API Response shape** (de `InstrumentoDetalhesResponse`):
```
instrumento_id → instrumentoId
licitante_id → licitanteId
ata_id → ataId
criado_em → criadoEm
tipo → tipo
contrato:
  numero_pncp → numeroPncp
  orgao_contratante → orgaoContratante
  vigencia_inicial → vigenciaInicial
  vigencia_final → vigenciaFinal
  prazo_entrega → prazoEntrega
  tipo_prazo_entrega → tipoPrazoEntrega
  prazo_pagamento → prazoPagamento
  tipo_prazo_pagamento → tipoPrazoPagamento
  endereco_entrega → enderecoEntrega
  anexo_url → anexoUrl
  criado_em → criadoEm
empenho:
  numero_pncp → numeroPncp
  orgao_contratante → orgaoContratante
  anexo_url → anexoUrl
  criado_em → criadoEm
itens[]:
  unidade_medida → unidadeMedida
  quantidade_total → quantidadeTotal
  valor_unitario → valorUnitario
  valor_total → valorTotal
```

---

## Decisão 6: Testes do Use Case

**Decision**: `BuscarInstrumentoUseCase.test.ts` em `src/features/instrumentos/domain/usecases/`
com 100% de cobertura (conforme constituição V).

**Rationale**: Constituição §V exige 100% de cobertura em use cases. Mesmo sendo um thin use
case, o teste valida o contrato de interface e previne regressão caso regras sejam adicionadas.
Padrão seguido: injetar mock do repositório via constructor.
