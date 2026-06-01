# Pesquisa: Visualizar Detalhes de Instrumento

## Decisões Técnicas

### D-001: Endpoint de detalhes já existe na API

**Decisão**: Usar o endpoint `GET /api/instrumentos/{id}` já especificado no OpenAPI.

**Rationale**: O endpoint já está definido em `l1core/docs/openapi.yaml` (linha 2052) e retorna
`InstrumentoDetalhesResponse` — um envelope com `tipo`, `contrato | null`, `empenho | null` e
`itens[]`. Nenhuma negociação de contrato é necessária.

**Alternativa considerada**: Reutilizar `GET /api/instrumentos` (listagem) e fazer lookup no
frontend. Rejeitada porque a listagem não retorna campos completos (vigência, prazos, endereço,
itens, etc.).

---

### D-002: Páginas de detalhe já existem com UI completa mas dados mockados

**Decisão**: Manter `ContratoDetalhesPage.tsx` e `NotaEmpenhoDetalhesPage.tsx` como estão
estruturalmente; substituir apenas a fonte de dados (mock → `useBuscarInstrumento`).

**Rationale**: As páginas foram criadas como protótipo visual em feature anterior. Têm rotas
registradas (`/contratos/detalhes/:id` e `/notas-empenho/detalhes/:id`) e navegação a partir de
`InstrumentosGestaoPage`. Reescrever do zero introduz risco sem ganho. O escopo deste feature
é integrar com API real.

**Campos a remover/adaptar**:
- `isARP` → não existe na API; remover do display
- `tipoEmpenho`, `dataEmissao`, `dataVencimento` em `NotaEmpenhoDetalhesPage` → não fazem parte
  de `EmpenhoDetalhesResponse`; remover
- `tipo_prazo_entrega: 'UTEIS' | 'CORRIDOS'` → API retorna `'DIAS' | 'MESES'`; ajustar labels

**Seção "Ordens de Fornecimento"**: permanece mocada; gestão de OFs é feature separada (fora do
escopo desta spec).

---

### D-003: Entidade de domínio como discriminated union

**Decisão**: Definir `InstrumentoDetalhe` como union discriminada por `tipo` em
`instrumentoContratual.ts`, co-locado com `InstrumentoListagem`.

**Rationale**: TypeScript narrowing garante que acessar `contrato.vigenciaInicial` só compile
quando `tipo === 'CONTRATO'`. Evita campos opcionais ambíguos no domínio.

---

### D-004: Use case simples (sem regras de negócio)

**Decisão**: `BuscarInstrumentoUseCase` é um wrapper fino sobre o repositório.

**Rationale**: Não há regras de negócio a validar no read path — o status já vem calculado
pelo backend. O use case existe para manter a convenção arquitetural (presentation não chama
repository diretamente) e para facilitar testes unitários do hook.

---

### D-005: Não criar novo arquivo de entidade

**Decisão**: Adicionar `InstrumentoDetalhe` em `instrumentoContratual.ts` (arquivo já existente).

**Rationale**: Todas as entidades do domínio de instrumentos estão nesse arquivo. Criar um arquivo
`instrumentoDetalhe.ts` separado não agrega organização para uma entidade tão relacionada.
