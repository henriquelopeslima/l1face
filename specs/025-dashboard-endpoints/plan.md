# Plano de Implementação: Dashboard com Dados Reais

**Branch**: `025-dashboard-endpoints` | **Data**: 2026-07-22 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/025-dashboard-endpoints/spec.md`

## Resumo

Substituir os dados 100% estáticos de `DashboardPage.tsx` (arrays `monthlyData`, `statusData`, `alertas` e valores inline dos 4 cards) por dados reais obtidos de `GET /api/dashboard`, que já retorna numa única resposta tudo que a tela precisa: os 4 indicadores, a série de evolução mensal (6 meses), a distribuição de instrumentos por status e as 5 notificações mais recentes. Como é uma única chamada, a implementação é um único hook (`useDashboard`) que substitui as constantes locais por estado carregado da API, com loading/erro tratados de forma consistente com o restante da aplicação. Segue a convenção de pastas mais recente do projeto (`domain/{contracts,entities,useCases}`), já usada por `instrumentos` e já escalonada (vazia) em `dashboard`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict mode), React 19
**Dependências Principais**: `apiFetch` de `@/shared/infrastructure/apiClient` (injeta `X-Licitante-Id` automaticamente via `activeLicitanteId`), `recharts` (já usado em `DashboardPage.tsx` para os gráficos)
**Armazenamento**: N/A — leitura via HTTP API; nenhum estado é persistido localmente
**Testes**: Vitest + React Testing Library, testes colocalizados (`*.test.ts` ao lado do arquivo), seguindo o padrão de `instrumentos`
**Plataforma Alvo**: Web SPA (l1face)
**Tipo de Projeto**: Feature slice em `src/features/dashboard/`, preenchendo a estrutura vazia já escalonada (`domain/contracts`, `domain/entities`, `domain/useCases`, `presentation/hooks`, `presentation/components`, `data/`)
**Metas de Performance**: Padrão de web app — dados reais exibidos em até 3s em condições normais de rede (CS-002 da spec)
**Restrições**: Proibido `any`; domain não pode importar de data/presentation; nenhum valor exibido pode continuar hardcoded após esta funcionalidade
**Escala/Scope**: Uma única tela (Dashboard/Home), uma única chamada de API (`GET /api/dashboard`); não inclui atualização em tempo real nem interações de escrita (ex.: marcar alerta como lido)

## Verificação de Constituição

*GATE: Deve passar antes de iniciar a implementação.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slice em `src/features/dashboard/` | ✅ PASS | Todos os arquivos novos ficam dentro da feature, preenchendo a estrutura já escalonada |
| I. Isolamento domain → data → presentation | ✅ PASS | `ObterDashboardUseCase` (domain) não importa `data` nem `presentation`; depende só de `IDashboardRepository` |
| II. TypeScript estrito (sem `any`) | ✅ PASS | Entidades tipadas explicitamente (`DashboardData`, `IndicadorValor`, etc.); resposta da API tipada como `unknown`/DTO antes do mapper converter para entidade de domínio |
| II. Dependency Inversion | ✅ PASS | `useDashboard` depende de `IDashboardRepository` (interface), não de `DashboardRepository` diretamente na assinatura |
| III. Lógica extraída para hook customizado (`useDashboard`) | ✅ PASS | `DashboardPage.tsx` deixa de ter arrays/constantes locais; toda busca de dados migra para o hook |
| III. Componentes puros | ✅ PASS | `DashboardPage.tsx` permanece responsável só por renderização; formatação de valores fica em funções puras do mapper/presentation |
| IV. Mascaramento de erros | ✅ PASS | Erros HTTP mapeados para mensagens amigáveis no repository; nenhum detalhe de infraestrutura exposto na UI |
| IV. Token JWT não exposto | ✅ PASS | Cookie HttpOnly enviado automaticamente por `apiFetch` (`credentials: 'include'`) |
| V. Use Cases com 100% cobertura de testes unitários | ✅ PASS | Teste obrigatório para `ObterDashboardUseCase` |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/025-dashboard-endpoints/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── checklists/
    └── requirements.md
```

### Código-Fonte (arquivos a criar/modificar)

```text
src/features/dashboard/
├── domain/
│   ├── entities/
│   │   ├── DashboardData.ts                  [CRIAR]
│   │   └── index.ts                          [CRIAR — re-exportar tipos]
│   ├── contracts/
│   │   └── IDashboardRepository.ts           [CRIAR]
│   └── useCases/
│       ├── ObterDashboardUseCase.ts          [CRIAR]
│       └── ObterDashboardUseCase.test.ts     [CRIAR]
├── data/
│   ├── mappers/
│   │   └── dashboardMappers.ts               [CRIAR — DTO da API → entidades de domínio]
│   └── repositories/
│       └── DashboardRepository.ts            [CRIAR]
└── presentation/
    ├── hooks/
    │   ├── useDashboard.ts                   [CRIAR]
    │   └── useDashboard.test.ts              [CRIAR]
    └── pages/
        └── DashboardPage.tsx                 [MODIFICAR — remove mocks, consome useDashboard]
```

