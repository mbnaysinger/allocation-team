import { MongoClient, Db, Collection } from 'mongodb';
import { configService } from '@/config/config.service';

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
    const MONGODB_URI = await configService.get<string>('config.database.mongodb.uri');
    const MONGODB_DB = await configService.get<string>('config.database.mongodb.db_name');

    if (!MONGODB_URI) {
      throw new Error('URI do MongoDB não encontrada. Verifique seu .env.yml ou as variáveis de ambiente de produção.');
    }

    if (!MONGODB_DB) {
      throw new Error('Nome do banco de dados MongoDB não encontrado. Verifique seu .env.yml ou as variáveis de ambiente de produção.');
    }
    
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

export async function getCollection(collectionName: string): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
