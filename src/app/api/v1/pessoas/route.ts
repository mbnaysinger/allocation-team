import { NextResponse } from 'next/server';
import { CriarPessoa } from '../../../../core/services/CriarPessoa';
import { MongoDbPessoaRepository } from '../../../../infrastructure/repositories/mongodb/MongoDbPessoaRepository';
import { DadosPessoa } from '../../../../core/models';

export async function POST(request: Request) {
  try {
    const dados: DadosPessoa = await request.json();

    // --- Injeção de Dependência ---
    const pessoaRepository = new MongoDbPessoaRepository();
    const criarPessoa = new CriarPessoa(pessoaRepository);

    const novaPessoa = await criarPessoa.execute(dados);

    return NextResponse.json(novaPessoa, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao criar pessoa:', err.message);
    
    // Retorna a mensagem de erro da validação do serviço
    return NextResponse.json(
      { message: err.message },
      { status: 400 } // Bad Request para erros de validação
    );
  }
} 