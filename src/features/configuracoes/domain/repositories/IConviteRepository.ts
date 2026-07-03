import type { AceitarConviteResultado } from '../entities/AceitarConviteResultado';

export interface IConviteRepository {
  aceitar(token: string): Promise<AceitarConviteResultado>;
  recusar(token: string): Promise<{ message: string }>;
}
