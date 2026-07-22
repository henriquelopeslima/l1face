# API Contracts: Dashboard com Dados Reais

## GET /api/dashboard

**Descrição**: Retorna, numa única resposta, todos os dados da tela inicial (dashboard) do licitante ativo: os 4 indicadores, a evolução mensal dos últimos 6 meses, a distribuição de instrumentos por status e as 5 notificações mais recentes do usuário autenticado.
**Autenticação**: Cookie HttpOnly `BEARER`.
**Autorização**: Qualquer usuário autenticado com vínculo ativo ao licitante informado (Administrador ou Colaborador).

### Request

```
GET /api/dashboard
X-Licitante-Id: <uuid>
```

| Parâmetro       | Local  | Tipo   | Obrigatório | Descrição                                         |
|------------------|--------|--------|--------------|-----------------------------------------------------|
| X-Licitante-Id   | header | UUID   | Sim          | Injetado automaticamente por `apiFetch` a partir do licitante ativo em sessão — nenhum código da feature precisa montá-lo manualmente |

### Response 200

```json
{
  "cards": {
    "valorTotalContratado": { "valor": 1000000.00, "variacaoPercentualMesAnterior": 12.5 },
    "valorTotalAtas": { "valor": 359112.10, "variacaoPercentualMesAnterior": 8.2 },
    "instrumentosAtivos": { "quantidade": 56, "proximosAoVencimento": 8 },
    "pendenciasFinanceiras": { "valor": 125450.00, "quantidadeAguardandoProcessamento": 5 }
  },
  "evolucaoMensal": [
    { "mes": "2026-02", "contratos": 3800000.00, "atas": 1800000.00 },
    { "mes": "2026-03", "contratos": 5100000.00, "atas": 2100000.00 },
    { "mes": "2026-04", "contratos": 4600000.00, "atas": 1900000.00 },
    { "mes": "2026-05", "contratos": 5800000.00, "atas": 2400000.00 },
    { "mes": "2026-06", "contratos": 6200000.00, "atas": 2800000.00 },
    { "mes": "2026-07", "contratos": 4200000.00, "atas": 1500000.00 }
  ],
  "statusInstrumentos": [
    { "status": "ATIVA", "quantidade": 45 },
    { "status": "PROXIMA_AO_VENCIMENTO", "quantidade": 8 },
    { "status": "ENCERRADA", "quantidade": 3 }
  ],
  "alertas": [
    {
      "id": "c1d2e3f4-a5b6-7890-cdef-123456789abd",
      "tipoOrigem": "instrumento",
      "entidadeId": "550e8400-e29b-41d4-a716-446655440001",
      "conteudo": {
        "titulo": "Contrato 042/2024 — Merenda Escolar",
        "descricao": "Vence em 12 dias",
        "cor": "#F39C12"
      },
      "lida": false,
      "lidaEm": null,
      "criadaEm": "2026-07-20T14:00:00+00:00"
    }
  ]
}
```

### Caso especial: licitante sem dados

Licitante sem nenhum dado cadastrado recebe a mesma estrutura (200), com todos os indicadores zerados, `evolucaoMensal` com 6 pontos zerados, `statusInstrumentos` e `alertas` como arrays vazios. Isso **não** é um erro — RF-007/CS-003 exigem que a tela renderize normalmente.

### Respostas de Erro

| Status | Causa                                              | Mensagem para o usuário                                                        |
|--------|-----------------------------------------------------|------------------------------------------------------------------------------------|
| 400    | Header `X-Licitante-Id` ausente                      | "Não foi possível identificar a empresa ativa. Atualize a página e tente novamente." |
| 401    | Token ausente, inválido ou expirado                  | (redireciona para `/login`, mesmo padrão de `InstrumentosRepository`/`UsuarioLicitanteRepository`) |
| 403    | Usuário sem vínculo com o licitante informado        | "Você não tem acesso aos dados desta empresa."                                     |
| 404    | Licitante não encontrado                             | "Não foi possível localizar a empresa. Atualize a página e tente novamente."       |
| 5xx / falha de rede | Erro de servidor ou indisponibilidade  | "Não foi possível carregar os dados da tela inicial. Tente novamente."             |

### Endpoints relacionados fora do escopo desta implementação

- `GET /api/notificacoes` — mesma forma de item (`NotificacaoResponse`) usada em `alertas`, mas não é chamado por esta feature; o campo `alertas` de `GET /api/dashboard` já entrega os 5 mais recentes prontos.
- Qualquer endpoint de marcação de notificação como lida — não existe ação de leitura na tela inicial nesta versão (ver Premissas da `spec.md`).
