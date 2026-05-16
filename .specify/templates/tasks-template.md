---

description: "Template de lista de tarefas para implementação de funcionalidade"
---

# Tarefas: [FEATURE NAME]

**Entrada**: Documentos de design em `/specs/[###-feature-name]/`
**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório para histórias de usuário), research.md, data-model.md, contracts/

**Testes**: Os exemplos abaixo incluem tarefas de teste. Testes são OPCIONAIS - inclua apenas se explicitamente solicitado na especificação da funcionalidade.

**Organização**: As tarefas são agrupadas por história de usuário para permitir implementação e teste independentes de cada história.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (ex: US1, US2, US3)
- Inclua caminhos de arquivo exatos nas descrições

## Convenções de Caminho

- **Projeto único**: `src/`, `tests/` na raiz do repositório
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` ou `android/src/`
- Os caminhos abaixo assumem projeto único - ajuste conforme a estrutura do plan.md

<!-- 
  ============================================================================
  IMPORTANTE: As tarefas abaixo são TAREFAS DE EXEMPLO apenas para ilustração.
  
  O comando /speckit-tasks DEVE substituí-las por tarefas reais baseadas em:
  - Histórias de usuário do spec.md (com suas prioridades P1, P2, P3...)
  - Requisitos da funcionalidade do plan.md
  - Entidades do data-model.md
  - Endpoints dos contracts/
  
  As tarefas DEVEM ser organizadas por história de usuário para que cada história possa ser:
  - Implementada independentemente
  - Testada independentemente
  - Entregue como incremento MVP
  
  NÃO mantenha estas tarefas de exemplo no arquivo tasks.md gerado.
  ============================================================================
-->

## Fase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Inicialização do projeto e estrutura básica

- [ ] T001 Criar estrutura do projeto conforme plano de implementação
- [ ] T002 Inicializar projeto [language] com dependências [framework]
- [ ] T003 [P] Configurar ferramentas de linting e formatação

---

## Fase 2: Fundação (Pré-requisitos Bloqueantes)

**Propósito**: Infraestrutura central que DEVE ser concluída antes que QUALQUER história de usuário possa ser implementada

**⚠️ CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa

Exemplos de tarefas de fundação (ajuste conforme seu projeto):

- [ ] T004 Configurar schema do banco de dados e framework de migrations
- [ ] T005 [P] Implementar framework de autenticação/autorização
- [ ] T006 [P] Configurar roteamento de API e estrutura de middleware
- [ ] T007 Criar models/entidades base das quais todas as histórias dependem
- [ ] T008 Configurar infraestrutura de tratamento de erros e logging
- [ ] T009 Configurar gerenciamento de configuração de ambiente

**Checkpoint**: Fundação pronta - implementação das histórias de usuário pode começar em paralelo

---

## Fase 3: História de Usuário 1 - [Title] (Prioridade: P1) 🎯 MVP

**Objetivo**: [Breve descrição do que esta história entrega]

**Teste Independente**: [Como verificar que esta história funciona por conta própria]

### Testes para História de Usuário 1 (OPCIONAL - apenas se testes forem solicitados) ⚠️

> **NOTA: Escreva estes testes PRIMEIRO, garanta que eles FALHEM antes da implementação**

- [ ] T010 [P] [US1] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T011 [P] [US1] Teste de integração para [user journey] em tests/integration/test_[name].py

### Implementação para História de Usuário 1

- [ ] T012 [P] [US1] Criar model [Entity1] em src/models/[entity1].py
- [ ] T013 [P] [US1] Criar model [Entity2] em src/models/[entity2].py
- [ ] T014 [US1] Implementar [Service] em src/services/[service].py (depende de T012, T013)
- [ ] T015 [US1] Implementar [endpoint/feature] em src/[location]/[file].py
- [ ] T016 [US1] Adicionar validação e tratamento de erros
- [ ] T017 [US1] Adicionar logging para operações da história de usuário 1

**Checkpoint**: Neste ponto, a História de Usuário 1 deve ser totalmente funcional e testável independentemente

---

## Fase 4: História de Usuário 2 - [Title] (Prioridade: P2)

**Objetivo**: [Breve descrição do que esta história entrega]

**Teste Independente**: [Como verificar que esta história funciona por conta própria]

### Testes para História de Usuário 2 (OPCIONAL - apenas se testes forem solicitados) ⚠️

- [ ] T018 [P] [US2] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T019 [P] [US2] Teste de integração para [user journey] em tests/integration/test_[name].py

### Implementação para História de Usuário 2

- [ ] T020 [P] [US2] Criar model [Entity] em src/models/[entity].py
- [ ] T021 [US2] Implementar [Service] em src/services/[service].py
- [ ] T022 [US2] Implementar [endpoint/feature] em src/[location]/[file].py
- [ ] T023 [US2] Integrar com componentes da História de Usuário 1 (se necessário)

**Checkpoint**: Neste ponto, as Histórias de Usuário 1 E 2 devem funcionar independentemente

---

## Fase 5: História de Usuário 3 - [Title] (Prioridade: P3)

**Objetivo**: [Breve descrição do que esta história entrega]

**Teste Independente**: [Como verificar que esta história funciona por conta própria]

### Testes para História de Usuário 3 (OPCIONAL - apenas se testes forem solicitados) ⚠️

- [ ] T024 [P] [US3] Teste de contrato para [endpoint] em tests/contract/test_[name].py
- [ ] T025 [P] [US3] Teste de integração para [user journey] em tests/integration/test_[name].py

### Implementação para História de Usuário 3

- [ ] T026 [P] [US3] Criar model [Entity] em src/models/[entity].py
- [ ] T027 [US3] Implementar [Service] em src/services/[service].py
- [ ] T028 [US3] Implementar [endpoint/feature] em src/[location]/[file].py

**Checkpoint**: Todas as histórias de usuário devem agora ser independentemente funcionais

---

[Adicione mais fases de história de usuário conforme necessário, seguindo o mesmo padrão]

---

## Fase N: Polimento & Aspectos Transversais

**Propósito**: Melhorias que afetam múltiplas histórias de usuário

- [ ] TXXX [P] Atualizações de documentação em docs/
- [ ] TXXX Limpeza e refatoração de código
- [ ] TXXX Otimização de performance em todas as histórias
- [ ] TXXX [P] Testes unitários adicionais (se solicitado) em tests/unit/
- [ ] TXXX Hardening de segurança
- [ ] TXXX Executar validação do quickstart.md

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: Sem dependências - pode começar imediatamente
- **Fundação (Fase 2)**: Depende da conclusão do Setup - BLOQUEIA todas as histórias de usuário
- **Histórias de Usuário (Fase 3+)**: Todas dependem da conclusão da Fase de Fundação
  - Histórias de usuário podem então prosseguir em paralelo (se houver equipe suficiente)
  - Ou sequencialmente em ordem de prioridade (P1 → P2 → P3)
- **Polimento (Fase Final)**: Depende da conclusão de todas as histórias de usuário desejadas

### Dependências entre Histórias de Usuário

- **História de Usuário 1 (P1)**: Pode começar após a Fundação (Fase 2) - Sem dependências de outras histórias
- **História de Usuário 2 (P2)**: Pode começar após a Fundação (Fase 2) - Pode integrar com US1 mas deve ser testável independentemente
- **História de Usuário 3 (P3)**: Pode começar após a Fundação (Fase 2) - Pode integrar com US1/US2 mas deve ser testável independentemente

### Dentro de Cada História de Usuário

- Testes (se incluídos) DEVEM ser escritos e FALHAR antes da implementação
- Models antes de services
- Services antes de endpoints
- Implementação central antes de integração
- História concluída antes de passar para a próxima prioridade

### Oportunidades de Paralelismo

- Todas as tarefas de Setup marcadas [P] podem ser executadas em paralelo
- Todas as tarefas de Fundação marcadas [P] podem ser executadas em paralelo (dentro da Fase 2)
- Uma vez concluída a Fase de Fundação, todas as histórias de usuário podem começar em paralelo (se a capacidade da equipe permitir)
- Todos os testes de uma história de usuário marcados [P] podem ser executados em paralelo
- Models dentro de uma história marcados [P] podem ser executados em paralelo
- Histórias de usuário diferentes podem ser trabalhadas em paralelo por diferentes membros da equipe

---

## Exemplo de Paralelismo: História de Usuário 1

```bash
# Iniciar todos os testes da História de Usuário 1 juntos (se testes forem solicitados):
Task: "Teste de contrato para [endpoint] em tests/contract/test_[name].py"
Task: "Teste de integração para [user journey] em tests/integration/test_[name].py"

