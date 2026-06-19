# Plano de Implementação: Atualização do Fluxo de Ordens de Fornecimento

**Branch**: `012-of-flow-update` | **Data**: 2026-06-15 | **Spec**: [spec.md](spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/012-of-flow-update/spec.md`

## Resumo

Atualização do fluxo de Ordens de Fornecimento (OF) para alinhar o frontend aos novos endpoints do backend. O fluxo genérico de "avançar status" é substituído por 3 ações específicas com campos próprios (separação, despacho, entrega). O formulário de criação de OF é simplificado (remove `valor_unitario`, adiciona `prazo_entrega`). O registro de pagamento tem o tratamento de erro corrigido. A liquidação é removida da interface nesta iteração.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.x (strict mode)  
**Dependências Principais**: React 18, Vite, Tailwind CSS, shadcn/ui  
**Armazenamento**: N/A (SPA, estado via hooks)  
**Testes**: Vitest + React Testing Library  
**Plataforma Alvo**: Web (SPA)  
**Tipo de Projeto**: Web application (frontend SPA)  
**Metas de Performance**: Transições de status refletidas em < 3 segundos  
**Restrições**: TypeScript strict — sem `any`, sem `as unknown`. Sem acoplamento de camadas (domínio não importa data/presentation).  
**Escala/Scope**: Feature isolada dentro de `src/features/instrumentos/`

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Arquitetura Clean / Vertical Slices | ✅ PASSA | Todas as mudanças ficam em `src/features/instrumentos/` divididas em domain/data/presentation |
| II. TypeScript Estrito + SOLID | ✅ PASSA | Novos inputs tipados explicitamente; nenhum `any`. Use cases com SRP. |
| III. Boas Práticas React | ✅ PASSA | Lógica extraída para hooks customizados; componentes sem lógica de negócio |
| IV. Security by Design | ✅ PASSA | Sem localStorage, sem dangerouslySetInnerHTML, erros de infra mascarados na UI |
| V. Testes e Qualidade | ✅ PASSA | Novos use cases precisam de testes unitários; use cases removidos têm testes a deletar |

**Sem violações. Rastreamento de Complexidade não necessário.**

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/012-of-flow-update/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── ordens-fornecimento.md
└── tasks.md             ← gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   └── instrumentoContratual.ts          ← MODIFICAR
│   ├── contracts/
│   │   └── IInstrumentosRepository.ts        ← MODIFICAR
│   └── useCases/
│       ├── AvancarStatusOrdemFornecimentoUseCase.ts      ← REMOVER
│       ├── AvancarStatusOrdemFornecimentoUseCase.test.ts ← REMOVER
│       ├── EmitirOrdemFornecimentoUseCase.ts             ← sem mudanças
│       ├── EmitirOrdemFornecimentoUseCase.test.ts        ← MODIFICAR (fixture)
│       ├── IniciarSeparacaoOrdemFornecimentoUseCase.ts   ← CRIAR
│       ├── IniciarSeparacaoOrdemFornecimentoUseCase.test.ts ← CRIAR
│       ├── RegistrarDespachoOrdemFornecimentoUseCase.ts  ← CRIAR
│       ├── RegistrarDespachoOrdemFornecimentoUseCase.test.ts ← CRIAR
│       ├── ConfirmarEntregaOrdemFornecimentoUseCase.ts   ← CRIAR
│       ├── ConfirmarEntregaOrdemFornecimentoUseCase.test.ts ← CRIAR
│       ├── RegistrarPagamentoOrdemFornecimentoUseCase.ts ← sem mudanças
│       └── RegistrarPagamentoOrdemFornecimentoUseCase.test.ts ← sem mudanças
├── data/
│   ├── mappers/
│   │   └── ordemFornecimentoMappers.ts       ← MODIFICAR
│   └── repositories/
│       └── InstrumentosRepository.ts          ← MODIFICAR
└── presentation/
    ├── hooks/
    │   ├── useAvancarStatusOrdemFornecimento.ts   ← REMOVER
    │   ├── useEmitirOrdemFornecimento.ts           ← sem mudanças
    │   ├── useIniciarSeparacaoOrdemFornecimento.ts ← CRIAR
    │   ├── useRegistrarDespachoOrdemFornecimento.ts ← CRIAR
    │   ├── useConfirmarEntregaOrdemFornecimento.ts  ← CRIAR
    │   ├── useRegistrarPagamentoOrdemFornecimento.ts ← MODIFICAR (erro)
    │   └── useRegistrarLiquidacaoOrdemFornecimento.ts ← sem mudanças (fora de escopo)
    ├── components/
    │   └── CriarOrdemFornecimento.tsx         ← MODIFICAR
    └── pages/
        ├── ContratoDetalhesPage.tsx            ← MODIFICAR
        └── NotaEmpenhoDetalhesPage.tsx         ← MODIFICAR
```

**Decisão de Estrutura**: Projeto único (SPA), feature `instrumentos` existente. Sem criação de novas features ou pages.

## Plano de Implementação por Camada

### Camada 1 — Domain (entidades + contratos + use cases)

**1.1 Atualizar `instrumentoContratual.ts`**

Mudanças na entidade `OrdemFornecimento`:
- Adicionar: `prazoEntrega: string`, `dataSeparacao: string | null`, `dataDespacho: string | null`, `codigoRastreio: string | null`, `numeroNfDespacho: string | null`

Mudanças em inputs:
- `ItemEmitirOFInput`: remover `valorUnitario: number`
- `EmitirOrdemFornecimentoInput`: adicionar `dataRecebimento: string`, `prazoEntrega: string`
- Remover: `AvancarStatusOrdemFornecimentoInput`
- Adicionar: `IniciarSeparacaoInput`, `RegistrarDespachoInput`, `ConfirmarEntregaInput`

**1.2 Atualizar `IInstrumentosRepository.ts`**

- Remover: `avancarStatusOrdemFornecimento(input: AvancarStatusOrdemFornecimentoInput)`
- Adicionar:
  - `iniciarSeparacaoOrdemFornecimento(input: IniciarSeparacaoInput): Promise<OrdemFornecimento>`
  - `registrarDespachoOrdemFornecimento(input: RegistrarDespachoInput): Promise<OrdemFornecimento>`
  - `confirmarEntregaOrdemFornecimento(input: ConfirmarEntregaInput): Promise<OrdemFornecimento>`

**1.3 Remover use case antigo**

- Deletar `AvancarStatusOrdemFornecimentoUseCase.ts` e seu `.test.ts`

**1.4 Criar 3 novos use cases**

Cada um segue o mesmo padrão: recebe o `IInstrumentosRepository` via construtor e delega ao método correspondente.

```typescript
// IniciarSeparacaoOrdemFornecimentoUseCase
export class IniciarSeparacaoOrdemFornecimentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  async execute(input: IniciarSeparacaoInput): Promise<OrdemFornecimento> {
    return this.repository.iniciarSeparacaoOrdemFornecimento(input);
  }
}
```

Idem para `RegistrarDespachoOrdemFornecimentoUseCase` e `ConfirmarEntregaOrdemFornecimentoUseCase`.

**1.5 Testes dos novos use cases**

Para cada use case, criar teste unitário verificando:
- Que o repositório é chamado com o input correto
- Que a OF retornada é propagada sem modificação

---

### Camada 2 — Data (mapper + repository)

**2.1 Atualizar `ordemFornecimentoMappers.ts`**

Adicionar campos ao tipo interno `ApiOrdemFornecimento`:
```typescript
prazo_entrega: string;
data_separacao: string | null;
data_despacho: string | null;
codigo_rastreio: string | null;
numero_nf_despacho: string | null;
```

Atualizar a função de mapeamento `mapApiOrdemFornecimentoToOrdemFornecimento` para mapear esses campos.

**2.2 Atualizar `InstrumentosRepository.ts`**

- **`emitirOrdemFornecimento`**: Atualizar body do request:
  - Remover: `valor_unitario`
  - Adicionar: `data_recebimento: input.dataRecebimento`, `prazo_entrega: input.prazoEntrega`

- **Substituir `avancarStatusOrdemFornecimento`** por 3 novos métodos:

  ```typescript
  async iniciarSeparacaoOrdemFornecimento(input: IniciarSeparacaoInput): Promise<OrdemFornecimento> {
    // PATCH /api/ordens-fornecimento/{id}/separacao
    // Body: { data_separacao }
    // Erros: 401, 404, 422 (TRANSICAO_STATUS_INVALIDA, DATA_CRONOLOGICA_INVALIDA)
  }

  async registrarDespachoOrdemFornecimento(input: RegistrarDespachoInput): Promise<OrdemFornecimento> {
    // PATCH /api/ordens-fornecimento/{id}/despacho
    // Body: { data_despacho, codigo_rastreio?, numero_nf? }
    // Erros: 401, 404, 422 (TRANSICAO_STATUS_INVALIDA, CAMPO_OBRIGATORIO_AUSENTE)
  }

  async confirmarEntregaOrdemFornecimento(input: ConfirmarEntregaInput): Promise<OrdemFornecimento> {
    // PATCH /api/ordens-fornecimento/{id}/entrega
    // Body: { data_entrega, prazo_pagamento }
    // Erros: 401, 404, 422 (TRANSICAO_STATUS_INVALIDA, DATA_CRONOLOGICA_INVALIDA)
  }
  ```

- **`registrarPagamentoOrdemFornecimento`**: Corrigir tratamento de erro:
  - Remover verificação de `PAGAMENTO_REQUER_LIQUIDACAO`
  - Adicionar tratamento de `TRANSICAO_STATUS_INVALIDA` com mensagem amigável

---

### Camada 3 — Presentation (hooks + componentes + páginas)

**3.1 Remover `useAvancarStatusOrdemFornecimento.ts`**

**3.2 Criar 3 novos hooks**

Seguindo o padrão dos hooks existentes:

```typescript
// useIniciarSeparacaoOrdemFornecimento.ts
export function useIniciarSeparacaoOrdemFornecimento() {
  // useState para isLoading + error
  // useCallback para o método iniciar(input: IniciarSeparacaoInput)
  // instancia IniciarSeparacaoOrdemFornecimentoUseCase
}
```

Idem para `useRegistrarDespachoOrdemFornecimento` e `useConfirmarEntregaOrdemFornecimento`.

**3.3 Corrigir `useRegistrarPagamentoOrdemFornecimento.ts`**

Ajustar mensagem de erro para refletir que o pagamento requer status `entregue` (não liquidação).

**3.4 Atualizar `CriarOrdemFornecimento.tsx`**

Mudanças no Passo 1 (Identificação):
- Remover campo "Número do Empenho" e lógica `gerarNumeroEmpenho()`
- Adicionar campo "Prazo de Entrega" (`prazo_entrega`, date input, obrigatório)
- Manter campo "Data de Recebimento da OF"

Mudanças no Passo 2 (Quantidades):
- Remover coluna "Valor Unit." da tabela
- Remover coluna "Valor Total" individual (o total não pode ser calculado sem `valorUnitario`)
- Remover linha de total da OF (ou exibir como "Calculado pelo servidor")
- Remover `valorUnitario` do estado `ItemOFFormulario`

Mudanças no submit:
- Incluir `dataRecebimento` e `prazoEntrega` no payload enviado ao use case
- Remover `valorUnitario` do payload dos itens

Validação de data no frontend (antes do submit):
- Exibir erro se `prazoEntrega < dataRecebimento`

**3.5 Atualizar `ContratoDetalhesPage.tsx`**

Remoção:
- Import e uso de `useAvancarStatusOrdemFornecimento`
- Estado `avancarLoadingId` e `ofConfirmacao`
- Modal de confirmação genérico de avanço de status
- Função `getProximoStatus` e constantes `ACAO_LABELS`
- Formulário inline de liquidação e estado relacionado (`liquidacaoOpenId`, `liquidacaoForm`)
- Import e uso de `useRegistrarLiquidacaoOrdemFornecimento`

Adição:
- Import dos 3 novos hooks de transição de status
- Estado para cada formulário inline de transição:
  - `separacaoOpenId + separacaoForm { dataSeparacao }`
  - `despachoOpenId + despachoForm { dataDespacho, codigoRastreio, numeroNf }`
  - `entregaOpenId + entregaForm { dataEntrega, prazoPagamento }`
- Formulários inline para cada transição (mesmo padrão dos formulários de liquidação/pagamento existentes)
- Lógica condicional para exibir o formulário correto baseado no `status` da OF

**3.6 Atualizar `NotaEmpenhoDetalhesPage.tsx`**

Mesmas mudanças da `ContratoDetalhesPage.tsx`.

---

## Ordem de Implementação Recomendada

1. **Domain** — entidades e contratos (base para tudo)
2. **Domain** — novos use cases + testes
3. **Data** — mapper atualizado
4. **Data** — repository atualizado
5. **Presentation** — novos hooks
6. **Presentation** — `CriarOrdemFornecimento.tsx`
7. **Presentation** — `ContratoDetalhesPage.tsx`
8. **Presentation** — `NotaEmpenhoDetalhesPage.tsx`
9. **Cleanup** — remoção dos arquivos obsoletos

Esta ordem garante que as camadas inferiores estão estáveis antes das superiores serem atualizadas.
