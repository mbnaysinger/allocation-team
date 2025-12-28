import { IProjetoRepository } from '../../ports/IProjetoRepository';
import { Projeto, DadosProjeto, ProjetoSelect } from '../../models/projeto/Projeto';

const validarDadosProjeto = (dados: DadosProjeto): void => {
  if (!dados.nome || dados.nome.trim().length < 3) {
    throw new Error('O nome do projeto é obrigatório e deve ter pelo menos 3 caracteres.');
  }
  if (!dados.abreviatura || dados.abreviatura.trim().length < 2) {
    throw new Error('A abreviatura do projeto é obrigatória e deve ter pelo menos 2 caracteres.');
  }
};

export class ProjetoService {
  constructor(private projetoRepository: IProjetoRepository) {}

  async criarProjeto(dados: DadosProjeto): Promise<Projeto> {
    try {
      validarDadosProjeto(dados);
      const novoProjeto = await this.projetoRepository.criar(dados);
      return novoProjeto;
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      throw new Error(`Falha ao criar projeto: ${(error as Error).message}`);
    }
  }

  async buscarProjetosAtivos(): Promise<ProjetoSelect[]> {
    return this.projetoRepository.buscarSelect();
  }

  async buscarProjetos(squads?: string[], pessoas?: string[]): Promise<Projeto[]> {
    return this.projetoRepository.buscarProjetos(squads, pessoas);
  }

  async buscarProjetosPorIds(projetoIds: string[]): Promise<Projeto[]> {
    return this.projetoRepository.buscarProjetosPorIds(projetoIds);
  }

  async buscarProjetoPorId(id: string): Promise<Projeto | null> {
    return this.projetoRepository.buscarPorId(id);
  }

  async atualizarProjeto(id: string, dados: Partial<DadosProjeto>): Promise<Projeto | null> {
    return this.projetoRepository.atualizar(id, dados);
  }

  async alternarAtivoProjeto(id: string, ativo: boolean): Promise<Projeto | null> {
    return this.projetoRepository.alternarAtivo(id, ativo);
  }
} 