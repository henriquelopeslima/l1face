# Quickstart: Validação Manual do Upload Automático de Anexo

Pré-requisito: `l1core` rodando localmente com as rotas `/api/atas/{id}/anexo`,
`/api/instrumentos/contratos/{id}/anexo` e `/api/instrumentos/empenhos/{id}/anexo` disponíveis
(já documentadas em `openapi.yaml`); um licitante ativo selecionado na sessão.

## 1. Cadastro de Ata com anexo enviado com sucesso

1. Acesse `/atas/cadastrar`, preencha os dados obrigatórios da ARP.
2. Na etapa de anexo, selecione um PDF válido (< 10 MB).
3. Confirme o revisar/finalizar — **não deve existir mais nenhum campo de texto de URL**.
4. Esperado: a Ata é criada, o anexo é enviado automaticamente logo em seguida, tela de sucesso
   sem nenhum aviso de falha de anexo.
5. Acesse a listagem de Atas e abra a Ata criada — o link do anexo deve aparecer.

## 2. Cadastro de Contrato/Empenho com anexo

Repetir os passos acima em `/instrumentos/contratos/cadastrar` e
`/instrumentos/empenhos/cadastrar` (ou fluxo equivalente) — o campo de arquivo não deve mais
exibir o tooltip "Em breve!" nem estar desabilitado.

## 3. Cadastro sem selecionar arquivo

1. Repita o cadastro de qualquer uma das 3 entidades sem selecionar nenhum arquivo.
2. Esperado: cadastro concluído normalmente, sem nenhuma tentativa de chamada à rota de anexo
   (verificável pela aba de rede do navegador — nenhuma requisição para `.../anexo`).

## 4. Falha parcial simulada (upload falha após criação bem-sucedida)

Formas de simular sem depender de indisponibilidade real do storage:
- Selecionar um arquivo que passe na validação client-side mas que o servidor rejeite (ex.:
  um `.pdf` renomeado a partir de um arquivo que não é PDF de verdade → 422 `arquivo_muito_grande`
  ou conteúdo inválido).
- Derrubar a conexão de rede logo após o `POST` de criação responder (DevTools → Network →
  Offline) e antes do `PUT` do anexo completar.

Esperado em ambos os casos: o registro aparece na listagem (foi criado), a tela final mostra a
mensagem "registro criado, mas o anexo não foi enviado" (não um erro total), e o usuário não é
mantido preso no formulário.

## 5. Falha na própria criação (sem tentativa de upload)

1. Preencha o formulário com um dado inválido que a API rejeite na criação (ex.: vigência final
   antes da inicial) e um arquivo válido selecionado.
2. Esperado: erro de criação exibido normalmente (comportamento atual, inalterado); nenhuma
   requisição para a rota de anexo deve ocorrer (o registro nunca foi criado).

## 6. Validação client-side (fail-fast antes de qualquer chamada de rede)

1. Tente selecionar um arquivo que não seja PDF, ou um PDF maior que 10 MB.
2. Esperado: aviso imediato no formulário, sem disparar a criação do registro.

## Testes automatizados a rodar

```bash
npm run test -- src/features/atas
npm run test -- src/features/instrumentos
npm run test -- src/features/configuracoes  # regressão do padrão espelhado (não deve quebrar)
```