**Decisão de Estrutura**: Feature slice único em `dashboard`, preenchendo a estrutura de pastas já escalonada (vazia) no repositório. Segue a convenção mais recente do projeto — `domain/contracts` + `domain/useCases` (camelCase) + `data/repositories` com chamada direta a `apiFetch` (sem classe `*API.ts` intermediária) — igual à usada em `instrumentos`, em vez da convenção mais antiga de `configuracoes` (`domain/usecases` minúsculo + `data/datasources/*API.ts` separado).

## Detalhes de Implementação por Camada

### Domain

**`DashboardData.ts`** — entidades de domínio (nomes conforme `data-model.md`): `DashboardData`, `IndicadorValor`, `IndicadorInstrumentosAtivos`, `IndicadorPendenciasFinanceiras`, `PontoEvolucaoMensal`, `StatusInstrumentoResumo`, `AlertaDashboard`.

**`IDashboardRepository.ts`**
```ts
export interface IDashboardRepository {
  obterDashboard(): Promise<DashboardData>;
}
```

**`ObterDashboardUseCase.ts`** — executa `repository.obterDashboard()`, sem lógica adicional (a agregação já vem pronta da API).

### Data

**`dashboardMappers.ts`**
- Converte o DTO bruto da resposta de `GET /api/dashboard` (camelCase, igual ao domínio, exceto pelos pontos abaixo) para `DashboardData`.
- `statusInstrumentos[].status` (`ATIVA | PROXIMA_AO_VENCIMENTO | ENCERRADA`) é mantido como enum no domínio; rótulo ("Vigentes"/"Vencendo"/"Vencidos") e cor de exibição são resolvidos na camada `presentation` (função pura local), não no mapper — mantém o mapper livre de decisões visuais.
- `evolucaoMensal[].mes` (`"YYYY-MM"`) é mantido como string no domínio; a formatação para rótulo curto do eixo X (`"Jul"`) é feita na `presentation`.
- `alertas[]` (`NotificacaoResponse`) é mapeado para `AlertaDashboard { id, tipoOrigem, conteudo: { titulo, descricao, cor }, lida, criadaEm }` — ícone é resolvido na `presentation` a partir de `tipoOrigem`, já que a API não retorna ícone.

**`DashboardRepository.ts`**
- `obterDashboard()`: chama `apiFetch('/api/dashboard')`, mapeia a resposta com `dashboardMappers`.
- Tratamento de erro HTTP (ver `contracts/api-contracts.md`): 400/401/403/404/5xx/falha de rede → mensagem amigável lançada como `Error`, sem detalhes de infraestrutura (401 não redireciona automaticamente — mesmo padrão de `InstrumentosRepository`; ver correção em `research.md`).

### Presentation

**`useDashboard.ts`** (modelo: `useListarInstrumentos.ts`)
```ts
interface UseDashboardResult {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
```
- Busca ao montar (`useEffect`); expõe `refetch` para o botão "Tentar novamente" do estado de erro.
- `isLoading` inicia `true` (RF-008); `dashboard` começa `null` — a UI não deve renderizar números com estado indefinido enquanto carrega.

**`DashboardPage.tsx`** (modificações)
- Remove `monthlyData`, `statusData`, `alertas` e todos os valores inline dos cards.
- Consome `useDashboard()`; enquanto `isLoading`, exibe skeleton/placeholder nos cards e gráficos (RF-008); em `error`, exibe mensagem com ação de tentar novamente (RF-009) no lugar do conteúdo da tela; com `dashboard` preenchido (mesmo zerado — RF-007), renderiza os 4 cards, os dois gráficos e a lista de alertas com os dados reais.
- Variação percentual (RF-003): renderizada apenas quando `variacaoPercentualMesAnterior !== null`; omitida (sem "+0%" nem texto inventado) quando `null`.
- Mapeamento local de `status` → rótulo/cor (`ATIVA` → "Vigentes"/`#0050FF`, `PROXIMA_AO_VENCIMENTO` → "Vencendo"/`#4D8EFF`, `ENCERRADA` → "Vencidos"/`#6B4DFF`) e de `tipoOrigem` → ícone (`instrumento`/`ata` → `Clock`, `of` → `WarningTriangle`, mantendo o padrão visual atual).

## Rastreamento de Complexidade

*Nenhuma violação de constituição identificada. Seção não aplicável.*
