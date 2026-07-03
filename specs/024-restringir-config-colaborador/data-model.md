# Data Model: Restringir Configurações para Colaborador

## Entidade reaproveitada: `UsuarioLicitante` (já existente)

Nenhum campo novo. Esta funcionalidade lê apenas o campo `papel` já existente para decidir visibilidade de UI.

| Campo               | Tipo                          | Uso nesta funcionalidade                                    |
|---------------------|-------------------------------|---------------------------------------------------------------|
| userId              | string                        | Comparado com o usuário autenticado (`useAuth().user.id`)     |
| papel               | `'ADMIN' \| 'COLABORADOR'`    | `papel === 'ADMIN'` determina se as seções restritas aparecem |

## Estado do novo hook `useIsAdminLicitante`

| Campo      | Tipo    | Descrição                                                                                   |
|------------|---------|-----------------------------------------------------------------------------------------------|
| isAdmin    | boolean | `true` somente quando o usuário autenticado tem `papel === 'ADMIN'` no licitante ativo. Inicia `false`. |
| isLoading  | boolean | `true` enquanto o papel ainda não foi confirmado (requisição em andamento). Inicia `true`.     |

## Mapeamento "Seção de Configurações" → visibilidade

Não é uma entidade persistida — é uma regra de apresentação aplicada em `ConfiguracoesPage`:

| Seção                  | Visível para Administrador | Visível para Colaborador |
|-------------------------|:---------------------------:|:--------------------------:|
| Perfil                  | ✅                           | ✅                          |
| Aparência                | ✅                           | ✅                          |
| Notificações             | ✅                           | ✅                          |
| Assinatura e cobrança    | ✅                           | ❌ (não montada no DOM)     |
| Segurança                | ✅                           | ✅                          |
| Gestão de acessos        | ✅                           | ❌ (não montada no DOM)     |
| Sair da conta            | ✅                           | ✅                          |

## Regras de Validação

- Enquanto `isLoading === true`, nenhuma das duas seções restritas é renderizada (evita "flash" de conteúdo indevido — RF-007).
- Se a consulta usada para determinar o papel falhar, `isAdmin` permanece `false` (fail-closed) e as seções restritas continuam ocultas até uma nova tentativa bem-sucedida (ex.: recarregar a página).
- A decisão de visibilidade é sempre relativa ao licitante ativo da sessão (`session.licitante.id`), nunca a outros licitantes aos quais o usuário também pertença.
