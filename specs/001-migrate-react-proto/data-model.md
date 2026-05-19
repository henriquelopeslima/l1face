# Modelo de Dados: Migração do Protótipo React para l1face

**Feature**: `001-migrate-react-proto`
**Data**: 2026-05-18
**Fase**: Mock (sem persistência — dados estáticos em repositórios mock)

## Entidades de Domínio

### InstrumentoContratual

Representa um documento jurídico de contratação pública. Discriminado por `tipo`.

```typescript
// src/features/instrumentos/domain/entities/InstrumentoContratual.ts

export type TipoInstrumentoContratual = 'contrato' | 'nota-empenho' | 'outro';

export type StatusInstrumento =
  | 'em-execucao'
  | 'proximo-vencimento'
  | 'encerrado'
  | 'renovavel';

export interface InstrumentoContratual {
  id: string;
  tipo: TipoInstrumentoContratual;
  numeroInstrumento: string;
  isARP: boolean;                    // nasceu de uma ARP
  orgaoContratante: string;
  secretaria: string;
  objeto: string;
  vigenciaInicio: string;            // ISO date
  vigenciaFim: string;               // ISO date
  prazoEntregaOF?: string;           // apenas nota-empenho: data limite OF mais antiga
  valorGlobal: number;
  saldoAtual: number;
  status: StatusInstrumento;
}
```

**Regras de negócio**:
- `prazoEntregaOF` — exclusivo de `tipo === 'nota-empenho'`; define alerta de prazo crítico
- `status === 'proximo-vencimento'` — calculado: vencimento em ≤ 30 dias
- `isARP === true` — exibe badge especial de ARP na listagem

---

### AtaRegistroPrecos (ARP)

Documento que formaliza os preços registrados após processo licitatório.

```typescript
// src/features/atas/domain/entities/AtaRegistroPrecos.ts

export type StatusArp = 'Ativa' | 'Próxima ao Vencimento' | 'Encerrada';

export interface AtaRegistroPrecos {
  id: string;
  numeroAta: string;
  orgaoGerenciador: string;
  objeto: string;
  vigenciaInicial: string;           // ISO date
  vigenciaFinal: string;             // ISO date
  valorTotalRegistrado: number;
  saldoOrgao: number;
  aceitaAdesao: boolean;
  saldoCarona?: number;              // presente apenas se aceitaAdesao === true
  quantidadeContratos: number;
  renovavel: boolean;
  status: StatusArp;
}
```

**Regras de negócio**:
- `saldoCarona` — presente apenas quando `aceitaAdesao === true`
- `status === 'Próxima ao Vencimento'` — vencimento em ≤ 45 dias
- Uma ARP pode originar múltiplos `InstrumentoContratual` (`isARP === true`)

---

### VinculoInstitucional

Representa o órgão/entidade ao qual o usuário está associado.

```typescript
// src/features/auth/domain/entities/VinculoInstitucional.ts

export interface VinculoInstitucional {
  id: string;
  nome: string;
  cnpj: string;
  tipo: 'orgao-publico' | 'entidade-privada';
}
```

---

### DashboardSummary

Agrega os dados resumidos exibidos no Dashboard.

```typescript
// src/features/dashboard/domain/entities/DashboardSummary.ts

export interface DashboardSummary {
  valorTotalContratado: number;
  valorTotalArps: number;
  instrumentosAtivos: number;
  instrumentosProximosVencimento: number;
  pendenciasFinanceiras: number;
  valorPendenciasFinanceiras: number;
  evolucaoMensal: EvolucaoMensal[];
  statusDistribuicao: StatusDistribuicao[];
  alertas: Alerta[];
}

export interface EvolucaoMensal {
  month: string;                     // 'Jan', 'Fev', etc.
  contratos: number;
  atas: number;
}

export interface StatusDistribuicao {
  name: string;
  value: number;
  color: string;
}

export type SeveridadeAlerta = 'warning' | 'danger' | 'info';

export interface Alerta {
  id: string;
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  linkTo?: string;
}
```

---

## Contratos de Repositório (Interfaces de Domínio)

```typescript
// src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts
export interface IInstrumentosRepository {
  listar(): Promise<InstrumentoContratual[]>;
  buscarPorId(id: string): Promise<InstrumentoContratual | null>;
  cadastrar(dados: Omit<InstrumentoContratual, 'id'>): Promise<InstrumentoContratual>;
}

// src/features/atas/domain/contracts/IAtasRepository.ts
export interface IAtasRepository {
  listar(): Promise<AtaRegistroPrecos[]>;
  buscarPorId(id: string): Promise<AtaRegistroPrecos | null>;
  cadastrar(dados: Omit<AtaRegistroPrecos, 'id'>): Promise<AtaRegistroPrecos>;
}

// src/features/auth/domain/contracts/IAuthRepository.ts
export interface IAuthRepository {
  listarVinculos(): Promise<VinculoInstitucional[]>;
  selecionarVinculo(id: string): Promise<void>;
  getVinculoAtual(): VinculoInstitucional | null;
}

// src/features/dashboard/domain/contracts/IDashboardRepository.ts
export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}
```

---

## Schemas de Validação Zod (Apresentação)

```typescript
// Formulário de Contrato (InstrumentosContratoCadastrarPage)
const contratoSchema = z.object({
  numeroInstrumento: z.string().min(1, 'Número obrigatório'),
  orgaoContratante: z.string().min(1, 'Órgão obrigatório'),
  secretaria: z.string().min(1, 'Secretaria obrigatória'),
  objeto: z.string().min(10, 'Descreva o objeto com ao menos 10 caracteres'),
  vigenciaInicio: z.string().min(1, 'Data de início obrigatória'),
  vigenciaFim: z.string().min(1, 'Data de fim obrigatória'),
  valorGlobal: z.number().positive('Valor deve ser positivo'),
});

// Formulário de ARP (ArpCadastrarPage)
const arpSchema = z.object({
  numeroAta: z.string().min(1, 'Número da ata obrigatório'),
  orgaoGerenciador: z.string().min(1, 'Órgão gerenciador obrigatório'),
  objeto: z.string().min(10, 'Descreva o objeto'),
  vigenciaInicial: z.string().min(1),
  vigenciaFinal: z.string().min(1),
  valorTotalRegistrado: z.number().positive(),
  aceitaAdesao: z.boolean(),
  renovavel: z.boolean(),
});
```

---

## Relacionamentos

```
VinculoInstitucional (1) ──── (N) InstrumentoContratual
AtaRegistroPrecos    (1) ──── (N) InstrumentoContratual [isARP=true]
DashboardSummary         ──── agrega métricas de InstrumentoContratual + AtaRegistroPrecos
```

---

## Mock Data (localização)

Dados mockados residem exclusivamente na camada `data/`:

- `src/features/instrumentos/data/MockInstrumentosRepository.ts` — lista de instrumentos (extraída do `InstrumentosGestao.tsx` do protótipo)
- `src/features/atas/data/MockAtasRepository.ts` — lista de ARPs (extraída do `ArpGestao.tsx` do protótipo)
- `src/features/auth/data/MockAuthRepository.ts` — vínculos institucionais disponíveis
- `src/features/dashboard/data/MockDashboardRepository.ts` — resumo do dashboard (extraído do `Dashboard.tsx` do protótipo)
