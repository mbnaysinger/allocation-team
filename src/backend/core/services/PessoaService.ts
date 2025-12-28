import { IPessoaRepository } from '../ports/IPessoaRepository';
import { Pessoa, DadosPessoa, CARGOS, SQUADS } from '../models/Pessoa';

// Validação de regras de negócio
const validarDadosPessoa = (dados: DadosPessoa): void => {
  if (!dados.nome || dados.nome.trim().length < 2) {
    throw new Error('O nome da pessoa é obrigatório e deve ter pelo menos 2 caracteres.');
  }
  if (!dados.cargo || !CARGOS.includes(dados.cargo)) {
    throw new Error('O cargo informado é inválido.');
  }
  if (!dados.squad || !SQUADS.includes(dados.squad)) {
    throw new Error('O squad informado é inválido.');
  }
};

export class PessoaService {
  constructor(private pessoaRepository: IPessoaRepository) {}

  async criarPessoa(dados: DadosPessoa): Promise<Pessoa> {
    try {
      validarDadosPessoa(dados);
      const novaPessoa = await this.pessoaRepository.criar(dados);

      return novaPessoa;
    } catch (error) {
      console.error("Erro ao criar pessoa:", error);
      throw new Error(`Falha ao criar pessoa: ${(error as Error).message}`);
    }
  }

  async buscarPessoas(squads?: string[]): Promise<Pessoa[]> {
    return this.pessoaRepository.buscarPessoas(squads);
  }

  async buscarPessoaPorId(id: string): Promise<Pessoa | null> {
    return this.pessoaRepository.buscarPorId(id);
  }

  async buscarPessoasAtivasPorIds(ids: string[]): Promise<Pessoa[]> {
    return this.pessoaRepository.buscarAtivosPorIds(ids);
  }

  async atualizarPessoa(id: string, dados: Partial<DadosPessoa>): Promise<Pessoa | null> {
    return this.pessoaRepository.atualizar(id, dados);
  }

  async alternarAtivoPessoa(id: string, ativo: boolean): Promise<Pessoa | null> {
    return this.pessoaRepository.alternarAtivo(id, ativo);
  }

  async buscarPessoasAtivas(squads?: string[]): Promise<Pessoa[]> {
    return this.pessoaRepository.buscarAtivos(squads);
  }

  async buscarSquads(): Promise<string[]> {
    return this.pessoaRepository.buscarSquads();
  }
} 