export interface UsuarioLicitante {
  id: string;
  userId: string;
  nomeCompleto: string;
  email: string;
  licitanteId: string;
  papel: 'ADMIN' | 'COLABORADOR';
  criadoEm: string;
}
