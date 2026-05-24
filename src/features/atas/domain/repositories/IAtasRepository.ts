import type { Ata } from '../entities/ata';

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;
}
