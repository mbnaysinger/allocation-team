import CredentialsProvider from "next-auth/providers/credentials";
import { dependencyFactory } from "@/infrastructure/factories/DependencyFactory";
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { Session, User } from 'next-auth';

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
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.name) {
        if (session.user) {
          session.user.name = token.name as string;
        }
      }
      if (token.email) {
        if (session.user) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
