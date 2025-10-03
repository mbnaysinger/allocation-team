import { IPessoaRepository } from '../ports/IPessoaRepository';
import { IProjetoRepository } from '../ports/IProjetoRepository';
import { IAtividadeRepository } from '../ports/IAtividadeRepository';
import { Pessoa, Atividade, AtividadeCompleta } from '../models';
import { Projeto } from '../models/projeto/Projeto';

interface BuscarAlocacaoSemanaDTO {
  dataInicio?: string;
  dataFim?: string;
  semana?: string;
  personIds?: string[]; // Opcional para filtrar por pessoas específicas
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

  async execute({ dataInicio, dataFim, semana, personIds }: BuscarAlocacaoSemanaDTO): Promise<AlocacaoSemana> {
    try {
      // Define a busca de pessoas com base na presença de personIds
      const buscarPessoasPromise = personIds && personIds.length > 0
        ? this.pessoaRepository.findByIds(personIds)
        : this.pessoaRepository.buscarAtivos();

      let atividadesPromise: Promise<Atividade[]>;

      if (semana) {
        atividadesPromise = this.atividadeRepository.buscarPorSemana(semana);
      } else if (dataInicio && dataFim) {
        atividadesPromise = this.atividadeRepository.buscarPorPeriodo(dataInicio, dataFim);
      } else {
        throw new Error('É necessário fornecer ou a semana ou o período de datas.');
      }

      // 1. Buscar todas as entidades em paralelo para otimizar
      const [pessoas, projetos, atividades] = await Promise.all([
        buscarPessoasPromise,
        this.projetoRepository.buscarTodos(),
        atividadesPromise,
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
    const projetosMap = new Map(projetos.map(p => [p.projetoId, p]));
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
