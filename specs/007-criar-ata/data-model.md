# Data Model: Criar Ata de Registro de Preços

**Branch**: `007-criar-ata` | **Data**: 2026-05-24

## Entidades de Domínio

### `CriarAtaInput` (nova)

Entrada para criação de uma Ata de Registro de Preços. Representa o payload validado enviado ao repositório.

```typescript
export interface ItemAtaInput {
  numeroItem: number;        // único dentro da ata; inteiro ≥ 1
  descricao: string;         // obrigatório
  unidadeMedida: string;     // máx 20 chars; obrigatório
  valorEstimado: number;     // float > 0
  qtdRegistrada: number;     // float > 0
  qtdParaCarona: number;     // float ≥ 0; deve ser 0 quando aceitaAdesao = false
}

export interface CriarAtaInput {
  numero: string;                  // obrigatório; ex: "001/2026"
  descricao: string;               // objeto da ata; obrigatório
  cnpjOrgaoGerenciador: string;    // 14 dígitos numéricos; obrigatório
  nomeOrgaoGerenciador: string;    // obrigatório
  dataInicioVigencia: string;      // ISO date "YYYY-MM-DD"; obrigatório
  dataFimVigencia: string;         // ISO date "YYYY-MM-DD"; deve ser > dataInicioVigencia
  aceitaAdesao: boolean;           // padrão false
  renovavel: boolean;              // padrão false
  numeroPncp: string | null;       // opcional; código de controle PNCP
  anexoUrl: string | null;         // opcional; URL da ata assinada
  itens: ItemAtaInput[];           // ao menos 1 item
}
```

**Regras de validação** (domínio):
- `dataFimVigencia` > `dataInicioVigencia`
- `cnpjOrgaoGerenciador` exatamente 14 dígitos numéricos (strip formatação)
- `itens.length >= 1`
- `itens[n].numeroItem` único dentro do array
- `itens[n].qtdRegistrada > 0`
- Se `aceitaAdesao === false`, então `itens[n].qtdParaCarona === 0` para todos os itens

---

### `DadosAtaPncp` (nova)

Dados retornados pelo endpoint PNCP para pré-preenchimento do formulário.

```typescript
export interface DadosAtaPncp {
  numeroControlePncp: string;     // ex: "19876424000142-1-000189/2025-000016"
  titulo: string;                 // título da ata no PNCP
  descricao: string;              // objeto da ata
  orgaoCnpj: string;              // CNPJ do órgão (14 dígitos)
  orgaoNome: string;              // nome do órgão gerenciador
  unidadeNome: string;
  modalidadeLicitacao: string;
  dataAssinatura: string;         // ISO date
  dataInicioVigencia: string;     // ISO date
  dataFimVigencia: string;        // ISO date
  situacao: string;
  cancelado: boolean;
  municipio: string;
  uf: string;
}
```

---

### `AtaDetalhes` (existente — reutilizada como retorno do `criarAta`)

Resposta da API após criação bem-sucedida. Já definida em `domain/entities/ataDetalhes.ts`.

---

## Mapeamento API ↔ Domínio

### `CriarAtaInput` → `POST /api/atas` (request body)

| Domínio (camelCase) | API (snake_case) |
|--------------------|------------------|
| `numero` | `numero` |
| `descricao` | `descricao` |
| `cnpjOrgaoGerenciador` | `cnpj_orgao_gerenciador` |
| `nomeOrgaoGerenciador` | `nome_orgao_gerenciador` |
| `dataInicioVigencia` | `data_inicio_vigencia` |
| `dataFimVigencia` | `data_fim_vigencia` |
| `aceitaAdesao` | `aceita_adesao` |
| `renovavel` | `renovavel` |
| `numeroPncp` | `numero_pncp` |
| `anexoUrl` | `anexo_url` |
| `itens[n].numeroItem` | `itens[n].numero_item` |
| `itens[n].descricao` | `itens[n].descricao` |
| `itens[n].unidadeMedida` | `itens[n].unidade_medida` |
| `itens[n].valorEstimado` | `itens[n].valor_estimado` |
| `itens[n].qtdRegistrada` | `itens[n].qtd_registrada` |
| `itens[n].qtdParaCarona` | `itens[n].qtd_para_carona` |
| *(fixo)* `ativo: true` | `ativo` |

### `GET /api/pncp/atas?codigo=` → `DadosAtaPncp`

| API (snake_case) | Domínio (camelCase) |
|-----------------|---------------------|
| `numero_controle_pncp` | `numeroControlePncp` |
| `titulo` | `titulo` |
| `descricao` | `descricao` |
| `orgao_cnpj` | `orgaoCnpj` |
| `orgao_nome` | `orgaoNome` |
| `unidade_nome` | `unidadeNome` |
| `modalidade_licitacao` | `modalidadeLicitacao` |
| `data_assinatura` | `dataAssinatura` |
| `data_inicio_vigencia` | `dataInicioVigencia` |
| `data_fim_vigencia` | `dataFimVigencia` |
| `situacao` | `situacao` |
| `cancelado` | `cancelado` |
| `municipio` | `municipio` |
| `uf` | `uf` |

---

## Estado do Formulário

O componente `CadastrarArp.tsx` gerencia estado interno para o wizard. As adaptações no state local são:

### `DadosArp` (state do componente — atualizado)

```typescript
interface DadosArp {
  modoEntrada: 'automatico' | 'manual';
  codigoPncp: string;            // era: numeroPNCP — alinhado ao parâmetro da API
  cnpjOrgaoGerenciador: string;  // era: cnpjContratante — campo CNPJ dedicado
  nomeOrgaoGerenciador: string;  // era: orgaoGerenciador
  numero: string;                // era: numeroAta
  descricao: string;             // era: objeto
  dataInicioVigencia: string;    // era: vigenciaInicial
  dataFimVigencia: string;       // era: vigenciaFinal
  aceitaAdesao: boolean;
  renovavel: boolean;
  numeroPncp: string | null;     // preenchido após lookup PNCP com numero_controle_pncp
  anexoUrl: string;              // era: File — agora campo de texto (URL)
}
```

### `ItemArp` (state do componente — atualizado)

```typescript
interface ItemArp {
  id: string;             // uuid local para React key (não enviado)
  numeroItem: number;     // NOVO — campo único por item; exibido no formulário
  descricao: string;
  unidadeMedida: string;
  qtdRegistrada: number;  // era: quantidadeRegistrada
  qtdParaCarona: number;  // era: quantidadeCarona
  valorEstimado: number;  // era: valorUnitario
  valorTotal: number;     // calculado (exibição apenas)
  valorPotencialCarona: number; // calculado (exibição apenas)
}
```
