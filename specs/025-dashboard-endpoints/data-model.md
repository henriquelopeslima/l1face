# Data Model: Dashboard com Dados Reais

## Entidade: DashboardData

Agregado retornado por `obterDashboard()` — representa todos os dados da tela inicial para o licitante ativo.

| Campo              | Tipo                          | Notas                                                     |
|---------------------|-------------------------------|-------------------------------------------------------------|
| cards               | `DashboardCards`               | Os 4 indicadores                                            |
| evolucaoMensal      | `PontoEvolucaoMensal[]`        | Sempre 6 pontos (mês atual + 5 anteriores)                   |
| statusInstrumentos  | `StatusInstrumentoResumo[]`    | Só situações com ao menos 1 instrumento                     |
| alertas             | `AlertaDashboard[]`            | Até 5 notificações mais recentes                             |

## DashboardCards

| Campo               | Tipo                              | Notas |
|----------------------|-----------------------------------|-------|
| valorTotalContratado | `IndicadorValor`                   | |
| valorTotalAtas        | `IndicadorValor`                   | |
| instrumentosAtivos    | `IndicadorInstrumentosAtivos`      | |
| pendenciasFinanceiras | `IndicadorPendenciasFinanceiras`   | |

## IndicadorValor

| Campo                          | Tipo             | Notas                                                                 |
|---------------------------------|------------------|-------------------------------------------------------------------------|
| valor                           | number           | Valor em reais                                                          |
| variacaoPercentualMesAnterior   | number \| null   | `null` quando não há mês anterior para comparar (RF-003) — UI deve omitir, não zerar |

## IndicadorInstrumentosAtivos

| Campo               | Tipo    | Notas |
|-----------------------|---------|-------|
| quantidade             | number  | Total de instrumentos ativos |
| proximosAoVencimento   | number  | Subconjunto próximo do vencimento |

## IndicadorPendenciasFinanceiras

| Campo                              | Tipo    | Notas |
|--------------------------------------|---------|-------|
| valor                                 | number  | Valor total pendente |
| quantidadeAguardandoProcessamento     | number  | Quantidade aguardando processamento |

## PontoEvolucaoMensal

| Campo      | Tipo    | Notas                                    |
|------------|---------|--------------------------------------------|
| mes        | string  | Formato `"YYYY-MM"`; convertido para rótulo curto (ex. `"Jul"`) só na `presentation` |
| contratos  | number  | Valor agregado de contratos no mês         |
| atas       | number  | Valor agregado de atas no mês              |

## StatusInstrumentoResumo

| Campo       | Tipo                                              | Notas |
|--------------|----------------------------------------------------|-------|
| status        | `'ATIVA' \| 'PROXIMA_AO_VENCIMENTO' \| 'ENCERRADA'` | Rótulo/cor de exibição resolvidos na `presentation` (ver `research.md`) |
| quantidade    | number                                              | |

## AlertaDashboard

| Campo        | Tipo                                    | Notas                                                       |
|---------------|------------------------------------------|-----------------------------------------------------------------|
| id             | string (UUID)                            | |
| tipoOrigem     | `'instrumento' \| 'ata' \| 'of'`         | Usado para resolver o ícone na `presentation`                    |
| entidadeId     | string (UUID)                            | Não exibido diretamente hoje; mantido para uso futuro (ex. link) |
| conteudo       | `{ titulo: string; descricao: string; cor: string }` | `titulo`/`descricao` exibidos como texto principal/secundário; `cor` usada no ícone |
| lida           | boolean                                  | Não exibido diretamente hoje (sem ação de marcar como lida nesta feature) |
| criadaEm       | string (ISO 8601)                        | Não exibido diretamente hoje; mantido para consistência com a API |

## Mapeamento API → Entidades

A resposta de `GET /api/dashboard` (`DashboardResponse` no `openapi.yaml`) já usa os mesmos nomes de campo em camelCase para `cards`, `evolucaoMensal` e `statusInstrumentos` — nenhuma transformação de nome é necessária, apenas tipagem. `alertas[]` (formato `NotificacaoResponse`) é mapeado 1:1 para `AlertaDashboard` (mesmos campos, mesmos nomes).

## Estado do Hook `useDashboard`

| Campo      | Tipo                    | Descrição                                                          |
|------------|-------------------------|------------------------------------------------------------------------|
| dashboard  | `DashboardData \| null` | `null` enquanto não há uma resposta bem-sucedida ainda carregada        |
| isLoading  | boolean                 | `true` durante a busca inicial ou um `refetch`                          |
| error      | string \| null          | Mensagem amigável da última falha (`null` se ausente)                   |
| refetch    | `() => void`            | Reexecuta a busca — usado pela ação "Tentar novamente" do estado de erro |

## Regras de Validação

- `variacaoPercentualMesAnterior` só é exibido quando não for `null` (RF-003) — a UI não deve renderizar "0%" nem qualquer texto de variação nesse caso.
- `statusInstrumentos` e `evolucaoMensal` são renderizados mesmo vazios/zerados sem gerar mensagem de erro (RF-007) — licitante sem dados é um estado válido, distinto de falha de carregamento.
- `alertas` pode ser uma lista vazia; a seção de alertas deve refletir isso sem exibir itens fictícios (História de Usuário 3, cenário 2 da spec).
- Nenhum campo desta entidade é editável nesta feature — `DashboardData` é somente leitura (sem mutações, sem ação de marcar `lida`).
