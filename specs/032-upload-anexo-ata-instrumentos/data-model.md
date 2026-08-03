# Modelo de Dados: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho

## Entidades modificadas

### `CriarAtaInput` (`src/features/atas/domain/entities/criarAta.ts`)

- Remove o campo `anexoUrl: string | null`.
- Demais campos inalterados.

### `CriarContratoInput` (`src/features/instrumentos/domain/entities/criarContrato.ts`)

- Remove o campo `anexoUrl?: string | null`.
- Demais campos inalterados.

### `CriarEmpenhoInput` (`src/features/instrumentos/domain/entities/criarContrato.ts`)

- Remove o campo `anexoUrl?: string | null`.
- Demais campos inalterados.

*(`AtaDetalhes.anexoUrl`, `InstrumentoDetalhe.anexoUrl` — usados pelas páginas de detalhes — não
são alterados; continuam vindo da API como `anexo_url` via `GET`.)*

## Entidades novas

### `AnexoResult` (um tipo por feature, mesmo shape; mirror de `FotoPerfilResult`)

```ts
// src/features/atas/domain/entities/anexoAta.ts
export interface AnexoAtaResult {
  anexoUrl: string;
}

// src/features/instrumentos/domain/entities/anexoInstrumento.ts
export interface AnexoInstrumentoResult {
  anexoUrl: string;
}
```

Dois tipos (não um único compartilhado) porque cada feature já mantém suas próprias entidades sem
importar de outra feature (Princípio I da constituição — isolamento por Vertical Slice); Contrato e
Empenho, ambos dentro de `instrumentos`, compartilham o mesmo tipo `AnexoInstrumentoResult`.

## Erros novos

Seguindo o padrão de `perfilErrors.ts` (uma classe base por feature + subclasses por caso),
adicionados a `ataErrors.ts` (Ata) e a um novo `instrumentosErrors.ts` (Contrato/Empenho — hoje a
classe `InstrumentosError` é privada ao arquivo `InstrumentosRepository.ts`, sem arquivo próprio;
esta funcionalidade extrai/reaproveita a mesma classe já existente, exportando-a, em vez de criar
uma segunda classe de erro para o mesmo domínio):

```ts
// ataErrors.ts — adiciona:
export class FormatoInvalidoAnexoError extends AtaError {
  constructor() { super('Apenas arquivos PDF são aceitos.'); this.name = 'FormatoInvalidoAnexoError'; }
}
export class ArquivoMuitoGrandeAnexoError extends AtaError {
  constructor() { super('O arquivo excede o limite de 10 MB.'); this.name = 'ArquivoMuitoGrandeAnexoError'; }
}

// InstrumentosRepository.ts — InstrumentosError passa a ser exportada e reaproveitada
// pelos 2 novos use cases de upload (Contrato e Empenho), com as mesmas 2 subclasses acima
// (renomeadas para o domínio de instrumentos, mesma mensagem).
```

## Estado local dos formulários (presentation)

| Formulário | Campo removido | Campo de arquivo |
|---|---|---|
| `CadastrarArp.tsx` | `dadosArp.anexoUrl: string` (state + input texto + exibição na revisão) | Novo `arquivoAnexo: File \| null` |
| `CadastrarContrato.tsx` | `dadosContrato.anexoContrato?: File` permanece — apenas habilitado (remove `disabled`/`Tooltip`) | Já existe |
| `CadastrarNotaEmpenho.tsx` | — | `anexo: File \| null` já existe — apenas habilitado |

O resultado parcial (`anexoFalhouUpload: boolean`) não é estado do componente — é devolvido pelo
hook de criação (`useCriarAta`/`useCriarContrato`/`useCriarEmpenho`), que passa a orquestrar
criar→upload internamente (ver `contracts/orquestracao-criar-upload.md`). O componente só lê esse
campo do retorno do hook para condicionar a mensagem (RF-005/RF-006).

## Fluxo de orquestração (dentro do hook `useCriar{Ata,Contrato,Empenho}`, mesmo desenho nos 3)

```
criar{Ata,Contrato,Empenho}(input, arquivo?):
  1. criado = await Criar{Ata,Contrato,Empenho}UseCase.execute(inputSemAnexo)
  2. se criado falhar -> mantém comportamento atual (seta `error`, retorna null; componente exibe
     Alert de erro e permanece no formulário — nenhuma tentativa de upload)
  3. se criado ok e nenhum arquivo selecionado -> retorna `criado`, `anexoFalhouUpload` = false
  4. se criado ok e arquivo selecionado:
       try: await UploadAnexo{Ata,Contrato,Empenho}UseCase.execute(criado.id, arquivo)
            -> retorna `criado`, `anexoFalhouUpload` = false
       catch: `anexoFalhouUpload` = true -> AINDA retorna `criado` normalmente (não lança)
  5. componente sempre segue para a mesma tela de sucesso quando `criado` não é null, exibindo a
     mensagem adicional apenas se `anexoFalhouUpload` for true
```
