import { IPessoaRepository } from '../ports/IPessoaRepository';
import { IProjetoRepository } from '../ports/IProjetoRepository';
import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Pessoa, Projeto, Atividade, AtividadeCompleta } from '../models';

interface BuscarAlocacaoSemanaDTO {
  dataInicio: string;
  dataFim: string;
}

interface AlocacaoSemana {
  pessoas: Pessoa[];
  projetos: Projeto[];
  atividades: AtividadeCompleta[];
}

export class BuscarAlocacaoSemana {
  constructor(
    private pessoaRepository: IPessoaRepository,
    private projetoRepository: IProjetoRepository,
    private atividadeRepository: IAtividadeRepository
  ) {}

  async execute({ dataInicio, dataFim }: BuscarAlocacaoSemanaDTO): Promise<AlocacaoSemana> {
    try {
      // 1. Buscar todas as entidades em paralelo para otimizar
      const [pessoas, projetos, atividades] = await Promise.all([
        this.pessoaRepository.buscarAtivos(),
        this.projetoRepository.buscarAtivos(),
        this.atividadeRepository.buscarPorPeriodo(dataInicio, dataFim),
      ]);

      // 2. Enriquecer as atividades com dados de pessoas e projetos
      const atividadesCompletas = this.combinarDados(atividades, pessoas, projetos);

      return {
        pessoas,
        projetos,
        atividades: atividadesCompletas,
      };
    } catch (error) {
      console.error('Erro ao buscar alocação da semana:', error);
      // Aqui poderíamos lançar um erro mais específico do domínio
      throw new Error('Não foi possível carregar os dados de alocação.');
    }
  }

  private combinarDados(atividades: Atividade[], pessoas: Pessoa[], projetos: Projeto[]): AtividadeCompleta[] {
    const projetosMap = new Map(projetos.map(p => [p.id, p]));
    const pessoasMap = new Map(pessoas.map(p => [p.id, p]));

    return atividades.map(atividade => {
      const pessoa = pessoasMap.get(atividade.pessoaId);
      const projeto = atividade.projetoId ? projetosMap.get(atividade.projetoId) : undefined;

      if (!pessoa) {
        // Log de aviso: Atividade órfã, sem pessoa correspondente.
        // Em um cenário real, poderíamos ter um tratamento mais robusto.
        console.warn(`Atividade ${atividade.id} sem pessoa correspondente.`);
        return null;
      }

      const novaAtividade: AtividadeCompleta = {
        ...atividade,
        pessoa,
        projeto: projeto || undefined,
      };
      return novaAtividade;
    }).filter((a): a is AtividadeCompleta => a !== null);
  }
}
