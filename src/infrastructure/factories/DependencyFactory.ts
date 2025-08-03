import { IAtividadeRepository } from '../../core/ports/IAtividadeRepository';
import { IPessoaRepository } from '../../core/ports/IPessoaRepository';
import { IProjetoRepository } from '../../core/ports/IProjetoRepository';
import { MongoDbAtividadeRepository } from '../repositories/mongodb/MongoDbAtividadeRepository';
import { MongoDbPessoaRepository } from '../repositories/mongodb/MongoDbPessoaRepository';
import { MongoDbProjetoRepository } from '../repositories/mongodb/MongoDbProjetoRepository';

import { BuscarAlocacaoSemana } from '../../core/services/BuscarAlocacaoSemana';
import { CriarAtividade } from '../../core/services/CriarAtividade';
import { AtualizarAtividade } from '../../core/services/AtualizarAtividade';
import { DeletarAtividade } from '../../core/services/DeletarAtividade';
import { ClonarAtividade } from '../../core/services/ClonarAtividade';
import { CriarProjeto } from '../../core/services/CriarProjeto';
import { CriarPessoa } from '../../core/services/CriarPessoa';
import { BuscarPessoas } from '../../core/services/BuscarPessoas';
// ... outros serviços

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

  public createBuscarPessoas(): BuscarPessoas {
    return new BuscarPessoas(this.createPessoaRepository());
  }
  
  
  public createCriarPessoa(): CriarPessoa {
    return new CriarPessoa(this.createPessoaRepository());
  }

  public createCriarProjeto(): CriarProjeto {
    return new CriarProjeto(this.createProjetoRepository());
  }
}

// Exportamos uma única instância da fábrica.
export const dependencyFactory = new DependencyFactory();