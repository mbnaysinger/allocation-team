import { MongoClient, Db, Collection, Document } from 'mongodb';
import { configService } from '@/config/config.service';

const MONGODB_URI = configService.get<string>('CONFIG.DATABASE.MONGODB.URI');
const MONGODB_DB = configService.get<string>('CONFIG.DATABASE.MONGODB.DB_NAME');

// Verificação para garantir que as variáveis de ambiente foram carregadas.
if (!MONGODB_URI) {
  throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_URI não está definida.');
}

if (!MONGODB_DB) {
  throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_DB_NAME não está definida.');
}

/**
 * Variável global para "cachear" a conexão com o banco de dados e evitar
 * criar uma nova conexão a cada requisição em ambientes "serverless" como a Vercel.
 * Isso melhora a performance.
 */
declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // No modo de desenvolvimento, usamos uma variável global para que o valor
  // seja preservado entre as recargas de módulo causadas pelo HMR (Hot Module Replacement).
  if (!global.mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global.mongoClientPromise = client.connect();
  }
  clientPromise = global.mongoClientPromise;
} else {
  // Em produção, é melhor não depender de uma variável global.
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

let db: Db;

/**
 * Obtém uma instância da coleção do MongoDB.
 * A conexão com o banco de dados é gerenciada e reutilizada eficientemente.
 * @param collectionName O nome da coleção a ser retornada.
 * @returns Uma Promise que resolve para uma instância da Collection.
 */
export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  if (db) {
    return db.collection<T>(collectionName);
  }
  
  const mongoClient = await clientPromise;
  db = mongoClient.db(MONGODB_DB);
  return db.collection<T>(collectionName);
}
