import { RefreshDouble, WarningTriangle } from 'iconoir-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Breadcrumb } from '@/shared/components/ui/breadcrumb';
import { LoadingLogo } from '@/shared/components/feedback/LoadingLogo';
import type { NotificacaoClicavel } from '../../domain/entities/Notificacao';
import { FiltroNotificacoes } from '../components/FiltroNotificacoes';
import { NotificacaoItem } from '../components/NotificacaoItem';
import { useAbrirNotificacao } from '../hooks/useAbrirNotificacao';
import { useListagemNotificacoes } from '../hooks/useListagemNotificacoes';

export function NotificacoesListagemPage() {
  const {
    gruposPorPeriodo,
    filtroLeitura,
    filtroOrigem,
    temNotificacoes,
    temMaisPaginas,
    isLoading,
    error,
    carregarMais,
    definirFiltroLeitura,
    definirFiltroOrigem,
    marcarComoLidaLocal,
    marcarTodasComoLidas,
  } = useListagemNotificacoes();
  const abrirNotificacao = useAbrirNotificacao();

  const handleClickNotificacao = (notificacao: NotificacaoClicavel) => {
    marcarComoLidaLocal(notificacao.id);
    void abrirNotificacao(notificacao);
  };

  const temAlgumGrupo = gruposPorPeriodo.length > 0;
  const carregandoInicial = isLoading && !temNotificacoes;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Breadcrumb items={[{ label: 'Página inicial', href: '/' }, { label: 'Notificações' }]} />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl lg:text-3xl">Notificações</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Veja todo o seu histórico de notificações
          </p>
        </div>
        {temNotificacoes && (
          <Button variant="outline" size="sm" onClick={() => void marcarTodasComoLidas()}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {temNotificacoes && (
        <FiltroNotificacoes
          filtroLeitura={filtroLeitura}
          onChangeFiltroLeitura={definirFiltroLeitura}
          filtroOrigem={filtroOrigem}
          onChangeFiltroOrigem={definirFiltroOrigem}
        />
      )}

      {carregandoInicial && (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingLogo />
        </div>
      )}

      {!carregandoInicial && error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <WarningTriangle className="h-8 w-8 text-[var(--danger)]" />
              <p className="text-[var(--danger)]">{error}</p>
              <Button variant="outline" onClick={carregarMais}>
                <RefreshDouble className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!carregandoInicial && !error && !temNotificacoes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">Você ainda não tem notificações.</p>
          </CardContent>
        </Card>
      )}

      {!carregandoInicial && !error && temNotificacoes && !temAlgumGrupo && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma notificação para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {!error &&
        gruposPorPeriodo.map((grupo) => (
          <Card key={grupo.titulo}>
            <CardHeader className="pb-3 lg:pb-4">
              <CardTitle className="text-base lg:text-lg">{grupo.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {grupo.itens.map((notificacao) => (
                <div key={notificacao.id} className="rounded-lg border border-border overflow-hidden">
                  <NotificacaoItem notificacao={notificacao} onClick={handleClickNotificacao} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

      {!error && temMaisPaginas && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={carregarMais} disabled={isLoading}>
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  );
}
