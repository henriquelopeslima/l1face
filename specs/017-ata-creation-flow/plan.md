# Plano de Implementação: Ajuste do Fluxo de Criação de Instrumento com ARP

**Branch**: `017-ata-creation-flow` | **Data**: 2026-06-28 | **Spec**: [spec.md](spec.md)
**Entrada**: Especificação da funcionalidade em `specs/017-ata-creation-flow/spec.md`

## Resumo

Ajuste de três comportamentos no fluxo multi-step de criação de contrato (`CadastrarContrato.tsx`):

1. **Default não-adesão**: ao selecionar uma ARP, o radio "É uma adesão?" pré-seleciona "Não" automaticamente; a opção "Sim" é desabilitada quando a ARP não aceita adesão.
2. **Quantidade limitada ao saldo**: os itens pré-carregados da ARP exibem e respeitam o saldo disponível como limite máximo — `saldo_orgao` para contratos do órgão e `saldo_carona` para adesões.
3. **Erro da API visível na etapa de revisão**: quando a API rejeita o cadastro, o alerta de erro aparece diretamente na etapa 4 sem ocultar o formulário.

Todas as mudanças são presentation-only, concentradas em `CadastrarContrato.tsx`. Nenhuma camada de domínio é modificada.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (React 18 + TSX)
**Dependências Principais**: React Router 7, shadcn/ui (Alert, RadioGroup, Input), iconoir-react
**Armazenamento**: N/A (estado local do formulário)
**Testes**: Vitest + React Testing Library (Use Cases cobertos por testes de domínio)
**Plataforma Alvo**: SPA web (desktop + mobile)
**Tipo de Projeto**: web-app (SPA — l1face)
**Metas de Performance**: Recálculo de saldo síncrono — sem impacto de performance mensurável
**Restrições**: TypeScript estrito; proibido `any`
**Escala/Scope**: 1 componente modificado (`CadastrarContrato.tsx`); impacto isolado na feature de instrumentos

## Verificação de Constituição

| Princípio | Status | Observação |
|-----------|--------|-----------|
| I. Arquitetura (Vertical Slices) | ✅ | Mudanças limitadas à camada `presentation/components` |
| II. TypeScript estrito | ✅ | Novos campos tipados; sem `any` |
| III. Boas Práticas React | ✅ | Lógica de saldo calculada no `useCallback` existente; render puro |
| IV. Segurança | ✅ | Sem impacto; dados vêm de API autenticada |
| V. Testes | ✅ | Nenhum Use Case de domínio é modificado; sem necessidade de novos testes unitários de domínio |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/017-ata-creation-flow/
├── plan.md           # Este arquivo
├── research.md       # Decisões de design
├── data-model.md     # Modelo de dados e transições de estado
├── quickstart.md     # Guia de implementação por seção
└── checklists/
    └── requirements.md
```

### Código-Fonte (arquivos modificados)

```text
src/features/instrumentos/presentation/components/
└── CadastrarContrato.tsx    # único arquivo a modificar
```

Arquivo de referência (somente leitura — sem modificações):
```text
src/features/atas/domain/entities/ataDetalhes.ts  # ItemAta com qtdConsumida*
src/features/atas/domain/entities/ata.ts           # Ata com aceitaAdesao
```

**Decisão de Estrutura**: Projeto único (SPA), todas as mudanças em `src/features/instrumentos/presentation/`.

## Plano de Implementação

### Tarefa 1 — Extender interface `ItemContrato` com campos de saldo

**Arquivo**: `src/features/instrumentos/presentation/components/CadastrarContrato.tsx`

Adicionar `saldoOrgao?: number` e `saldoCarona?: number` à interface `ItemContrato`. Estes campos são `undefined` para itens criados manualmente e preenchidos ao carregar itens da ARP.

**Critério de aceite**: TypeScript compila sem erros; itens manuais continuam funcionando sem saldo.

---

### Tarefa 2 — Calcular saldos ao carregar itens da ARP

**Função**: `carregarItensDaArp` (dentro de `CadastrarContrato.tsx`)

Ao mapear `ItemAta → ItemContrato`:
- Setar `quantidadeTotal: 0` (em vez de `qtdRegistrada`) — o usuário informa a quantidade
- Setar `saldoOrgao: item.qtdRegistrada - item.qtdConsumidaOrgao`
- Setar `saldoCarona: item.qtdParaCarona - item.qtdConsumidaCarona`

**Critério de aceite**: Ao selecionar uma ARP e navegar para a etapa de itens, os campos de saldo aparecem corretamente e as quantidades iniciam em 0.

---

### Tarefa 3 — Auto-default "Não" para adesão ao selecionar ARP

**Efeito**: `useEffect` que reage a `dadosContrato.arpOrigem`

Adicionar ao início do efeito:
```typescript
setIsAdesao((prev) => prev === undefined ? false : prev);
```

Isso garante que quando o usuário seleciona uma ARP pela primeira vez, `isAdesao` passa de `undefined` para `false`. Se já foi definido explicitamente, mantém o valor.

**Critério de aceite**: Ao selecionar uma ARP, o radio "Não" fica marcado; ao trocar de ARP, escolhas explícitas são preservadas.

---

### Tarefa 4 — Desabilitar opção "Sim" para ARPs sem adesão

**JSX**: bloco do radio "É uma adesão?" (etapa 2)

Usar `arpSelecionada?.aceitaAdesao` (disponível na lista `atas` já carregada) para controlar `disabled` do `RadioGroupItem value="sim"`:

```typescript
<RadioGroupItem value="sim" id="adesao-sim" disabled={arpSelecionada?.aceitaAdesao === false} />
```

**Critério de aceite**: ARP com `aceitaAdesao: false` → opção "Sim" desabilitada e visualmente cinza.

---

### Tarefa 5 — Limitar quantidade ao saldo disponível na tabela de itens

**JSX**: tabela de itens da etapa 3 (bloco `modoItens === 'manual'`)

Para cada item vindo da ARP:
- Calcular `saldoAtual = isAdesao ? item.saldoCarona : item.saldoOrgao`
- Setar `max={saldoAtual}` no input de quantidade
- Desabilitar input quando `saldoAtual === 0`
- Exibir texto de saldo abaixo do input: `"Saldo: X un"`

**Critério de aceite**: Não é possível digitar quantidade acima do saldo; itens com saldo zero ficam desabilitados; ao trocar adesão/não-adesão, o `max` muda automaticamente.

---

### Tarefa 6 — Exibir erro da API na etapa de revisão (etapa 4)

**JSX**: etapa 4 — Revisão e Confirmação, logo após o alerta de "Atenção" existente

Adicionar:
```tsx
{erroSalvar && (
  <Alert variant="destructive">
    <WarningTriangle className="h-4 w-4" />
    <AlertTitle>Erro ao cadastrar contrato</AlertTitle>
    <AlertDescription>{erroSalvar}</AlertDescription>
  </Alert>
)}
```

O `erroSalvar` provém do hook `useCriarContrato` e já é resetado a cada nova chamada — não é necessário limpeza manual.

**Critério de aceite**: Quando a API retorna erro, o formulário da etapa 4 permanece visível com alerta destrutivo acima dos botões; nova tentativa limpa o alerta enquanto a requisição está em andamento.

---

## Rastreamento de Complexidade

Nenhuma violação de constituição identificada. Sem entrada necessária nesta tabela.
