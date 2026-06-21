# Tarefas: Upload de Foto de Perfil

**Entrada**: Documentos de design em `specs/015-upload-foto-perfil/`  
**Pré-requisitos**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

## Formato: `[ID] [P?] [Story?] Descrição`

- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (US1, US2, US3)

---

## Fase 1: Setup — Infraestrutura Compartilhada

**Propósito**: Ajustes de infraestrutura transversais que habilitam a feature inteira.

- [x] T001 Modificar `src/shared/infrastructure/apiClient.ts` para omitir `Content-Type` quando `body instanceof FormData`, permitindo que o browser defina o boundary do multipart automaticamente
- [x] T002 [P] Estender `src/features/auth/presentation/context/AuthContext.tsx`: adicionar ação `UPDATE_FOTO_PERFIL` ao reducer, adicionar `updateFotoPerfil(url: string | null): void` ao estado e ao valor do contexto, e expô-la na interface `AuthContextValue`

**Checkpoint**: `apiFetch` aceita FormData sem corromper Content-Type; `AuthContext` expõe `updateFotoPerfil`.

---

## Fase 2: Fundação — Domain da Feature Configurações

**Propósito**: Entidades, erros e interface de repositório que DEVEM existir antes de qualquer história de usuário.

⚠️ **CRÍTICO**: Nenhum trabalho de história de usuário pode começar até que esta fase esteja completa.

- [x] T003 [P] Criar `src/features/configuracoes/domain/entities/fotoPerfil.ts` com as interfaces `FotoPerfilUpload` (campo `arquivo: File`) e `FotoPerfilResult` (campo `fotoUrl: string`)
- [x] T004 [P] Criar `src/features/configuracoes/domain/errors/perfilErrors.ts` com as classes `PerfilError` (base), `FormatoInvalidoError`, `ArquivoMuitoGrandeError`, `ArquivoInvalidoError` e `StorageIndisponivelError`
- [x] T005 Criar `src/features/configuracoes/domain/repositories/IPerfilRepository.ts` com interface `IPerfilRepository { uploadFoto(arquivo: File): Promise<FotoPerfilResult>; removerFoto(): Promise<void> }` (depende de T003, T004)

**Checkpoint**: Domínio da feature `configuracoes` definido — entidades, erros e contrato de repositório prontos.

---

## Fase 3: História de Usuário 1 — Enviar Foto de Perfil (Prioridade: P1) 🎯 MVP

**Objetivo**: Usuário clica em "Alterar foto", seleciona JPEG ou PNG válido, foto é enviada e o avatar é atualizado imediatamente em toda a aplicação.

**Teste Independente**: Clicar em "Alterar foto" na tela de Configurações, selecionar uma imagem JPEG/PNG ≤ 5 MB e verificar que o avatar no PerfilSection e no AppHeader é atualizado sem recarregar a página.

### Testes para História de Usuário 1

- [x] T006 [P] [US1] Criar `src/features/configuracoes/domain/useCases/UploadFotoPerfilUseCase.test.ts` cobrindo: arquivo válido retorna `FotoPerfilResult`, `FormatoInvalidoError` para tipo inválido, `ArquivoMuitoGrandeError` para arquivo > 5 MB; usar mock de `IPerfilRepository` (depende de T005)
- [x] T007 [P] [US1] Criar `src/features/configuracoes/domain/useCases/UploadFotoPerfilUseCase.ts`: validar MIME type (`image/jpeg` | `image/png`) e tamanho (≤ 5.242.880 bytes), lançar erros de domínio correspondentes, chamar `repository.uploadFoto` e retornar `FotoPerfilResult` (depende de T005)

### Implementação para História de Usuário 1

