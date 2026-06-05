# Plano de Implementação: Ordens de Fornecimento

**Branch**: `011-criar-ordens-fornecimento` | **Data**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

## Resumo

Implementar o ciclo completo de Ordens de Fornecimento (OF) nas páginas de detalhes de Contrato
e Empenho: emissão, listagem com saldo remanescente, avanço de status operacional, registro de
liquidação e registro de pagamento. A feature segue o padrão Clean Architecture já estabelecido
na feature `instrumentos`, estendendo o repositório, criando 5 use cases, 5 hooks e refatorando
o componente `CriarOrdemFornecimento.tsx` para conectar à API real.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6.0.2  
**Dependências Principais**: React 19.2.6, React Router 7.15.1, Zod 4.4.3, Vitest 4.1.6  
**Armazenamento**: N/A (SPA sem estado persistente local)  
**Testes**: Vitest 4.1.6 (unit), Playwright 1.60.0 (e2e)  
**Plataforma Alvo**: Browser (SPA)  
**Tipo de Projeto**: web-app (SPA)  
**Metas de Performance**: Listagem de OFs carrega em < 3s; emissão confirmada em < 3s  
**Restrições**: Sem `any`, sem `as unknown` (TypeScript estrito — constituição §II)  
**Escala/Scope**: 5 use cases, 5 hooks, 1 mapper, 2 páginas modificadas, 1 componente refatorado, extensão de 1 repositório e 1 contrato

## Verificação de Constituição

| Princípio | Gate | Status |
|-----------|------|--------|
| §I Arquitetura | Entidades em `domain/entities`, use cases em `domain/useCases`, mapper em `data/mappers`, hooks em `presentation/hooks`. OFs ficam dentro da feature `instrumentos` (mesma feature, mesmo contexto) | ✅ PASSA |
| §I Isolamento | `domain` não importa de `data` ou `presentation` em nenhum dos novos arquivos | ✅ PASSA |
| §II TypeScript | Zero `any`; tipagem explícita via interfaces; union discriminada para `StatusOrdemFornecimento` | ✅ PASSA |
| §III Hooks | Lógica de estado extraída para 5 hooks customizados; páginas recebem hooks prontos | ✅ PASSA |
| §III Componentes | Páginas e componentes puramente presentacionais após refatoração | ✅ PASSA |
| §IV Segurança | Sem `dangerouslySetInnerHTML`; erros de infraestrutura mascarados com mensagens amigáveis | ✅ PASSA |
| §V Testes | 5 use cases com 100% de cobertura de testes unitários | ✅ PASSA |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/011-criar-ordens-fornecimento/
├── spec.md
├── plan.md              ← este arquivo
├── research.md
├── data-model.md
├── contracts/
│   └── ordens-fornecimento.md
└── tasks.md             (gerado por /speckit-tasks)
```

### Código-Fonte (arquivos afetados)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   └── instrumentoContratual.ts       ← MODIFICAR: adicionar 7 novos tipos de OF
│   ├── contracts/
│   │   └── IInstrumentosRepository.ts     ← MODIFICAR: adicionar 5 métodos de OF
│   └── useCases/
│       ├── EmitirOrdemFornecimentoUseCase.ts          ← CRIAR
│       ├── EmitirOrdemFornecimentoUseCase.test.ts     ← CRIAR (100% coverage)
│       ├── ListarOrdensFornecimentoUseCase.ts         ← CRIAR
│       ├── ListarOrdensFornecimentoUseCase.test.ts    ← CRIAR (100% coverage)
│       ├── AvancarStatusOrdemFornecimentoUseCase.ts   ← CRIAR
│       ├── AvancarStatusOrdemFornecimentoUseCase.test.ts ← CRIAR (100% coverage)
│       ├── RegistrarLiquidacaoOrdemFornecimentoUseCase.ts      ← CRIAR
│       ├── RegistrarLiquidacaoOrdemFornecimentoUseCase.test.ts ← CRIAR (100% coverage)
│       ├── RegistrarPagamentoOrdemFornecimentoUseCase.ts       ← CRIAR
│       └── RegistrarPagamentoOrdemFornecimentoUseCase.test.ts  ← CRIAR (100% coverage)
├── data/
│   ├── mappers/
│   │   └── ordemFornecimentoMappers.ts    ← CRIAR: mappers API → domínio
│   └── repositories/
│       └── InstrumentosRepository.ts      ← MODIFICAR: implementar 5 novos métodos
└── presentation/
    ├── hooks/
    │   ├── useListarOrdensFornecimento.ts              ← CRIAR (query hook)
    │   ├── useEmitirOrdemFornecimento.ts               ← CRIAR (mutation hook)
    │   ├── useAvancarStatusOrdemFornecimento.ts        ← CRIAR (mutation hook)
    │   ├── useRegistrarLiquidacaoOrdemFornecimento.ts  ← CRIAR (mutation hook)
    │   └── useRegistrarPagamentoOrdemFornecimento.ts   ← CRIAR (mutation hook)
    ├── components/
    │   └── CriarOrdemFornecimento.tsx     ← REFATORAR: conectar à API real
    └── pages/
        ├── ContratoDetalhesPage.tsx       ← MODIFICAR: substituir placeholder por OFs reais
        └── NotaEmpenhoDetalhesPage.tsx    ← MODIFICAR: substituir placeholder por OFs reais
```

