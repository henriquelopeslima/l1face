# Contratos: Componentes de UI Compartilhados

**Feature**: `001-migrate-react-proto`
**Localização**: `src/shared/components/ui/`

Estes contratos definem as props públicas dos componentes de UI genéricos migrados do protótipo. São baseados no padrão shadcn/ui (Radix UI + Tailwind CSS).

## Convenções

- Todos os componentes aceitam `className?: string` para customização via Tailwind
- Props de variante usam `class-variance-authority` (CVA)
- Nenhum componente contém lógica de negócio

---

## Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;   // Renderiza como filho (via Radix Slot)
}
```

---

## Card

```typescript
// Composição: Card > CardHeader > CardTitle / CardDescription / CardContent / CardFooter
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
```

---

## Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

---

## Select

```typescript
// Composição (Radix): Select > SelectTrigger > SelectValue / SelectContent > SelectItem
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}
interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof RadixSelectItem> {}
```

---

## Table

```typescript
// Composição: Table > TableHeader > TableRow > TableHead / TableBody > TableRow > TableCell
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
```

---

## Badge

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

---

## Dialog

```typescript
// Composição: Dialog > DialogTrigger / DialogContent > DialogHeader > DialogTitle / DialogDescription / DialogFooter
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

---

## Form (react-hook-form + shadcn)

```typescript
// Composição: Form > FormField > FormItem > FormLabel / FormControl / FormMessage
interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  render: (props: { field: ControllerRenderProps<T> }) => React.ReactElement;
}
```

---

## Tabs

```typescript
// Composição: Tabs > TabsList > TabsTrigger / TabsContent
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
```

---

## Contratos de Layout

### AppHeader

```typescript
interface AppHeaderProps {
  breadcrumb?: string[];   // Segmentos do breadcrumb atual (ex: ['Instrumentos', 'Gestão'])
}
```

### AppSidebar

Sem props externas. Gerencia internamente estado de colapso e item ativo via `useLocation`.

### MobileBottomNav

Sem props externas. Renderiza apenas em viewports abaixo do breakpoint `lg`.

### SupportChatbot

Sem props externas. Botão flutuante fixo no canto inferior direito de telas autenticadas.

### RootLayout

Sem props externas. Compõe `AppSidebar + AppHeader + <Outlet /> + MobileBottomNav + SupportChatbot`.

### SelecionarVinculoLayout

Sem props externas. Layout simples sem sidebar para a tela de seleção de vínculo.
