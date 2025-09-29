import { IAtividadeRepository } from '../../core/ports/IAtividadeRepository';
import { IResumoSemanalRepository } from '../../core/ports/IResumoSemanalRepository';
import { IPessoaRepository } from '../../core/ports/IPessoaRepository';
import { IProjetoRepository } from '../../core/ports/IProjetoRepository';
import { IEpicoRepository } from '../../core/ports/IEpicoRepository';
import { ITarefaRepository } from '../../core/ports/ITarefaRepository';
import { MongoDbAtividadeRepository } from '../repositories/mongodb/MongoDbAtividadeRepository';
import { MongoDbPessoaRepository } from '../repositories/mongodb/MongoDbPessoaRepository';
import { MongoDbProjetoRepository } from '../repositories/mongodb/ProjetoRepository';
import { MongoDbResumoSemanalRepository } from '../repositories/mongodb/MongoDbResumoSemanalRepository';
import { MongoDbEpicoRepository } from '../repositories/mongodb/MongoDbEpicoRepository';
import { MongoDbTarefaRepository } from '../repositories/mongodb/MongoDbTarefaRepository';
import { IUserRepository } from '../../core/ports/IUserRepository';
import { MongoDbUserRepository } from '../repositories/mongodb/MongoDbUserRepository';

import { BuscarAlocacaoSemana } from '../../core/services/BuscarAlocacaoSemana';
import { CriarAtividade } from '../../core/services/CriarAtividade';
import { AtualizarAtividade } from '../../core/services/AtualizarAtividade';
import { DeletarAtividade } from '../../core/services/DeletarAtividade';
import { ClonarAtividade } from '../../core/services/ClonarAtividade';
import { ProjetoService } from '../../core/services/projeto/ProjetoService';
import { EpicoService } from '../../core/services/projeto/EpicoService';
import { TarefaService } from '../../core/services/projeto/TarefaService';
import { CriarPessoa } from '../../core/services/CriarPessoa';
import { BuscarPessoas } from '../../core/services/BuscarPessoas';
import { SalvarResumoSemanal } from '../../core/services/SalvarResumoSemanal';
import { BuscarResumosSemanais } from '../../core/services/BuscarResumosSemanais';
import { CriarUsuario } from '../../core/services/CriarUsuario';


// Esta classe centraliza a criação de todas as dependências.
class DependencyFactory {
  // --- Repositórios ---
  private createAtividadeRepository(): IAtividadeRepository {
    // Futuramente, poderíamos ter um if aqui baseado na config para retornar
    // um FirebaseAtividadeRepository()
    return new MongoDbAtividadeRepository();
  }

  private createPessoaRepository(): IPessoaRepository {
    return new MongoDbPessoaRepository();
  }
  
  private createProjetoRepository(): IProjetoRepository {
    return new MongoDbProjetoRepository();
  }

  private createEpicoRepository(): IEpicoRepository {
    return new MongoDbEpicoRepository();
  }

  private createTarefaRepository(): ITarefaRepository {
    return new MongoDbTarefaRepository();
  }

  private createResumoSemanalRepository(): IResumoSemanalRepository {
    return new MongoDbResumoSemanalRepository();
  }

  public async createUserRepository(): Promise<IUserRepository> {
    return new MongoDbUserRepository();
  }

  // --- Serviços ---
  // Os serviços recebem os repositórios de que precisam.
  
  public createBuscarAlocacaoSemana(): BuscarAlocacaoSemana {
    return new BuscarAlocacaoSemana(
      this.createPessoaRepository(),
      this.createProjetoRepository(),
      this.createAtividadeRepository()
    );
  }

  public createCriarAtividade(): CriarAtividade {
    return new CriarAtividade(this.createAtividadeRepository());
  }

  public createAtualizarAtividade(): AtualizarAtividade {
    return new AtualizarAtividade(this.createAtividadeRepository());
  }

  public createDeletarAtividade(): DeletarAtividade {
    return new DeletarAtividade(this.createAtividadeRepository());
  }

  public createClonarAtividade(): ClonarAtividade {
    return new ClonarAtividade(this.createAtividadeRepository());
  }

  public createSalvarResumoSemanal(): SalvarResumoSemanal {
    return new SalvarResumoSemanal(this.createResumoSemanalRepository());
  }

  public createBuscarResumosSemanais(): BuscarResumosSemanais {
    return new BuscarResumosSemanais(this.createResumoSemanalRepository());
  }

  public createBuscarPessoas(): BuscarPessoas {
    return new BuscarPessoas(this.createPessoaRepository());
  }
  
  public createCriarPessoa(): CriarPessoa {
    return new CriarPessoa(this.createPessoaRepository());
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

  public async createCriarUsuario(): Promise<CriarUsuario> {
    const userRepository = await this.createUserRepository();
    return new CriarUsuario(userRepository);
  }
}

// Exportamos uma única instância da fábrica.
export const dependencyFactory = new DependencyFactory();
