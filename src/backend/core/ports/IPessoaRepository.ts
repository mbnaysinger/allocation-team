import { Pessoa, DadosPessoa } from '../models/Pessoa';

export interface IPessoaRepository {
  buscarPessoas(squads?: string[]): Promise<Pessoa[]>;
  buscarAtivosPorIds(ids: string[]): Promise<Pessoa[]>;
  findByIds(ids: string[]): Promise<Pessoa[]>;
  buscarAtivos(squads?: string[]): Promise<Pessoa[]>;
  buscarPorId(id: string): Promise<Pessoa | null>;
  criar(dados: DadosPessoa): Promise<Pessoa>;
  atualizar(id: string, dados: Partial<DadosPessoa>): Promise<Pessoa | null>;
  alternarAtivo(id: string, ativo: boolean): Promise<Pessoa | null>;
  buscarSquads(): Promise<string[]>;
}
