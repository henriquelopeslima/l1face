# API Contracts: Restringir Configurações para Colaborador

Esta funcionalidade **não introduz nenhum endpoint novo**. Ela reaproveita, sem alterações, o endpoint já documentado na feature `022-listar-usuarios-licitante`:

## GET /api/licitantes/{licitanteId}/usuarios (reaproveitado)

**Uso nesta funcionalidade**: descobrir o `papel` (`ADMIN` | `COLABORADOR`) do usuário autenticado no licitante ativo, localizando na resposta o item cujo `userId` corresponde ao usuário logado.

Ver contrato completo (parâmetros, resposta, códigos de erro) em `specs/022-listar-usuarios-licitante/contracts/api-contracts.md`.

**Nota de acoplamento**: o novo hook `useIsAdminLicitante` (desta funcionalidade) e o hook `useGestaoAcessos` (da feature `023-convidar-colaborador`) chamam esse mesmo endpoint de forma independente — ver "Trade-off assumido" em `plan.md`. Nenhuma mudança de contrato é necessária para viabilizar isso.
