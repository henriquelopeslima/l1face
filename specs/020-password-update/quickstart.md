# Guia Rápido: Implementação de Alteração de Senha

**Tempo estimado de implementação**: 2-4 horas (com testes)  
**Arquivos a criar**: 8  
**Arquivos a modificar**: 1 (SegurancaSection)

## Overview da Arquitetura

```
presentation/AlterarSenhaForm.tsx (UI pura)
    ↓ usa
presentation/hooks/useChangePassword.ts (State + orquestração)
    ↓ chama
domain/usecases/AlterarSenhaUseCase.ts (Regra de negócio)
domain/usecases/ValidarForcaSenhaUseCase.ts (Validação)
    ↓ usa interface
domain/repositories/IChangePasswordRepository.ts
    ↓ implementado por
data/repositories/ChangePasswordRepository.ts (Injeção de dependência)
    ↓ chama
data/datasources/ChangePasswordAPI.ts (HTTP real)
```

---

## Checklist de Implementação

### Fase 1: Domain (Regras de Negócio Puras)

- [ ] Criar `src/features/configuracoes/domain/usecases/ValidarForcaSenhaUseCase.ts`
  - Função: `execute(password: string): ValidationResult`
  - Valida: 8-20 chars, letras, números
  - Retorna: erros estruturados + mensagem amigável
  - **Testável**: Nenhuma dependência externa

- [ ] Criar `src/features/configuracoes/domain/usecases/AlterarSenhaUseCase.ts`
  - Dependência: `IChangePasswordRepository`
  - Função: `execute(req: ChangePasswordRequest): Promise<ChangePasswordResponse>`
  - Valida request antes de chamar repository
  - **Testável**: Mock IChangePasswordRepository

- [ ] Criar `src/features/configuracoes/domain/repositories/IChangePasswordRepository.ts`
  - Interface pura: contrato do que data layer DEVE implementar

- [ ] Criar `src/features/configuracoes/domain/entities/ChangePasswordRequest.ts` e `ChangePasswordResponse.ts`
  - Types/Interfaces TypeScript

### Fase 2: Data (Infraestrutura)

- [ ] Criar `src/features/configuracoes/data/datasources/ChangePasswordAPI.ts`
  - Injeta HTTP client (axios instance)
  - Função: `POST /api/auth/alterar-senha`
  - Trata erros básicos (axios errors)

- [ ] Criar `src/features/configuracoes/data/repositories/ChangePasswordRepository.ts`
  - Implementa `IChangePasswordRepository`
  - Injeta `ChangePasswordAPI`
  - Mapeia DTO → Entity
  - Trata erros HTTP (401, 5xx, timeout)

### Fase 3: Presentation (UI + Hooks)

- [ ] Criar `src/features/configuracoes/presentation/hooks/useChangePassword.ts`
  - State: `formData`, `loading`, `error`, `success`, `validationErrors`
  - Actions: `updateCurrentPassword`, `updateNewPassword`, `submit`, `reset`
  - Valida enquanto digita (onChange)
  - Chama AlterarSenhaUseCase em submit
  - **Testável**: Sem dependência direta de HTTP

- [ ] Criar `src/features/configuracoes/presentation/components/AlterarSenhaForm.tsx`
  - Componente puro: recebe props do hook
  - Renderiza: inputs, botão, mensagens, validação visual
  - Reusa UI components existentes (Input, Button, etc.)

- [ ] Modificar `src/features/configuracoes/presentation/pages/ConfiguracoesPage.tsx`
  - Ou modificar `src/features/configuracoes/presentation/components/SegurancaSection.tsx`
  - Importar `AlterarSenhaForm`
  - Integrar na seção de segurança

### Fase 4: Testes

- [ ] Testes domain: `ValidarForcaSenhaUseCase`
  - Testes para cada validação (length, letters, numbers)
  - Casos limítrofes (7 chars, 21 chars, sem letras, etc.)

- [ ] Testes domain: `AlterarSenhaUseCase`
  - Mock repository, testar chamada

- [ ] Testes presentation: `useChangePassword` hook
  - Mock domain use cases
  - Testar estado inicial, validação, submissão, reset

- [ ] Testes presentation: `AlterarSenhaForm` componente
  - Render com props mock
  - Testar interações (digitar, clicar submit)

