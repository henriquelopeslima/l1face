<!--
Sync Impact Report
Version change: UNVERSIONED (placeholders) → 1.0.0
Principles populated:
  - [PRINCIPLE_1_NAME] → I. Arquitetura e Estrutura de Pastas
  - [PRINCIPLE_2_NAME] → II. Princípios SOLID e TypeScript
  - [PRINCIPLE_3_NAME] → III. Boas Práticas React
  - [PRINCIPLE_4_NAME] → IV. Práticas Estritas de Segurança (Security by Design)
  - [PRINCIPLE_5_NAME] → V. Testes e Qualidade de Código
Added sections: Todos os 5 princípios (eram placeholders)
Removed sections: [SECTION_2_NAME], [SECTION_3_NAME] (placeholders incorporados na Governança)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — seção "Verificação de Constituição" é dinâmica; sem alterações necessárias
  ✅ .specify/templates/spec-template.md — alinhado; sem alterações necessárias
  ✅ .specify/templates/tasks-template.md — alinhado; sem alterações necessárias
Follow-up TODOs: Nenhum
-->

# l1face Constitution

## Princípios Fundamentais

### I. Arquitetura e Estrutura de Pastas

**Padrão de Design**: Clean Architecture organizada por Vertical Slices (Features). Cada
funcionalidade de negócio DEVE ser auto-contida.

**Estrutura Obrigatória por Feature** — toda pasta em `src/features/[nome-da-feature]` DEVE
ser dividida estritamente em:

- `domain/`: Entidades de negócio, interfaces/contratos de repositórios e Use Cases (regras
  de negócio puras — sem React, sem dependências externas).
- `data/`: Implementações de repositórios, mapeadores (mappers/adapters) e chamadas de
  API/SDKs (infraestrutura).
- `presentation/`: Componentes React, custom hooks, estados locais, estilos e validações
  visuais.

**Regra de Isolamento** (INVIOLÁVEL):

- A camada `domain` NUNCA DEVE importar nada de `data` ou `presentation`.
- A camada `presentation` SOMENTE DEVE interagir com o `domain` através de Use Cases ou
  interfaces de contratos — nunca diretamente com implementações de `data`.

*Rationale*: Isolar o domínio garante que regras de negócio permaneçam testáveis e agnósticas
de framework, prevenindo acoplamento acidental com infraestrutura ou UI.

---

### II. Princípios SOLID e TypeScript

Todos os itens abaixo são MANDATÓRIOS:

- **S (Single Responsibility)**: Cada componente React faz exatamente uma coisa — renderizar
  UI ou gerenciar estado visual via hooks. Regras de negócio ficam exclusivamente em Use Cases
  (`domain`).
- **O (Open/Closed)**: Componentes de UI genéricos DEVEM ser extensíveis via composição
  (prop `children`) ou polimorfismo de tipagem, sem necessidade de modificar código interno.
- **L (Liskov Substitution)**: Subtipos de propriedades ou respostas de contratos DEVEM ser
  totalmente intercambiáveis sem quebrar a aplicação.
- **I (Interface Segregation)**: Componentes NÃO DEVEM depender de props que não utilizam.
  DEVE-SE preferir interfaces tipadas granulares em vez de objetos genéricos e abrangentes.
- **D (Dependency Inversion)**: A camada `presentation` DEVE depender de abstrações
  (interfaces do `domain`), não de implementações diretas de APIs ou serviços. Dependências
  DEVEM ser injetadas via React Context ou factories quando necessário.

**TypeScript Estrito** (INVIOLÁVEL):

- Proibido o uso de `any` ou `as unknown`.
- Toda tipagem DEVE ser explícita, inferida com segurança, ou baseada em Type Guards e
  Generics para reaproveitamento.

*Rationale*: TypeScript estrito combinado com SOLID previne regressões silenciosas e reduz
custo de manutenção em codebases que crescem por Vertical Slices independentes.

---

