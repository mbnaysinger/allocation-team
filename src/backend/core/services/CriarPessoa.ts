import { IPessoaRepository } from '../ports/IPessoaRepository';
import { Pessoa, DadosPessoa, Cargo } from '../models';

// Validação de regras de negócio
const validarDadosPessoa = (dados: DadosPessoa): void => {
  if (!dados.nome || dados.nome.trim().length < 2) {
    throw new Error('O nome da pessoa é obrigatório e deve ter pelo menos 2 caracteres.');
  }
  const cargosValidos: Cargo[] = ['Analista de TI', 'Analista de Negócios'];
  if (!dados.cargo || !cargosValidos.includes(dados.cargo)) {
    throw new Error('O cargo informado é inválido.');
  }
};


export class CriarPessoa {
  constructor(private pessoaRepository: IPessoaRepository) {}

  async execute(dados: DadosPessoa): Promise<Pessoa> {
    try {
      // 1. Validar os dados de entrada
      validarDadosPessoa(dados);

      // 2. Chamar o repositório para persistir os dados
      const novaPessoa = await this.pessoaRepository.criar(dados);

      // 3. Retornar a pessoa criada
      return novaPessoa;
    } catch (error) {
      console.error("Erro ao criar pessoa:", error);
      // Lançar um erro específico do caso de uso para ser tratado na camada de API
      throw new Error(`Falha ao criar pessoa: ${(error as Error).message}`);
    }
  }
} 