## Fases de Implementação

### Fase 1: Domínio (bloqueante para as demais)

**Objetivo**: Adicionar entidades e contratos de OF ao domínio sem tocar em infraestrutura ou UI.

**1.1** — Modificar `instrumentoContratual.ts`: adicionar os tipos
`StatusOrdemFornecimento`, `StatusPagamento`, `ItemOrdemFornecimento`, `OrdemFornecimento`,
`ListagemOrdensFornecimento`, `EmitirOrdemFornecimentoInput`, `ItemEmitirOFInput`,
`AvancarStatusOrdemFornecimentoInput`, `RegistrarLiquidacaoInput`, `RegistrarPagamentoInput`.

**1.2** — Modificar `IInstrumentosRepository.ts`: adicionar os 5 novos métodos.

**1.3** — Criar os 5 use cases com seus respectivos arquivos `.test.ts` (100% coverage):
- `EmitirOrdemFornecimentoUseCase` — delega para `repository.emitirOrdemFornecimento`
- `ListarOrdensFornecimentoUseCase` — delega para `repository.listarOrdensFornecimento`
- `AvancarStatusOrdemFornecimentoUseCase` — delega para `repository.avancarStatusOrdemFornecimento`
- `RegistrarLiquidacaoOrdemFornecimentoUseCase` — delega para `repository.registrarLiquidacaoOrdemFornecimento`
- `RegistrarPagamentoOrdemFornecimentoUseCase` — delega para `repository.registrarPagamentoOrdemFornecimento`

### Fase 2: Infraestrutura (bloqueante para hooks)

**Objetivo**: Implementar os métodos no repositório e criar os mappers.

**2.1** — Criar `ordemFornecimentoMappers.ts`:
- `mapApiItemOrdemFornecimentoToItemOrdemFornecimento(api) → ItemOrdemFornecimento`
- `mapApiOrdemFornecimentoToOrdemFornecimento(api) → OrdemFornecimento`
- `mapApiListagemOrdensToListagemOrdensFornecimento(api) → ListagemOrdensFornecimento`

**2.2** — Modificar `InstrumentosRepository.ts`: implementar os 5 novos métodos com tratamento
de erros consistente com o padrão existente (erros 400/401/404/422 → mensagens amigáveis).