---

## Arquivo-por-Arquivo

### 1. ValidarForcaSenhaUseCase.ts

```typescript
export type PasswordValidationError = 'MIN_LENGTH' | 'MAX_LENGTH' | 'NO_LETTERS' | 'NO_NUMBERS';

export interface ValidationResult {
  isValid: boolean;
  errors: PasswordValidationError[];
  message: string;
}

export class ValidarForcaSenhaUseCase {
  execute(password: string): ValidationResult {
    const errors: PasswordValidationError[] = [];

    if (password.length < 8) {
      errors.push('MIN_LENGTH');
    }
    if (password.length > 20) {
      errors.push('MAX_LENGTH');
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('NO_LETTERS');
    }
    if (!/\d/.test(password)) {
      errors.push('NO_NUMBERS');
    }

    const isValid = errors.length === 0;
    const message = this.buildMessage(errors);

    return { isValid, errors, message };
  }

  private buildMessage(errors: PasswordValidationError[]): string {
    if (errors.length === 0) return 'Senha válida';
    // ... construir mensagem amigável baseada em errors
  }
}
```

### 2. AlterarSenhaUseCase.ts

```typescript
export class AlterarSenhaUseCase {
  constructor(
    private repository: IChangePasswordRepository,
    private validarForcaSenha: ValidarForcaSenhaUseCase
  ) {}

  async execute(
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    // Validar força
    const validation = this.validarForcaSenha.execute(request.newPassword);
    if (!validation.isValid) {
      // Retornar erro? Ou deixar submeter e deixar backend validar?
      // Decisão: deixar submeter (backend é autoridade)
    }

    // Chamar repository
    return this.repository.changePassword(request);
  }
}
```

### 3. useChangePassword.ts

```typescript
export function useChangePassword(
  changePasswordUseCase: AlterarSenhaUseCase,
  validarForcaSenhaUseCase: ValidarForcaSenhaUseCase
) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<PasswordValidationError[]>([]);

  // Validar em tempo real
  const handleNewPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, newPassword: value }));
    const result = validarForcaSenhaUseCase.execute(value);
    setValidationErrors(result.errors);
  };

  // Submeter
  const submit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await changePasswordUseCase.execute(formData);
      if (response.success) {
        setSuccess(true);
        setFormData({ currentPassword: '', newPassword: '' });
      } else {
        setError(response.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    success,
    validationErrors,
    updateCurrentPassword: (pwd: string) =>
      setFormData(prev => ({ ...prev, currentPassword: pwd })),
    updateNewPassword: handleNewPasswordChange,
    submit,
    reset: () => {
      setFormData({ currentPassword: '', newPassword: '' });
      setError(null);
      setSuccess(false);
      setValidationErrors([]);
    }
  };
}
```

### 4. AlterarSenhaForm.tsx

```typescript
interface AlterarSenhaFormProps {
  formData: { currentPassword: string; newPassword: string };
  isLoading: boolean;
  error: string | null;
  success: boolean;
  validationErrors: PasswordValidationError[];
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function AlterarSenhaForm({
  formData,
  isLoading,
  error,
  success,
  validationErrors,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSubmit
}: AlterarSenhaFormProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        {success && <Alert type="success">Senha alterada com sucesso!</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Input
          label="Senha Atual"
          type="password"
          value={formData.currentPassword}
          onChange={(e) => onCurrentPasswordChange(e.target.value)}
          disabled={isLoading}
        />

        <Input
          label="Nova Senha"
          type="password"
          value={formData.newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          disabled={isLoading}
        />

        <PasswordStrengthIndicator
          password={formData.newPassword}
          validationErrors={validationErrors}
        />

        <Button
          onClick={onSubmit}
          disabled={isLoading || !formData.currentPassword || !formData.newPassword}
          loading={isLoading}
        >
          Alterar Senha
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Injeção de Dependência

**Opção 1: React Context + Provider** (Recomendado)

```typescript
// configuracoes/presentation/context/ChangePasswordContext.tsx
export const ChangePasswordContext = createContext<{
  changePasswordUseCase: AlterarSenhaUseCase;
  validarForcaSenhaUseCase: ValidarForcaSenhaUseCase;
} | null>(null);

