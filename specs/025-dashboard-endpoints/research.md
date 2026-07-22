# Research: Dashboard com Dados Reais

## Endpoint da API

**Decision**: Usar `GET /api/dashboard` (operationId `obterDashboard`), que retorna numa única resposta todos os dados exibidos hoje pela tela inicial.

**Rationale**: A descrição do endpoint no `openapi.yaml` confirma que ele agrega, numa única chamada, os 4 indicadores, a série de 6 meses de evolução mensal, a distribuição de instrumentos por status e as 5 notificações mais recentes — exatamente as quatro seções hoje mockadas em `DashboardPage.tsx`. Não há necessidade de compor múltiplas chamadas de API nem de orquestrar requisições paralelas.

**Alternatives considered**: Buscar cada seção separadamente (ex.: `GET /api/instrumentos` para status, `GET /api/notificacoes` para alertas). Rejeitado — o backend já entrega a agregação pronta especificamente para esta tela (tag `Dashboard`), então buscar por partes duplicaria lógica de agregação que já existe no servidor e adicionaria chamadas de rede desnecessárias.

---

## Header `X-Licitante-Id`

**Decision**: Nenhum tratamento adicional é necessário — `apiFetch` (`@/shared/infrastructure/apiClient.ts`) já injeta `X-Licitante-Id` automaticamente a partir do `activeLicitanteId` global, setado pelo `AuthContext` ao logar/selecionar o licitante.

**Rationale**: O mesmo mecanismo já é usado por `instrumentos` (`GET /api/instrumentos`), que também exige esse header e não precisa passar `licitanteId` explicitamente pelas camadas do hook/use case. Repetir esse padrão evita reintroduzir o encadeamento manual de `licitanteId` usado em `configuracoes` (convenção mais antiga, anterior à centralização em `apiClient.ts`).

**Alternatives considered**: Receber `licitanteId` via `useAuth()` e passá-lo explicitamente ao use case (padrão usado em `useGestaoAcessos`). Rejeitado para esta feature — é o padrão mais antigo do projeto; `instrumentos`, a feature mais recentemente construída, já demonstra que o header global é suficiente e reduz parâmetros repetidos em toda a cadeia de chamadas.

---

## Convenção de pastas da feature

**Decision**: Seguir a estrutura já escalonada (vazia) em `src/features/dashboard/domain/{contracts,entities,useCases}` — mesma convenção usada por `instrumentos` (feature mais recentemente construída, com 22 use cases).

**Rationale**: O repositório hoje tem duas convenções coexistindo: a mais antiga (`domain/{repositories,usecases}` + `data/datasources/*API.ts`, usada em `configuracoes`/`auth`/`atas`) e a mais recente (`domain/{contracts,useCases}` + `data/repositories/*Repository.ts` chamando `apiFetch` diretamente, usada em `instrumentos`). Como a pasta `dashboard` já foi escalonada vazia seguindo a convenção mais recente (`contracts`/`useCases` em vez de `repositories`/`usecases`), manter essa estrutura evita inconsistência dentro da própria feature e acompanha a direção mais atual do projeto.

**Alternatives considered**: Replicar a convenção de `configuracoes` (mais familiar por ser mais numerosa em quantidade de features). Rejeitado — significaria renomear pastas já criadas para esta feature e divergir do padrão da feature mais recentemente construída (`instrumentos`).

---

## Ausência de entidade de notificação reaproveitável no frontend

**Decision**: Criar uma entidade `AlertaDashboard` local à feature `dashboard`, mapeada a partir de `NotificacaoResponse`, em vez de reaproveitar algo já existente.

**Rationale**: Buscando no código, `NotificacoesSection.tsx` (em `configuracoes`) usa uma lista de alertas 100% mockada e não relacionada à API real de notificações — não existe hoje nenhuma entidade `Notificacao`/`Alerta` compartilhada no frontend. Como o campo `alertas` de `DashboardResponse` reaproveita o mesmo formato de `GET /api/notificacoes` (mas essa tela ainda não foi implementada com dados reais), criar a entidade dentro de `dashboard` evita depender de algo inexistente, sem impedir que uma futura feature de notificações reaproveite o mesmo formato de DTO.

