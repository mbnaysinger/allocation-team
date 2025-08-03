import { IProjetoRepository } from '../ports/IProjetoRepository';
import { Projeto, DadosProjeto } from '../models';

const validarDadosProjeto = (dados: DadosProjeto): void => {
  if (!dados.nome || dados.nome.trim().length < 3) {
    throw new Error('O nome do projeto é obrigatório e deve ter pelo menos 3 caracteres.');
  }
  if (!dados.abreviatura || dados.abreviatura.trim().length < 2) {
    throw new Error('A abreviatura do projeto é obrigatória e deve ter pelo menos 2 caracteres.');
  }
};

export class CriarProjeto {
  constructor(private projetoRepository: IProjetoRepository) {}

  async execute(dados: DadosProjeto): Promise<Projeto> {
    try {
      validarDadosProjeto(dados);
      const novoProjeto = await this.projetoRepository.criar(dados);
      return novoProjeto;
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      throw new Error(`Falha ao criar projeto: ${(error as Error).message}`);
    }
  }
} 