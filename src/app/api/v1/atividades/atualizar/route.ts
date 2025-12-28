// src/app/api/v1/atividades/atualizar/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../../backend/infrastructure/factories/DependencyFactory';
import { DadosAtividade } from '../../../../../backend/core/models/Atividade';

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

    const atividadeService = dependencyFactory.createAtividadeService();
    const atividadeAtualizada = await atividadeService.update(id, dadosParaAtualizar);

    return NextResponse.json(atividadeAtualizada);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao atualizar atividade (POST):', err.message);
    if (err.message.includes('Conflito de versão')) {
      return NextResponse.json({ message: err.message }, { status: 409 });
    }
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
