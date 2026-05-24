import type { Ata } from '../entities/ata';
import type { AtaDetalhes } from '../entities/ataDetalhes';

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;
  getAta(ataId: string): Promise<AtaDetalhes>;
}