**Alternatives considered**: Adiar a criação de uma entidade compartilhada em `shared/` para quando a área de notificações real também precisar dela. Adotado como abordagem — a entidade fica local a `dashboard` por ora; promovê-la para `shared/` é decisão da futura feature de notificações, não desta.

---

## Rótulos, cores e ícones não retornados pela API

**Decision**: Resolver rótulo/cor de `status` (enum `ATIVA|PROXIMA_AO_VENCIMENTO|ENCERRADA`) e ícone de `tipoOrigem` (`instrumento|ata|of`) por meio de funções puras locais na camada `presentation`, não no mapper de dados.

**Rationale**: A API retorna apenas os enums, sem metadados visuais (cor do gráfico de pizza, ícone do alerta) — esses valores hoje são hardcoded em `DashboardPage.tsx` junto aos dados mockados. Mantê-los como uma pequena função de mapeamento na `presentation` (não no `data/mappers`) respeita a Constituição (domain/data não devem carregar decisões de UI) e preserva exatamente a aparência visual atual da tela, que não faz parte do escopo desta mudança.

**Alternatives considered**: Levar cor/ícone para dentro da entidade de domínio retornada pelo mapper. Rejeitado — misturaria decisão de apresentação (cor de gráfico, ícone) com o modelo de domínio, ferindo a separação de camadas da Constituição (Princípio I).

---

## Tratamento de erros

**Decision**: Mapear os status HTTP de `GET /api/dashboard` seguindo o mesmo padrão já usado em `InstrumentosRepository`/`UsuarioLicitanteRepository`:

- 401 → `JWT_EXPIRED` → redireciona para `/login`
- 400 → "Não foi possível identificar a empresa ativa. Atualize a página e tente novamente." (header `X-Licitante-Id` ausente — cenário defensivo, não deve ocorrer em uso normal)
- 403 → "Você não tem acesso aos dados desta empresa."
- 404 → "Não foi possível localizar a empresa. Atualize a página e tente novamente."
- Falha de rede/5xx → "Não foi possível carregar os dados da tela inicial. Tente novamente."

**Rationale**: Consistência direta com o tratamento já implementado nas duas features mais recentes (`instrumentos`, `configuracoes`), e alinhamento com RF-009 e o caso de borda de indisponibilidade da spec.

**Alternatives considered**: Nenhuma — o padrão de mapeamento de erro já está bem estabelecido no projeto; não há motivo para uma abordagem diferente aqui.

---

## Formatação de mês (`"YYYY-MM"` → rótulo curto do eixo X)

**Decision**: Implementar uma função pura pequena e local (`presentation`), sem introduzir uma nova utilidade compartilhada em `shared/`.

**Rationale**: Não existe hoje nenhum utilitário de formatação de data em `src/shared`. Introduzir um novo módulo compartilhado para uma única conversão (`"2026-07"` → `"Jul"`) seria abstração prematura para o escopo desta feature; se uma segunda feature precisar do mesmo formato futuramente, a extração para `shared/` pode ser feita nesse momento.

**Alternatives considered**: Adicionar uma dependência de biblioteca de datas (ex.: `date-fns`). Rejeitado — desnecessário para formatar `"YYYY-MM"` em abreviação de mês em português; `Intl.DateTimeFormat` ou um array estático de 12 abreviações já resolve com zero dependências novas.

---

## Estrutura de arquivos

| Camada | Arquivo | Ação |
|--------|---------|------|
| domain/entities | `DashboardData.ts` | CRIAR |
| domain/entities | `index.ts` | CRIAR |
| domain/contracts | `IDashboardRepository.ts` | CRIAR |
| domain/useCases | `ObterDashboardUseCase.ts` | CRIAR |
| domain/useCases | `ObterDashboardUseCase.test.ts` | CRIAR |
| data/mappers | `dashboardMappers.ts` | CRIAR |
| data/repositories | `DashboardRepository.ts` | CRIAR |
| presentation/hooks | `useDashboard.ts` | CRIAR |
| presentation/hooks | `useDashboard.test.ts` | CRIAR |
| presentation/pages | `DashboardPage.tsx` | MODIFICAR — remove mocks, consome `useDashboard` |
