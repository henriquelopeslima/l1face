# Plano de Implementação: Detalhes do Contrato e Empenho

**Branch**: `010-detalhe-contrato-empenho` | **Data**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

## Resumo

Conectar as páginas de detalhes de Contrato e Empenho (já existentes com UI completa usando mock
data) ao endpoint real `GET /api/instrumentos/{id}`, seguindo o padrão Clean Architecture do
projeto. O trabalho envolve: adicionar entidades de detalhe ao domínio, estender o contrato do
repositório, criar o use case, o mapper e o hook, e então refatorar as duas páginas para
eliminar os mocks.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6.0.2  
**Dependências Principais**: React 19.2.6, React Router 7.15.1, Zod 4.4.3, Vitest 4.1.6  
**Armazenamento**: N/A (SPA sem estado persistente local)  
**Testes**: Vitest 4.1.6 (unit), Playwright 1.60.0 (e2e)  
**Plataforma Alvo**: Browser (SPA)  
**Tipo de Projeto**: web-app (SPA)  
**Metas de Performance**: Tela carrega e renderiza dados em < 3s em conexão normal  
**Restrições**: Sem `any`, sem `as unknown` (TypeScript estrito — constituição §II)  
**Escala/Scope**: 2 páginas de detalhe, 1 hook, 1 use case, 1 mapper, estender 2 arquivos existentes

## Verificação de Constituição

| Princípio | Gate | Status |
|-----------|------|--------|
| §I Arquitetura | Entidades em `domain/entities`, UC em `domain/usecases`, mapper em `data/mappers`, hook em `presentation/hooks` | ✅ PASSA |
| §I Isolamento | `domain` não importa de `data` ou `presentation` | ✅ PASSA |
| §II TypeScript | Zero `any`, union discriminada para type narrowing seguro | ✅ PASSA |
| §III Hooks | Estado de loading/error/data extraído para `useBuscarInstrumento` | ✅ PASSA |
| §III Componentes | Páginas serão puramente presentacionais após refatoração | ✅ PASSA |
| §IV Segurança | Sem `dangerouslySetInnerHTML`, erros de infraestrutura mascarados | ✅ PASSA |
| §V Testes | `BuscarInstrumentoUseCase` com 100% de cobertura de testes unitários | ✅ PASSA |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/010-detalhe-contrato-empenho/
├── spec.md
├── plan.md              ← este arquivo
├── research.md
├── data-model.md
├── contracts/
│   └── buscar-instrumento.md
└── tasks.md             (gerado por /speckit-tasks)
```

### Código-Fonte (arquivos afetados)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   └── instrumentoContratual.ts       ← MODIFICAR: adicionar 5 novos tipos
│   ├── contracts/
│   │   └── IInstrumentosRepository.ts     ← MODIFICAR: adicionar buscarInstrumento()
│   └── usecases/
│       ├── BuscarInstrumentoUseCase.ts    ← CRIAR
│       └── BuscarInstrumentoUseCase.test.ts ← CRIAR (100% coverage)
├── data/
│   ├── mappers/
│   │   └── instrumentosMappers.ts         ← MODIFICAR: adicionar mapper de detalhe
│   └── repositories/
│       └── InstrumentosRepository.ts      ← MODIFICAR: implementar buscarInstrumento()
└── presentation/
    ├── hooks/
    │   └── useBuscarInstrumento.ts        ← CRIAR
    └── pages/
        ├── ContratoDetalhesPage.tsx       ← MODIFICAR: remover mocks, conectar hook
        └── NotaEmpenhoDetalhesPage.tsx    ← MODIFICAR: remover mocks, conectar hook
```

## Fases de Implementação

### Fase 1: Fundação do Domínio (bloqueante para as demais)

#### T001 — Adicionar Entidades de Detalhe

**Arquivo**: `src/features/instrumentos/domain/entities/instrumentoContratual.ts`

Adicionar ao final do arquivo:

