# Plano de Implementação: Exibição de Saldo de Carona nos Itens do Contrato de Adesão

**Branch**: `018-contrato-adesao-carona` | **Data**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

## Resumo

Quando o usuário cadastra um contrato marcado como **adesão** a uma ARP, a etapa de itens deve exibir o saldo disponível para carona (`qtdParaCarona - qtdConsumidaCarona`) em vez do saldo do órgão (`qtdRegistrada - qtdConsumidaOrgao`). A entidade de domínio `ItemAta` e os mappers já possuem todos os campos necessários; a mudança é exclusivamente na camada de apresentação de `CadastrarContrato.tsx`: corrigir a condição de exibição do badge de saldo, diferenciar o cabeçalho da coluna de quantidade, e garantir que itens sem saldo de carona sejam marcados como indisponíveis quando o modo adesão estiver ativo.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 + React 18 (TSX), Vite  
**Dependências Principais**: shadcn/ui, iconoir-react, React Router  
**Armazenamento**: N/A — nenhuma alteração de dados persistidos  
**Testes**: Vitest  
**Plataforma Alvo**: SPA (navegador)  
**Tipo de Projeto**: Frontend (feature `instrumentos`)  
**Metas de Performance**: N/A — mudança puramente visual/reativa  
**Restrições**: TypeScript strict (`no any`), constituição Clean Architecture por Vertical Slices  
**Escala/Scope**: 1 componente de apresentação (`CadastrarContrato.tsx`) — mudanças cirúrgicas

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Arquitetura (Vertical Slices) | ✅ APROVADO | Mudanças restritas a `presentation/`; `domain/` e `data/` intocados |
| II. SOLID + TypeScript Estrito | ✅ APROVADO | Sem uso de `any`; sem novas dependências; sem violações de SRP |
| III. Boas Práticas React | ✅ APROVADO | Lógica de saldo já está correta nos hooks; mudança é só na renderização |
| IV. Segurança (Security by Design) | ✅ APROVADO | Sem alteração de autenticação, tokens ou dados sensíveis |
| V. Testes e Qualidade | ✅ APROVADO | Nenhum Use Case de domínio é alterado; não requer novos testes unitários de domínio |

**Resultado**: Nenhuma violação. Pode prosseguir para pesquisa.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/018-contrato-adesao-carona/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 (ver abaixo)
├── data-model.md        # Fase 1 (ver abaixo)
└── tasks.md             # Fase 2 (gerado por /speckit-tasks)
```

### Código-Fonte (arquivos afetados)

```text
src/features/instrumentos/presentation/components/
└── CadastrarContrato.tsx    ← ÚNICO ARQUIVO MODIFICADO
```

Nenhum arquivo novo será criado. Nenhum arquivo em `domain/` ou `data/` é alterado.

## Rastreamento de Complexidade

> Nenhuma violação de constituição identificada. Seção omitida.

---

## Fase 0: Pesquisa

### research.md

Não há incertezas técnicas a pesquisar: o codebase é conhecido e a entidade já está completa. Todos os campos necessários (`qtdParaCarona`, `qtdConsumidaCarona`) já estão presentes em `ItemAta` (entity) e populados pelo mapper `ataDetalhesMappers.ts`.

As perguntas relevantes já foram respondidas pela leitura do código:

| Decisão | Resolução | Rationale |
|---------|-----------|-----------|
| Alterar a entidade `ItemAta`? | **Não** — já possui todos os campos necessários | `qtdParaCarona`, `qtdConsumidaCarona`, `qtdRegistrada`, `qtdConsumidaOrgao` já existem |
| Alterar mappers ou repositórios? | **Não** | `mapApiItemAtaToItemAta` já mapeia todos os campos |
| Criar novo hook customizado? | **Não** — mudança é localizada | A lógica `saldoAtual` já existe no componente; a mudança é na renderização |
| Alterar `CadastrarNotaEmpenho`? | **Fora de escopo** | Especificado nas Premissas da spec; pode ser feito em feature separada |
| Condição `item.saldoOrgao !== undefined` | **Substituir** por verificação semântica correta | Usar `item.saldoOrgao !== undefined \|\| item.saldoCarona !== undefined`, ou simplesmente `isItensVinculadosArp` |

---

## Fase 1: Design e Contratos

### data-model.md

Nenhuma mudança de modelo de dados. O estado `ItemContrato` interno ao componente já tem:

```typescript
interface ItemContrato {
  id: string;
  itemAtaId?: string;
  descricao: string;
  unidadeMedida: string;
  quantidadeTotal: number;
  valorUnitario: number;
  valorTotal: number;
  saldoOrgao?: number;   // qtdRegistrada - qtdConsumidaOrgao
  saldoCarona?: number;  // qtdParaCarona - qtdConsumidaCarona
}
```

Ambos os campos já são populados em `carregarItensDaArp` quando uma ARP é selecionada. **Nenhuma mudança necessária.**

### Contratos

Este é um projeto frontend (SPA) sem API exposta. A interface de contrato relevante é o comportamento visível ao usuário na etapa de itens:

**Comportamento esperado por estado de `isAdesao`:**

| Condição | Cabeçalho da coluna | Limite de quantidade | Badge de saldo | Itens ocultos/desabilitados |
|----------|---------------------|----------------------|----------------|------------------------------|
| Sem ARP vinculada | "Quantidade" | sem limite | não exibido | nenhum |
| Com ARP, `isAdesao = false` | "Qtd. / Saldo Órgão" | `saldoOrgao` | exibe `saldoOrgao` | itens com `saldoOrgao = 0` |
| Com ARP, `isAdesao = true` | "Qtd. / Saldo Carona" | `saldoCarona` | exibe `saldoCarona` | itens com `saldoCarona = 0` |

### Mudanças detalhadas em `CadastrarContrato.tsx`

#### 1. Cabeçalho da coluna de quantidade (linha ~813)

**Antes:**
```tsx
<TableHead className="min-w-[120px]">Quantidade</TableHead>
```

**Depois:**
```tsx
<TableHead className="min-w-[120px]">
  {isItensVinculadosArp
    ? isAdesao
      ? 'Qtd. / Saldo Carona'
      : 'Qtd. / Saldo Órgão'
    : 'Quantidade'}
