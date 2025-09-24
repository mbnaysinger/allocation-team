// src/app/api/v1/atividades/atualizar/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../../backend/infrastructure/factories/DependencyFactory';
import { DadosAtividade } from '../../../../../core/models';

interface UpdatePayload extends Partial<DadosAtividade> {
  id: string; // O ID agora vem no corpo
}

export async function POST(request: Request) {
  try {
    const payload: UpdatePayload = await request.json();
    const { id, ...dadosParaAtualizar } = payload;

    if (!id) {
      return NextResponse.json({ message: 'O ID da atividade é obrigatório.' }, { status: 400 });
    }

    const atualizarAtividade = dependencyFactory.createAtualizarAtividade();
    const atividadeAtualizada = await atualizarAtividade.execute(id, dadosParaAtualizar);

    return NextResponse.json(atividadeAtualizada);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao atualizar atividade (POST):', err.message);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
