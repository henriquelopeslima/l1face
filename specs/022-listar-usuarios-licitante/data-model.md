# Data Model: Listar e Revogar Usuários do Licitante

## Entidade: UsuarioLicitante

Representa um vínculo entre um usuário e um licitante, com seu papel na organização.

| Campo        | Tipo                       | Notas                                    |
|--------------|----------------------------|------------------------------------------|
| id           | string (UUID)              | UUID do vínculo usuário-licitante        |
| userId       | string (UUID)              | UUID do usuário                          |
| nomeCompleto | string                     | Nome completo do usuário                 |
| email        | string                     | E-mail do usuário                        |
| licitanteId  | string (UUID)              | UUID do licitante                        |
| papel        | `'ADMIN' \| 'COLABORADOR'` | Papel do usuário dentro do licitante     |
| criadoEm     | string (ISO 8601)          | Data/hora de criação do vínculo          |

## Mapeamento API → Entidade

A resposta de `GET /api/licitantes/{licitanteId}/usuarios` retorna um array de objetos com os mesmos campos — nenhuma transformação de nomes é necessária (os campos da API já estão em camelCase).

## Estado do Hook `useGestaoAcessos`

| Campo         | Tipo                        | Descrição                                  |
|---------------|-----------------------------|---------------------------------------------|
| usuarios      | `UsuarioLicitante[]`        | Lista de usuários do licitante              |
| isLoading     | boolean                     | True enquanto a lista está sendo carregada  |
| error         | string \| null              | Erro de listagem (null se ausente)          |
| removendoId   | string \| null              | userId sendo removido (para loading inline) |
| removeError   | string \| null              | Erro da última remoção (null se ausente)    |

## Regras de Validação

- `papel` só pode ser `'ADMIN'` ou `'COLABORADOR'` — valores fora desse conjunto são inválidos.
- O botão de remover de um usuário é ocultado quando `usuario.userId === currentUser.id`.
- A lista não é atualizada antes de a API confirmar a exclusão (sem optimistic update).
