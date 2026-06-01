# Plano de Implementação: Visualizar Detalhes de Instrumento

**Branch**: `009-detalhe-empenho-contrato` | **Data**: 2026-06-01 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `specs/009-detalhe-empenho-contrato/spec.md`

## Resumo

Conectar as páginas de detalhe de Contrato e Empenho (já existentes com UI completa e dados
mockados) ao endpoint real `GET /api/instrumentos/{id}`. A mudança adiciona a cadeia de domínio
completa (`InstrumentoDetalhe`, `BuscarInstrumentoUseCase`, mapper e hook) e substitui os mocks
hardcoded por dados reais. Inclui alinhamento de campo de nomes às convenções da API e remoção
de campos que existem nos mocks mas não na especificação da API (`isARP`, `tipoEmpenho`,
`dataEmissao`, `dataVencimento`).

## Contexto Técnico

**Linguagem/Versão**: TypeScript 6 + React 19
**Dependências Principais**: Vite 8, React Router 7, shadcn/ui (Radix), Tailwind CSS 4, Zod 4, Vitest 4
**Armazenamento**: N/A (frontend SPA)
**Testes**: Vitest (unitários em Use Cases); Playwright (e2e — fora do escopo desta feature)
**Plataforma Alvo**: Navegador web moderno (SPA)
**Tipo de Projeto**: Web application (frontend SPA)
**Metas de Performance**: Detalhe carregado em < 2s após navegação
**Restrições**: Sem `any` ou `as unknown`; domínio não importa de `data` ou `presentation`
**Escala/Scope**: Feature multi-camada dentro de `src/features/instrumentos/`

## Verificação de Constituição

*GATE: Deve passar antes da implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture (Vertical Slices) | ✅ | Entidades em `domain/`; mapper e repositório em `data/`; hook e pages em `presentation/` |
| II. SOLID + TypeScript Estrito | ✅ | Sem `any`; union discriminada garante narrowing seguro; single responsibility por camada |
| III. Boas Práticas React | ✅ | Lógica de busca extraída para `useBuscarInstrumento`; pages permanecem apresentacionais |
| IV. Segurança | ✅ | Token via cookie HttpOnly; `X-Licitante-Id` injetado por `apiFetch`; sem localStorage |
| V. Testes | ✅ | `BuscarInstrumentoUseCase` com cobertura unitária 100% |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/009-detalhe-empenho-contrato/
├── plan.md              # Este arquivo
├── spec.md              # Especificação
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — entidades e mapeamento
├── contracts/
│   └── buscar-instrumento.md   # GET /api/instrumentos/{id}
├── checklists/
│   └── requirements.md  # Checklist de qualidade da spec
└── tasks.md             # Fase 2 — gerado por /speckit-tasks
```

### Código-Fonte (raiz do repositório)

```text
src/features/instrumentos/
├── domain/
│   ├── entities/
│   │   └── instrumentoContratual.ts  (ATUALIZAR — + ItemInstrumentoDetalhe, ContratoDetalhe,
│   │                                              EmpenhoDetalhe, InstrumentoDetalhe)
│   ├── contracts/
│   │   └── IInstrumentosRepository.ts (ATUALIZAR — + buscarInstrumento(id): Promise<InstrumentoDetalhe>)
│   └── useCases/
│       ├── BuscarInstrumentoUseCase.ts       (NOVO)
│       └── BuscarInstrumentoUseCase.test.ts  (NOVO)
├── data/
│   ├── mappers/
│   │   └── instrumentosMappers.ts            (ATUALIZAR — + mapApiInstrumentoDetalhesToInstrumentoDetalhe)
│   └── repositories/
│       └── InstrumentosRepository.ts         (ATUALIZAR — + buscarInstrumento)
└── presentation/
    ├── hooks/
    │   └── useBuscarInstrumento.ts            (NOVO)
    └── pages/
        ├── ContratoDetalhesPage.tsx           (ATUALIZAR — substituir mock por useBuscarInstrumento;
        │                                                  alinhar campos; adicionar loading/erro)
        └── NotaEmpenhoDetalhesPage.tsx        (ATUALIZAR — substituir mock por useBuscarInstrumento;
                                                           remover campos não-API; adicionar loading/erro)
