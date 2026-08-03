# Pesquisa: Upload Automático de Anexo ao Cadastrar Ata, Contrato e Empenho

## 1. Rotas de anexo já documentadas na API (l1core)

**Decisão**: Reaproveitar as 3 rotas já existentes e documentadas em `l1core/docs/openapi.yaml`,
sem propor nenhuma rota nova:

| Entidade  | Endpoint                                   | Método | Campo do form-data |
|-----------|---------------------------------------------|--------|---------------------|
| Ata       | `PUT /api/atas/{id}/anexo`                   | PUT    | `anexo` |
| Contrato  | `PUT /api/instrumentos/contratos/{id}/anexo` | PUT    | `anexo` |
| Empenho   | `PUT /api/instrumentos/empenhos/{id}/anexo`  | PUT    | `anexo` |

Cada uma tem também um `DELETE` equivalente (`removerAnexo{Ata,Contrato,Empenho}`), usado pelo
`removerAnexo(id)` mencionado no pedido do usuário (não exercitado pelo fluxo de criação, mas
exposto no repositório para uso futuro pela página de detalhes).

**Contrato de resposta observado no OpenAPI** (idêntico nas 3 rotas):
- `200`: `{ "anexo_url": "https://..." }` — sucesso, retorna URL assinada do arquivo.
- `404`: entidade não encontrada / não pertence ao licitante autenticado.
- `415`: arquivo enviado não é `application/pdf` — corpo `{ error: "formato_invalido", message }`.
- `422`: arquivo ausente, maior que 10 MB, ou conteúdo inválido (não é um PDF real) — corpo
  `{ error: "arquivo_muito_grande" | outro, message }`.
- `503`: falha no storage (GCS indisponível).
- Requer header `X-Licitante-Id` (já injetado automaticamente por `apiFetch`, ver seção 3).

**Rationale**: O limite de 10 MB e o aceite exclusivo de `application/pdf` já estão documentados
na API para as 3 rotas — o cliente deve replicar essa mesma validação antes do envio (fail-fast),
mas a validação de servidor continua sendo a fonte de verdade (por isso o use case trata também os
códigos 415/422/503 retornados pelo repositório, não apenas a validação client-side).

**Alternativas consideradas**: Nenhuma — as rotas já existem prontas na API; não há decisão de
design aqui, apenas leitura do contrato existente.

---

## 2. Padrão a espelhar: upload de foto de perfil

**Decisão**: Seguir exatamente a mesma divisão de responsabilidades já usada em
`features/configuracoes` para foto de perfil:

- `IPerfilRepository.uploadFoto(arquivo: File): Promise<FotoPerfilResult>` — interface no domain.
- `PerfilRepository.uploadFoto` — implementação em `data/repositories`, monta `FormData`, chama
  `apiFetch(url, { method: 'PUT', body: formData })`, mapeia cada status HTTP relevante para uma
  subclasse de erro específica (`FormatoInvalidoError`, `ArquivoMuitoGrandeError`,
  `StorageIndisponivelError`, fallback genérico).
- `UploadFotoPerfilUseCase.execute(arquivo: File)` — valida mimetype/tamanho no cliente (client-side
  fail-fast) **antes** de chamar o repositório, lançando as mesmas subclasses de erro do domain.

