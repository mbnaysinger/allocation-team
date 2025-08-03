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
    const MONGODB_URI = configService.get<string>('CONFIG.DATABASE.MONGODB.URI');
    const MONGODB_DB = configService.get<string>('CONFIG.DATABASE.MONGODB.DB_NAME');

    if (!MONGODB_URI) {
      throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_URI não está definida.');
    }

    if (!MONGODB_DB) {
      throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_DB_NAME não está definida.');
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
