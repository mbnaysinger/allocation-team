// src/app/api/v1/pessoas/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../backend/infrastructure/factories/DependencyFactory';
import { DadosPessoa } from '../../../../backend/core/models/Pessoa';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const squads = searchParams.getAll('squads');
    
    const pessoaService = dependencyFactory.createPessoaService();
    const pessoas = await pessoaService.buscarPessoasAtivas(squads.length > 0 ? squads : undefined);
    
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

    const criarPessoa = dependencyFactory.createPessoaService();
    const novaPessoa = await criarPessoa.criarPessoa(dados);

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
