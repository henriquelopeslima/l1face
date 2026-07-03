import type { AceitarConviteResultado } from '../../domain/entities/AceitarConviteResultado';
import type { IConviteRepository } from '../../domain/repositories/IConviteRepository';
import { ConviteAPI } from '../datasources/ConviteAPI';

export class ConviteRepository implements IConviteRepository {
  private api = new ConviteAPI();

  aceitar(token: string): Promise<AceitarConviteResultado> {
    return this.api.aceitar(token);
  }

  recusar(token: string): Promise<{ message: string }> {
    return this.api.recusar(token);
  }
}
