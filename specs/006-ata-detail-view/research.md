# Research: Visualizar Detalhes de Ata

**Branch**: `006-ata-detail-view` | **Fase**: 0 (Research)

## Decisões Técnicas

### 1. Endpoint da API
- **Decisão**: `GET /api/atas?id={ataId}` com header `X-Licitante-Id` (injetado automaticamente pelo `apiFetch`)
- **Rationale**: O usuário especificou explicitamente "id da ata na query", o `apiFetch` já gerencia o header automaticamente via estado do módulo em `src/shared/infrastructure/apiClient.ts`
- **Alternativa rejeitada**: `GET /api/atas/{id}` (path param) — contradiz a especificação do usuário

### 2. Modelo de Dados
- **Decisão**: Criar entidade separada `AtaDetalhes` + `ItemAta` em `domain/entities/`
- **Rationale**: A resposta detalhada da API (`AtaResponse`) possui campos extras ausentes na listagem (`itens[]`, `cnpj_orgao_gerenciador`, `nome_orgao_gerenciador`, `numero_pncp`, `anexo_url`) e é um contrato diferente. Reutilizar `Ata` exigiria tornê-la opcional/parcial de forma insegura.
- **Alternativa rejeitada**: Estender a interface `Ata` existente com campos opcionais — polui o modelo de listagem e força type guards desnecessários

### 3. Estratégia de Integração
- **Decisão**: Adicionar método `getAta(ataId: string): Promise<AtaDetalhes>` ao `IAtasRepository` e implementar em `AtasRepository`
- **Rationale**: Segue o padrão já estabelecido por `listarAtas()`. O Use Case `GetAtaUseCase` manterá a separação de responsabilidades exigida pela constituição.
- **Alternativa rejeitada**: Criar repositório separado `AtaDetalhesRepository` — complexidade desnecessária para um único método adicional

### 4. Atualização do ArpDetalhesPage
- **Decisão**: Substituir o bloco de mock data por `useGetAta(id)` e adaptar a exibição de campos ao modelo `AtaDetalhes`
- **Rationale**: A página já está estruturada (Tabs, tabela de itens, header com botões) — a mudança é de dados hardcoded para dados reais, mantendo a UI existente que o time já validou
- **Impacto**: A aba "Contratos Gerados" continuará estática por ora (sem endpoint de contratos no escopo desta feature)

## Estado Atual do Código

| Artefato | Estado |
|----------|--------|
| `ArpDetalhesPage` | Existe, dados mockados |
| Rota `/atas/:id` | Registrada em `routes.tsx` |
| Botão "Abrir Detalhes Completos" em `ArpGestaoPage` | Existente, funcional |
| `IAtasRepository.getAta()` | Não existe |
| `AtasRepository.getAta()` | Não existe |
| `GetAtaUseCase` | Não existe |
| `useGetAta` hook | Não existe |
| Entidade `AtaDetalhes` | Não existe |
| Entidade `ItemAta` | Não existe |
| Mapper `mapApiAtaDetalhesToAtaDetalhes` | Não existe |
