// src/app/api/v1/pessoas/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../infrastructure/factories/DependencyFactory';
import { DadosPessoa } from '../../../../core/models';

export async function GET() {
  try {
    const buscarPessoas = dependencyFactory.createBuscarPessoas();
    const pessoas = await buscarPessoas.execute();
    return NextResponse.json(pessoas);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao buscar pessoas:', err);
    return NextResponse.json(
      { message: 'Erro ao buscar pessoas', details: err.message },
      { status: 500 }
    );
  }
}

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
