import { IProjetoRepository } from '../../core/ports/IProjetoRepository';

export class BuscarProjetos {
  constructor(private readonly projetoRepository: IProjetoRepository) {}

  async execute() {
    return this.projetoRepository.buscarTodos();
  }
}
