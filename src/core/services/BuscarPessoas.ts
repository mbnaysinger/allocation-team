// src/core/services/BuscarPessoas.ts
import { Pessoa } from '../models';
import { IPessoaRepository } from '../ports/IPessoaRepository';

export class BuscarPessoas {
  constructor(private pessoaRepository: IPessoaRepository) {}

  async execute(): Promise<Pessoa[]> {
    return this.pessoaRepository.buscarAtivos();
  }
}
