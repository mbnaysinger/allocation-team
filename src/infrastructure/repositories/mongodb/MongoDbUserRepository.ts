import { Collection, Document } from "mongodb";
import { IUserRepository } from "../../../core/ports/IUserRepository";
import { User } from "../../../core/models/User";
import { getCollection } from '../../../config/databases/mongodb';

const fromDocument = (doc: Document): User => {
  const { _id, ...data } = doc;
  return {
    id: _id?.toHexString(),
    email: data.email,
    name: data.name,
    password: data.password, // Atenção: password não deve ser retornado para o frontend
    role: data.role,
    personIds: data.personIds || [],
  } as User;
};

export class MongoDbUserRepository implements IUserRepository {
  private async getUsersCollection(): Promise<Collection<Document>> {
    return getCollection("users");
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getUsersCollection();
    const document = await collection.findOne({ email });
    return document ? fromDocument(document) : null;
  }

  async createUser(user: User): Promise<User> {
    const collection = await this.getUsersCollection();
    const result = await collection.insertOne(user);
    // MongoDB irá gerar _id automaticamente. Mapeamos para 'id' para consistência.
    return { ...user, id: result.insertedId.toHexString() };
  }
}
