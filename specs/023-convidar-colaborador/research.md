# Research: Convidar Colaborador

## Endpoint da API

**Decision**: Usar `POST /api/licitantes/{licitanteId}/convites`, que já cobre tanto o convite inicial quanto o reenvio.

**Rationale**: A descrição do endpoint no `openapi.yaml` afirma explicitamente: "Se já existir um convite pendente para o mesmo par e-mail/licitante, a chamada é tratada como reenvio." Isso significa que a mesma chamada (mesmo método, mesmo corpo `{ email }`) resolve tanto a História de Usuário 1 (convite novo) quanto a História de Usuário 3 (reenvio) sem lógica extra no frontend — o backend decide se é criação ou renovação.

**Alternatives considered**: Usar o endpoint dedicado `POST /api/licitantes/{licitanteId}/convites/{conviteId}/reenviar` para reenvios explícitos. Rejeitado para o MVP porque exigiria manter o `conviteId` em memória entre chamadas (não há endpoint de listagem de convites pendentes) e não traz benefício perceptível ao usuário — o Admin já resolve o reenvio simplesmente convidando o mesmo e-mail de novo.

---

## Ausência de endpoint de listagem de convites

**Decision**: Não implementar uma lista de "convites pendentes" na UI nesta versão.

**Rationale**: Não existe `GET /api/licitantes/{licitanteId}/convites` no `openapi.yaml`. Persistir e exibir uma lista de convites pendentes exigiria armazenamento local (ex: `localStorage`) que ficaria dessincronizado do backend assim que o convite fosse aceito/recusado/expirado. A spec (`Premissas`) já documenta essa decisão como padrão razoável para o MVP.

**Alternatives considered**: Guardar convites enviados em estado local do hook (somente durante a sessão). Rejeitado por enquanto — adiciona complexidade sem valor real, já que a mesma ação de "convidar" já resolve reenvio.

---

## Determinar se o usuário autenticado é ADMIN do licitante ativo

**Decision**: Derivar `isAdmin` a partir da lista já carregada por `useGestaoAcessos` (`usuarios.find(u => u.userId === currentUserId)?.papel === 'ADMIN'`), sem nova chamada de API.

**Rationale**: `AuthContext` (`session.licitante`) não carrega o papel do usuário dentro do licitante ativo — apenas `id`, `cnpj` e `nome_empresa` (ver `GetMeUseCase`/`licitante` entity). A única fonte confiável do papel do usuário logado dentro do licitante é a própria listagem de `GET /api/licitantes/{licitanteId}/usuarios`, já buscada por este mesmo componente. Reaproveitar evita uma chamada de API redundante.

**Alternatives considered**: Expandir `/api/me` ou `AuthContext` para incluir o papel do usuário no licitante ativo. Rejeitado — está fora do escopo desta funcionalidade (mudaria um contrato usado por toda a aplicação) e não é necessário, já que o dado já está disponível localmente.

---

## Substituição da UI de "Adicionar usuário" mock

**Decision**: O modo "criar" do Drawer em `GestaoAcessosSection.tsx` é substituído integralmente pelo formulário de convite (campo único de e-mail). O modo "editar" (lápis, papel/senha de um usuário já existente) é removido junto, pois nunca teve suporte real da API (o `onSubmit` do formulário sempre foi mock, sem chamada HTTP) e não faz parte de nenhum endpoint disponível hoje.

**Rationale**: Manter uma ação "Editar" que não persiste nada seria uma regressão de confiança na UI — o usuário clicaria em salvar e nada aconteceria de fato. Como o mesmo Drawer/formulário está sendo reescrito para o fluxo de convite, é o momento natural de remover o código morto do modo "editar" (`gerarSenhaAleatoria`, campos de senha, seleção de papel comentada) em vez de deixá-lo inacessível ou enganoso.

**Alternatives considered**: Manter o botão de editar escondido/desabilitado para uma futura funcionalidade. Rejeitado — não há tarefa nem endpoint previstos para isso; reintroduzir quando houver suporte real é mais simples do que manter código morto no meio da nova implementação.

---

## Validação de e-mail na camada de apresentação

**Decision**: Validar o campo de e-mail com Zod (`z.string().min(1).email()`) antes de chamar o Use Case, reaproveitando o padrão já usado em `RegisterPage.tsx`.

**Rationale**: A Constituição (Princípio IV) exige validação de entrada via Zod na camada `presentation`. `RegisterPage.tsx` já estabelece o padrão de mensagens em português para esse tipo de validação.

**Alternatives considered**: Usar `react-hook-form` completo como em `RegisterPage.tsx`. Rejeitado para este formulário de campo único — o restante do `GestaoAcessosSection.tsx` já usa `useState` simples; introduzir `react-hook-form` só para um campo aumentaria a superfície de mudança sem benefício proporcional.

---

## Tratamento de erros do convite

**Decision**: Mapear os status HTTP da resposta de `POST /convites` para mensagens amigáveis, seguindo o mesmo padrão já usado em `UsuarioLicitanteAPI.revogar`:

- 401 → `JWT_EXPIRED` → redireciona para `/login` (padrão já existente no `UsuarioLicitanteRepository`)
- 403 → "Apenas administradores podem enviar convites."
- 404 → "Não foi possível localizar a empresa. Atualize a página e tente novamente."
- 409 → "Este e-mail já tem acesso a esta empresa."
- 422 → "Informe um e-mail válido."
- demais (5xx/rede) → "Erro ao enviar convite. Tente novamente."

**Rationale**: Consistência com o tratamento de erros já implementado para `revogar`, e alinhamento direto com os cenários de aceite RF-002, RF-004 e RF-008 da spec.

---

## Estrutura de arquivos

Todos os arquivos novos/alterados ficam dentro de `src/features/configuracoes/`, reaproveitando a estrutura já criada pela funcionalidade 022 (`UsuarioLicitanteAPI`, `UsuarioLicitanteRepository`, `useGestaoAcessos`).

| Camada | Arquivo | Ação |
|--------|---------|------|
| domain/entities | `ConviteColaborador.ts` | CRIAR |
| domain/entities | `index.ts` | ATUALIZAR — re-exportar `ConviteColaborador` |
| domain/repositories | `IUsuarioLicitanteRepository.ts` | ATUALIZAR — adicionar método `convidar` |
| domain/usecases | `ConvidarColaboradorUseCase.ts` | CRIAR |
| domain/usecases | `index.ts` | ATUALIZAR — re-exportar |
| data/datasources | `UsuarioLicitanteAPI.ts` | ATUALIZAR — adicionar método `convidar` |
| data/repositories | `UsuarioLicitanteRepository.ts` | ATUALIZAR — adicionar método `convidar` |
| presentation/hooks | `useGestaoAcessos.ts` | ATUALIZAR — estado/ação de convite + `isAdmin` |
| presentation/components | `GestaoAcessosSection.tsx` | MODIFICAR — substituir Drawer de criar/editar pelo formulário de convite |
| __tests__/domain | `ConvidarColaboradorUseCase.test.ts` | CRIAR |
| __tests__/presentation | `useGestaoAcessos.test.ts` | ATUALIZAR — cobrir fluxo de convite |
