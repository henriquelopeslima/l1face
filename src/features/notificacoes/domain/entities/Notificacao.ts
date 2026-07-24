export type TipoOrigemNotificacao = 'instrumento' | 'ata' | 'of' | 'colaborador';

export interface ConteudoNotificacao {
  titulo: string;
  descricao: string;
  cor: string;
}

export interface Notificacao {
  id: string;
  tipoOrigem: TipoOrigemNotificacao;
  entidadeId: string;
  conteudo: ConteudoNotificacao;
  lida: boolean;
  lidaEm: string | null;
  criadaEm: string;
}

export interface ListaNotificacoes {
  itens: Notificacao[];
  total: number;
  paginaAtual: number;
  totalPaginas: number;
}

/**
 * Forma mínima de uma notificação para exibição/clique. Permite reutilizar
 * `NotificacaoItem` e `useAbrirNotificacao` com o `AlertaDashboard` da feature
 * `dashboard`, que representa a mesma notificação com um subconjunto de campos.
 */
export interface NotificacaoClicavel {
  id: string;
  tipoOrigem: TipoOrigemNotificacao;
  entidadeId: string;
  conteudo: ConteudoNotificacao;
  lida: boolean;
}
