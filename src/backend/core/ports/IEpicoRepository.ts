import { Epico, DadosEpico } from '../models/projeto/Epico';

export interface IEpicoRepository {
  buscarTodos(): Promise<Epico[]>;
  buscarPorProjetoId(projetoId: string): Promise<Epico[]>;
  buscarPorId(id: string): Promise<Epico | null>;
  criar(dados: DadosEpico): Promise<Epico>;
  atualizar(id: string, dados: Partial<DadosEpico>): Promise<Epico | null>;
  deletar(id: string): Promise<boolean>;
}
