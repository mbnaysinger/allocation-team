import { Projeto, DadosProjeto } from '../models';

export interface IProjetoRepository {
  buscarTodos(): Promise<Projeto[]>;
  buscarAtivos(): Promise<Projeto[]>;
  buscarPorId(id: string): Promise<Projeto | null>;
  criar(dados: DadosProjeto): Promise<Projeto>;
  atualizar(id: string, dados: Partial<DadosProjeto>): Promise<Projeto | null>;
  alternarAtivo(id: string, ativo: boolean): Promise<Projeto | null>;
}