</TableHead>
```

#### 2. Condição de exibição do badge de saldo (linha ~856)

**Antes:**
```tsx
{item.saldoOrgao !== undefined && (
  <span ...>
    {semSaldo ? 'Sem saldo' : `/ ${...}`}
  </span>
)}
```

**Depois** — usar `isItensVinculadosArp` como condição semântica:
```tsx
{isItensVinculadosArp && (
  <span ...>
    {semSaldo ? 'Sem saldo' : `/ ${...}`}
  </span>
)}
```

#### 3. Verificação de `semSaldo` (linha ~824)

A lógica `const saldoAtual = isAdesao ? (item.saldoCarona ?? Infinity) : (item.saldoOrgao ?? Infinity)` já está correta. A linha `semSaldo` pode ser simplificada:

**Antes:**
```tsx
const semSaldo = item.saldoOrgao !== undefined && saldoAtual === 0;
```

**Depois:**
```tsx
const semSaldo = isItensVinculadosArp && saldoAtual === 0;
```

Isso é semanticamente equivalente para ARP items (onde ambos os saldos são definidos), mas é mais claro e correto — `isItensVinculadosArp` é o indicador real de que existe um saldo a verificar.

#### 4. Sem outras mudanças

- `validarEtapaItens`: já usa `isAdesao ? saldoCarona : saldoOrgao` — correto, sem mudança
- `saldoAtual` cálculo: já correto — sem mudança
- `max` no input: já usa `saldoAtual` — sem mudança
- Limpeza de quantidades ao alternar `isAdesao`: comportamento atual (não limpa) é aceitável; o campo `max` já impede exceder o novo limite

### quickstart.md

**Pré-requisitos para testar localmente:**
1. Backend `l1core` rodando (Docker)
2. `npm run dev` no repositório `l1face`
3. Usuário autenticado com pelo menos uma ARP cadastrada que aceita adesão (`aceita_adesao: true`) e com itens que possuem `qtd_para_carona > 0`

**Fluxo de teste manual:**
1. Ir para `Instrumentos > Cadastrar > Contrato`
2. Passo 1: Escolher "Preenchimento Manual"
3. Passo 2: Selecionar uma ARP com `aceita_adesao = true` → marcar "É uma adesão? Sim"
4. Passo 3 (Itens): Verificar que o cabeçalho mostra "Qtd. / Saldo Carona"
5. Verificar que itens com `qtd_para_carona = 0` aparecem como "Sem saldo"
6. Verificar que itens com `qtd_para_carona > 0` mostram o saldo de carona correto no badge
7. Tentar inserir quantidade maior que `saldoCarona` e verificar limitação automática
8. Voltar ao Passo 2 e trocar para "Não" → verificar que Passo 3 passa a mostrar "Qtd. / Saldo Órgão"
