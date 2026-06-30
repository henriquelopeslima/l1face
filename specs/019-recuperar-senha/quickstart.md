# Quickstart: Recuperação de Senha

## Visão Geral

Esta feature adiciona o fluxo completo de recuperação de senha ao app. O botão "Esqueceu a senha?"
já existe em `LoginPage.tsx` com um `alert` placeholder — a implementação substitui esse alert
por navegação para uma nova página `/recuperar-senha`.

## Arquivos a Criar

```
src/features/auth/
├── domain/
│   ├── entities/recuperacaoSenha.ts          # Entidade de request
│   └── usecases/
│       ├── RecuperarSenhaUseCase.ts          # Use case
│       └── RecuperarSenhaUseCase.test.ts     # Testes unitários
├── data/
│   └── repositories/AuthRepository.ts        # Adicionar método recuperarSenha()
└── presentation/
    ├── hooks/useRecuperarSenha.ts             # Hook de estado/submit
    └── pages/RecuperarSenhaPage.tsx           # Página da feature
```

## Arquivos a Modificar

```
src/features/auth/domain/repositories/IAuthRepository.ts   # Adicionar recuperarSenha()
src/features/auth/data/repositories/AuthRepository.ts      # Implementar recuperarSenha()
src/features/auth/presentation/pages/LoginPage.tsx          # Trocar alert por navigate()
src/app/routes.tsx                                          # Adicionar rota /recuperar-senha
```

## Fluxo do Usuário

```
LoginPage (/login)
    → clica "Esqueceu a senha?"
    → navega para /recuperar-senha

RecuperarSenhaPage (/recuperar-senha)
    → usuário preenche e-mail
    → validação no frontend (não vazio, formato válido)
    → submit → useRecuperarSenha → RecuperarSenhaUseCase → IAuthRepository
    → exibe mensagem de sucesso genérica
    → link "Voltar ao login" → navega para /login
```

## Convenções do Projeto a Seguir

- Usar `apiFetch` de `@/shared/infrastructure/apiClient` para chamadas HTTP
- Lançar `AuthError` para falhas de conectividade/servidor
- Não lançar erro para resposta 200 (sempre sucesso genérico)
- Validação no frontend antes de chamar o backend (conforme Constituição §IV)
- Use Case com 100% de cobertura de testes unitários (conforme Constituição §V)
- Proibido `any` e `as unknown` (conforme Constituição §II)
