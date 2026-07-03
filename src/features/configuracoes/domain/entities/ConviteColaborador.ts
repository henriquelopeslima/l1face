export interface ConviteColaborador {
  id: string;
  email: string;
  nome: string;
  licitanteId: string;
  usuarioJaCadastrado: boolean;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO';
  criadoEm: string;
  expiresAt: string;
}
