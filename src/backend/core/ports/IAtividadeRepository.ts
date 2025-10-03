import { Atividade, DadosAtividade, StatusAtividade } from '../models';

export interface IAtividadeRepository {
  buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Atividade[]>;
  buscarPorSemana(semana: string): Promise<Atividade[]>;
  buscarPorPessoaEPeriodo(pessoaId: string, dataInicio: string, dataFim: string): Promise<Atividade[]>;
  criar(dados: DadosAtividade): Promise<Atividade>;
  atualizar(id: string, dados: Partial<DadosAtividade>): Promise<Atividade | null>;
  deletar(id: string): Promise<void>;
  buscarPorId(id: string): Promise<Atividade | null>;
  updateStatus(id: string, status: StatusAtividade): Promise<Atividade | null>;
  // Futuramente:
  // buscarCompletaPorId(id: string): Promise<AtividadeCompleta | null>;
}
