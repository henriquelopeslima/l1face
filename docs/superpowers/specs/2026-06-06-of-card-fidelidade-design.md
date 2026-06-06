# Design: Fidelidade do Card de Ordens de Fornecimento

**Data:** 2026-06-06  
**Arquivo alvo:** `src/features/instrumentos/presentation/pages/ContratoDetalhesPage.tsx`  
**Referência:** `../react-proto/src/app/pages/ContratoDetalhes.tsx`

---

## Objetivo

Alinhar o card "Ordens de Fornecimento" na página de detalhe de contrato ao protótipo visual e comportamental em `react-proto`, corrigindo os seguintes gaps:

- Ausência do widget de ciclo de vida
- Ausência de modal de confirmação ao avançar status
- Botão de ação oculto (só visível quando expandido)
- Indicadores de prazo de entrega ausentes no header da OF
- Badge de pagamento atrasado ausente no header da OF
- Seção de dados financeiros desestruturada
- Box de prazo final de entrega ausente
- Estrutura de expand/collapse divergente do protótipo

---

## Escopo

### Fora do escopo
- Campos `numeroEmpenho` e `tipoEmpenho` — **removidos** (não existem na entidade `OrdemFornecimento` da API)
- Filtro por empenho — **removido** (dependia de `numeroEmpenho`)
- Formulários de liquidação e pagamento — mantidos inline, sem migração para dialogs
- Demais seções da página (Detalhes, Itens, Resumo Financeiro) — sem alteração

---

## Estrutura do container

O card "Ordens de Fornecimento" usa o componente `Accordion` (ShadCN, já disponível no projeto) com `type="multiple"`, permitindo expandir múltiplas OFs simultaneamente. Cada OF é um `AccordionItem`.

O `filtroEmpenho` e o input de busca são removidos.

---

## Trigger de cada OF (`AccordionTrigger`)

Layout horizontal, da esquerda para direita:

| Elemento | Condição |
|---|---|
| `OF #N` (bold) | sempre |
| Badge de status do ciclo | sempre — estilo `border-[#0050FF] text-[#0050FF]` |
| Badge `Pagamento Atrasado` (vermelho `#DD4B39`) | `statusPagamento === 'em_atraso'` |
| Badge de indicador de prazo (verde/laranja/vermelho) | OF não entregue e `prazoEntrega` do contrato não-nulo |
| Data de recebimento (muted, alinhada à direita) | sempre |
| **Botão de ação contextual** | próxima transição de ciclo disponível |

**Botão de ação contextual:**
- Visível diretamente no trigger (não requer expandir)
- Usa `e.stopPropagation()` para não colapsar/expandir o item ao clicar
- Labels: `'pedido_recebido' → "Iniciar Separação"`, `'em_separacao' → "Registrar Despacho"`, `'despachado' → "Confirmar Entrega"`
- Ao clicar: abre o dialog de confirmação (não chama a API diretamente)

**Cálculo do indicador de prazo de entrega:**
- `prazoFinalEntrega = adicionarDiasUteis(of.dataRecebimento, contrato.prazoEntrega)`
- `diasAtePrazo = Math.ceil((prazoFinalEntrega - hoje) / MS_POR_DIA)`
- Verde (`#00A65A`) se `diasAtePrazo > 5` → "Dentro do prazo"
- Laranja (`#F39C12`) se `0 ≤ diasAtePrazo ≤ 5` → "Prazo se encerrando"
- Vermelho (`#DD4B39`) se `diasAtePrazo < 0` → "Prazo vencido"
- Só aparece para OFs com `status !== 'entregue' && status !== 'pago'`

---

## Widget de ciclo de vida

Exibido dentro do `AccordionContent`, antes da seção de dados financeiros.

**5 etapas em sequência horizontal:**

| Etapa | Key | Ícone (iconoir-react) |
|---|---|---|
| Pedido Recebido | `pedido_recebido` | `Mail` |
| Em Separação | `em_separacao` | `BoxIso` |
| Despachado | `despachado` | `Truck` |
| Entregue | `entregue` | `Check` |
| Pago | `pago` | `DollarCircle` |

**Visual por etapa:**
- Círculo 40×40px: `bg-[#0050FF] text-white` se concluída, `bg-accent text-muted-foreground` se pendente
- Label 10px abaixo: `font-semibold` se concluída, `text-muted-foreground` se pendente
- Linha horizontal entre etapas: `bg-[#0050FF]` se etapa anterior concluída, `bg-accent` se pendente

Um `Tooltip` com `InfoCircle` explica que o saldo é debitado definitivamente ao atingir "Entregue".

**Box de prazo final de entrega** (abaixo do widget, quando `indicadorPrazo !== null`):
- Borda e background com a cor do indicador (borda sólida, background `cor + 15` de opacidade via `${cor}26`)
- Exibe: "Prazo Final de Entrega", data calculada (font-mono), `dataRecebimento + N dias úteis`, badge com texto e dias restantes

---

## Modal de confirmação de transição de status

`Dialog` global na página, controlado por dois estados:
- `confirmacaoAberta: boolean`
- `ofConfirmacao: { id: string; proximoStatus: 'em_separacao' | 'despachado' | 'entregue'; label: string } | null`

