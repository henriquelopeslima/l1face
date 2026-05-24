# Pesquisa: Listagem de Atas com API Real

## D-01: Criação da camada de domínio para a feature `atas`

**Decisão**: Criar as camadas `domain/` e `data/` dentro de `src/features/atas/`, completando a Clean Architecture vertical slice da feature.

**Rationale**: A feature `atas` atualmente só possui `presentation/`. Para integrar com a API real seguindo a constituição, é obrigatório ter a separação de responsabilidades em domain/data/presentation. O repositório encapsula a chamada HTTP; o use case orquestra a regra de busca; a camada de apresentação consome apenas o use case via hook customizado.

**Alternativa rejeitada**: Fazer a chamada `apiFetch` diretamente dentro de `ArpGestaoPage` ou em um hook sem o repositório — viola o Princípio I (Clean Architecture) e o Princípio D (Dependency Inversion) da constituição.

---

## D-02: Entidade de domínio `Ata` vs. tipo de API

**Decisão**: Definir uma entidade `Ata` em `domain/entities/ata.ts` com campos em camelCase, independente do formato da API. Um mapper em `data/mappers/atasMappers.ts` converte o formato snake_case da API para a entidade de domínio.

**Rationale**: A entidade de domínio precisa ser agnóstica de infraestrutura. Se a API mudar seus nomes de campos, apenas o mapper muda — o domínio e a apresentação permanecem intactos.

**Alternativa rejeitada**: Usar os tipos da API diretamente na camada de domínio — introduziria acoplamento entre o domínio e o contrato HTTP.

---

## D-03: Status da ata — representação no domínio

**Decisão**: Usar um union type TypeScript `'ATIVA' | 'PROXIMA_AO_VENCIMENTO' | 'ENCERRADA'` na entidade de domínio (espelhando a API). O mapeamento para rótulos de exibição em português (`'Ativa'`, `'Próxima ao Vencimento'`, `'Encerrada'`) é responsabilidade da camada de apresentação.

**Rationale**: Manter o valor canônico da API no domínio facilita comparações lógicas e filtragens. A transformação para texto legível é preocupação de UI, não de negócio.

**Alternativa rejeitada**: Armazenar rótulos em português na entidade de domínio — mistura concerns de domínio e apresentação; dificulta filtragens programáticas.

---

## D-04: Hook customizado `useListarAtas`

**Decisão**: Criar `src/features/atas/presentation/hooks/useListarAtas.ts` que instancia o repositório e o use case, dispara a busca no `useEffect` inicial e expõe `{ atas, isLoading, error, refetch }`.

**Rationale**: Exigência constitucional (Princípio III): toda lógica de estado complexa e `useEffect` deve ser extraída para um hook customizado. A página `ArpGestaoPage` se torna puramente apresentacional, recebendo dados pelo hook.

**Alternativa rejeitada**: Lógica de busca inline em `ArpGestaoPage` — viola o Princípio III da constituição.

---

## D-05: Tratamento de erros de API

**Decisão**: O `AtasRepository` lança `AtaError` (erro de domínio específico da feature) para falhas de rede e respostas de erro da API (401, 403, 404, outros). O hook `useListarAtas` captura o erro e expõe via estado `error: string | null`. A página exibe a mensagem de erro com botão de nova tentativa via função `refetch`.

**Rationale**: Isola o tratamento de erro no repositório, mantém o hook e a página livres de lógica de infraestrutura. Segue o padrão já estabelecido pela feature `auth` com `AuthError`.

**Alternativa rejeitada**: Expor o objeto `Error` diretamente na UI — risco de vazar detalhes de infraestrutura (Princípio IV da constituição).

---

## D-06: Instâncias do repositório e use case

**Decisão**: Instanciar o `AtasRepository` e o `ListarAtasUseCase` dentro do hook `useListarAtas` (mesmo padrão usado em `AuthContext` para `loginUseCase`, `getMeUseCase`, etc.).

**Rationale**: A feature `atas` não tem um contexto global de estado; a busca é disparada na montagem da página. Instanciar no hook é simples e suficiente para o escopo atual.

**Alternativa rejeitada**: Criar um `AtasContext` análogo ao `AuthContext` — sobre-engenharia para uma busca stateless que não precisa ser compartilhada entre múltiplas rotas.
