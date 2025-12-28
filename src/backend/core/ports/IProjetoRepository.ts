import { Projeto, DadosProjeto, ProjetoSelect } from '../models/projeto/Projeto';

export interface IProjetoRepository {
  buscarProjetos(squads?: string[], pessoas?: string[]): Promise<Projeto[]>;
  buscarProjetosPorIds(projetoIds: string[]): Promise<Projeto[]>;
  buscarProjetosCardPorId(projetoId: string): Promise<ProjetoSelect>;
  buscarAtivos(): Promise<Projeto[]>;
  buscarSelect(): Promise<ProjetoSelect[]>;
  buscarPorId(id: string): Promise<Projeto | null>;
  criar(dados: DadosProjeto): Promise<Projeto>;
  atualizar(id: string, dados: Partial<DadosProjeto>): Promise<Projeto | null>;
  alternarAtivo(id: string, ativo: boolean): Promise<Projeto | null>;
}
