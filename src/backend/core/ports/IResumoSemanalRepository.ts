import { ResumoSemanal } from "../models/ResumoSemanal";

export interface IResumoSemanalRepository {
  save(resumo: Omit<ResumoSemanal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResumoSemanal>;
  getByPersonIdsAndWeek(pessoaIds: string[], semana: string): Promise<ResumoSemanal[]>;
}
