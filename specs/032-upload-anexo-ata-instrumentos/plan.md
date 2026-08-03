# Plano de Implementação: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho

**Branch**: `032-upload-anexo-ata-instrumentos` | **Data**: 2026-08-03 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificação da funcionalidade em `/specs/032-upload-anexo-ata-instrumentos/spec.md`

## Resumo

Hoje, `CriarAtaInput`/`CriarContratoInput`/`CriarEmpenhoInput` aceitam um `anexoUrl` de texto
(no caso da Ata, digitado manualmente; em Contrato/Empenho, um campo já pensado para `File` mas
desabilitado com "Em breve!"). As 3 rotas de anexo (`PUT /api/{atas|instrumentos/contratos|
instrumentos/empenhos}/{id}/anexo`, multipart, PDF ≤10 MB) já existem e são documentadas no
OpenAPI, mas nenhum dos 3 formulários as consome. Esta funcionalidade remove `anexoUrl` da entrada
de criação, habilita/cria o campo de seleção de arquivo nos 3 formulários, e encadeia
Criar→Upload: após a criação bem-sucedida, dispara automaticamente o upload do arquivo
selecionado usando o id retornado, tratando falha do upload como falha parcial (o registro já
criado não é perdido; mensagem distinta; segue o fluxo normal) em vez de erro total. A camada
nova (`uploadAnexo`/`removerAnexo` no repositório de cada feature + `UploadAnexo{Ata,Contrato,
Empenho}UseCase`) espelha exatamente o padrão já usado por `UploadFotoPerfilUseCase`/
`PerfilRepository` em `configuracoes`.

## Contexto Técnico

