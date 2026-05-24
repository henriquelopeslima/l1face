# Research: Criar Ata de Registro de Preços

**Branch**: `007-criar-ata` | **Data**: 2026-05-24

## O que já existe

### UI (presentation)
- `src/features/atas/presentation/components/CadastrarArp.tsx` — componente com wizard 3 etapas completo (dados, itens, revisão), 100% mockado
- `src/features/atas/presentation/pages/ArpCadastrarPage.tsx` — página wrapper já com rota ativa
- A navegação e o formulário multi-step já estão implementados visualmente

### Infraestrutura compartilhada
- `src/shared/infrastructure/apiClient.ts` — `apiFetch` injeta `X-Licitante-Id` automaticamente via `activeLicitanteId` (módulo singleton), com `credentials: 'include'` para o cookie JWT

### Domínio / Repositório
- `IAtasRepository` tem `listarAtas()` e `getAta()` apenas
- `AtasRepository` implementa os dois métodos com tratamento de erros HTTP
- `AtaError` como erro de domínio único
- Padrão de use case: classe com `execute()`, sem dependências de framework

## O que está faltando

| Camada | O que criar | Observação |
|--------|-------------|------------|
| `domain/entities` | `CriarAtaInput`, `DadosAtaPncp` | Tipos de entrada e resposta PNCP |
| `domain/repositories` | `criarAta()`, `consultarAtaPncp()` em `IAtasRepository` | Interface de contrato |
| `domain/usecases` | `CriarAtaUseCase` + test, `ConsultarAtaPncpUseCase` + test | Com 100% de cobertura |
| `data/mappers` | `criarAtaMappers.ts`, `pncpMappers.ts` | snake_case → camelCase |
| `data/repositories` | `criarAta()`, `consultarAtaPncp()` em `AtasRepository` | Chamadas à API real |
| `presentation/hooks` | `useCriarAta`, `useConsultarAtaPncp` | Seguindo padrão `useGetAta` |
| `presentation/components` | Atualizar `CadastrarArp.tsx` | Remover mocks, usar hooks reais |

## Decisões técnicas

### Mapeamento do formulário para a API

O componente `CadastrarArp.tsx` usa nomes internos que diferem da API:

| Campo no componente | Campo na API | Observação |
|--------------------|--------------|------------|
| `orgaoGerenciador` (string) | `nome_orgao_gerenciador` + `cnpj_orgao_gerenciador` | Separar CNPJ do nome; adicionar campo CNPJ separado |
| `numeroPNCP` | `codigo` (query param para PNCP) + `numero_pncp` (corpo da ata) | Campo dual-use |
| `numeroAta` | `numero` | Renomear no state |
| `objeto` | `descricao` | Renomear no state |
| `vigenciaInicial` | `data_inicio_vigencia` | Manter formato ISO (input type="date" já usa YYYY-MM-DD) |
| `vigenciaFinal` | `data_fim_vigencia` | Idem |
| `aceitaAdesao` | `aceita_adesao` | Direto |
| `renovavel` | `renovavel` | Direto |
| `anexoArp` (File) | `anexo_url` (string \| null) | **Mudar para campo de URL de texto**; upload de arquivo está fora de escopo |
| Item `id` (uuid local) | não enviado | Gerado internamente apenas para React key |
| Item sem `numero_item` | `numero_item` (integer único) | **Adicionar campo número do item ao formulário** |
| Item `quantidadeRegistrada` | `qtd_registrada` | |
| Item `quantidadeCarona` | `qtd_para_carona` | |
| Item `valorUnitario` | `valor_estimado` | |
| Item `unidadeMedida` | `unidade_medida` | Máx 20 chars |

### PNCP lookup: campo `codigo` vs `numeroPNCP`
- A API `/api/pncp/atas?codigo=` usa o código PNCP formatado (ex: `19876424000142-1-000189/2025-000016`)
- O formulário atual tem `numeroPNCP` como campo livre — manter como campo livre porém renomear o parâmetro de query para `codigo` ao chamar a API
- Após lookup bem-sucedido, o campo `numero_pncp` da criação deve ser preenchido com o `numero_controle_pncp` retornado

### Decisão: `ativo` no POST
- O POST `/api/atas` requer o campo `ativo: boolean`. Por padrão, `ativo: true` ao criar.
- Não expor esse campo na UI — sempre enviar `true` na criação.

### Importação via planilha
- A funcionalidade "Importar via Planilha" (etapa 2) é um mock visual no componente atual.
- **Decisão**: Manter o mock visual existente da planilha sem implementar integração real — está fora do escopo desta feature. O foco é o fluxo manual e a integração PNCP.

### Validações duplicadas (cliente + servidor)
- Validação no cliente: Zod no hook `useCriarAta` ou validação inline no componente
- Erros do servidor 422 devem ser mapeados para mensagens legíveis em português

### Padrão do hook para criação (vs busca)
- `useCriarAta` retorna `{ criarAta, isLoading, error }` — imperativo (não auto-executa)
- `useConsultarAtaPncp` retorna `{ consultar, isLoading, error, dados }` — imperativo (executa sob demanda)
- Seguindo o padrão `useGetAta` para estado e erros, mas sem `useEffect` auto-trigger

## Alternativas consideradas

| Decisão | Alternativa | Rejeitado porque |
|---------|-------------|------------------|
| Atualizar `CadastrarArp.tsx` com hooks reais | Criar novo componente do zero | Componente existente tem UI robusta; refatorar é mais eficiente |
| Manter planilha como mock | Implementar import real | Fora de escopo; aumentaria complexidade sem valor imediato |
| Campo `anexo_url` como texto (URL) | Upload de arquivo real | API aceita URL; upload de arquivo é infraestrutura separada fora de escopo |
| `ativo: true` fixo na criação | Expor na UI | Campo técnico; sempre ativo na criação, simplifica UX |