Endpoints:
- `POST /api/instrumentos/{instrumentoId}/ordens-fornecimento` → retorna `OrdemFornecimento`
- `GET /api/instrumentos/{instrumentoId}/ordens-fornecimento` → retorna `ListagemOrdensFornecimento`
- `PATCH /api/ordens-fornecimento/{id}/status` → retorna `OrdemFornecimento`
- `PATCH /api/ordens-fornecimento/{id}/liquidacao` → retorna `OrdemFornecimento`
- `PATCH /api/ordens-fornecimento/{id}/pagamento` → retorna `OrdemFornecimento`

Erros específicos a tratar:
- `400 SALDO_INSUFICIENTE` → "Saldo do instrumento insuficiente para emitir esta OF."
- `422 ITEM_NAO_PERTENCE_AO_CONTRATO` → "Um ou mais itens não pertencem a este instrumento."
- `422 TRANSICAO_STATUS_INVALIDA` → mensagem do campo `message` da API
- `422 LIQUIDACAO_REQUER_ENTREGA` → "A liquidação só pode ser registrada após o status 'entregue'."
- `422 PAGAMENTO_REQUER_LIQUIDACAO` → "É necessário registrar a liquidação antes do pagamento."

### Fase 3: Hooks de Apresentação (bloqueante para UI)

**Objetivo**: Criar os 5 hooks que as páginas vão consumir.

**3.1** — `useListarOrdensFornecimento(instrumentoId: string)` — query hook com `refetch`,
padrão idêntico ao `useBuscarInstrumento`.

**3.2** — `useEmitirOrdemFornecimento()` — mutation hook com método `emitir(input)`.

**3.3** — `useAvancarStatusOrdemFornecimento()` — mutation hook com método `avancar(input)`.

**3.4** — `useRegistrarLiquidacaoOrdemFornecimento()` — mutation hook com método `registrar(input)`.

**3.5** — `useRegistrarPagamentoOrdemFornecimento()` — mutation hook com método `registrar(input)`.

### Fase 4: Refatoração do componente e integração nas páginas

**Objetivo**: Conectar a UI à API real.

**4.1** — Refatorar `CriarOrdemFornecimento.tsx`:
- Remover campos `numeroEmpenho` e `tipoEmpenho` (não existem na API)
- Adicionar campo `valorUnitario` por item no Passo 2
- Mudar `onSubmit` callback para receber `EmitirOrdemFornecimentoInput`
- Atualizar tipagem de `itensContrato` para usar `ItemInstrumentoDetalhe`

**4.2** — Modificar `ContratoDetalhesPage.tsx`:
- Instanciar `useListarOrdensFornecimento(instrumentoId)` e `useEmitirOrdemFornecimento()`
- Substituir o card placeholder por uma listagem real das OFs com saldo remanescente
- Adicionar botão "Emitir OF" que abre o `CriarOrdemFornecimento` dialog
- Após emissão bem-sucedida, chamar `refetch()` da listagem
- Exibir ações de avanço de status, liquidação e pagamento em cada OF da listagem

**4.3** — Modificar `NotaEmpenhoDetalhesPage.tsx`:
- Mesma integração que o passo 4.2 (OFs também se aplicam a empenhos)

## Notas de Implementação

### Padrão de mutation hook

Os hooks de mutation seguem este padrão (diferente do query hook):

```typescript
export function useEmitirOrdemFornecimento() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emitir = async (input: EmitirOrdemFornecimentoInput): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await emitirOrdemFornecimentoUseCase.execute(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir OF. Tente novamente.';
      setError(message);
      throw err; // re-throw para a página poder orquestrar o refetch apenas em sucesso
    } finally {
      setIsLoading(false);
    }
  };

  return { emitir, isLoading, error };
}
```

### Orquestração de refetch nas páginas

```typescript
const { emitir } = useEmitirOrdemFornecimento();
const { refetch } = useListarOrdensFornecimento(instrumentoId);

const handleEmitirOF = async (input) => {
  try {
    await emitir(input);
    refetch(); // só executa se emitir não lançar
  } catch {
    // erro já está em hook.error, não precisa tratar aqui
  }
};
```
