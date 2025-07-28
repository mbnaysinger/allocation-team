import { getCollection } from './mongodb';
import { Pessoa, Projeto, Atividade, AtividadeCompleta } from '../types/allocation';

// Função para converter Date para FirestoreTimestamp
const convertToTimestamp = (date: Date) => {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  };
};

export class MongoDBService {
  // ===== PESSOAS =====
  static async getPessoas(): Promise<Pessoa[]> {
    try {
      const collection = await getCollection('pessoas');
      const pessoas = await collection.find({ ativo: true }).toArray();
      
      return pessoas.map(pessoa => ({
        id: pessoa.id,
        nome: pessoa.nome,
        cargo: pessoa.cargo,
        ativo: pessoa.ativo,
        createdAt: convertToTimestamp(pessoa.createdAt),
        updatedAt: convertToTimestamp(pessoa.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
      return [];
    }
  }

  static async addPessoa(dados: Omit<Pessoa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pessoa | null> {
    try {
      const collection = await getCollection('pessoas');
      const now = new Date();
      const pessoa = {
        id: Date.now().toString(),
        ...dados,
        createdAt: now,
        updatedAt: now
      };

      await collection.insertOne(pessoa);
      return {
        ...pessoa,
        createdAt: convertToTimestamp(pessoa.createdAt),
        updatedAt: convertToTimestamp(pessoa.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      return null;
    }
  }

  static async updatePessoa(id: string, dados: Partial<Pessoa>): Promise<boolean> {
    try {
      const collection = await getCollection('pessoas');
      const result = await collection.updateOne(
        { id },
        { 
          $set: { 
            ...dados, 
            updatedAt: new Date() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      return false;
    }
  }

  static async deletePessoa(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('pessoas');
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      return false;
    }
  }

  // ===== PROJETOS =====
  static async getProjetos(): Promise<Projeto[]> {
    try {
      const collection = await getCollection('projetos');
      const projetos = await collection.find({ ativo: true }).toArray();
      
      return projetos.map(projeto => ({
        id: projeto.id,
        abreviatura: projeto.abreviatura,
        nome: projeto.nome,
        descricao: projeto.descricao,
        entidade: projeto.entidade,
        linkJira: projeto.linkJira,
        ativo: projeto.ativo,
        createdAt: convertToTimestamp(projeto.createdAt),
        updatedAt: convertToTimestamp(projeto.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  }

  static async addProjeto(dados: Omit<Projeto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Projeto | null> {
    try {
      const collection = await getCollection('projetos');
      const now = new Date();
      const projeto = {
        id: Date.now().toString(),
        ...dados,
        createdAt: now,
        updatedAt: now
      };

      await collection.insertOne(projeto);
      return {
        ...projeto,
        createdAt: convertToTimestamp(projeto.createdAt),
        updatedAt: convertToTimestamp(projeto.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      return null;
    }
  }

  static async updateProjeto(id: string, dados: Partial<Projeto>): Promise<boolean> {
    try {
      const collection = await getCollection('projetos');
      const result = await collection.updateOne(
        { id },
        { 
          $set: { 
            ...dados, 
            updatedAt: new Date() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      return false;
    }
  }

  static async deleteProjeto(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('projetos');
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      return false;
    }
  }

  // ===== ATIVIDADES =====
  static async getAtividades(): Promise<Atividade[]> {
    try {
      const collection = await getCollection('atividades');
      const atividades = await collection.find({}).toArray();
      
      return atividades.map(atividade => ({
        id: atividade.id,
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId,
        descricaoJira: atividade.descricaoJira,
        horas: atividade.horas,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      return [];
    }
  }

  static async getAtividadesPorPeriodo(dataInicio: string, dataFim: string): Promise<Atividade[]> {
    try {
      const collection = await getCollection('atividades');
      const atividades = await collection.find({
        data: { $gte: dataInicio, $lte: dataFim }
      }).toArray();
      
      return atividades.map(atividade => ({
        id: atividade.id,
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId,
        descricaoJira: atividade.descricaoJira,
        horas: atividade.horas,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades por período:', error);
      return [];
    }
  }

  static async getAtividadesCompletas(): Promise<AtividadeCompleta[]> {
    try {
      const atividades = await this.getAtividades();
      const pessoas = await this.getPessoas();
      const projetos = await this.getProjetos();

      return atividades.map(atividade => {
        const pessoa = pessoas.find(p => p.id === atividade.pessoaId);
        const projeto = atividade.projetoId ? projetos.find(p => p.id === atividade.projetoId) : undefined;

        return {
          ...atividade,
          pessoa: pessoa!,
          projeto
        };
      });
    } catch (error) {
      console.error('Erro ao buscar atividades completas:', error);
      return [];
    }
  }

  static async getAtividadesCompletasPorPeriodo(dataInicio: string, dataFim: string): Promise<AtividadeCompleta[]> {
    try {
      const atividades = await this.getAtividadesPorPeriodo(dataInicio, dataFim);
      const pessoas = await this.getPessoas();
      const projetos = await this.getProjetos();

      return atividades.map(atividade => {
        const pessoa = pessoas.find(p => p.id === atividade.pessoaId);
        const projeto = atividade.projetoId ? projetos.find(p => p.id === atividade.projetoId) : undefined;

        return {
          ...atividade,
          pessoa: pessoa!,
          projeto
        };
      });
    } catch (error) {
      console.error('Erro ao buscar atividades completas por período:', error);
      return [];
    }
  }

  static async addAtividade(dados: Omit<Atividade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Atividade | null> {
    try {
      const collection = await getCollection('atividades');
      const now = new Date();
      const atividade = {
        id: Date.now().toString(),
        ...dados,
        createdAt: now,
        updatedAt: now
      };

      await collection.insertOne(atividade);
      return {
        ...atividade,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      return null;
    }
  }

  static async updateAtividade(id: string, dados: Partial<Atividade>): Promise<boolean> {
    try {
      const collection = await getCollection('atividades');
      const result = await collection.updateOne(
        { id },
        { 
          $set: { 
            ...dados, 
            updatedAt: new Date() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      return false;
    }
  }

  static async deleteAtividade(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('atividades');
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      return false;
    }
  }

  static async cloneAtividade(atividadeId: string): Promise<Atividade | null> {
    try {
      const collection = await getCollection('atividades');
      
      // Buscar a atividade original
      const atividadeOriginal = await collection.findOne({ id: atividadeId });
      if (!atividadeOriginal) {
        throw new Error('Atividade não encontrada');
      }

      // Criar cópia com novo ID e título modificado
      const now = new Date();
      const novaAtividade = {
        id: Date.now().toString(),
        titulo: `${atividadeOriginal.titulo} - Cópia`,
        data: atividadeOriginal.data,
        pessoaId: atividadeOriginal.pessoaId,
        tipo: atividadeOriginal.tipo,
        projetoId: atividadeOriginal.projetoId,
        descricaoJira: atividadeOriginal.descricaoJira,
        horas: atividadeOriginal.horas,
        createdAt: now,
        updatedAt: now
      };

      await collection.insertOne(novaAtividade);
      return {
        ...novaAtividade,
        createdAt: convertToTimestamp(novaAtividade.createdAt),
        updatedAt: convertToTimestamp(novaAtividade.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao clonar atividade:', error);
      return null;
    }
  }

  // ===== MÉTODOS DE BUSCA =====
  static async getAtividadesPorData(data: string): Promise<Atividade[]> {
    try {
      const collection = await getCollection('atividades');
      const atividades = await collection.find({ data }).toArray();
      
      return atividades.map(atividade => ({
        id: atividade.id,
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId,
        descricaoJira: atividade.descricaoJira,
        horas: atividade.horas,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades por data:', error);
      return [];
    }
  }

  static async getAtividadesPorPessoa(pessoaId: string): Promise<Atividade[]> {
    try {
      const collection = await getCollection('atividades');
      const atividades = await collection.find({ pessoaId }).toArray();
      
      return atividades.map(atividade => ({
        id: atividade.id,
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId,
        descricaoJira: atividade.descricaoJira,
        horas: atividade.horas,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades por pessoa:', error);
      return [];
    }
  }

  static async getAtividadesPorProjeto(projetoId: string): Promise<Atividade[]> {
    try {
      const collection = await getCollection('atividades');
      const atividades = await collection.find({ projetoId }).toArray();
      
      return atividades.map(atividade => ({
        id: atividade.id,
        titulo: atividade.titulo,
        data: atividade.data,
        pessoaId: atividade.pessoaId,
        tipo: atividade.tipo,
        projetoId: atividade.projetoId,
        descricaoJira: atividade.descricaoJira,
        horas: atividade.horas,
        createdAt: convertToTimestamp(atividade.createdAt),
        updatedAt: convertToTimestamp(atividade.updatedAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar atividades por projeto:', error);
      return [];
    }
  }

  // ===== MÉTODOS OTIMIZADOS PARA ATUALIZAÇÕES ESPECÍFICAS =====
  
  static async getAtividadesCompletasPorPessoaESemana(pessoaId: string, dataInicio: string, dataFim: string): Promise<AtividadeCompleta[]> {
    try {
      const atividadesCollection = await getCollection('atividades');
      const pessoasCollection = await getCollection('pessoas');
      const projetosCollection = await getCollection('projetos');
      
      const atividades = await atividadesCollection.find({
        pessoaId,
        data: { $gte: dataInicio, $lte: dataFim }
      }).toArray();
      
      // Buscar apenas a pessoa específica e projetos necessários
      const pessoa = await pessoasCollection.findOne({ id: pessoaId });
      const projetoIds = [...new Set(atividades.map(a => a.projetoId).filter(Boolean))];
      const projetos = projetoIds.length > 0 
        ? await projetosCollection.find({ id: { $in: projetoIds } }).toArray()
        : [];

      return atividades.map(atividade => {
        const projeto = atividade.projetoId ? projetos.find(p => p.id === atividade.projetoId) : undefined;

        // Garantir que pessoa existe, caso contrário não retornar a atividade
        if (!pessoa) {
          console.warn(`Pessoa ${pessoaId} não encontrada`);
          return null;
        }

        return {
          id: atividade.id,
          titulo: atividade.titulo,
          data: atividade.data,
          pessoaId: atividade.pessoaId,
          tipo: atividade.tipo,
          projetoId: atividade.projetoId,
          descricaoJira: atividade.descricaoJira,
          horas: atividade.horas,
          createdAt: convertToTimestamp(atividade.createdAt),
          updatedAt: convertToTimestamp(atividade.updatedAt),
          pessoa: {
            id: pessoa.id,
            nome: pessoa.nome,
            cargo: pessoa.cargo,
            ativo: pessoa.ativo,
            createdAt: convertToTimestamp(pessoa.createdAt),
            updatedAt: convertToTimestamp(pessoa.updatedAt)
          },
          projeto: projeto ? {
            id: projeto.id,
            nome: projeto.nome,
            abreviatura: projeto.abreviatura,
            descricao: projeto.descricao,
            entidade: projeto.entidade,
            linkJira: projeto.linkJira,
            ativo: projeto.ativo,
            createdAt: convertToTimestamp(projeto.createdAt),
            updatedAt: convertToTimestamp(projeto.updatedAt)
          } : undefined
        };
      }).filter(Boolean) as AtividadeCompleta[];
    } catch (error) {
      console.error('Erro ao buscar atividades por pessoa e semana:', error);
      return [];
    }
  }

  static async getPessoaById(pessoaId: string): Promise<Pessoa | null> {
    try {
      const collection = await getCollection('pessoas');
      const pessoa = await collection.findOne({ id: pessoaId });
      
      if (!pessoa) return null;
      
      return {
        id: pessoa.id,
        nome: pessoa.nome,
        cargo: pessoa.cargo,
        ativo: pessoa.ativo,
        createdAt: convertToTimestamp(pessoa.createdAt),
        updatedAt: convertToTimestamp(pessoa.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao buscar pessoa por ID:', error);
      return null;
    }
  }

  static async getProjetoById(projetoId: string): Promise<Projeto | null> {
    try {
      const collection = await getCollection('projetos');
      const projeto = await collection.findOne({ id: projetoId });
      
      if (!projeto) return null;
      
      return {
        id: projeto.id,
        nome: projeto.nome,
        abreviatura: projeto.abreviatura,
        descricao: projeto.descricao,
        entidade: projeto.entidade,
        linkJira: projeto.linkJira,
        ativo: projeto.ativo,
        createdAt: convertToTimestamp(projeto.createdAt),
        updatedAt: convertToTimestamp(projeto.updatedAt)
      };
    } catch (error) {
      console.error('Erro ao buscar projeto por ID:', error);
      return null;
    }
  }
} 