**Linguagem/Versão**: TypeScript ~6.0.2, React 19.2.6
**Dependências Principais**: Nenhuma dependência nova — reaproveita `apiFetch` (já suporta
`FormData`, ver research.md #3) e o padrão de componentes shadcn/ui (`Input type="file"`, `Alert`,
`Tooltip`) já presentes nos 3 formulários.
**Armazenamento**: N/A — o arquivo vive apenas como `File` em estado local do formulário até o
upload; o armazenamento real (GCS) é responsabilidade do backend (`l1core`), fora do escopo deste
plano.
**Testes**: Vitest, seguindo o padrão já usado para `UploadFotoPerfilUseCase.test.ts` (use cases de
upload) e para `CriarAtaUseCase.test.ts`/`GetAtaUseCase.test.ts`/`BuscarInstrumentoUseCase.test.ts`
(ajuste mecânico de fixtures que hoje setam `anexoUrl: null` na entrada — ver data-model.md).
**Plataforma Alvo**: SPA web responsiva, 3 páginas de cadastro já existentes (`/atas/cadastrar`,
cadastro de Contrato e de Empenho em `instrumentos`).
**Tipo de Projeto**: Projeto único frontend (`l1face`), sem alteração de backend — as 3 rotas de
anexo já existem e estão documentadas em `l1core/docs/openapi.yaml` (ver research.md #1).
**Restrições**: `AtaDetalhes.anexoUrl`/`InstrumentoDetalhe.anexoUrl` e a exibição condicional do
link nas páginas de detalhes (`ArpDetalhesPage`, `ContratoDetalhesPage`, `NotaEmpenhoDetalhesPage`)
não mudam (RF-008). Nenhuma navegação nova para páginas de detalhes é introduzida a partir do
fluxo de criação — o destino pós-cadastro continua sendo o mesmo de hoje (telas/listas de gestão);
ver research.md #4 para a justificativa dessa leitura de "seguir para a página de detalhes
normalmente" da spec. Validação de mimetype/tamanho no cliente (PDF, ≤10 MB) é fail-fast antes de
qualquer chamada de rede, mas não substitui a validação do servidor — os códigos 415/422/503
retornados pelas 3 rotas continuam sendo tratados no repositório.
**Escala/Scope**: 2 features estendidas (`atas`, `instrumentos`) — 3 entidades de input alteradas,
2 repositórios estendidos (4 métodos novos: `uploadAnexo`/`removerAnexo` em `AtasRepository`;
`uploadAnexoContrato`/`removerAnexoContrato`/`uploadAnexoEmpenho`/`removerAnexoEmpenho` em
`InstrumentosRepository`), 3 use cases novos de upload, 3 componentes de formulário modificados
(um deles — `CadastrarNotaEmpenho.tsx` — ganha a tela de transição `CadastroSucesso` que hoje não
tem, para poder exibir a mensagem de falha parcial sem interromper a navegação).

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificar após o design da Fase 1.*

| Princípio | Avaliação | Justificativa |
|-----------|-----------|----------------|
| I. Arquitetura e Estrutura de Pastas | PASS | Toda mudança vive dentro de `src/features/atas` e `src/features/instrumentos` já existentes (domain/data/presentation). Nenhum repositório genérico cross-feature é criado (explicitamente rejeitado pelo usuário) — `uploadAnexo`/`removerAnexo` são métodos adicionados a `IAtasRepository`/`IInstrumentosRepository`, cada um na sua própria feature. `domain` continua sem importar de `data`/`presentation`. |
| II. SOLID e TypeScript | PASS | Remoção de `anexoUrl` dos 3 Inputs é uma mudança aditiva/de contrato já esperada pelos consumidores (mappers atualizados no mesmo commit). Os 3 novos Use Cases (`UploadAnexoAtaUseCase`/`UploadAnexoContratoUseCase`/`UploadAnexoEmpenhoUseCase`) têm responsabilidade única (validar + delegar), mirror exato de `UploadFotoPerfilUseCase` (Interface Segregation — cada um só depende do método do repositório que usa). Sem `any`/`as unknown`; erros são subclasses tipadas (`FormatoInvalidoAnexoError`/`ArquivoMuitoGrandeAnexoError`), não strings soltas. |
| III. Boas Práticas React | PASS | Toda a lógica de orquestração criar→upload e o estado `anexoFalhouUpload` ficam dentro dos componentes de formulário já responsáveis por chamar os hooks `useCriar{Ata,Contrato,Empenho}` (mesma camada que já orquestra `finalizarCadastro`/`salvar` hoje) — nenhuma lógica de negócio migra para dentro de componentes puros. `CadastrarNotaEmpenho.tsx` ganha o mesmo padrão de tela de transição que os outros 2 formulários já usam, em vez de inventar um terceiro padrão. |
| IV. Segurança | PASS | Upload via `FormData`/`apiFetch` (cookie `HttpOnly` já centralizado, sem token em `localStorage`). Validação de mimetype/tamanho ocorre na camada `domain` (Use Case) antes de qualquer chamada de rede — consistente com "Validação na Borda", aplicada tanto no cliente quanto (já hoje) no servidor. Nenhum dado de erro de infraestrutura (stack trace) é exposto — mensagens de erro são strings amigáveis mapeadas a partir do `error`/`message` retornado pela API. |
| V. Testes e Qualidade | PASS | Os 3 novos Use Cases recebem testes unitários puros (100% de cobertura, mirror de `UploadFotoPerfilUseCase.test.ts`); fixtures existentes que setam `anexoUrl: null` são ajustadas mecanicamente (sem novo assert dependente do valor). A orquestração criar→upload nos 3 componentes recebe testes de comportamento (sucesso completo, sem arquivo, falha de criação, falha parcial de upload). |

Nenhuma violação identificada — Rastreamento de Complexidade não se aplica.

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/032-upload-anexo-ata-instrumentos/
├── plan.md              # Este arquivo (saída do comando /speckit-plan)
├── research.md          # Saída da Fase 0
├── data-model.md        # Saída da Fase 1
├── quickstart.md        # Saída da Fase 1
├── contracts/           # Saída da Fase 1
│   ├── IAtasRepository-anexo.md
│   ├── IInstrumentosRepository-anexo.md
│   └── orquestracao-criar-upload.md
└── tasks.md             # Saída da Fase 2 (/speckit-tasks — não criado por este comando)
```

### Código-Fonte (raiz do repositório)

```text
src/
└── features/
    ├── atas/
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   ├── criarAta.ts                 # MODIFICADO: remove anexoUrl de CriarAtaInput
    │   │   │   └── anexoAta.ts                 # NOVO: AnexoAtaResult
    │   │   ├── errors/ataErrors.ts             # MODIFICADO: + FormatoInvalidoAnexoError, ArquivoMuitoGrandeAnexoError
    │   │   ├── repositories/IAtasRepository.ts # MODIFICADO: + uploadAnexo, removerAnexo
    │   │   └── usecases/
    │   │       ├── CriarAtaUseCase.ts          # SEM ALTERAÇÃO
    │   │       └── UploadAnexoAtaUseCase.ts    # NOVO
    │   ├── data/
    │   │   ├── mappers/criarAtaMappers.ts      # MODIFICADO: remove anexo_url do request
    │   │   └── repositories/AtasRepository.ts  # MODIFICADO: + uploadAnexo, removerAnexo
    │   └── presentation/
    │       ├── hooks/useCriarAta.ts            # MODIFICADO: orquestra criar→upload, expõe anexoFalhouUpload
    │       └── components/CadastrarArp.tsx     # MODIFICADO: remove input de URL; novo input de File; passa arquivo ao hook
    │
    └── instrumentos/
        ├── domain/
        │   ├── entities/
        │   │   ├── criarContrato.ts                  # MODIFICADO: remove anexoUrl de CriarContratoInput/CriarEmpenhoInput
        │   │   └── anexoInstrumento.ts                # NOVO: AnexoInstrumentoResult
        │   ├── errors/instrumentosErrors.ts           # NOVO: InstrumentosError (exportada), FormatoInvalidoAnexoError, ArquivoMuitoGrandeAnexoError
        │   ├── contracts/IInstrumentosRepository.ts   # MODIFICADO: + upload/removerAnexo{Contrato,Empenho}
        │   └── useCases/
        │       ├── CriarContratoUseCase.ts             # SEM ALTERAÇÃO
        │       ├── CriarEmpenhoUseCase.ts               # SEM ALTERAÇÃO
        │       ├── UploadAnexoContratoUseCase.ts        # NOVO
        │       └── UploadAnexoEmpenhoUseCase.ts         # NOVO
        ├── data/
        │   ├── mappers/criarContratoMappers.ts          # MODIFICADO: remove anexo_url do request
        │   ├── mappers/criarEmpenhoMappers.ts           # MODIFICADO: remove anexo_url do request
        │   └── repositories/InstrumentosRepository.ts   # MODIFICADO: + upload/removerAnexo{Contrato,Empenho}; InstrumentosError passa a ser exportada
        └── presentation/
            ├── hooks/useCriarContrato.ts                 # MODIFICADO: orquestra criar→upload, expõe anexoFalhouUpload
            ├── hooks/useCriarEmpenho.ts                  # MODIFICADO: orquestra criar→upload, expõe anexoFalhouUpload
            └── components/
                ├── CadastrarContrato.tsx                  # MODIFICADO: remove disabled/tooltip do input de File; passa arquivo ao hook
                └── CadastrarNotaEmpenho.tsx                # MODIFICADO: remove disabled/tooltip; ganha tela CadastroSucesso; passa arquivo ao hook
```

**Decisão de Estrutura**: Projeto único (frontend `l1face`); extensão pontual das 2 features já
existentes (`atas`, `instrumentos`), sem criar feature nova nem repositório genérico cross-feature
(explicitamente fora de escopo por pedido do usuário). Nenhum arquivo de `configuracoes` é
modificado — é apenas a referência de padrão a espelhar (research.md #2), não uma dependência de
código.

## Rastreamento de Complexidade

*Sem violações a justificar — tabela omitida.*
