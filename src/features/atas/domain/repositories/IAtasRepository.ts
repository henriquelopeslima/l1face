import type { Ata, AtaStatus, ListaAtas } from '../entities/ata';
import type { AtaDetalhes } from '../entities/ataDetalhes';
import type { AtaCriada, CriarAtaInput, DadosAtaPncp } from '../entities/criarAta';

export interface ListarAtasParams {
  page?: number;
  limit?: number;
  geral?: string;
  status?: AtaStatus;
}

export interface IAtasRepository {
  listarAtas(): Promise<Ata[]>;
  listarAtasPaginado(params?: ListarAtasParams): Promise<ListaAtas>;
  getAta(ataId: string): Promise<AtaDetalhes>;
  criarAta(input: CriarAtaInput): Promise<AtaCriada>;
  consultarAtaPncp(codigo: string): Promise<DadosAtaPncp>;
}
