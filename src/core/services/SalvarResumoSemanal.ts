import { IResumoSemanalRepository } from '../ports/IResumoSemanalRepository';
import { ResumoSemanal } from '../models';

export class SalvarResumoSemanal {
  constructor(private resumoRepository: IResumoSemanalRepository) {}

  async execute(data: { pessoaId: string; semana_inicio: string; comentario: string }): Promise<ResumoSemanal> {
    const resumo = await this.resumoRepository.salvar(data);
    return resumo;
  }
}