**Rationale**: É o único precedente no código para "enviar arquivo após criar/carregar algo", já
citado explicitamente pelo usuário como o padrão a replicar ("mesmo papel do
UploadFotoPerfilUseCase"). Reaproveitar a mesma forma evita inventar uma segunda convenção para o
mesmo problema.

**Alternativas consideradas**: Um "AnexoRepository" genérico cross-feature (rejeitado
explicitamente pelo usuário — cada feature mantém seu próprio repositório, sem acoplamento entre
`atas` e `instrumentos`).

---

## 3. `apiFetch` já suporta `FormData` e injeta o header de licitante

**Decisão**: Nenhuma mudança em `src/shared/infrastructure/apiClient.ts` é necessária.

`apiFetch` (linha 7-15) já detecta `options.body instanceof FormData` e omite o
`Content-Type: application/json` nesse caso (deixando o browser definir o boundary do
multipart automaticamente), e já injeta `x-licitante-id` em todo request quando há um licitante
ativo — satisfazendo o parâmetro `X-Licitante-Id` exigido pelas 3 rotas de anexo.

**Rationale**: Confirmado lendo o arquivo; comportamento idêntico ao já usado por
`PerfilRepository.uploadFoto`.

---

## 4. Destino de navegação após o cadastro: "página de detalhes" não existe hoje no fluxo de criação

**Achado**: Nenhum dos 3 formulários navega hoje para uma página de detalhes
(`ArpDetalhesPage`/`ContratoDetalhesPage`/`NotaEmpenhoDetalhesPage`) ao concluir o cadastro:

- `CadastrarArp.tsx` e `CadastrarContrato.tsx` exibem uma tela `CadastroSucesso` (processando →
  sucesso) cujo botão final ("Ir para gestão") chama `navigate('/atas/gestao')` /
  `navigate('/instrumentos/gestao')` — uma lista de gestão, não os detalhes do registro criado.
- `CadastrarNotaEmpenho.tsx` nem exibe tela de sucesso: no `submit`, se `criarEmpenho` retorna um
  id, chama `navigate('/instrumentos/gestao')` imediatamente, de forma síncrona.

**Decisão**: Interpretar "seguir para a página de detalhes normalmente" (RF-006 da spec) como
"seguir para o mesmo destino pós-cadastro que já existe hoje para o caso de sucesso completo" —
ou seja, o requisito central é **não bloquear nem desviar** o usuário para uma tela de erro total
quando só o anexo falha; o destino em si (hoje a tela/lista de gestão) não muda como parte desta
funcionalidade. Não há requisito explícito do usuário para redirecionar para as páginas de
detalhes reais, e o próprio pedido trata as páginas de detalhes como "sem mudança" — elas
continuam sendo alcançadas pela navegação já existente (lista → clique no registro), não pelo
fluxo de criação.

**Consequência de design**: Para exibir a mensagem distinta de falha parcial de forma consistente
nos 3 formulários, `CadastrarNotaEmpenho.tsx` passa a usar o mesmo padrão de tela
`processando → sucesso` (`CadastroSucesso`) que `CadastrarArp.tsx`/`CadastrarContrato.tsx` já
usam, em vez do `navigate()` imediato atual — é o único lugar onde uma mensagem pode ser
exibida sem interromper a navegação para quem não teve falha nenhuma.

**Rationale**: Minimiza a diferença entre o que a spec pede e o que o código faz hoje, sem expandir
o escopo para uma mudança de rotas que não foi pedida nem listada nas remoções/adições do usuário.

**Alternativas consideradas**:
- Adicionar navegação real para as páginas de detalhes (rejeitada: expande escopo além do pedido,
  que trata as páginas de detalhes como invariantes).
- Manter `CadastrarNotaEmpenho.tsx` com `navigate()` imediato e usar apenas um `Alert` inline antes
  da navegação (rejeitada: o `navigate()` já dispara antes do usuário conseguir ler a mensagem,
  pois é síncrono após o `await`; precisaria da mesma tela de transição que os outros dois já têm).

---

## 5. Sem biblioteca de toast em uso — mensagens seguem o padrão `Alert` já existente

**Achado**: `sonner` está instalado e há um wrapper `shared/components/ui/sonner.tsx`, mas nenhum
componente da aplicação hoje importa `toast` de `sonner` — é um componente shadcn de scaffold,
não conectado a nenhum fluxo.

**Decisão**: A mensagem de falha parcial usa o mesmo padrão `<Alert variant="destructive">` /
`<Alert>` (não destructive, pois não é uma falha total) já usado nas 3 telas para erros de
validação e de criação, exibido junto à tela de sucesso.

**Rationale**: Consistência com o padrão de UI já estabelecido; não introduz uma dependência nova
(`sonner`) para uma única mensagem.

---

## 6. Validação client-side: tipo e tamanho

**Decisão**: `TIPOS_ACEITOS = ['application/pdf']`, `TAMANHO_MAXIMO = 10 * 1024 * 1024` (10 MB) —
replicando os mesmos nomes de constantes de `UploadFotoPerfilUseCase`, com os valores documentados
no OpenAPI para as 3 rotas de anexo (10 MB / apenas PDF, idêntico nas 3).

**Rationale**: Mesmo valor para Ata, Contrato e Empenho — não há divergência no OpenAPI entre as
3 rotas quanto a limite de tamanho ou mimetype aceito.
