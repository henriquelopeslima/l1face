# Modelo de Dados: Listagem de Atas com API Real

## Entidade de Domínio: `Ata`

**Arquivo**: `src/features/atas/domain/entities/ata.ts`

| Campo            | Tipo                                                    | Descrição                                         |
|------------------|---------------------------------------------------------|---------------------------------------------------|
| `id`             | `string` (UUID)                                         | Identificador único da ata                        |
| `numero`         | `string`                                                | Número identificador da ata (ex.: "001/2026")     |
| `objeto`         | `string`                                                | Descrição/objeto da ata                           |
| `orgaoGerenciador` | `{ nome: string; cnpj: string }`                    | Dados do órgão público gerenciador                |
| `vigenciaInicial` | `string` (ISO date)                                    | Data de início da vigência (YYYY-MM-DD)           |
| `vigenciaFinal`  | `string` (ISO date)                                     | Data de fim da vigência (YYYY-MM-DD)              |
| `valorRegistrado` | `number`                                               | Soma de (qtd × valor unitário) de todos os itens  |
| `saldo`          | `number`                                                | Saldo disponível (0 por enquanto — impl. futura)  |
| `contratos`      | `number`                                                | Contratos vinculados (0 por enquanto — impl. futura) |
| `status`         | `'ATIVA' \| 'PROXIMA_AO_VENCIMENTO' \| 'ENCERRADA'`   | Status calculado pelo servidor                    |
| `aceitaAdesao`   | `boolean`                                               | Indica se aceita adesão externa (carona)          |
| `renovavel`      | `boolean`                                               | Indica se a ata é renovável                       |

### Regras de validação (respeitadas pelo mapper)

- `vigenciaFinal` deve ser posterior a `vigenciaInicial` (garantido pelo servidor — não revalidado no cliente)
- `valorRegistrado` e `saldo` são números não negativos
- `status` é sempre um dos três valores do union type

---

## Tipo de Erro de Domínio: `AtaError`

**Arquivo**: `src/features/atas/domain/errors/ataErrors.ts`

Erro lançado pelo `AtasRepository` e propagado pelo `ListarAtasUseCase`. Encapsula mensagens em português, prontas para exibição ao usuário.

```
AtaError extends Error
  - message: string  ← mensagem em português pronta para UI
```

---

## Tipo da Resposta da API: `ApiAtaListagemResponse`

**Arquivo**: `src/features/atas/data/mappers/atasMappers.ts` (definido inline como tipo privado ao mapper)

Representa o formato snake_case retornado pelo endpoint `GET /api/atas`. Nunca exposto além da camada `data/`.

| Campo da API          | Tipo           |
|-----------------------|----------------|
| `id`                  | `string`       |
| `numero`              | `string`       |
| `objeto`              | `string`       |
| `orgao_gerenciador`   | `{ nome: string; cnpj: string }` |
| `vigencia_inicial`    | `string`       |
| `vigencia_final`      | `string`       |
| `valor_registrado`    | `number`       |
| `saldo`               | `number`       |
| `contratos`           | `number`       |
| `status`              | `string`       |
| `aceita_adesao`       | `boolean`      |
| `renovavel`           | `boolean`      |

---

## Mapeamento API → Domínio

**Função**: `mapApiAtaToAta(raw: ApiAtaListagemResponse): Ata`

| Campo da API             | Campo da Entidade            |
|--------------------------|------------------------------|
| `raw.id`                 | `id`                         |
| `raw.numero`             | `numero`                     |
| `raw.objeto`             | `objeto`                     |
| `raw.orgao_gerenciador`  | `orgaoGerenciador`           |
| `raw.vigencia_inicial`   | `vigenciaInicial`            |
| `raw.vigencia_final`     | `vigenciaFinal`              |
| `raw.valor_registrado`   | `valorRegistrado`            |
| `raw.saldo`              | `saldo`                      |
| `raw.contratos`          | `contratos`                  |
| `raw.status`             | `status` (cast para union type) |
| `raw.aceita_adesao`      | `aceitaAdesao`               |
| `raw.renovavel`          | `renovavel`                  |

---

## Mapeamento Status → Rótulo de Exibição

Responsabilidade da **camada de apresentação** (em `ArpGestaoPage` ou utilitário de apresentação):

| Valor do domínio        | Rótulo exibido           | Badge variant  |
|-------------------------|--------------------------|----------------|
| `'ATIVA'`               | `'Ativa'`                | `success`      |
| `'PROXIMA_AO_VENCIMENTO'` | `'Próxima ao Vencimento'` | `warning`   |
| `'ENCERRADA'`           | `'Encerrada'`            | `outline`      |
