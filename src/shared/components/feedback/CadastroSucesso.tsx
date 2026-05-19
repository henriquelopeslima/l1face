import { CheckCircle, Page } from 'iconoir-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';

type CadastroSucessoProps = {
  processando: boolean;
  progresso: number;
  titulo: string;
  descricao: string;
  tituloSucesso: string;
  descricaoSucesso: string;
  etapaAtual: string;
  onConcluir: () => void;
};

const etapasProcessamento = [
  { limite: 20, label: 'Validando arquivo e campos obrigatórios' },
  { limite: 60, label: 'Estruturando dados do cadastro' },
  { limite: 100, label: 'Finalizando e preparando visualização' },
];

export function CadastroSucesso({
  processando,
  progresso,
  titulo,
  descricao,
  tituloSucesso,
  descricaoSucesso,
  etapaAtual,
  onConcluir,
}: CadastroSucessoProps) {
  const isEtapaConcluida = (limite: number) => progresso >= limite;

  return (
    <Card>
      <CardContent className="p-6 lg:p-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            {processando ? (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Page className="h-7 w-7 text-primary" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle className="h-11 w-11 text-success" />
              </div>
            )}

            <h2 className="text-2xl lg:text-3xl font-medium">
              {processando ? titulo : tituloSucesso}
            </h2>
            <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
              {processando ? descricao : descricaoSucesso}
            </p>
          </div>

          {processando ? (
            <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4 lg:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{etapaAtual}</span>
                  <span className="text-primary font-semibold">{Math.round(progresso)}%</span>
                </div>
                <Progress value={progresso} className="h-2.5" />
              </div>

              <div className="space-y-3">
                {etapasProcessamento.map((etapa) => (
                  <div key={etapa.label} className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        isEtapaConcluida(etapa.limite) ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                    <p
                      className={`text-sm transition-colors ${
                        isEtapaConcluida(etapa.limite) ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {etapa.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-2">
              <Button onClick={onConcluir} size="lg" className="min-w-56">
                Ir para gestão
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
