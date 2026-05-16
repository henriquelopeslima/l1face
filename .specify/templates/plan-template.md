# Plano de Implementação: [FEATURE]

**Branch**: `[###-feature-name]` | **Data**: [DATE] | **Spec**: [link]
**Entrada**: Especificação da funcionalidade em `/specs/[###-feature-name]/spec.md`

**Nota**: Este template é preenchido pelo comando `/speckit-plan`. Consulte `.specify/templates/plan-template.md` para o fluxo de execução.

## Resumo

[Extrair da spec da funcionalidade: requisito principal + abordagem técnica da pesquisa]

## Contexto Técnico

<!--
  AÇÃO NECESSÁRIA: Substitua o conteúdo desta seção pelos detalhes técnicos
  do projeto. A estrutura aqui é apresentada de forma orientativa para guiar
  o processo de iteração.
-->

**Linguagem/Versão**: [ex: Python 3.11, Swift 5.9, Rust 1.75 ou NEEDS CLARIFICATION]  
**Dependências Principais**: [ex: FastAPI, UIKit, LLVM ou NEEDS CLARIFICATION]  
**Armazenamento**: [se aplicável, ex: PostgreSQL, CoreData, arquivos ou N/A]  
**Testes**: [ex: pytest, XCTest, cargo test ou NEEDS CLARIFICATION]  
**Plataforma Alvo**: [ex: servidor Linux, iOS 15+, WASM ou NEEDS CLARIFICATION]  
**Tipo de Projeto**: [ex: library/cli/web-service/mobile-app/compiler/desktop-app ou NEEDS CLARIFICATION]  
**Metas de Performance**: [específico ao domínio, ex: 1000 req/s, 10k linhas/s, 60 fps ou NEEDS CLARIFICATION]  
**Restrições**: [específico ao domínio, ex: <200ms p95, <100MB memória, offline-capable ou NEEDS CLARIFICATION]  
**Escala/Scope**: [específico ao domínio, ex: 10k usuários, 1M LOC, 50 telas ou NEEDS CLARIFICATION]

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

[Gates determinados com base no arquivo de constituição]

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/[###-feature]/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0 (comando /speckit-plan)
├── data-model.md        # Saída da Fase 1 (comando /speckit-plan)
├── quickstart.md        # Saída da Fase 1 (comando /speckit-plan)
├── contracts/           # Saída da Fase 1 (comando /speckit-plan)
└── tasks.md             # Saída da Fase 2 (comando /speckit-tasks - NÃO criado pelo /speckit-plan)
```

### Código-Fonte (raiz do repositório)
<!--
  AÇÃO NECESSÁRIA: Substitua a árvore de placeholders abaixo pelo layout concreto
  desta funcionalidade. Remova opções não utilizadas e expanda a estrutura escolhida
  com caminhos reais (ex: apps/admin, packages/something). O plano entregue não
  deve incluir rótulos de Opção.
-->

```text
# [REMOVE IF UNUSED] Opção 1: Projeto único (PADRÃO)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Opção 2: Aplicação web (quando "frontend" + "backend" detectados)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Opção 3: Mobile + API (quando "iOS/Android" detectado)
api/
└── [mesmo que backend acima]

ios/ or android/
└── [estrutura específica da plataforma: módulos de funcionalidade, fluxos de UI, testes de plataforma]
```

**Decisão de Estrutura**: [Documente a estrutura selecionada e referencie os diretórios
reais capturados acima]

## Rastreamento de Complexidade

> **Preencha SOMENTE se a Verificação de Constituição tiver violações que precisam ser justificadas**

| Violação | Por que é Necessária | Alternativa Mais Simples Rejeitada Porque |
|----------|---------------------|------------------------------------------|
| [ex: 4º projeto] | [necessidade atual] | [por que 3 projetos são insuficientes] |
| [ex: padrão Repository] | [problema específico] | [por que acesso direto ao BD é insuficiente] |