```

**Decisão de Estrutura**: Aplicação web SPA. Todos os artefatos ficam dentro de
`src/features/instrumentos/`, seguindo o padrão Vertical Slices existente. Nenhum novo arquivo de
router é necessário — as rotas `/contratos/detalhes/:id` e `/notas-empenho/detalhes/:id` já estão
registradas em `src/app/routes.tsx`.

---

## Tarefas de Implementação

As tarefas são listadas em ordem de dependência. A cadeia é:
`entity → contract → use case → mapper → repository → hook → pages`.

### Tarefa 1: Adicionar entidades de domínio

**Arquivo**: `src/features/instrumentos/domain/entities/instrumentoContratual.ts`

Adicionar ao final do arquivo (após `InstrumentoListagem`):

```typescript
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
  tipoPrazoEntrega: 'DIAS' | 'MESES' | null;
  prazoPagamento: number | null;
  tipoPrazoPagamento: 'DIAS' | 'MESES' | null;
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

export type InstrumentoDetalhe =
  | {
      instrumentoId: string;
      licitanteId: string;
      ataId: string | null;
      criadoEm: string;
      tipo: 'CONTRATO';
      contrato: ContratoDetalhe;
      empenho: null;
      itens: ItemInstrumentoDetalhe[];
    }
  | {
      instrumentoId: string;
      licitanteId: string;
      ataId: string | null;
      criadoEm: string;
      tipo: 'EMPENHO';
      contrato: null;
      empenho: EmpenhoDetalhe;
      itens: ItemInstrumentoDetalhe[];
    };
```

---

### Tarefa 2: Atualizar contrato do repositório

**Arquivo**: `src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts`

Adicionar import e método:

```typescript
import type { InstrumentoDetalhe } from '../entities/instrumentoContratual';

// Adicionar ao interface:
buscarInstrumento(id: string): Promise<InstrumentoDetalhe>;
```

---

### Tarefa 3: Criar BuscarInstrumentoUseCase

**Arquivo novo**: `src/features/instrumentos/domain/useCases/BuscarInstrumentoUseCase.ts`

```typescript
import type { IInstrumentosRepository } from '../contracts/IInstrumentosRepository';
import type { InstrumentoDetalhe } from '../entities/instrumentoContratual';

export class BuscarInstrumentoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}

  async execute(id: string): Promise<InstrumentoDetalhe> {
    return this.repository.buscarInstrumento(id);
  }
}
```

**Arquivo novo**: `src/features/instrumentos/domain/useCases/BuscarInstrumentoUseCase.test.ts`

Cobertura mínima (100%):
- Chama `repository.buscarInstrumento(id)` e retorna o resultado
- Propaga erros lançados pelo repositório

---

### Tarefa 4: Adicionar mapper de detalhes

**Arquivo**: `src/features/instrumentos/data/mappers/instrumentosMappers.ts`

Adicionar função:

```typescript
type ApiInstrumentoDetalheResponse = {
  instrumento_id: string;
  licitante_id: string;
  ata_id: string | null;
  criado_em: string;
  tipo: 'CONTRATO' | 'EMPENHO';
  contrato: {
    id: string;
    numero_pncp: string | null;
    numero: string;
    orgao_contratante: string;
    unidade: string;
    objeto: string;
    vigencia_inicial: string;
    vigencia_final: string;
    endereco: string | null;
    prazo_entrega: number | null;
    tipo_prazo_entrega: 'DIAS' | 'MESES' | null;
    prazo_pagamento: number | null;
    tipo_prazo_pagamento: 'DIAS' | 'MESES' | null;
    endereco_entrega: string | null;
    renovavel: boolean;
    anexo_url: string | null;
    status: string;
    criado_em: string;
  } | null;
  empenho: {
    id: string;
    numero_pncp: string | null;
    orgao_contratante: string;
    unidade: string;
    objeto: string;
    anexo_url: string | null;
    status: string;
    criado_em: string;
  } | null;
  itens: Array<{
    id: string;
    descricao: string;
    unidade_medida: string;
    quantidade_total: number;
    valor_unitario: number;
    valor_total: number;
  }>;
};

