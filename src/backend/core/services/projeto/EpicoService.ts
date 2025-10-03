import { IEpicoRepository } from '../../ports/IEpicoRepository';
import { Epico, DadosEpico } from '../../models/projeto/Epico';

const validarDadosEpico = (dados: DadosEpico): void => {
  if (!dados.nome || dados.nome.trim().length < 3) {
    throw new Error('O nome do épico é obrigatório e deve ter pelo menos 3 caracteres.');
  }
  if (!dados.descricao || dados.descricao.trim().length < 5) {
    throw new Error('A descrição do épico é obrigatória e deve ter pelo menos 5 caracteres.');
  }
  if (!dados.projetoId) {
    throw new Error('O ID do projeto é obrigatório.');
  }
};

export class EpicoService {
  constructor(private epicoRepository: IEpicoRepository) {}

  async criarEpico(dados: DadosEpico): Promise<Epico> {
    try {
      validarDadosEpico(dados);
      const novoEpico = await this.epicoRepository.criar(dados);
      return novoEpico;
    } catch (error) {
      console.error("Erro ao criar épico:", error);
      throw new Error(`Falha ao criar épico: ${(error as Error).message}`);
    }
  }

  async buscarEpicos(): Promise<Epico[]> {
    return this.epicoRepository.buscarTodos();
  }

  async buscarEpicosPorProjeto(projetoId: string): Promise<Epico[]> {
    return this.epicoRepository.buscarPorProjetoId(projetoId);
  }

  async buscarEpicoPorId(id: string): Promise<Epico | null> {
    return this.epicoRepository.buscarPorId(id);
  }

  async atualizarEpico(id: string, dados: Partial<DadosEpico>): Promise<Epico | null> {
    try {
      return await this.epicoRepository.atualizar(id, dados);
    } catch (error) {
      console.error("Erro ao atualizar épico:", error);
      throw new Error(`Falha ao atualizar épico: ${(error as Error).message}`);
    }
  }

  async deletarEpico(id: string): Promise<boolean> {
    try {
      return await this.epicoRepository.deletar(id);
    } catch (error) {
      console.error("Erro ao deletar épico:", error);
      throw new Error(`Falha ao deletar épico: ${(error as Error).message}`);
    }
  }
}