**Conteúdo do dialog:**
- Título: "Confirmar Ação"
- Descrição: `"Tem certeza que deseja: [label]?"`
- Mini preview do ciclo: dois nós (status atual → próximo status) conectados por linha colorida — replica o visual do protótipo
- Rodapé: botão "Cancelar" e botão "Confirmar"

**Ao confirmar:** chama `avancar({ id, status: proximoStatus })`, fecha o dialog, chama `refetchOrdens()`.

O estado de loading do botão "Confirmar" usa o `isAvancarLoading` existente.

---

## Conteúdo expandido (`AccordionContent`) — ordem das seções

1. **Informações básicas** — grid 3 colunas: Data de Recebimento · Valor Total · Status (badge)
2. **Itens Solicitados** — `bg-accent/30 rounded-lg p-3`, badges `descricao × quantidade unidadeMedida`
3. **Ciclo de vida** — widget + box de prazo final de entrega
4. **Dados Financeiros** — `border-t pt-4`, visível apenas se `status === 'entregue' || status === 'pago'`:
   - Linha 1: Data de Entrega · Data de Liquidação · NF-e
   - Linha 2: Prazo Final de Pagamento (`prazoPagamento` da OF, se presente) · Status de Pagamento (badge) · Data de Pagamento Efetivo
5. **Botões de ação** — `border-t pt-3`, exibidos quando alguma ação está disponível:
   - Botão de transição de ciclo (abre o dialog)
   - "Registrar Liquidação" — se `status === 'entregue' && !dataLiquidacao`
   - "Registrar Pagamento" — se `status === 'entregue' && dataLiquidacao && !dataPagamentoEfetivo`
6. **Formulário inline de liquidação** — expande quando `liquidacaoOpenId === of.id`
7. **Formulário inline de pagamento** — expande quando `pagamentoOpenId === of.id`

---

## Estados de gerenciamento (novos/modificados)

| Estado | Tipo | Descrição |
|---|---|---|
| `confirmacaoAberta` | `boolean` | Controla abertura do dialog de confirmação |
| `ofConfirmacao` | `{ id, proximoStatus, label } \| null` | OF pendente de confirmação |
| `expandedOFId` | removido | Substituído pelo Accordion nativo |
| `avancarLoadingId` | removido | Loading agora é controlado por `isAvancarLoading` do hook, exibido no botão "Confirmar" do dialog |

Estados mantidos: `liquidacaoOpenId`, `liquidacaoForm`, `pagamentoOpenId`, `pagamentoForm`.

---

## Funções auxiliares (a adicionar)

```ts
function calcularPrazoFinalEntrega(
  dataRecebimento: string,
  prazo: number,
  tipoPrazo: TipoPrazo | null
): Date
// Se tipoPrazo === 'UTEIS': pula sábados e domingos ao contar os dias
// Se tipoPrazo === 'CORRIDOS' ou null: soma dias calendário

function calcularIndicadorPrazo(
  dataRecebimento: string,
  prazoEntrega: number,
  tipoPrazo: TipoPrazo | null
): { cor: string; texto: string; diasRestantes: number } | null
// Verde (#00A65A) se diasRestantes > 5 → "Dentro do prazo"
// Laranja (#F39C12) se 0 ≤ diasRestantes ≤ 5 → "Prazo se encerrando"
// Vermelho (#DD4B39) se diasRestantes < 0 → "Prazo vencido"
// Retorna null se prazoEntrega ou tipoPrazo forem null
```

Ficam no escopo do componente (não precisam de arquivo separado).

**Nota:** `of.prazoPagamento` é uma data ISO string (prazo calculado e persistido no momento da liquidação). Exibir diretamente com `formatDate()`, sem recalcular.

---

## Componentes/imports necessários

Já disponíveis no projeto:
- `Accordion, AccordionContent, AccordionItem, AccordionTrigger` — `@/shared/components/ui/accordion`
- `Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle` — `@/shared/components/ui/dialog`
- `Tooltip, TooltipContent, TooltipTrigger` — `@/shared/components/ui/tooltip`
- `Truck, Check, Mail, InfoCircle` — `iconoir-react` (verificar se já importados; adicionar se necessário)

---

## Critérios de aceitação

- [ ] Cada OF exibe o botão de ação contextual diretamente no trigger sem precisar expandir
- [ ] Clicar no botão de ação abre o dialog de confirmação (não executa a API diretamente)
- [ ] O widget de ciclo de vida é visível ao expandir qualquer OF
- [ ] Etapas concluídas aparecem em azul `#0050FF`; pendentes em cinza
- [ ] OFs não entregues com prazo calculável exibem badge colorido no trigger
- [ ] OFs com `statusPagamento === 'em_atraso'` exibem badge vermelho no trigger
- [ ] A seção "Dados Financeiros" só aparece para OFs com status `entregue` ou `pago`
- [ ] O box de prazo final de entrega não aparece para OFs entregues ou pagas
- [ ] Formulários de liquidação e pagamento continuam funcionando normalmente
