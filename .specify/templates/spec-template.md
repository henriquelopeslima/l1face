# Especificação de Funcionalidade: [FEATURE NAME]

**Branch da Funcionalidade**: `[###-feature-name]`  
**Criado em**: [DATE]  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "$ARGUMENTS"

## Cenários de Uso & Testes *(obrigatório)*

<!--
  IMPORTANTE: As histórias de usuário devem ser PRIORIZADAS como jornadas de usuário ordenadas por importância.
  Cada história/jornada de usuário deve ser TESTÁVEL INDEPENDENTEMENTE - ou seja, se você implementar apenas UMA delas,
  ainda deve ter um MVP (Produto Mínimo Viável) funcional que entrega valor.
  
  Atribua prioridades (P1, P2, P3, etc.) a cada história, onde P1 é a mais crítica.
  Pense em cada história como uma fatia independente de funcionalidade que pode ser:
  - Desenvolvida independentemente
  - Testada independentemente
  - Implantada independentemente
  - Demonstrada a usuários independentemente
-->

### História de Usuário 1 - [Brief Title] (Prioridade: P1)

[Descreva esta jornada de usuário em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que tem este nível de prioridade]

**Teste Independente**: [Descreva como pode ser testado independentemente - ex: "Pode ser totalmente testado por [ação específica] e entrega [valor específico]"]

**Cenários de Aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]
2. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### História de Usuário 2 - [Brief Title] (Prioridade: P2)

[Descreva esta jornada de usuário em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que tem este nível de prioridade]

**Teste Independente**: [Descreva como pode ser testado independentemente]

**Cenários de Aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### História de Usuário 3 - [Brief Title] (Prioridade: P3)

[Descreva esta jornada de usuário em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que tem este nível de prioridade]

**Teste Independente**: [Descreva como pode ser testado independentemente]

**Cenários de Aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

[Adicione mais histórias de usuário conforme necessário, cada uma com prioridade atribuída]

### Casos de Borda

<!--
  AÇÃO NECESSÁRIA: O conteúdo desta seção representa placeholders.
  Preencha com os casos de borda corretos.
-->

- O que acontece quando [condição de limite]?
- Como o sistema trata [cenário de erro]?

## Requisitos *(obrigatório)*

<!--
  AÇÃO NECESSÁRIA: O conteúdo desta seção representa placeholders.
  Preencha com os requisitos funcionais corretos.
-->

### Requisitos Funcionais

- **RF-001**: O sistema DEVE [capacidade específica, ex: "permitir que usuários criem contas"]
- **RF-002**: O sistema DEVE [capacidade específica, ex: "validar endereços de e-mail"]
- **RF-003**: Os usuários DEVEM conseguir [interação principal, ex: "redefinir sua senha"]
- **RF-004**: O sistema DEVE [requisito de dados, ex: "persistir preferências do usuário"]
- **RF-005**: O sistema DEVE [comportamento, ex: "registrar todos os eventos de segurança"]

*Exemplo de marcação de requisitos não claros:*

- **RF-006**: O sistema DEVE autenticar usuários via [NEEDS CLARIFICATION: método de autenticação não especificado - e-mail/senha, SSO, OAuth?]
- **RF-007**: O sistema DEVE reter dados do usuário por [NEEDS CLARIFICATION: período de retenção não especificado]

### Entidades Principais *(inclua se a funcionalidade envolve dados)*

- **[Entity 1]**: [O que representa, atributos principais sem detalhes de implementação]
- **[Entity 2]**: [O que representa, relacionamentos com outras entidades]

## Critérios de Sucesso *(obrigatório)*

<!--
  AÇÃO NECESSÁRIA: Defina critérios de sucesso mensuráveis.
  Devem ser agnósticos de tecnologia e mensuráveis.
-->

### Resultados Mensuráveis

- **CS-001**: [Métrica mensurável, ex: "Usuários conseguem criar conta em menos de 2 minutos"]
- **CS-002**: [Métrica mensurável, ex: "Sistema suporta 1000 usuários simultâneos sem degradação"]
- **CS-003**: [Métrica de satisfação, ex: "90% dos usuários concluem a tarefa principal na primeira tentativa"]
- **CS-004**: [Métrica de negócio, ex: "Reduzir tickets de suporte relacionados a [X] em 50%"]

## Premissas

<!--
  AÇÃO NECESSÁRIA: O conteúdo desta seção representa placeholders.
  Preencha com premissas baseadas em padrões razoáveis escolhidos
  quando a descrição da funcionalidade não especificou certos detalhes.
-->

- [Premissa sobre usuários-alvo, ex: "Usuários têm conectividade estável à internet"]
- [Premissa sobre limites de escopo, ex: "Suporte mobile está fora do escopo para v1"]
- [Premissa sobre dados/ambiente, ex: "Sistema de autenticação existente será reutilizado"]
- [Dependência de sistema/serviço existente, ex: "Requer acesso à API de perfil de usuário existente"]
