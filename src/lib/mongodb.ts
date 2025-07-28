import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/allocation_team?authSource=admin';
const MONGODB_DB = process.env.MONGODB_DB || 'allocation_team';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

// Verificar se estamos no lado do servidor
const isServer = typeof window === 'undefined';

// Declaração de tipos globais
declare global {
  var mongo: {
    conn: { client: MongoClient; db: Db } | null;
    promise: Promise<{ client: MongoClient; db: Db }> | null;
  } | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Se não estamos no servidor, retornar erro
  if (!isServer) {
    throw new Error('MongoDB connection is only available on the server side');
  }

  if (cached?.conn) {
    return cached.conn;
  }

    cached!.promise = MongoClient.connect(MONGODB_URI).then((client: MongoClient) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  const result = await cached!.promise;
  cached!.conn = result;
  return result;
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Tipos para as coleções
export interface Pessoa {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  horasDisponiveis: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  status: 'ativo' | 'inativo' | 'concluido';
  createdAt: Date;
  updatedAt: Date;
}

export interface Atividade {
  id: string;
  nome: string;
  descricao: string;
  projetoId: string;
  horasEstimadas: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  createdAt: Date;
  updatedAt: Date;
}

export interface Alocacao {
  id: string;
  pessoaId: string;
  atividadeId: string;
  data: Date;
  horasAlocadas: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
} 