import CredentialsProvider from "next-auth/providers/credentials";
import { dependencyFactory } from "@/infrastructure/factories/DependencyFactory";
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';
import NextAuth from "next-auth"; // Importar NextAuth
import { UserRole } from "@/core/models/UserRole";

export const authOptions = {
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
          // Adiciona o role e personIds ao objeto que será passado para o callback jwt
          return {
            id: user.id as string,
            email: user.email,
            role: user.role || UserRole.USER, // Garante um role padrão
            personIds: user.personIds || [],
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.personIds = user.personIds;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.personIds = token.personIds as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
