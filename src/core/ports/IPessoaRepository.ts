import { Pessoa, DadosPessoa } from '../models';

export interface IPessoaRepository {
  buscarTodos(): Promise<Pessoa[]>;
  buscarAtivos(): Promise<Pessoa[]>;
  buscarPorId(id: string): Promise<Pessoa | null>;
  criar(dados: DadosPessoa): Promise<Pessoa>;
  atualizar(id: string, dados: Partial<DadosPessoa>): Promise<Pessoa | null>;
  alternarAtivo(id: string, ativo: boolean): Promise<Pessoa | null>;
}
