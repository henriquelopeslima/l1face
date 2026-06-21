import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { HalfMoon, SunLight } from 'iconoir-react';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/components/ui/utils';

export function AparenciaSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card id="aparencia" className="scroll-mt-4">
      <CardHeader className="pb-3 lg:pb-6">
        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
          {theme === 'dark' ? (
            <HalfMoon className="h-4 w-4 lg:h-5 lg:w-5" />
          ) : (
            <SunLight className="h-4 w-4 lg:h-5 lg:w-5" />
          )}
          Aparência
        </CardTitle>
        <CardDescription className="text-sm lg:text-base">Personalize a aparência do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 lg:space-y-3">
          <p className="text-sm font-medium">Tema</p>
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            {[
              { value: 'light', icon: SunLight, label: 'Claro', desc: 'Tema claro' },
              { value: 'dark', icon: HalfMoon, label: 'Escuro', desc: 'Tema escuro' },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-lg border-2 transition-all',
                  theme === value
                    ? 'border-[#0050FF] bg-[#EDF4FF] dark:bg-[#0050FF]/10'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <Icon className="h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-sm lg:text-base">{label}</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
