import { UserRole } from '@/core/models/UserRole';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      personIds: string[];
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    personIds?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserRole;
    personIds?: string[];
  }
}
