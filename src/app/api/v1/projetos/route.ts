import { NextResponse } from 'next/server';
import { CriarProjeto } from '../../../../core/services/CriarProjeto';
import { MongoDbProjetoRepository } from '../../../../infrastructure/repositories/mongodb/MongoDbProjetoRepository';
import { DadosProjeto } from '../../../../core/models';

export async function POST(request: Request) {
  try {
    const dados: DadosProjeto = await request.json();

    const projetoRepository = new MongoDbProjetoRepository();
    const criarProjeto = new CriarProjeto(projetoRepository);

    const novoProjeto = await criarProjeto.execute(dados);

    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao criar projeto:', err.message);
    
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
} 