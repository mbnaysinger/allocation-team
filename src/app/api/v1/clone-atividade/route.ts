// src/app/api/v1/clone-atividade/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../backend/infrastructure/factories/DependencyFactory';

export async function POST(request: Request) {
  try {
    const { id } = await request.json(); // ID vem do corpo da requisição

    if (!id) {
      return NextResponse.json({ message: 'O ID da atividade é obrigatório.' }, { status: 400 });
    }

    const clonarAtividade = dependencyFactory.createClonarAtividade();
    const atividadeClonada = await clonarAtividade.execute(id);

    return NextResponse.json(atividadeClonada, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao clonar atividade:', err.message);

    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}