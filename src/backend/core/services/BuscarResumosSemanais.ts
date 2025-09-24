import { IResumoSemanalRepository } from '../ports/IResumoSemanalRepository';
import { ResumoSemanal } from '../models';

export class BuscarResumosSemanais {
  constructor(private resumoRepository: IResumoSemanalRepository) {}

  async execute(pessoaIds: string[], semana_inicio: string): Promise<ResumoSemanal[]> {
    if (pessoaIds.length === 0) {
      return [];
    }
    return this.resumoRepository.buscarPorPessoasESemana(pessoaIds, semana_inicio);
  }
}
