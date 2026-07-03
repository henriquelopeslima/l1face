# Data Model: Convidar Colaborador

## Entidade: ConviteColaborador

Representa um convite de vínculo enviado a um e-mail em nome de um licitante.

| Campo               | Tipo                                | Notas                                                             |
|---------------------|--------------------------------------|--------------------------------------------------------------------|
| id                  | string (UUID)                        | UUID do convite                                                   |
| email               | string                                | E-mail do convidado                                                |
| nome                | string                                | Nome exibido/usado para o convidado (nome já cadastrado, nome informado no convite, ou nome derivado do e-mail) — sempre presente na resposta; opcional na requisição |
| licitanteId         | string (UUID)                        | UUID do licitante ao qual o convidado será vinculado               |
| usuarioJaCadastrado | boolean                              | `true` se o e-mail já pertencia a um usuário no momento do convite |
| status              | `'PENDENTE' \| 'ACEITO' \| 'RECUSADO'` | Estado atual do convite                                            |
| criadoEm            | string (ISO 8601)                    | Data/hora de criação (ou do último reenvio)                        |
| expiresAt           | string (ISO 8601)                    | Expiração — 24h após criação/reenvio                                |

## Mapeamento API → Entidade

A resposta de `POST /api/licitantes/{licitanteId}/convites` (`ConviteColaboradorResponse` no `openapi.yaml`) já retorna os campos com os mesmos nomes em camelCase — nenhuma transformação é necessária.

## Extensão da Entidade: UsuarioLicitante (já existente)

Nenhuma alteração de forma. Reaproveitada apenas para derivar o papel do usuário autenticado dentro do licitante ativo (ver seção "Estado do Hook" abaixo).

## Estado do Hook `useGestaoAcessos` (campos novos)

| Campo            | Tipo                | Descrição                                                                 |
|------------------|---------------------|----------------------------------------------------------------------------|
| isAdmin          | boolean             | `true` quando o usuário autenticado tem `papel === 'ADMIN'` na lista `usuarios` |
| convidando       | boolean             | `true` enquanto a chamada de convite está em andamento                     |
| convidarError    | string \| null      | Mensagem de erro da última tentativa de convite (null se ausente)          |
| convidarSucesso  | string \| null      | Mensagem de confirmação da última tentativa bem-sucedida (null se ausente) |

## Regras de Validação

- `email` (formulário de convite) DEVE ser não vazio e ter formato de e-mail válido (validado via Zod na camada `presentation` antes de chamar o Use Case).
- `nome` (formulário de convite) DEVE ser não vazio (validado via Zod na camada `presentation`, mesma tratativa do `email`) — obrigatório na UI por decisão de produto, embora opcional no contrato da API. Só tem efeito no backend se o e-mail ainda não pertencer a um usuário cadastrado; caso contrário é ignorado.
- `status` só pode assumir `'PENDENTE'`, `'ACEITO'` ou `'RECUSADO'`.
- A ação de convidar só é exibida/habilitada quando `isAdmin === true`.
- Um convite bem-sucedido (`201`) sempre retorna `status: 'PENDENTE'`, independentemente de ser criação nova ou reenvio — não há distinção visível de "foi reenvio" na resposta, então a UI trata ambos os casos com a mesma mensagem de sucesso.