```typescript
export type TipoPrazo = 'UTEIS' | 'CORRIDOS';

export interface ItemInstrumentoDetalhe {
  id: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ContratoDetalhe {
  id: string;
  numeroPncp: string | null;
  numero: string;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  endereco: string | null;
  prazoEntrega: number | null;
  tipoPrazoEntrega: TipoPrazo | null;
  prazoPagamento: number | null;
  tipoPrazoPagamento: TipoPrazo | null;
  enderecoEntrega: string | null;
  renovavel: boolean;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}

export interface EmpenhoDetalhe {
  id: string;
  numeroPncp: string | null;
  orgaoContratante: string;
  unidade: string;
  objeto: string;
  anexoUrl: string | null;
  status: StatusInstrumento;
  criadoEm: string;
}

type InstrumentoDetalheBase = {
  instrumentoId: string;
  licitanteId: string;
  ataId: string | null;
  criadoEm: string;
  itens: ItemInstrumentoDetalhe[];
};

export type InstrumentoDetalhe =
  | (InstrumentoDetalheBase & { tipo: 'CONTRATO'; contrato: ContratoDetalhe; empenho: null })
  | (InstrumentoDetalheBase & { tipo: 'EMPENHO'; empenho: EmpenhoDetalhe; contrato: null });
```

#### T002 — Estender Contrato do Repositório (paralelo com T003)

**Arquivo**: `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`

Adicionar ao interface:
```typescript
buscarInstrumento(id: string): Promise<InstrumentoDetalhe>;
```
Importar `InstrumentoDetalhe` do arquivo de entidades.

#### T003 — Adicionar Mapper (paralelo com T002)

**Arquivo**: `src/features/instrumentos/data/mappers/instrumentosMappers.ts`

Adicionar função `mapApiInstrumentoDetalhesToInstrumentoDetalhe(raw: unknown): InstrumentoDetalhe`
que converte snake_case → camelCase conforme mapeamento em `data-model.md`.
A função usa narrowing por `raw.tipo` para construir o tipo correto da union.

---

### Fase 2: Infraestrutura de Dados (depende de T001, T002, T003)

#### T004 — Implementar `buscarInstrumento` no Repositório

**Arquivo**: `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`

Adicionar método:
```typescript
async buscarInstrumento(id: string): Promise<InstrumentoDetalhe> {
  const response = await apiFetch(`/api/instrumentos/${id}`);
  // tratar 401 → InstrumentosError('Sessão expirada...')
  // tratar 404 → InstrumentosError('Instrumento não encontrado.')
  // tratar outros → InstrumentosError genérico
  const raw = await response.json();
  return mapApiInstrumentoDetalhesToInstrumentoDetalhe(raw);
}
```
Seguir o padrão de tratamento de erros dos métodos existentes.

#### T005 — Criar BuscarInstrumentoUseCase + Testes (paralelo com T004)

**Arquivo**: `src/features/instrumentos/domain/usecases/BuscarInstrumentoUseCase.ts`

```typescript
export class BuscarInstrumentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  async execute(id: string): Promise<InstrumentoDetalhe> {
    return this.repository.buscarInstrumento(id);
  }
}
```

**Arquivo**: `src/features/instrumentos/domain/usecases/BuscarInstrumentoUseCase.test.ts`

Testar:
- `execute(id)` delega para `repository.buscarInstrumento(id)` e retorna o resultado
- `execute(id)` propaga erro do repositório

---

### Fase 3: Hook de Apresentação (depende de T004 e T005)

#### T006 — Criar `useBuscarInstrumento`

**Arquivo**: `src/features/instrumentos/presentation/hooks/useBuscarInstrumento.ts`

Seguir o padrão de `useGetAta.ts`:
```typescript
const repository = new InstrumentosRepository();
const useCase = new BuscarInstrumentoUseCase(repository);

export function useBuscarInstrumento(id: string) {
  const [instrumento, setInstrumento] = useState<InstrumentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async () => { ... }, [id]);

  useEffect(() => { buscar(); }, [buscar]);

  return { instrumento, isLoading, error, refetch: buscar };
}
```

---

### Fase 4: Refatorar ContratoDetalhesPage (depende de T006)

#### T007 — Conectar ContratoDetalhesPage à API Real

**Arquivo**: `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`

1. Remover todas as interfaces locais (`ContratoDetalhado`, `ItemContrato`, `MovimentacaoItem`,
   `OrdemFornecimento`) e todos os dados mock (`contratosDetalhados`, `itensContrato`, etc.)
