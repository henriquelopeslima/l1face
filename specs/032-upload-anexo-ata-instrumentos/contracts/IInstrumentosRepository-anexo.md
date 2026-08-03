# Contrato Interno: `IInstrumentosRepository` estendido com upload/remoção de anexo (Contrato e Empenho)

```typescript
// src/features/instrumentos/domain/contracts/IInstrumentosRepository.ts
export interface IInstrumentosRepository {
  consultarContratoPncp(codigo: string): Promise<DadosContratoPncp>;      // SEM ALTERAÇÃO
  listarInstrumentos(params?: ListarInstrumentosParams): Promise<ListaInstrumentos>; // SEM ALTERAÇÃO
  criarContrato(input: CriarContratoInput): Promise<string>;              // input sem anexoUrl
  criarEmpenho(input: CriarEmpenhoInput): Promise<string>;                // input sem anexoUrl
  buscarInstrumento(id: string): Promise<InstrumentoDetalhe>;             // SEM ALTERAÇÃO
  listarOrdensFornecimento(instrumentoId: string): Promise<ListagemOrdensFornecimento>; // SEM ALTERAÇÃO
  emitirOrdemFornecimento(...): Promise<OrdemFornecimento>;               // SEM ALTERAÇÃO
  // ...demais métodos de OF inalterados
  uploadAnexoContrato(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult>; // NOVO
  removerAnexoContrato(instrumentoId: string): Promise<void>;                                 // NOVO
  uploadAnexoEmpenho(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult>;   // NOVO
  removerAnexoEmpenho(instrumentoId: string): Promise<void>;                                  // NOVO
}
```

Métodos separados para Contrato e Empenho (em vez de um único `uploadAnexo(tipo, id, arquivo)`)
porque as rotas da API já são distintas por tipo de instrumento (ver abaixo) e os 2 use cases
(`UploadAnexoContratoUseCase`/`UploadAnexoEmpenhoUseCase`) pedidos pelo usuário também são
distintos — mantém a interface espelhando 1:1 o que cada use case chama.

## Contrato externo reaproveitado (l1core)

- `PUT|DELETE /api/instrumentos/contratos/{id}/anexo` — `l1core/docs/openapi.yaml` linhas
  3340-3430 (`id` = **id do Instrumento**, não do Contrato — o mesmo id retornado por
  `criarContrato`).
- `PUT|DELETE /api/instrumentos/empenhos/{id}/anexo` — linhas 3595-3690 (`id` = id do Instrumento
  retornado por `criarEmpenho`).

Mesmo contrato de resposta que a rota de Ata (ver `IAtasRepository-anexo.md`): `200` com
`anexo_url`, `404`, `415`, `422` (`arquivo_muito_grande` | outro), `503`.

## Implementação em `InstrumentosRepository`

Mesmo padrão de `AtasRepository.uploadAnexo`, reaproveitando a classe `InstrumentosError` já
existente no arquivo (hoje privada — passa a ser exportada) e 2 novas subclasses
(`FormatoInvalidoAnexoError`, `ArquivoMuitoGrandeAnexoError`) em um novo arquivo
`src/features/instrumentos/domain/errors/instrumentosErrors.ts`:

```typescript
async uploadAnexoContrato(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult> {
  return this.uploadAnexo(`/api/instrumentos/contratos/${instrumentoId}/anexo`, arquivo);
}
async uploadAnexoEmpenho(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult> {
  return this.uploadAnexo(`/api/instrumentos/empenhos/${instrumentoId}/anexo`, arquivo);
}
private async uploadAnexo(url: string, arquivo: File): Promise<AnexoInstrumentoResult> {
  const formData = new FormData();
  formData.append('anexo', arquivo);
  let response: Response;
  try {
    response = await apiFetch(url, { method: 'PUT', body: formData });
  } catch {
    throw new InstrumentosError('Serviço indisponível. Verifique sua conexão e tente novamente.');
  }
  if (response.status === 404) throw new InstrumentosError('Instrumento não encontrado.');
  if (response.status === 415) throw new FormatoInvalidoAnexoError();
  if (response.status === 422) {
    const data = await response.json() as { error?: string };
    if (data.error === 'arquivo_muito_grande') throw new ArquivoMuitoGrandeAnexoError();
    throw new FormatoInvalidoAnexoError();
  }
  if (response.status === 503) throw new InstrumentosError('Não foi possível armazenar o anexo. Tente novamente.');
  if (!response.ok) throw new InstrumentosError('Erro ao enviar anexo. Tente novamente.');
  const data = (await response.json()) as { anexo_url: string };
  return { anexoUrl: data.anexo_url };
}
// removerAnexoContrato/removerAnexoEmpenho seguem o mesmo padrão de AtasRepository.removerAnexo,
// com a URL correspondente e DELETE.
```

(`uploadAnexo` privado só existe para não duplicar o corpo entre Contrato/Empenho dentro do mesmo
`InstrumentosRepository` — não é exposto na interface pública `IInstrumentosRepository`.)

## `UploadAnexoContratoUseCase` / `UploadAnexoEmpenhoUseCase` (novos)

Mesmas constantes e mesma forma de `UploadAnexoAtaUseCase` (`application/pdf`, 10 MB), um arquivo
por use case:

```typescript
// src/features/instrumentos/domain/useCases/UploadAnexoContratoUseCase.ts
export class UploadAnexoContratoUseCase {
  constructor(private readonly repository: IInstrumentosRepository) {}
  async execute(instrumentoId: string, arquivo: File): Promise<AnexoInstrumentoResult> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) throw new FormatoInvalidoAnexoError();
    if (arquivo.size > TAMANHO_MAXIMO) throw new ArquivoMuitoGrandeAnexoError();
    return this.repository.uploadAnexoContrato(instrumentoId, arquivo);
  }
}
// UploadAnexoEmpenhoUseCase idêntico, chamando repository.uploadAnexoEmpenho
```