export function mapApiInstrumentoDetalhesToInstrumentoDetalhe(
  data: ApiInstrumentoDetalheResponse,
): InstrumentoDetalhe {
  const itens: ItemInstrumentoDetalhe[] = data.itens.map((item) => ({
    id: item.id,
    descricao: item.descricao,
    unidadeMedida: item.unidade_medida,
    quantidadeTotal: item.quantidade_total,
    valorUnitario: item.valor_unitario,
    valorTotal: item.valor_total,
  }));

  if (data.tipo === 'CONTRATO' && data.contrato !== null) {
    return {
      instrumentoId: data.instrumento_id,
      licitanteId: data.licitante_id,
      ataId: data.ata_id,
      criadoEm: data.criado_em,
      tipo: 'CONTRATO',
      contrato: {
        id: data.contrato.id,
        numeroPncp: data.contrato.numero_pncp,
        numero: data.contrato.numero,
        orgaoContratante: data.contrato.orgao_contratante,
        unidade: data.contrato.unidade,
        objeto: data.contrato.objeto,
        vigenciaInicial: data.contrato.vigencia_inicial,
        vigenciaFinal: data.contrato.vigencia_final,
        endereco: data.contrato.endereco,
        prazoEntrega: data.contrato.prazo_entrega,
        tipoPrazoEntrega: data.contrato.tipo_prazo_entrega,
        prazoPagamento: data.contrato.prazo_pagamento,
        tipoPrazoPagamento: data.contrato.tipo_prazo_pagamento,
        enderecoEntrega: data.contrato.endereco_entrega,
        renovavel: data.contrato.renovavel,
        anexoUrl: data.contrato.anexo_url,
        status: data.contrato.status as StatusInstrumento,
        criadoEm: data.contrato.criado_em,
      },
      empenho: null,
      itens,
    };
  }

  // tipo === 'EMPENHO'
  return {
    instrumentoId: data.instrumento_id,
    licitanteId: data.licitante_id,
    ataId: data.ata_id,
    criadoEm: data.criado_em,
    tipo: 'EMPENHO',
    contrato: null,
    empenho: {
      id: data.empenho!.id,
      numeroPncp: data.empenho!.numero_pncp,
      orgaoContratante: data.empenho!.orgao_contratante,
      unidade: data.empenho!.unidade,
      objeto: data.empenho!.objeto,
      anexoUrl: data.empenho!.anexo_url,
      status: data.empenho!.status as StatusInstrumento,
      criadoEm: data.empenho!.criado_em,
    },
    itens,
  };
}
```

> **Nota**: importar `StatusInstrumento`, `InstrumentoDetalhe`, `ItemInstrumentoDetalhe` dos
> respectivos módulos de domínio.

---

### Tarefa 5: Implementar buscarInstrumento no repositório

**Arquivo**: `src/features/instrumentos/data/repositories/InstrumentosRepository.ts`

Adicionar método:

```typescript
async buscarInstrumento(id: string): Promise<InstrumentoDetalhe> {
  let response: Response;
  try {
    response = await apiFetch(`/api/instrumentos/${encodeURIComponent(id)}`, { method: 'GET' });
  } catch {
    throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
  }

  if (response.status === 401) {
    throw new InstrumentosError('Sessão expirada. Faça login novamente.');
  }
  if (response.status === 404) {
    throw new InstrumentosError('Instrumento não encontrado.');
  }
  if (!response.ok) {
    throw new InstrumentosError('Erro ao carregar instrumento. Tente novamente.');
  }

  const data: unknown = await response.json();
  return mapApiInstrumentoDetalhesToInstrumentoDetalhe(
    data as Parameters<typeof mapApiInstrumentoDetalhesToInstrumentoDetalhe>[0],
  );
}
```

Adicionar imports necessários: `InstrumentoDetalhe`, `mapApiInstrumentoDetalhesToInstrumentoDetalhe`.

---

### Tarefa 6: Criar useBuscarInstrumento

**Arquivo novo**: `src/features/instrumentos/presentation/hooks/useBuscarInstrumento.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import { BuscarInstrumentoUseCase } from '../../domain/useCases/BuscarInstrumentoUseCase';
import { InstrumentosRepository } from '../../data/repositories/InstrumentosRepository';
import type { InstrumentoDetalhe } from '../../domain/entities/instrumentoContratual';

const repository = new InstrumentosRepository();
const useCase = new BuscarInstrumentoUseCase(repository);

