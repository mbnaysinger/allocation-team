import { Atividade, DadosAtividade, Pessoa, Projeto, StatusAtividade } from '.';

export interface IAtividadeRepository {
  criar(dados: DadosAtividade): Promise<Atividade>;
  atualizar(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null>;
  deletar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Atividade | null>;
  buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Atividade[]>;
  buscarPorPessoaEPeriodo(pessoaId: string, dataInicio: string, dataFim: string): Promise<Atividade[]>;
  clone(id: string): Promise<Atividade | null>;
  updateStatus(id: string, status: StatusAtividade): Promise<Atividade | null>;
}

export interface IPessoaRepository {
  criar(dados: Omit<Pessoa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pessoa>;
  buscarTodos(): Promise<Pessoa[]>;
}

export interface IProjetoRepository {
  criar(dados: Omit<Projeto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Projeto>;
  buscarTodos(): Promise<Projeto[]>;
}
