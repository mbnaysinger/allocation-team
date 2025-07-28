// Script de inicialização do MongoDB
// Este script é executado quando o container MongoDB é iniciado pela primeira vez

// Conectar ao banco de dados
db = db.getSiblingDB('allocation_team');

// Criar coleções iniciais
db.createCollection('pessoas');
db.createCollection('projetos');
db.createCollection('atividades');
db.createCollection('alocacoes');

// Criar índices para melhor performance
db.pessoas.createIndex({ "nome": 1 });
db.projetos.createIndex({ "nome": 1 });
db.atividades.createIndex({ "nome": 1 });
db.atividades.createIndex({ "projetoId": 1 });
db.alocacoes.createIndex({ "pessoaId": 1 });
db.alocacoes.createIndex({ "atividadeId": 1 });
db.alocacoes.createIndex({ "data": 1 });

// Inserir dados de exemplo (opcional)
db.pessoas.insertMany([
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@empresa.com",
    cargo: "Desenvolvedor",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2", 
    nome: "Maria Santos",
    email: "maria.santos@empresa.com",
    cargo: "Designer",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.projetos.insertMany([
  {
    id: "1",
    nome: "Sistema de Alocação",
    descricao: "Sistema para gerenciar alocação de recursos",
    abreviatura: "SIS",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    nome: "Portal do Cliente",
    descricao: "Portal web para clientes",
    abreviatura: "PORTAL",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.atividades.insertMany([
  {
    id: "1",
    nome: "Desenvolvimento Frontend",
    descricao: "Implementação da interface do usuário",
    projetoId: "1",
    horasEstimadas: 80,
    status: "em_andamento",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    nome: "Design de Interface",
    descricao: "Criação dos mockups e protótipos",
    projetoId: "2", 
    horasEstimadas: 40,
    status: "em_andamento",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Banco de dados 'allocation_team' inicializado com sucesso!");
print("Coleções criadas: pessoas, projetos, atividades, alocacoes");
print("Dados de exemplo inseridos"); 