import type { Ata } from '../entities/ata';
import type { AtaDetalhes } from '../entities/ataDetalhes';
import type { CriarAtaInput, DadosAtaPncp } from '../entities/criarAta';

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;
  getAta(ataId: string): Promise<AtaDetalhes>;
  criarAta(input: CriarAtaInput): Promise<AtaDetalhes>;
  consultarAtaPncp(codigo: string): Promise<DadosAtaPncp>;
}
