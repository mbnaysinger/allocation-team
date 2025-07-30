import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../infrastructure/factories/DependencyFactory';
import { DadosPessoa } from '../../../../core/models';

export async function POST(request: Request) {
  try {
    const dados: DadosPessoa = await request.json();

    const criarPessoa = dependencyFactory.createCriarPessoa();
    const novaPessoa = await criarPessoa.execute(dados);

    return NextResponse.json(novaPessoa, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao criar pessoa:', err.message);
    
    return NextResponse.json(
      { message: err.message },
      { status: 400 } // Bad Request para erros de validação
    );
  }
}