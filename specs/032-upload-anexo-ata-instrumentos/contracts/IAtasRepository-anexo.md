# Contrato Interno: `IAtasRepository` estendido com upload/remoção de anexo

```typescript
// src/features/atas/domain/repositories/IAtasRepository.ts
export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;                                    // SEM ALTERAÇÃO
  listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>; // SEM ALTERAÇÃO
  getAta(ataId: string): Promise<AtaDetalhes>;                       // SEM ALTERAÇÃO
  criarAta(input: CriarAtaInput): Promise<AtaCriada>;                // input sem anexoUrl
  consultarAtaPncp(codigo: string): Promise<DadosAtaPncp>;           // SEM ALTERAÇÃO
  uploadAnexo(ataId: string, arquivo: File): Promise<AnexoAtaResult>; // NOVO
  removerAnexo(ataId: string): Promise<void>;                        // NOVO
}
```

## Contrato externo reaproveitado (l1core)

`PUT /api/atas/{id}/anexo` e `DELETE /api/atas/{id}/anexo` — já documentados em
`l1core/docs/openapi.yaml` linhas 2982-3090 (ver research.md #1). Nenhuma rota nova.

## Implementação de `AtasRepository.uploadAnexo` / `removerAnexo`

Mesmo padrão de `PerfilRepository.uploadFoto` (`FormData`, `apiFetch`, mapeamento de status →
subclasse de `AtaError`):

```typescript
async uploadAnexo(ataId: string, arquivo: File): Promise<AnexoAtaResult> {
  const formData = new FormData();
  formData.append('anexo', arquivo);

  let response: Response;
  try {
    response = await apiFetch(`/api/atas/${encodeURIComponent(ataId)}/anexo`, {
      method: 'PUT',
      body: formData,
    });
  } catch {
    throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
  }

  if (response.status === 404) throw new AtaError('Ata não encontrada.');
  if (response.status === 415) throw new FormatoInvalidoAnexoError();
  if (response.status === 422) {
    const data = await response.json() as { error?: string };
    if (data.error === 'arquivo_muito_grande') throw new ArquivoMuitoGrandeAnexoError();
    throw new FormatoInvalidoAnexoError();
  }
  if (response.status === 503) throw new AtaError('Não foi possível armazenar o anexo. Tente novamente.');
  if (!response.ok) throw new AtaError('Erro ao enviar anexo. Tente novamente.');

  const data = (await response.json()) as { anexo_url: string };
  return { anexoUrl: data.anexo_url };
}

async removerAnexo(ataId: string): Promise<void> {
  let response: Response;
  try {
    response = await apiFetch(`/api/atas/${encodeURIComponent(ataId)}/anexo`, { method: 'DELETE' });
  } catch {
    throw new AtaError('Serviço indisponível. Verifique sua conexão e tente novamente.');
  }
  if (response.status === 204) return;
  if (response.status === 404) throw new AtaError('Ata não encontrada.');
  if (!response.ok) throw new AtaError('Erro ao remover anexo. Tente novamente.');
}
```

## `UploadAnexoAtaUseCase` (novo)

```typescript
// src/features/atas/domain/usecases/UploadAnexoAtaUseCase.ts
const TIPOS_ACEITOS = ['application/pdf'];
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export class UploadAnexoAtaUseCase {
  constructor(private readonly repository: IAtasRepository) {}

  async execute(ataId: string, arquivo: File): Promise<AnexoAtaResult> {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) throw new FormatoInvalidoAnexoError();
    if (arquivo.size > TAMANHO_MAXIMO) throw new ArquivoMuitoGrandeAnexoError();
    return this.repository.uploadAnexo(ataId, arquivo);
  }
}
```

Mirror exato de `UploadFotoPerfilUseCase` (validação client-side antes de delegar ao repositório).
