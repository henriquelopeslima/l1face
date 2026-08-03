# Contrato de UI: Orquestração Criar → Upload nos 3 formulários

**Onde vive a orquestração**: dentro dos hooks de apresentação já existentes
(`useCriarAta`/`useCriarContrato`/`useCriarEmpenho`), não inline nos componentes de formulário —
por exigência da constituição (Princípio III: "Toda lógica de estado complexa [ou] chamadas de
Use Cases... DEVE ser extraída para um hook customizado... Lógica inline em componentes é proibida
quando ultrapassa estado trivial"). Isso também é o que torna a orquestração testável com
`renderHook`, no mesmo padrão já usado por `useBuscarInstrumento.test.ts` — não há nenhum teste de
componente (`.test.tsx`) em todo o repositório hoje, então introduzir o primeiro só para esta
funcionalidade quebraria a convenção de testes já estabelecida (só Use Cases e hooks têm teste).

Mesmo desenho para os 3 hooks (`useCriarAta`, `useCriarContrato`, `useCriarEmpenho`), cada um
ganhando um segundo parâmetro opcional `arquivo?: File | null` em sua função de criação e um novo
campo `anexoFalhouUpload: boolean` no retorno:

```typescript
// dentro de useCriarAta (mesmo desenho em useCriarContrato/useCriarEmpenho)
const uploadUseCase = new UploadAnexoAtaUseCase(repository);
const [anexoFalhouUpload, setAnexoFalhouUpload] = useState(false);

const criarAta = useCallback(async (input: CriarAtaInput, arquivo?: File | null) => {
  setIsLoading(true);
  setError(null);
  setAnexoFalhouUpload(false);
  try {
    const criado = await criarAtaUseCase.execute(input); // SEM anexoUrl no input
    if (arquivo) {
      try {
        await uploadUseCase.execute(criado.id, arquivo);
      } catch {
        setAnexoFalhouUpload(true); // não interrompe o fluxo — criado ainda é retornado normalmente
      }
    }
    return criado;
  } catch (err) {
    setError(err instanceof AtaError ? err.message : 'Erro ao cadastrar ata. Tente novamente.');
    return null; // erro de criação: comportamento atual inalterado, nenhuma tentativa de upload
  } finally {
    setIsLoading(false);
  }
}, []);

return { criarAta, isLoading, error, anexoFalhouUpload };
```

O componente (`CadastrarArp.tsx`/`CadastrarContrato.tsx`/`CadastrarNotaEmpenho.tsx`) só passa o
`File` local para a função do hook e lê `anexoFalhouUpload` no retorno — nenhuma chamada direta a
Use Case dentro do componente.

## Mensagem distinta (RF-005/RF-006)

Renderizada junto à tela `CadastroSucesso` (ou antes dela, para Empenho, que precisa passar a
usar essa mesma tela — ver research.md #4), condicionada a `anexoFalhouUpload`:

```tsx
{anexoFalhouUpload && (
  <Alert>
    <WarningTriangle className="h-4 w-4" />
    <AlertTitle>Registro criado, mas o anexo não foi enviado</AlertTitle>
    <AlertDescription>
      O cadastro foi concluído normalmente. Não foi possível enviar o anexo — você pode
      reenviá-lo mais tarde pelos detalhes do registro.
    </AlertDescription>
  </Alert>
)}
```

Não é `variant="destructive"` — o cadastro em si teve sucesso; é um aviso, não um erro bloqueante.

## `CadastrarNotaEmpenho.tsx`: adoção do padrão `CadastroSucesso`

Único dos 3 formulários que hoje não usa a tela de transição — precisa ganhar o mesmo
`processandoCadastro`/`cadastroConcluido` + `<CadastroSucesso />` que `CadastrarArp.tsx`/
`CadastrarContrato.tsx` já têm, substituindo o `navigate('/instrumentos/gestao')` síncrono dentro
de `salvar()`. Sem essa mudança, não há como exibir `anexoFalhouUpload` antes de sair da tela.

## Casos de borda cobertos por este contrato

- Nenhum arquivo selecionado → `uploadAnexoXxxUseCase` nunca é chamado; `anexoFalhouUpload`
  permanece `false`; segue direto para o sucesso (RF-009).
- Falha na própria criação (`criado` é `null`/falsy) → função retorna cedo, nenhuma tentativa de
  upload, comportamento de erro atual preservado (RF-007).
- Falha no upload (415/422/503/rede, capturadas pelo `catch` genérico do use case/repositório) →
  `anexoFalhouUpload = true`, mas o fluxo positivo (tela de sucesso) continua (RF-005/RF-006).
