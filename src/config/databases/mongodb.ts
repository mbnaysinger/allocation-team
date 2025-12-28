import { MongoClient, Db, Collection } from 'mongodb';

/**
 * Variável global para "cachear" a conexão com o banco de dados e evitar
 * criar uma nova conexão a cada requisição em ambientes "serverless" como a Vercel.
 * Isso melhora a performance.
 */
declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;
let db: Db;

/**
 * Estabelece e "cacheia" a conexão com o MongoDB.
 * A lógica de leitura das variáveis de ambiente e de conexão
 * só é executada quando esta função é chamada pela primeira vez.
 */
async function connectToDatabase() {
  if (clientPromise) {
    return clientPromise;
  }

  const MONGODB_URI = process.env.CONFIG_DATABASE_MONGODB_URI;
  const MONGODB_DB = process.env.CONFIG_DATABASE_MONGODB_DB_NAME;

  if (!MONGODB_URI) {
    throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_URI não está definida.');
  }

  if (!MONGODB_DB) {
    throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_DB_NAME não está definida.');
  }

  const options = {};
  
  if (process.env.NODE_ENV === 'development') {
    // No modo de desenvolvimento, usamos uma variável global para que o valor
    // seja preservado entre as recargas de módulo causadas pelo HMR (Hot Module Replacement).
    if (!global.mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, options);
      global.mongoClientPromise = client.connect();
    }
    clientPromise = global.mongoClientPromise;
  } else {
    // Em produção, é melhor não depender de uma variável global.
    const client = new MongoClient(MONGODB_URI, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Obtém uma instância da coleção do MongoDB.
 * A conexão com o banco de dados é gerenciada e reutilizada eficientemente.
 * @param collectionName O nome da coleção a ser retornada.
 * @returns Uma Promise que resolve para uma instância da Collection.
 */
export async function getCollection(collectionName: string): Promise<Collection> {
  // Garante que a conexão com o banco de dados foi estabelecida.
  const mongoClient = await connectToDatabase();
  
  // Se a instância do 'db' ainda não foi criada, cria-a agora.
  if (!db) {
    const MONGODB_DB = process.env.CONFIG_DATABASE_MONGODB_DB_NAME;
    if (!MONGODB_DB) {
      throw new Error('A variável de ambiente CONFIG_DATABASE_MONGODB_DB_NAME não está definida para obter o DB.');
    }
    db = mongoClient.db(MONGODB_DB);
  }
  
  return db.collection(collectionName);
}