- [x] T008 [US1] Criar `src/features/configuracoes/data/repositories/PerfilRepository.ts` implementando `IPerfilRepository.uploadFoto`: montar `FormData` com campo `foto`, chamar `PUT /api/perfil/foto` via `apiFetch`, mapear respostas HTTP (200 → `FotoPerfilResult`, 415 → `FormatoInvalidoError`, 422 → erro específico por `error` field, 503 → `StorageIndisponivelError`) (depende de T001, T005)
- [x] T009 [US1] Criar `src/features/configuracoes/presentation/hooks/useUploadFotoPerfil.ts` orquestrando: estado `isUploading`, instância de `UploadFotoPerfilUseCase` com `PerfilRepository`, chamada a `updateFotoPerfil` do `AuthContext` após upload bem-sucedido, retornar `{ isUploading, handleUpload }` (depende de T002, T007, T008)
- [x] T010 [US1] Atualizar `src/features/configuracoes/presentation/components/PerfilSection.tsx`: adicionar `<input type="file" accept="image/jpeg,image/png" />` oculto referenciado por `useRef`, conectar botão "Alterar foto" ao hook `useUploadFotoPerfil`, desabilitar botão e exibir spinner durante `isUploading`, exibir toast/mensagem de sucesso após upload (depende de T009)

**Checkpoint**: Usuário pode trocar a foto de perfil e o avatar atualiza em tempo real no PerfilSection e no AppHeader.

---

## Fase 4: História de Usuário 2 — Rejeição de Arquivo Inválido (Prioridade: P2)

**Objetivo**: Arquivos com formato errado ou acima de 5 MB são rejeitados com mensagem de erro clara; a foto atual permanece inalterada.

**Teste Independente**: Selecionar um arquivo PDF, GIF ou > 5 MB e verificar que a mensagem de erro adequada é exibida e o avatar não muda.

### Implementação para História de Usuário 2

- [x] T011 [US2] Atualizar `src/features/configuracoes/presentation/hooks/useUploadFotoPerfil.ts`: adicionar validação client-side de MIME type e tamanho antes de chamar o use case, adicionar estado `error: string | null`, retornar `error` e `clearError` no valor do hook (depende de T009)
- [x] T012 [US2] Atualizar `src/features/configuracoes/presentation/components/PerfilSection.tsx`: exibir mensagem de erro quando `error` estiver presente (inline abaixo do botão ou via toast), limpar erro ao selecionar novo arquivo (depende de T010, T011)

**Checkpoint**: Envio de arquivo inválido exibe mensagem de erro e não altera a foto atual.

---

## Fase 5: História de Usuário 3 — Remover Foto de Perfil (Prioridade: P3)

**Objetivo**: Usuário com foto de perfil pode removê-la; o avatar volta a exibir suas iniciais.

**Teste Independente**: Com foto de perfil ativa, clicar em "Remover foto", confirmar e verificar que o avatar exibe as iniciais. Verificar que o botão de remoção não aparece para usuários sem foto.

### Testes para História de Usuário 3

- [x] T013 [P] [US3] Criar `src/features/configuracoes/domain/useCases/RemoverFotoPerfilUseCase.test.ts` cobrindo: remoção bem-sucedida (repositório chamado, sem erro), propagação de `PerfilError` em falha de rede (depende de T005)
- [x] T014 [P] [US3] Criar `src/features/configuracoes/domain/useCases/RemoverFotoPerfilUseCase.ts`: chamar `repository.removerFoto()` sem validações adicionais (depende de T005)

### Implementação para História de Usuário 3

- [x] T015 [US3] Adicionar método `removerFoto` em `src/features/configuracoes/data/repositories/PerfilRepository.ts`: chamar `DELETE /api/perfil/foto` via `apiFetch`, tratar 204 como sucesso, 401 como erro de autenticação, outros como `PerfilError` genérico (depende de T008)
- [x] T016 [US3] Atualizar `src/features/configuracoes/presentation/hooks/useUploadFotoPerfil.ts`: adicionar instância de `RemoverFotoPerfilUseCase`, função `handleRemover` que chama o use case e executa `updateFotoPerfil(null)` após sucesso, estado `isRemoving` (depende de T009, T014)
- [x] T017 [US3] Atualizar `src/features/configuracoes/presentation/components/PerfilSection.tsx`: exibir botão "Remover foto" apenas quando `user?.fotoPerfil` estiver presente, adicionar diálogo de confirmação antes de chamar `handleRemover`, exibir spinner durante `isRemoving` (depende de T010, T016)

