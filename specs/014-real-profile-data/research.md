# Pesquisa: Dados Reais no Perfil de Configurações

## Decisões Técnicas

### Fonte dos Dados

**Decisão**: Usar `AuthContext` (`useAuth()`) diretamente na camada de apresentação — sem novo endpoint, sem novo Use Case.

**Rationale**: Os dados necessários (`user.nomeCompleto`, `user.email`, `session.licitante.nomeEmpresa`) já estão disponíveis no contexto de autenticação, carregados via `getMeUseCase` no mount do `AuthProvider`. Criar um novo Use Case seria overhead desnecessário para uma leitura de dados já disponíveis no contexto global.

**Alternativas consideradas**:
- Novo endpoint `/api/me/perfil` → rejeitado; `/api/me` já retorna todos os campos necessários.
- Polling ou re-fetch na tela de configurações → rejeitado; os dados já estão hidratados no contexto.

---

### Tratamento de Campos Ausentes

**Decisão**: Usar o operador `?? '—'` (nullish coalescing) para substituir `null`, `undefined` ou string vazia por traço "—".

**Rationale**: Padrão simples, legível e type-safe em TypeScript. Não requer biblioteca externa.

**Alternativas consideradas**:
- Função helper `valueOr(v, '—')` → rejeitada por ser overhead para 3–4 chamadas; inline é mais legível.
- Exibir espaço em branco → rejeitado pelo requisito explícito do usuário.

---

### Custom Hook vs. Uso Direto do AuthContext

**Decisão**: Usar `useAuth()` diretamente na `ConfiguracoesPage` — sem criar hook intermediário.

**Rationale**: A lógica se resume a desestruturar `user` e `session` do contexto e aplicar `?? '—'`. Não há `useEffect`, não há estado local, não há chamadas assíncronas. A constituição exige extração para hook apenas para "lógica de estado complexa" — este caso não se enquadra.

**Alternativas consideradas**:
- `usePerfil()` hook wrapper → rejeitado; não adiciona valor para lógica tão trivial.

---

### Campo de Telefone

**Decisão**: Exibir "—" fixo para o campo de telefone.

**Rationale**: A entidade `User` não possui campo de telefone. Exibir "—" é o comportamento correto conforme o requisito RF-004 e a premissa documentada na spec.

**Alternativas consideradas**:
- Remover o campo da UI → rejeitado; o campo de telefone pode ser adicionado à entidade no futuro e a estrutura visual deve permanecer.
