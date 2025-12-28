import { IProjetoRepository } from '../ports/IProjetoRepository';
import { Atividade, AtividadeCompleta } from '../models/Atividade';
import { Projeto } from '../models/projeto/Projeto';
import { Pessoa } from '../models/Pessoa';
import { PessoaService } from './PessoaService';
import { AtividadeService } from './AtividadeService';

interface BuscarAlocacaoSemanaDTO {
  semana: string;
  squads?: string[];
  pessoas?: string[];
  projetos?: string[];
  personIds?: string[]; // Mantido para o caso de uso de perfil de usuário
}

interface AlocacaoSemana {
  pessoas: Pessoa[];
  projetos: Projeto[];
  atividades: AtividadeCompleta[];
}

export class AlocacaoSemanalService {
  constructor(
    private projetoRepository: IProjetoRepository,
    private pessoaService: PessoaService,
    private atividadeService: AtividadeService
  ) {}

  async getWeeklyAllocationWithFilters({ semana, squads, pessoas: pessoasIds, projetos: projetosIds, personIds }: BuscarAlocacaoSemanaDTO): Promise<AlocacaoSemana> {
    try {
      // Determina os IDs de pessoas a serem buscados
      let finalPersonIds = personIds || [];
      if (pessoasIds && pessoasIds.length > 0) {
        finalPersonIds = finalPersonIds ? [...new Set([...finalPersonIds, ...pessoasIds])] : pessoasIds;
      } else if (squads && squads.length > 0) {
        const pessoasNoSquad = await this.pessoaService.buscarPessoasAtivas(squads);
        const idsPessoasNoSquad = pessoasNoSquad.map(p => p.id);
        finalPersonIds = finalPersonIds ? [...new Set([...finalPersonIds, ...idsPessoasNoSquad])] : idsPessoasNoSquad;
      }

      // Busca as atividades da semana com os filtros aplicados
      const atividades = await this.atividadeService.getByWeekWithFilters(
        semana,
        finalPersonIds,
        projetosIds
      );

      if (atividades.length === 0) {
        const pessoas = finalPersonIds ? await this.pessoaService.buscarPessoasAtivasPorIds(finalPersonIds) : [];
        return { pessoas, projetos: [], atividades: [] };
      }

      const pessoaIdsFromAtividades = [...new Set(atividades.map(a => a.pessoaId))];
      const projetoIdsFromAtividades = [...new Set(atividades.map(a => a.projetoId).filter(Boolean))] as string[];

      const [pessoas, projetos] = await Promise.all([
        this.pessoaService.buscarPessoasAtivasPorIds(pessoaIdsFromAtividades),
        this.projetoRepository.buscarProjetosPorIds(projetoIdsFromAtividades),
      ]);

      const atividadesCompletas = this.combinarDados(atividades, pessoas, projetos);

      return {
        pessoas,
        projetos,
        atividades: atividadesCompletas,
      };
    } catch (error) {
      console.error('Erro ao buscar alocação da semana:', error);
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
