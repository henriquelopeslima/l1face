# Modelo de Dados: Central de Notificações no Frontend

Entidades da camada `domain` da nova feature `src/features/notificacoes`. Todos os tipos são planos
(sem métodos), consistentes com o padrão já usado em `dashboard/domain/entities/DashboardData.ts`.

## Notificacao

Representa um alerta gerado pelo backend para o usuário autenticado, no contexto do licitante ativo.

| Campo         | Tipo                                  | Obrigatório | Descrição |
|---------------|----------------------------------------|-------------|-----------|
| `id`          | `string` (UUID)                        | Sim         | Identificador único da notificação. |
| `tipoOrigem`  | `'instrumento' \| 'ata' \| 'of'`        | Sim         | Origem que gerou a notificação — usada para escolher ícone/rota relacionada. |
| `entidadeId`  | `string` (UUID)                        | Sim         | Identificador da entidade de origem (instrumento, ata ou OF). |
| `conteudo`    | `ConteudoNotificacao`                   | Sim         | Texto e cor de destaque, definidos pelo backend. |
| `lida`        | `boolean`                               | Sim         | Estado de leitura atual. |
| `lidaEm`      | `string` (ISO 8601) \| `null`           | Sim         | Data/hora em que foi marcada como lida; `null` se ainda não lida. |
| `criadaEm`    | `string` (ISO 8601)                     | Sim         | Data/hora de criação da notificação. |

**Validação/Regras**:
- `lidaEm` só é não-nulo quando `lida === true` (invariante garantida pelo backend; o frontend não
  precisa revalidar, apenas refletir).
- Notificações são sempre escopadas a um usuário + licitante ativo — o frontend nunca deve misturar
  notificações de licitantes diferentes na mesma lista (RF-008, Caso de Borda).

### ConteudoNotificacao

| Campo      | Tipo     | Obrigatório | Descrição |
|------------|----------|-------------|-----------|
| `titulo`   | `string` | Sim         | Título curto exibido em negrito. |
| `descricao`| `string` | Sim         | Texto complementar/descritivo. |
| `cor`      | `string` (hex, ex.: `#F59E0B`) | Sim | Cor de destaque (usada no indicador colorido ao lado do item). |

## ListaNotificacoes (resultado de listagem)

Envelope retornado pelo Use Case de listagem — espelha a paginação do backend, ainda que o frontend
nesta fase só consuma a primeira página (Premissas da spec).

| Campo   | Tipo               | Descrição |
|---------|---------------------|-----------|
| `itens` | `Notificacao[]`      | Notificações da página atual, mais recente primeiro. |
| `total` | `number`             | Total de notificações do usuário no licitante ativo. |

## Estado derivado: contagem de não lidas

Não é uma entidade própria — é derivada em tempo de renderização a partir da lista carregada:
`quantidadeNaoLidas = itens.filter(n => !n.lida).length`. Mantida assim (em vez de campo separado)
para eliminar a possibilidade de os dois números divergirem no estado do Context.

## Estado do Context (`NotificacoesContext`)

| Campo               | Tipo                              | Descrição |
|----------------------|------------------------------------|-----------|
| `notificacoes`       | `Notificacao[]`                    | Lista atual em memória. |
| `quantidadeNaoLidas` | `number`                           | Derivado de `notificacoes` (ver acima). |
| `isLoading`          | `boolean`                          | Carregamento inicial em andamento. |
| `error`              | `string \| null`                   | Mensagem amigável em caso de falha (Caso de Borda: erro de rede). |
| `marcarComoLida`     | `(id: string) => Promise<void>`    | Marca uma notificação como lida (otimista, ver research.md #3). |
| `marcarTodasComoLidas` | `() => Promise<void>`            | Marca todas como lidas. |
| `refetch`            | `() => void`                       | Força nova consulta (ex.: ao trocar de licitante ativo). |

## Relação com entidades já existentes

- `AlertaDashboard` (em `features/dashboard/domain/entities/DashboardData.ts`) tem o mesmo formato de
  `Notificacao` (campos idênticos, exceto que a dashboard não expõe `lidaEm`). As duas entidades
  permanecem **independentes** (uma por feature), por isolamento de Vertical Slice — não há um tipo
  compartilhado entre `dashboard` e `notificacoes` (ver research.md #4 para a mesma decisão aplicada a
  ícones).
