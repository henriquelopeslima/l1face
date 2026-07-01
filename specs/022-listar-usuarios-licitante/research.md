# Research: Listar e Revogar Usuários do Licitante

## Endpoints da API

**Decision**: Usar os endpoints já documentados no openapi.yaml de l1core.

| Operação | Método | URL |
|----------|--------|-----|
| Listar   | GET    | `/api/licitantes/{licitanteId}/usuarios` |
| Revogar  | DELETE | `/api/licitantes/{licitanteId}/usuarios/{userId}` |

**Rationale**: Endpoints estão especificados e disponíveis — sem necessidade de polling, WebSocket ou paginação neste escopo.

**Alternatives considered**: Paginação foi avaliada, mas a spec define que listas de usuários de PMEs tendem a ser pequenas; descartada para v1.

---

## Acesso ao licitanteId e userId autenticado

**Decision**: Obter via `useAuth()` → `session.licitante.id` (licitante ativo) e `user.id` (usuário logado).

**Rationale**: O `AuthContext` já gerencia o licitante selecionado e é acessível em qualquer componente dentro do `AuthProvider`. Nenhuma prop drilling necessária.

**Alternatives considered**: Passar `licitanteId` via props do componente — descartado pois introduz acoplamento desnecessário na árvore de componentes.

---

## Desabilitar auto-remoção na UI

**Decision**: Comparar `usuario.userId === currentUser.id` para ocultar o botão de remover do próprio usuário logado.

**Rationale**: A API protege o último ADMIN com 409, mas a spec pede que a própria interface esconda a ação de remoção para o usuário autenticado, reduzindo fricção desnecessária.

---

## Tratamento de erros de revogação

**Decision**: Mapear os status HTTP da resposta de DELETE para mensagens amigáveis:
- 403 → "Apenas administradores podem revogar acessos."
- 404 → "Vínculo não encontrado. A lista será atualizada."
- 409 → "Não é possível remover o último administrador do licitante."
- demais → mensagem genérica de erro.

**Rationale**: Mensagens específicas melhoram a experiência sem expor detalhes de infraestrutura.

---

## Atualização otimista vs. pessimista

**Decision**: Atualização **pessimista** — atualizar a lista somente após confirmação de sucesso da API.

**Rationale**: Revogação de acesso é uma operação de segurança; feedback incorreto (rollback de update otimista) seria confuso e potencialmente inseguro.

---

## Estrutura de arquivos

Todos os novos arquivos ficam dentro de `src/features/configuracoes/`, respeitando as camadas da constituição.

| Camada | Arquivos novos |
|--------|---------------|
| domain/entities | `UsuarioLicitante.ts` |
| domain/repositories | `IUsuarioLicitanteRepository.ts` |
| domain/usecases | `ListarUsuariosLicitanteUseCase.ts`, `RevogarAcessoUseCase.ts` |
| data/datasources | `UsuarioLicitanteAPI.ts` |
| data/repositories | `UsuarioLicitanteRepository.ts` |
| presentation/hooks | `useGestaoAcessos.ts` |
| presentation/components | `GestaoAcessosSection.tsx` (substituir mock) |
| __tests__/domain | `ListarUsuariosLicitanteUseCase.test.ts`, `RevogarAcessoUseCase.test.ts` |
| __tests__/presentation | `useGestaoAcessos.test.ts` |
