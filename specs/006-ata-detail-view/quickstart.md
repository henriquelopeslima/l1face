# Quickstart: Visualizar Detalhes de Ata

## O que foi planejado

Integrar `ArpDetalhesPage` com a API real, substituindo os dados mockados. A página e a rota já existem — a mudança é exclusivamente na camada de dados e no consumo no componente.

## Estrutura de Arquivos

```text
src/features/atas/
├── domain/
│   ├── entities/
│   │   ├── ata.ts                          (existente — sem alteração)
│   │   └── ataDetalhes.ts                  (NOVO — AtaDetalhes + ItemAta)
│   ├── errors/
│   │   └── ataErrors.ts                    (existente — sem alteração)
│   ├── repositories/
│   │   └── IAtasRepository.ts              (ATUALIZAR — adicionar getAta())
│   └── usecases/
│       ├── ListarAtasUseCase.ts            (existente — sem alteração)
│       ├── GetAtaUseCase.ts                (NOVO)
│       └── GetAtaUseCase.test.ts           (NOVO — cobertura 100%)
│
├── data/
│   ├── mappers/
│   │   ├── atasMappers.ts                  (existente — sem alteração)
│   │   └── ataDetalhesMappers.ts           (NOVO — mappers para AtaDetalhes e ItemAta)
│   └── repositories/
│       └── AtasRepository.ts               (ATUALIZAR — implementar getAta())
│
└── presentation/
    ├── hooks/
    │   ├── useListarAtas.ts                (existente — sem alteração)
    │   └── useGetAta.ts                    (NOVO)
    └── pages/
        └── ArpDetalhesPage.tsx             (ATUALIZAR — usar useGetAta em vez de mock)
```

## Ordem de Implementação

1. `domain/entities/ataDetalhes.ts` — definir `ItemAta` e `AtaDetalhes`
2. `domain/repositories/IAtasRepository.ts` — adicionar `getAta(ataId: string): Promise<AtaDetalhes>`
3. `domain/usecases/GetAtaUseCase.ts` + `GetAtaUseCase.test.ts`
4. `data/mappers/ataDetalhesMappers.ts`
5. `data/repositories/AtasRepository.ts` — implementar `getAta()`
6. `presentation/hooks/useGetAta.ts`
7. `presentation/pages/ArpDetalhesPage.tsx` — substituir mock por `useGetAta`

## Verificação Rápida

```bash
# Testes unitários
npm run test

# Build sem erros de tipo
npm run build

# Dev server
npm run dev
# Navegar: /atas/gestao → clicar em uma ata → expandir → "Abrir Detalhes Completos"
```