export function ConfiguracoesProvider({ children }: { children: React.ReactNode }) {
  const api = new ChangePasswordAPI(httpClient);
  const repository = new ChangePasswordRepository(api);
  const changePasswordUseCase = new AlterarSenhaUseCase(repository, new ValidarForcaSenhaUseCase());
  const validarForcaSenhaUseCase = new ValidarForcaSenhaUseCase();

  return (
    <ChangePasswordContext.Provider value={{ changePasswordUseCase, validarForcaSenhaUseCase }}>
      {children}
    </ChangePasswordContext.Provider>
  );
}

// Em SegurancaSection.tsx ou ConfiguracoesPage.tsx
function SegurancaSection() {
  const { changePasswordUseCase, validarForcaSenhaUseCase } = useContext(ChangePasswordContext)!;
  const hook = useChangePassword(changePasswordUseCase, validarForcaSenhaUseCase);
  return <AlterarSenhaForm {...hook} />;
}
```

**Opção 2: Factory Function** (Simples)

```typescript
// configuracoes/presentation/hooks/useChangePassword.ts
export function useChangePassword() {
  // Instanciar dentro do hook
  const api = new ChangePasswordAPI(httpClient);
  const repository = new ChangePasswordRepository(api);
  const useCase = new AlterarSenhaUseCase(
    repository,
    new ValidarForcaSenhaUseCase()
  );
  // ... resto do hook
}
```

---

## Testes: Exemplo

### ValidarForcaSenhaUseCase.test.ts

```typescript
describe('ValidarForcaSenhaUseCase', () => {
  const useCase = new ValidarForcaSenhaUseCase();

  it('deve validar senha correta', () => {
    const result = useCase.execute('Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve rejeitar senha muito curta', () => {
    const result = useCase.execute('Pass1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('MIN_LENGTH');
  });

  it('deve rejeitar senha sem números', () => {
    const result = useCase.execute('Password');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('NO_NUMBERS');
  });

  // ... mais testes
});
```

### useChangePassword.test.ts

```typescript
describe('useChangePassword', () => {
  it('deve validar força de senha em tempo real', () => {
    const mockValidarForcaSenha = {
      execute: jest.fn().mockReturnValue({
        isValid: false,
        errors: ['MIN_LENGTH'],
        message: 'Mínimo 8 caracteres'
      })
    };
    const mockChangePassword = {
      execute: jest.fn()
    };

    const { result } = renderHook(() =>
      useChangePassword(mockChangePassword, mockValidarForcaSenha)
    );

    act(() => {
      result.current.updateNewPassword('Pass');
    });

    expect(result.current.validationErrors).toContain('MIN_LENGTH');
  });

  // ... mais testes
});
```

---

## Checklist de Integração Final

- [ ] SegurancaSection importa AlterarSenhaForm
- [ ] Todos os imports de domain/data resolvem sem erros
- [ ] TypeScript compila sem erros (`tsc --noEmit`)
- [ ] Componentes renderizam sem erro
- [ ] Validação em tempo real funciona (onChange)
- [ ] Submissão envia POST correto
- [ ] Erro 400 mostra mensagem apropriada
- [ ] Sucesso mostra toast e limpa form
- [ ] Erro 401 redireciona para login
- [ ] Testes rodam: `npm test`
- [ ] Cobertura ≥ 80% para domain layer

---

## Debug: Checklist Comum

| Problema | Solução |
|----------|---------|
| "Cannot find module" | Verificar imports relativos vs. absolutos. Projeto usa path aliases? |
| Tipo `ChangePasswordRequest` não encontrado | Criar/exportar em `domain/entities/` |
| Hook não valida enquanto digita | Verificar se `updateNewPassword` chama `validarForcaSenhaUseCase.execute` |
| Submissão não funciona | Verificar se useCase.execute() está sendo chamado; mock em testes |
| Estilos quebrados | Reutilizar classes do projeto (ex: `className="space-y-4"` do Tailwind) |
| JWT não enviado | Verificar se httpClient já tem cookie jar configurado |

---

## Próximo: Tasks (Fase 2)

Após plan.md estar pronto, executar:
```bash
/speckit-tasks
```

Isso gerará `tasks.md` com todas as ações granulares (ex: "criar ValidarForcaSenhaUseCase.ts", etc.) ordenadas por dependência.
