// src/infrastructure/database/mongodb.ts
import { MongoClient, Db } from 'mongodb';
import { configService } from '@/config/config.service';

// 1. Obter configurações do nosso ConfigService
const MONGODB_URI = configService.get<string>('config.database.mongodb.uri');
const MONGODB_DB = configService.get<string>('config.database.mongodb.db_name');

// 2. Validar se as configurações foram carregadas
if (!MONGODB_URI) {
  throw new Error('URI do MongoDB não encontrada. Verifique seu .env.yml ou as variáveis de ambiente de produção.');
}

if (!MONGODB_DB) {
  throw new Error('Nome do banco de dados MongoDB não encontrado. Verifique seu .env.yml ou as variáveis de ambiente de produção.');
}

// O restante do arquivo (lógica de cache de conexão) permanece o mesmo
declare global {
  var mongo: {
    conn: { client: MongoClient; db: Db } | null;
    promise: Promise<{ client: MongoClient; db: Db }> | null;
  } | undefined;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached!.promise) {
    cached!.promise = MongoClient.connect(MONGODB_URI).then((client: MongoClient) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }
  
  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}