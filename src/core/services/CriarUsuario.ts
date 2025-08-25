import { IUserRepository } from '../ports/IUserRepository';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export class CriarUsuario {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData: User): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Um usuário com este e-mail já existe.');
    }

    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const newUser: User = {
      ...userData,
      password: hashedPassword,
    };

    return this.userRepository.createUser(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
