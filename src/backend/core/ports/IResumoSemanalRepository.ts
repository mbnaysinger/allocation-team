import { ResumoSemanal } from "../models";

export interface IResumoSemanalRepository {
  salvar(resumo: Omit<ResumoSemanal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResumoSemanal>;
  buscarPorPessoasESemana(pessoaIds: string[], semana_inicio: string): Promise<ResumoSemanal[]>;
}
