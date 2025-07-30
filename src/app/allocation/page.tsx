import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getWeekDates, formatDate } from "../utils/date";

interface AllocationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper para garantir que a baseURL está correta tanto no servidor quanto no cliente
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // No browser, use caminhos relativos
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel
  return `http://localhost:${process.env.PORT ?? 3000}`; // Ambiente local
};

async function getAlocacaoData(dataInicio: string, dataFim: string) {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/v1/atividades', baseUrl);
  url.searchParams.append('dataInicio', dataInicio);
  url.searchParams.append('dataFim', dataFim);
  
  try {
    const res = await fetch(url.toString(), {
      // Usar 'no-store' para garantir que os dados sejam sempre frescos a cada navegação de semana
      cache: 'no-store', 
    });

    if (!res.ok) {
      const errorBody = await res.json();
      throw new Error(`Erro na API: ${res.status} - ${errorBody.message}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Falha ao buscar dados de alocação:", error);
    // Retornar um estado vazio em caso de falha na busca
    return { pessoas: [], projetos: [], atividades: [] };
  }
}

export default async function AllocationPage({
  searchParams,
}: AllocationPageProps) {
  // ✅ Aguarda os searchParams antes de usar
  const params = await searchParams;
  
  // Determina a data base para a semana (pela URL ou data atual)
  const dateParam = params?.data as string | undefined;
  const baseDate = dateParam ? new Date(dateParam) : new Date();

  const week = getWeekDates(baseDate);

  // Busca os dados no servidor
  const initialData = await getAlocacaoData(formatDate(week.start), formatDate(week.end));

  return (
    <main className="min-h-screen bg-bg text-text-light">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView initialData={initialData} week={week} />
      </div>
    </main>
  );
}