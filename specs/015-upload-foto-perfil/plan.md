# Plano de Implementação: Upload de Foto de Perfil

**Branch**: `015-upload-foto-perfil` | **Data**: 2026-06-21 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da funcionalidade em `specs/015-upload-foto-perfil/spec.md`

## Resumo

Permitir que o usuário autenticado envie, substitua e remova sua foto de perfil a partir da tela de Configurações > Meu Perfil. O upload é feito via `PUT /api/perfil/foto` (multipart/form-data). Após o envio, o avatar é atualizado globalmente (header + seção de perfil) de forma reativa sem recarregar a página.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5 (strict)  
**Dependências Principais**: React 18, React Router, Tailwind CSS, shadcn/ui, iconoir-react  
**Armazenamento**: N/A (imagens armazenadas no Cloudflare R2, gerenciado pela API)  
**Testes**: Vitest + React Testing Library  
**Plataforma Alvo**: SPA Web (navegadores modernos)  
**Tipo de Projeto**: web-app (frontend SPA consumindo API REST)  
**Metas de Performance**: Upload responsivo — feedback visual imediato ao usuário  
**Restrições**: Sem `any` ou `as unknown`; sem tokens em localStorage; validação na camada de apresentação  
**Escala/Scope**: Funcionalidade por usuário autenticado, uma foto por conta

## Verificação de Constituição

*GATE: Deve passar antes da pesquisa da Fase 0. Reverificado após design da Fase 1.*

| Princípio | Status | Observação |
|-----------|--------|------------|
| I. Vertical Slices — `domain/data/presentation` em `configuracoes` | ✅ | Estrutura seguida |
| I. `domain` não importa `data` ou `presentation` | ✅ | Use Cases só dependem de `IPerfilRepository` |
| I. `presentation` acessa `domain` via Use Cases/contratos | ✅ | Hook chama use case; repositório injetado |
| II. Sem `any` / `as unknown` | ✅ | Tipagem explícita em todos os artefatos |
| II. SOLID — SRP por componente/hook | ✅ | `useUploadFotoPerfil` separa estado de UI; `PerfilSection` só renderiza |
| III. Lógica de estado em hook customizado | ✅ | `useUploadFotoPerfil.ts` encapsula estado de upload/remoção |
| IV. Validação na borda | ✅ | MIME type e tamanho validados no hook antes de chamar use case |
| IV. Sem localStorage para dados sensíveis | ✅ | URL de foto não é dado sensível; não armazenada localmente |
| V. Use Cases com 100% de cobertura | ✅ | `.test.ts` obrigatório para `UploadFotoPerfilUseCase` e `RemoverFotoPerfilUseCase` |

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/015-upload-foto-perfil/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 ✅
├── data-model.md        # Fase 1 ✅
└── tasks.md             # Fase 2 (gerado por /speckit-tasks)
```

### Código-Fonte

```text
src/
├── shared/
│   └── infrastructure/
│       └── apiClient.ts                            # MODIFICAR: omitir Content-Type para FormData
│
└── features/
    ├── auth/
    │   └── presentation/
    │       └── context/
    │           └── AuthContext.tsx                 # MODIFICAR: ação UPDATE_FOTO_PERFIL + updateFotoPerfil()
    │
    └── configuracoes/
        ├── domain/
        │   ├── entities/
        │   │   └── fotoPerfil.ts                   # CRIAR: FotoPerfilUpload, FotoPerfilResult
        │   ├── errors/
        │   │   └── perfilErrors.ts                 # CRIAR: PerfilError, FormatoInvalidoError, etc.
        │   ├── repositories/
        │   │   └── IPerfilRepository.ts            # CRIAR: interface uploadFoto / removerFoto
        │   └── useCases/
        │       ├── UploadFotoPerfilUseCase.ts       # CRIAR
        │       ├── UploadFotoPerfilUseCase.test.ts  # CRIAR
        │       ├── RemoverFotoPerfilUseCase.ts      # CRIAR
        │       └── RemoverFotoPerfilUseCase.test.ts # CRIAR
        ├── data/
        │   └── repositories/
        │       └── PerfilRepository.ts             # CRIAR: implementa IPerfilRepository
        └── presentation/
            ├── hooks/
            │   └── useUploadFotoPerfil.ts          # CRIAR: estado + orquestra use cases + updateFotoPerfil
            └── components/
                └── PerfilSection.tsx               # MODIFICAR: conectar botão ao hook + exibir estados
```

**Decisão de Estrutura**: Projeto único com Vertical Slices. A feature `configuracoes` recebe sua camada `domain/data` completa. Dependência cruzada com `auth` é feita exclusivamente via `AuthContext` (React Context), sem importação direta de módulos internos de `auth`.

## Decisões de Design (resumo da pesquisa)

Veja [research.md](./research.md) para detalhes completos.

1. **apiFetch + FormData**: Modificar `apiClient.ts` para omitir `Content-Type` quando `body instanceof FormData`, permitindo que o browser defina o boundary automaticamente.

2. **Atualização reativa**: Nova ação `UPDATE_FOTO_PERFIL` no reducer do `AuthContext` + função `updateFotoPerfil(url)` exposta no contexto. Evita re-fetch desnecessário de `/api/me`.

3. **Validação client-side**: MIME type e tamanho validados no hook antes de chamar o use case, retornando mensagens de erro sem viagem à API.

4. **URL assinada (1h)**: Usada diretamente como `src` do avatar. Renovação automática é escopo futuro.

## Rastreamento de Complexidade

Nenhuma violação da constituição identificada.