2. Importar `useBuscarInstrumento`, `InstrumentoDetalhe`, `ContratoDetalhe`, `ItemInstrumentoDetalhe`
3. Substituir lookup de mock por `const { instrumento, isLoading, error } = useBuscarInstrumento(id)`
4. Adicionar estado de loading (skeleton ou spinner) e estado de erro (card com mensagem + botão retry)
5. Adicionar guard: se `instrumento?.tipo !== 'CONTRATO'`, redirecionar para 404
6. Adaptar campos:
   - `isARP` → `instrumento.ataId !== null`
   - `secretaria` → `instrumento.contrato.unidade`
   - `valorGlobal` → `instrumento.itens.reduce((s, i) => s + i.valorTotal, 0)`
   - `prazoEntrega` + tipo → `${contrato.prazoEntrega} ${contrato.tipoPrazoEntrega === 'UTEIS' ? 'dias úteis' : 'dias corridos'}`
7. Simplificar tabela de itens: remover colunas `qtdEntregue`, `qtdReservada`, `saldoDisponivel`,
   barra de progresso de consumo (dados não disponíveis na API)
8. Visão "Extrato" → substituir por empty state: "Histórico de movimentações disponível em breve"
9. Ordens de Fornecimento → manter seção mas com empty state e sem botão "Nova OF" por enquanto
10. Documentos: se `contrato.anexoUrl !== null` → link; caso contrário → "Nenhum anexo disponível"
11. ARP de Origem: exibir se `instrumento.ataId !== null`, navegar para `/atas/detalhes/{ataId}`
12. Status badge: mapear `StatusInstrumento` para labels/cores corretas

---

### Fase 5: Refatorar NotaEmpenhoDetalhesPage (depende de T006)

#### T008 — Conectar NotaEmpenhoDetalhesPage à API Real

**Arquivo**: `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`

1. Remover todas as interfaces locais e dados mock
2. Importar `useBuscarInstrumento`, `EmpenhoDetalhe`, `ItemInstrumentoDetalhe`
3. Substituir lookup de mock por `const { instrumento, isLoading, error } = useBuscarInstrumento(id)`
4. Adicionar estados de loading e erro
5. Adaptar campos:
   - Título: `empenho.numeroPncp ?? 'Número PNCP não informado'`
   - Header: `empenho.orgaoContratante`, `empenho.unidade`, `empenho.objeto`
   - Remover seções: Vigência (sem datas no empenho), Prazos Operacionais, Endereço de Entrega
6. Tabela de itens: mesmas colunas simples do T007 (descricao, unidade, quantidade, vUnit, vTotal)
7. Documentos: se `empenho.anexoUrl !== null` → link; caso contrário → "Nenhum anexo disponível"
8. ARP de Origem: mesma lógica do T007
9. Ordens de Fornecimento: empty state

---

## Dependências entre Tarefas

```
T001 (entidades)
  ├── T002 (IRepository) ──┐
  └── T003 (mapper)    ────┤
                           ├── T004 (Repository impl) ──┐
                           └── T005 (UseCase + tests)    │
                                                          ├── T006 (hook)
                                                          │     ├── T007 (ContratoDetalhesPage)
                                                          │     └── T008 (NotaEmpenhoDetalhesPage)
```

**Paralelismo possível**: T002 ‖ T003 | T004 ‖ T005 | T007 ‖ T008

---

## Verificação / Como Testar

1. **Testes unitários**: `pnpm vitest run` — todos devem passar incluindo `BuscarInstrumentoUseCase.test.ts`
2. **Dev server**: `pnpm dev` → acessar `http://localhost:5174`
3. **Fluxo do Contrato**: Ir em Instrumentos → Gestão → clicar num contrato → verificar que todos os
   campos do contrato real aparecem (sem mock data hardcoded)
4. **Fluxo do Empenho**: Ir em Instrumentos → Gestão → clicar num empenho → verificar campos
5. **Campo nulo**: Verificar que campos `null` da API exibem "Não informado" sem quebrar a UI
6. **ARP vinculada**: Criar instrumento com `ata_id` e verificar que card "ARP de Origem" aparece
   com link correto
7. **404**: Acessar URL `/contratos/detalhes/id-inexistente` → deve mostrar estado de erro
8. **TypeScript**: `pnpm tsc --noEmit` → zero erros
