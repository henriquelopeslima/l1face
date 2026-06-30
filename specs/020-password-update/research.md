# Fase 0: Pesquisa e Decisões de Design

**Data**: 2026-06-30 | **Feature**: Atualização de Senha na Tela de Configurações

## Decisão 1: Padrão de Validação de Força de Senha

**Problema Pesquisado**: Como implementar feedback visual em tempo real de força de senha mantendo sincronismo com regras do backend?

**Decisão**: Implementar validador síncrono em cliente que espelha exatamente as regras do backend (`/api/auth/alterar-senha`)

**Rationale**:
- Backend documenta regras claras via OpenAPI: 8-20 caracteres, letras + números obrigatórios
- Validação duplicada (client + server) é segurança por design — o backend nunca confia no cliente
- Validador síncrono permite feedback imediato sem latência de rede
- Reutiliza padrão já estabelecido em outras features do projeto (ex: validação de CNPJ em cadastros)

**Alternativas Consideradas**:
- ❌ Delegar validação 100% ao backend: causaria latência entre digitar e feedback
- ❌ Usar biblioteca de validação genérica sem sincronismo: risco de divergência regras client/server

---

## Decisão 2: Estrutura de Repositório e Injeção de Dependência

**Problema Pesquisado**: Como integrar com a camada de API mantendo testabilidade sem framework de IoC pesado?

**Decisão**: Padrão Repository com interface no domain, implementação em data, injeção manual via factory ou React Context

**Rationale**:
- Projeto já usa padrão Repository em outras features (ex: contratos, atas)
- Permite mock fácil em testes unitários sem framework externo
- Alinha com princípio D do SOLID (Dependency Inversion) da constituição
- Sem sobrecarga: projeto é SPA, não aplicação enterprise com centenas de dependências

**Alternativas Consideradas**:
- ❌ Integração direta com HTTP client em componentes: viola Single Responsibility
- ❌ Framework como Inversify: overhead desnecessário para scope da feature

---

## Decisão 3: Hook Customizado vs. Biblioteca de Formulário (ex: React Hook Form)

**Problema Pesquisado**: Qual padrão para gerenciar estado do formulário e integração com Use Cases?

**Decisão**: Hook customizado (`useChangePassword`) que orquestra Use Cases locais + controle de submissão. Sem biblioteca pesada de formulário.

**Rationale**:
- Formulário é simples (2 campos): não justifica overhead de `react-hook-form`
- Hook customizado permite integração perfeita com Use Cases do domain
- Alinha com princípio III da constituição (lógica complexa em hooks customizados)
- Controle fino sobre validação client-side em tempo real vs. submissão

**Alternativas Consideradas**:
- ❌ React Hook Form: overhead para 2 campos
- ❌ Gerenciar estado inline em componente: viola Single Responsibility

---

## Decisão 4: Tratamento de Erros e Timeouts

**Problema Pesquisado**: Como tratar erros de rede, timeouts e casos onde JWT expira durante preenchimento?

**Decisão**: 
- Timeout padrão do projeto (ex: 30s) para requisição de alteração
- Retry automático 1x em falha de rede (400-599)
- Se JWT expirou (401): exibir modal "Sessão Expirada" e redirecionar para login
- Erros genéricos (ex: 5xx): exibir "Erro ao alterar senha. Tente novamente mais tarde"

**Rationale**:
- Alinha com padrões estabelecidos em outras features (ex: criação de contratos)
- JWT em cookie HttpOnly é gerenciado automaticamente pelo browser — se expirado, requisição falha naturalmente
- Retry 1x absorve picos de latência de rede transitória
- Mensagens genéricas para erros não esperados (segurança + UX)

**Alternativas Consideradas**:
- ❌ Sem retry: frustra usuários em conexão instável
- ❌ Múltiplos retries: mascara problemas maiores

---

## Decisão 5: Layout e Componentização UI

**Problema Pesquisado**: Onde integrar formulário? Novo componente ou expandir SegurancaSection?

**Decisão**: Criar componente `AlterarSenhaForm` novo (apresentacional puro) que será importado em `SegurancaSection`. Manter separação de responsabilidades.

**Rationale**:
- SegurancaSection já listar outras opções de segurança (2FA, etc.) — adicionar formulário nela diretamente a tornaria muito grande
- Componente isolado é testável independentemente
- Reutilizável se 2FA ou outras features precisarem integração similar
- Alinha com princípio III da constituição (componentes puros e burros)

**Alternativas Consideradas**:
- ❌ Inline no SegurancaSection: componente fica muito grande
- ❌ Como page separada: quebra fluxo UX (usuário esperaria estar em Configurações)

---

## Decisão 6: Validação de "Mesma Senha Anterior"

**Problema Pesquisado**: Spec menciona edge case: usuário tenta alterar para mesma senha. Devo bloquear no cliente?

**Decisão**: Não bloquear no cliente. Deixar backend validar. Mostrar erro apropiado se API retornar.

**Rationale**:
- Backend é autoridade sobre regras de negócio
- Caso muito raro e não mencionado em RF-* ou CS-*
- Validador cliente focado em força/formato
- Reduz complexidade (um critério a menos na validação)

**Alternativas Consideradas**:
- ✅ (não rejeitada): Comparar senhas no cliente — mas aumenta lógica sem valor claro

---

## Decisão 7: Requisição HTTP — URL Base e Headers

**Problema Pesquisado**: Como construir URL e headers para `/api/auth/alterar-senha`?

**Decisão**: Reutilizar HTTP client/axios instance já configurada no projeto com baseURL e interceptadores. Adicionar header `Content-Type: application/json`. JWT em cookie (automático).

**Rationale**:
- Projeto já tem instância HTTP configurada em `src/shared/services/http.ts` (ou similar)
- Cookie HttpOnly é enviado automaticamente pelo browser com `credentials: include`
- Sem necessidade de adicionar headers manuais

**Alternativas Consideradas**:
- ❌ Nova instância HTTP: duplicação
- ❌ Gerenciar JWT manualmente: inseguro (localStorage), complexo

---

## Síntese

Todas as decisões mantêm conformidade com a constituição (Clean Architecture, SOLID, React best practices, Security by Design, Testabilidade). Nenhuma NEEDS CLARIFICATION foi necessária — padrões e tecnologias são estabelecidas no projeto.

**Próximo Passo**: Phase 1 — Gerar data-model.md, contracts, quickstart.md.
