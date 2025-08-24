import { NextRequest, NextResponse } from 'next/server';
import { dependencyFactory } from '@/infrastructure/factories/DependencyFactory';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }

    const criarUsuario = await dependencyFactory.createCriarUsuario();
    const newUser = await criarUsuario.execute({ name, email, password });

    // Retorne apenas informações seguras do usuário, sem a senha.
    const userWithoutPassword = { id: newUser.id, name: newUser.name, email: newUser.email };
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Um usuário com este e-mail já existe.') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