export function useBuscarInstrumento(id: string | undefined) {
  const [instrumento, setInstrumento] = useState<InstrumentoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await useCase.execute(id);
      setInstrumento(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar instrumento.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { instrumento, isLoading, error, retry: buscar };
}
```

---

### Tarefa 7: Atualizar ContratoDetalhesPage

**Arquivo**: `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`

**Mudanças principais**:

1. **Remover** todas as interfaces locais de mock (`ContratoDetalhado`, `ItemContrato`,
   `MovimentacaoItem`, etc.) e os arrays de dados hardcoded (`contratosDetalhados`, `itensContrato`,
   `movimentacoesContrato`, `ordensFornecimento`).

2. **Importar** `useBuscarInstrumento` e `ContratoDetalhe`, `ItemInstrumentoDetalhe` do domínio.

3. **Trocar lookup de mock** por chamada ao hook:
   ```typescript
   const { instrumento, isLoading, error, retry } = useBuscarInstrumento(id);
   ```

4. **Renderizar estados de loading e erro** antes do `if (!instrumento)`.

5. **Narrowing de tipo**: após verificar `instrumento.tipo === 'CONTRATO'`, usar
   `instrumento.contrato` para acessar campos específicos.

6. **Adaptar campo `tipoPrazoEntrega`**: a API retorna `'DIAS' | 'MESES'` (não `'UTEIS' | 'CORRIDOS'`);
   atualizar os labels exibidos:
   - `'DIAS'` → `'dias corridos'`
   - `'MESES'` → `'meses'`

7. **Remover** o campo `isARP` e o badge "ARP" correspondente.

8. **Seção "Itens do Contrato"**: usar `instrumento.itens` (`ItemInstrumentoDetalhe[]`). Remover
   colunas `qtdEntregue`, `qtdReservada`, `saldoDisponivel` (não existem no detalhe); exibir
   descrição, unidade, quantidade, valor unitário e valor total.

9. **Seção "Resumo Financeiro"**: calcular `valorTotal = sum(item.valorTotal)` e
   `valorTotalUnitario = sum(item.quantidadeTotal × item.valorUnitario)` com os dados reais.
   Remover cards de "saldo reservado" e "saldo efetivamente disponível" (dependem de OFs).

10. **Seção "ARP de Origem"**: exibir quando `instrumento.ataId !== null`.

11. **Seção "Ordens de Fornecimento"**: manter estrutura UI mas exibir estado vazio (sem dados
    reais). Não conectar a nenhuma API de OFs (fora do escopo).

12. **Manter** botão "Exportar Dados", breadcrumb, botão de voltar e estrutura visual geral.

---

### Tarefa 8: Atualizar NotaEmpenhoDetalhesPage

**Arquivo**: `src/features/instrumentos/presentation/pages/NotaEmpenhoDetalhesPage.tsx`

**Mudanças principais**:

1. **Remover** interfaces locais de mock (`NotaEmpenhoDetalhada`, `ItemNotaEmpenho`, etc.) e
   arrays hardcoded.

2. **Importar** `useBuscarInstrumento` e `EmpenhoDetalhe`, `ItemInstrumentoDetalhe`.

3. **Trocar mock** por hook:
   ```typescript
   const { instrumento, isLoading, error, retry } = useBuscarInstrumento(id);
   ```

4. **Narrowing**: verificar `instrumento.tipo === 'EMPENHO'` antes de acessar `instrumento.empenho`.

5. **Remover campos inexistentes na API**: `tipoEmpenho`, `dataEmissao`, `dataVencimento`,
   `enderecoEntrega`, `prazoEntrega`, `prazoPagamento`. A API não retorna esses campos para Empenho.

6. **Seção "Detalhes"**: exibir `orgaoContratante`, `unidade`, `objeto`, `status`, `numeroPncp` (quando presente), `ataId` (quando vinculado).

7. **Seção "Itens"**: usar `instrumento.itens`. Remover colunas `qtdEntregue`, `qtdReservada`.

8. **Seção "Ordens de Fornecimento"**: manter UI com estado vazio (sem OFs reais).

---

## Verificação de Constituição (pós-design)

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Clean Architecture | ✅ | Sem violações: domain ← data ← presentation, nenhuma camada cruza limites |
| II. SOLID + TypeScript | ✅ | Union discriminada elimina `any`; `BuscarInstrumentoUseCase` tem responsabilidade única |
| III. Boas Práticas React | ✅ | `useBuscarInstrumento` isola efeito e estado; pages ficam presentacionais |
| IV. Segurança | ✅ | Cookie HttpOnly; sem dados sensíveis em localStorage; erros mascarados na UI |
| V. Testes | ✅ | `BuscarInstrumentoUseCase` com 100% de cobertura unitária |
