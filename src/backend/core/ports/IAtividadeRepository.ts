import { Atividade, DadosAtividade, StatusAtividade } from '../models/Atividade';

export interface IAtividadeRepository {
  buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Atividade[]>;
  getByWeekWithFilters(semana: string, pessoaIds: string[], projetoIds?: string[]): Promise<Atividade[]>;
  buscarPorPessoaEPeriodo(pessoaId: string, dataInicio: string, dataFim: string): Promise<Atividade[]>;
  criar(dados: DadosAtividade): Promise<Atividade>;
  atualizar(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null>;
  deletar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Atividade | null>;
  updateStatus(id: string, status: StatusAtividade): Promise<Atividade | null>;
  reorderActivities(pessoaId: string, data: string, orderedActivityIds: string[]): Promise<void>;
  getNextPosicaoForDay(pessoaId: string, data: string): Promise<number>;
}