# Iniciar todos os models da História de Usuário 1 juntos:
Task: "Criar model [Entity1] em src/models/[entity1].py"
Task: "Criar model [Entity2] em src/models/[entity2].py"
```

---

## Estratégia de Implementação

### MVP First (Apenas História de Usuário 1)

1. Concluir Fase 1: Setup
2. Concluir Fase 2: Fundação (CRÍTICO - bloqueia todas as histórias)
3. Concluir Fase 3: História de Usuário 1
4. **PARAR e VALIDAR**: Testar História de Usuário 1 independentemente
5. Fazer deploy/demo se estiver pronto

### Entrega Incremental

1. Concluir Setup + Fundação → Fundação pronta
2. Adicionar História de Usuário 1 → Testar independentemente → Deploy/Demo (MVP!)
3. Adicionar História de Usuário 2 → Testar independentemente → Deploy/Demo
4. Adicionar História de Usuário 3 → Testar independentemente → Deploy/Demo
5. Cada história agrega valor sem quebrar as histórias anteriores

### Estratégia com Equipe em Paralelo

Com múltiplos desenvolvedores:

1. Equipe conclui Setup + Fundação juntos
2. Uma vez concluída a Fundação:
   - Desenvolvedor A: História de Usuário 1
   - Desenvolvedor B: História de Usuário 2
   - Desenvolvedor C: História de Usuário 3
3. Histórias concluídas e integradas independentemente

---

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências
- Rótulo [Story] mapeia a tarefa à história de usuário específica para rastreabilidade
- Cada história de usuário deve ser independentemente concluível e testável
- Verificar que os testes falham antes de implementar
- Fazer commit após cada tarefa ou grupo lógico
- Parar em qualquer checkpoint para validar a história independentemente
- Evitar: tarefas vagas, conflitos no mesmo arquivo, dependências entre histórias que quebram a independência
