# Quickstart: Criar Ata de Registro de Preços

**Branch**: `007-criar-ata` | **Data**: 2026-05-24

## Fluxo de integração

### Fluxo 1: Criação manual de ata

```
ArpCadastrarPage
  └── CadastrarArp (componente)
        ├── Step 1: Formulário de dados da ata
        │   ├── [Opcional] Buscar PNCP
        │   │   └── useConsultarAtaPncp.consultar(codigo)
        │   │         └── ConsultarAtaPncpUseCase.execute(codigo)
        │   │               └── IAtasRepository.consultarAtaPncp(codigo)
        │   │                     └── GET /api/pncp/atas?codigo={codigo}
        │   └── Preencher campos manuais
        ├── Step 2: Gerenciar itens da ata
        │   └── Adicionar / editar / remover itens (local state)
        ├── Step 3: Revisão e confirmação
        │   └── Botão "Finalizar Cadastro"
        │         └── useCriarAta.criarAta(CriarAtaInput)
        │               └── CriarAtaUseCase.execute(input)
        │                     └── IAtasRepository.criarAta(input)
        │                           └── POST /api/atas
        │                                 → AtaDetalhes (201)
        └── navigate('/atas/gestao') após sucesso
```

### Fluxo 2: Pré-preenchimento via PNCP

1. Usuário digita código PNCP no campo "Código PNCP"
2. Clica "Buscar" → `useConsultarAtaPncp.consultar(codigoPncp)`
3. Retorno `DadosAtaPncp` preenche campos: `nomeOrgaoGerenciador`, `cnpjOrgaoGerenciador`, `descricao`, `dataInicioVigencia`, `dataFimVigencia`, `numeroPncp`
4. Campos ficam em `readOnly` no modo automático
5. Usuário pode alternar para "modo manual" para editar os campos pré-preenchidos

## Dependências entre artefatos

```
CriarAtaInput (domain/entities) ←── CriarAtaUseCase (domain/usecases)
                                         ↑
DadosAtaPncp (domain/entities)  ←── ConsultarAtaPncpUseCase (domain/usecases)
                                         ↑
IAtasRepository (domain/repositories) ← atualizado com criarAta + consultarAtaPncp
                                         ↑
AtasRepository (data/repositories) ← implementação concreta
     ↑                    ↑
criarAtaMappers.ts     pncpMappers.ts
     ↑                    ↑
useCriarAta.ts     useConsultarAtaPncp.ts
     ↑                    ↑
CadastrarArp.tsx (presentation/components) ← usa ambos os hooks
```

## Guia de testes

### Use Case (unitário)

```typescript
// CriarAtaUseCase.test.ts
const input: CriarAtaInput = {
  numero: '001/2026',
  descricao: 'AQUISIÇÃO DE MATERIAL',
  cnpjOrgaoGerenciador: '00360305000104',
  nomeOrgaoGerenciador: 'Ministério da Fazenda',
  dataInicioVigencia: '2026-01-01',
  dataFimVigencia: '2026-12-31',
  aceitaAdesao: false,
  renovavel: false,
  numeroPncp: null,
  anexoUrl: null,
  itens: [{ numeroItem: 1, descricao: 'Item', unidadeMedida: 'UN', valorEstimado: 1.5, qtdRegistrada: 100, qtdParaCarona: 0 }],
};
```

### Cenários de teste obrigatórios para `CriarAtaUseCase`

- ✅ Cria ata com sucesso e retorna `AtaDetalhes`
- ✅ Propaga `AtaError` para 401 (sessão expirada)
- ✅ Propaga `AtaError` para 403 (acesso negado)
- ✅ Propaga `AtaError` para 422 (dados inválidos)
- ✅ Propaga `AtaError` para falha de rede

### Cenários de teste obrigatórios para `ConsultarAtaPncpUseCase`

- ✅ Retorna `DadosAtaPncp` para código válido
- ✅ Propaga `AtaError` para 404 (não encontrado)
- ✅ Propaga `AtaError` para 422 (resultado ambíguo)
- ✅ Propaga `AtaError` para 503 (PNCP indisponível)
- ✅ Propaga `AtaError` para falha de rede
