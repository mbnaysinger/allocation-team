import { IResumoSemanalRepository } from '../ports/IResumoSemanalRepository';
import { ResumoSemanal } from '../models/ResumoSemanal';

export class ResumosSemanaisService {
  constructor(private resumoRepository: IResumoSemanalRepository) {}

  async getInitialLoadData(pessoaIds: string[], semana: string): Promise<ResumoSemanal[]> {
    if (pessoaIds.length === 0) {
      return [];
    }
    return this.resumoRepository.getByPersonIdsAndWeek(pessoaIds, semana);
  }

  async add(data: { pessoaId: string; semana: string; comentario: string }): Promise<ResumoSemanal> {
    const resumo = await this.resumoRepository.save(data);
    return resumo;
  }
}
