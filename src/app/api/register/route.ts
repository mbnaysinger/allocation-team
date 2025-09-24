import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/infrastructure/factories/DependencyFactory';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const criarUsuario = await dependencyFactory.createCriarUsuario();
    const newUser = await criarUsuario.execute({ email, password });

    // Retorne apenas informações seguras do usuário, sem a senha.
    const userWithoutPassword = { id: newUser.id, email: newUser.email };
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message === 'Um usuário com este e-mail já existe.') {
        statusCode = 409;
      }
    }
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