### III. Boas Práticas React

- **Hooks Customizados**: Toda lógica de estado complexa, chamadas de Use Cases ou efeitos
  (`useEffect`) de um componente DEVE ser extraída para um hook customizado da própria feature
  (ex: `useGetFeatureData.ts`). Lógica inline em componentes é proibida quando ultrapassa
  estado trivial.
- **Componentes Puros**: Componentes visuais DEVEM ser o mais puros e burros (presentational)
  possível — responsabilidade restrita a renderização, sem lógica de negócio embutida.
- **Imutabilidade**: Estados NUNCA DEVEM ser mutados diretamente. DEVE-SE usar estritamente
  `useState` ou `useReducer`.
- **Performance**: `useMemo` e `useCallback` DEVEM ser usados conscientemente para evitar
  re-renderizações caras e manter a integridade das dependências dos hooks. Uso indiscriminado
  é tão prejudicial quanto a ausência.

*Rationale*: Separar estado visual de lógica de negócio via hooks customizados é
pré-requisito para testabilidade isolada da camada de apresentação sem overhead de DOM.

---

### IV. Práticas Estritas de Segurança (Security by Design)

Todos os itens abaixo são INVIOLÁVEIS:

- **Prevenção contra XSS**: Proibido o uso de `dangerouslySetInnerHTML` sem sanitização
  explícita via biblioteca homologada (ex: `dompurify`). NUNCA passar dados não confiáveis
  para atributos executáveis.
- **Armazenamento de Tokens**: Proibido salvar tokens de autenticação (JWT) ou dados sensíveis
  em `localStorage` ou `sessionStorage`. DEVE-SE preferir cookies `HttpOnly` com flag `Secure`
  ou gerenciamento estrito em memória.
- **Validação na Borda**: Toda entrada de formulário ou input do usuário DEVE ser validada na
  camada `presentation` (ex: via `Zod`) antes de atingir o domínio.
- **Mascaramento de Erros**: Erros de infraestrutura, detalhes de banco de dados ou stack
  traces de APIs NÃO DEVEM ser expostos na UI ou em logs abertos do console em produção.

*Rationale*: Segurança por design evita que vulnerabilidades sejam introduzidas
inadvertidamente durante o desenvolvimento acelerado de features isoladas.

---

### V. Testes e Qualidade de Código

- **Testabilidade**: O código DEVE ser escrito para ser testável. Se um componente está
  difícil de testar com React Testing Library, isso é sintoma de violação do Princípio de
  Responsabilidade Única — o componente DEVE ser refatorado.
- **Cobertura de Use Cases**: Use Cases em `domain` DEVEM ter 100% de cobertura de testes
  unitários puros (sem simular ambiente React/DOM).

*Rationale*: Cobertura total dos Use Cases garante que o núcleo de negócio seja auditável e
seguro para refatoração sem risco de regressão silenciosa nas regras de negócio.

---

## Governança

**Emenda**: Qualquer alteração a estes princípios DEVE ser documentada neste arquivo com
incremento de versão semântica, justificativa de negócio ou técnica, e plano de migração para
código existente em não-conformidade.

**Política de Versionamento**:

- MAJOR: Remoção ou redefinição incompatível de princípio existente.
- MINOR: Adição de novo princípio ou expansão material de seção existente.
- PATCH: Clarificações, ajustes de redação, correções sem impacto semântico.

**Conformidade**: Toda PR DEVE ser verificada contra os 5 princípios desta constituição antes
do merge. Violações DEVEM ser justificadas no campo "Rastreamento de Complexidade" do
`plan.md` da feature correspondente.

**Resolução de Conflitos**: Em caso de ambiguidade entre esta constituição e práticas legadas
no código, esta constituição prevalece. Código legado em não-conformidade DEVE ser migrado no
contexto da feature que o tocar.

**Version**: 1.0.0 | **Ratified**: 2026-05-16 | **Last Amended**: 2026-05-16
