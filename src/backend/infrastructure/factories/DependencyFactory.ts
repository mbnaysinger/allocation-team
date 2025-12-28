import { IAtividadeRepository } from '../../core/ports/IAtividadeRepository';
import { IResumoSemanalRepository } from '../../core/ports/IResumoSemanalRepository';
import { IPessoaRepository } from '../../core/ports/IPessoaRepository';
import { IProjetoRepository } from '../../core/ports/IProjetoRepository';
import { IEpicoRepository } from '../../core/ports/IEpicoRepository';
import { ITarefaRepository } from '../../core/ports/ITarefaRepository';
import { AtividadeRepository } from '../repositories/mongodb/AtividadeRepository';
import { PessoaRepository } from '../repositories/mongodb/PessoaRepository';
import { ProjetoRepository } from '../repositories/mongodb/ProjetoRepository';
import { ResumoSemanalRepository } from '../repositories/mongodb/ResumoSemanalRepository';
import { MongoDbEpicoRepository } from '../repositories/mongodb/MongoDbEpicoRepository';
import { MongoDbTarefaRepository } from '../repositories/mongodb/MongoDbTarefaRepository';
import { IUserRepository } from '../../core/ports/IUserRepository';
import { MongoDbUserRepository } from '../repositories/mongodb/MongoDbUserRepository';

import { AlocacaoSemanalService } from '../../core/services/AlocacaoSemanalService';
import { AtividadeService } from '../../core/services/AtividadeService';
import { ProjetoService } from '../../core/services/projeto/ProjetoService';
import { EpicoService } from '../../core/services/projeto/EpicoService';
import { TarefaService } from '../../core/services/projeto/TarefaService';
import { PessoaService } from '../../core/services/PessoaService';
import { ResumosSemanaisService } from '../../core/services/ResumosSemanaisService';
import { CriarUsuario } from '../../core/services/CriarUsuario';


// Esta classe centraliza a criação de todas as dependências.
class DependencyFactory {
  // --- Repositórios ---
  private createAtividadeRepository(): IAtividadeRepository {
    // Futuramente, poderíamos ter um if aqui baseado na config para retornar
    // um FirebaseAtividadeRepository()
    return new AtividadeRepository();
  }

  private createPessoaRepository(): IPessoaRepository {
    return new PessoaRepository();
  }
  
  private createProjetoRepository(): IProjetoRepository {
    return new ProjetoRepository();
  }

  private createEpicoRepository(): IEpicoRepository {
    return new MongoDbEpicoRepository();
  }

  private createTarefaRepository(): ITarefaRepository {
    return new MongoDbTarefaRepository();
  }

  private createResumoSemanalRepository(): IResumoSemanalRepository {
    return new ResumoSemanalRepository();
  }

  public async createUserRepository(): Promise<IUserRepository> {
    return new MongoDbUserRepository();
  }

  // --- Serviços ---
  // Os serviços recebem os repositórios de que precisam.
  
  public createAlocacaoSemanalService(): AlocacaoSemanalService {
    return new AlocacaoSemanalService(
      this.createProjetoRepository(),
      this.createPessoaService(),
      this.createAtividadeService()
    );
  }

  public createAtividadeService(): AtividadeService {
    return new AtividadeService(this.createAtividadeRepository(), this.createProjetoRepository());
  }

  public createResumosSemanaisService(): ResumosSemanaisService {
    return new ResumosSemanaisService(this.createResumoSemanalRepository());
  }

  public createProjetoService(): ProjetoService {
    return new ProjetoService(this.createProjetoRepository());
  }

  public createEpicoService(): EpicoService {
    return new EpicoService(this.createEpicoRepository());
  }

  public createTarefaService(): TarefaService {
    return new TarefaService(this.createTarefaRepository());
  }

  public createPessoaService(): PessoaService {
    return new PessoaService(this.createPessoaRepository());
  }

  public async createCriarUsuario(): Promise<CriarUsuario> {
    const userRepository = await this.createUserRepository();
    return new CriarUsuario(userRepository);
  }
}

// Exportamos uma única instância da fábrica.
export const dependencyFactory = new DependencyFactory();
