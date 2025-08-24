import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dependencyFactory } from "@/infrastructure/factories/DependencyFactory";
import bcrypt from 'bcryptjs';
import { User } from '@/core/models/User';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userRepository = await dependencyFactory.createUserRepository();
        const user = await userRepository.findByEmail(credentials.email as string);

        if (user && user.password && await bcrypt.compare(credentials.password as string, user.password)) {
          // Retorne um objeto de usuário que será serializado para o JWT/sessão
          return { id: user.id as string, name: user.name, email: user.email };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.name) {
        session.user.name = token.name as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Página de login personalizada
  },
};

// Para Next.js App Router com NextAuth.js v4, precisamos exportar as funções GET e POST
// que chamam NextAuth com as opções de autenticação.
export async function GET(req: Request, res: Response) {
  return NextAuth(authOptions)(req, res);
}

export async function POST(req: Request, res: Response) {
  return NextAuth(authOptions)(req, res);
}
