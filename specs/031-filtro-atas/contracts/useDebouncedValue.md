# Contrato Interno: `useDebouncedValue` (novo hook compartilhado)

```typescript
// src/shared/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

Genérico e sem dependência de nenhuma feature — vive em `shared/hooks/` ao lado de `useMobile.ts`.
Usado apenas por `useListagemAtas` (busca textual, RF-008 da spec), mas fica disponível para
qualquer outra tela do projeto que precise da mesma necessidade no futuro (reduz duplicação).
