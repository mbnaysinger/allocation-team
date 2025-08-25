import NextAuth from "next-auth";
import { authOptions } from '@/config/auth';

// Para Next.js App Router com NextAuth.js v4, precisamos exportar as funções GET e POST
// que chamam NextAuth com as opções de autenticação.
export async function GET(req: Request, res: Response) {
  return NextAuth(authOptions)(req, res);
}

export async function POST(req: Request, res: Response) {
  return NextAuth(authOptions)(req, res);
}
