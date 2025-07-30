import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/allocation_team?authSource=admin';
const MONGODB_DB = process.env.MONGODB_DB || 'allocation_team';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

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