**Checkpoint**: Remoção de foto funciona corretamente; botão de remoção aparece/some conforme a existência de foto.

---

## Fase 6: Polimento & Aspectos Transversais

**Propósito**: Qualidade de código e verificação final.

- [x] T018 [P] Verificar ausência de `any` e `as unknown` em todos os arquivos criados/modificados nesta feature
- [x] T019 Executar suite de testes (`vitest run`) e confirmar que `UploadFotoPerfilUseCase.test.ts` e `RemoverFotoPerfilUseCase.test.ts` passam

---

## Dependências & Ordem de Execução

### Dependências entre Fases

- **Setup (Fase 1)**: T001 e T002 são independentes entre si (paralelos)
- **Fundação (Fase 2)**: T003 e T004 são paralelos; T005 depende de T003 + T004 — **bloqueia todas as histórias**
- **US1 (Fase 3)**: T006 e T007 são paralelos; T008 depende de T001 + T005; T009 depende de T002 + T007 + T008; T010 depende de T009
- **US2 (Fase 4)**: T011 depende de T009; T012 depende de T010 + T011
- **US3 (Fase 5)**: T013 e T014 são paralelos (dependem de T005); T015 depende de T008; T016 depende de T009 + T014; T017 depende de T010 + T016
- **Polimento (Fase 6)**: depende de todas as fases anteriores desejadas

### Dependências entre Histórias de Usuário

- **US1 (P1)**: sem dependências de outras histórias — MVP independente
- **US2 (P2)**: estende o hook e o componente de US1 — deve vir após US1
- **US3 (P3)**: estende o hook e o componente de US1 — pode ser feita em paralelo com US2

---

## Oportunidades de Paralelismo

### Fase 1 (paralelo)
```
T001 — apiClient.ts
T002 — AuthContext.tsx
```

### Fase 2 (parcialmente paralelo)
```
T003 — fotoPerfil.ts          ┐ paralelos
T004 — perfilErrors.ts        ┘
T005 — IPerfilRepository.ts   (após T003 + T004)
```

### Fase 3 (parcialmente paralelo)
```
T006 — UploadFotoPerfilUseCase.test.ts  ┐ paralelos (ambos dependem de T005)
T007 — UploadFotoPerfilUseCase.ts       ┘
T008 — PerfilRepository.ts  (após T001 + T005)
T009 — useUploadFotoPerfil.ts (após T002 + T007 + T008)
T010 — PerfilSection.tsx (após T009)
```

### Fase 5 (parcialmente paralelo)
```
T013 — RemoverFotoPerfilUseCase.test.ts  ┐ paralelos (dependem de T005)
T014 — RemoverFotoPerfilUseCase.ts       ┘
T015 — PerfilRepository.ts (removerFoto) (após T008)
```

---

## Estratégia de Implementação

### MVP First (apenas US1 — Fases 1, 2, 3)

1. Concluir Fase 1: Setup (T001, T002)
2. Concluir Fase 2: Fundação (T003 → T004 → T005)
3. Concluir Fase 3: US1 (T006/T007 → T008 → T009 → T010)
4. **PARAR e VALIDAR**: trocar foto e verificar avatar atualizado no header e na tela

### Entrega Incremental

1. Setup + Fundação → infraestrutura pronta
2. US1 → MVP funcional (trocar foto) — validar e fazer demo
3. US2 → mensagens de erro para arquivos inválidos — validar
4. US3 → remoção de foto — validar

### Notas

- Tarefas [P] = arquivos distintos, sem dependências entre si
- Cada fase encerra com um checkpoint verificável sem recarregar a página
- Após T019, executar o app e validar o fluxo completo manualmente
