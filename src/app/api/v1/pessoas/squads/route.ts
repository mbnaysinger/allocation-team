// src/app/api/v1/squads/route.ts
import { NextResponse } from 'next/server';
import { dependencyFactory } from '../../../../../backend/infrastructure/factories/DependencyFactory';

export async function GET() {
  try {
    const pessoaService = dependencyFactory.createPessoaService();
    const squads = await pessoaService.buscarSquads();
    return NextResponse.json(squads);
  } catch (error) {
    const err = error as Error;
    console.error('Erro na API ao buscar squads:', err);
    return NextResponse.json(
      { message: 'Erro ao buscar squads', details: err.message },
      { status: 500 }
    );
  }
}
