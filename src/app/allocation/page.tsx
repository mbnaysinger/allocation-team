import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getWeekDates, formatDate } from "@/app/utils/date";
import { dependencyFactory } from "@/infrastructure/factories/DependencyFactory";

interface AllocationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getAlocacaoData(dataInicio: string, dataFim: string) {
  try {
    const buscarAlocacaoSemana = dependencyFactory.createBuscarAlocacaoSemana();
    // Chama o serviço diretamente em vez de fazer um fetch
    return await buscarAlocacaoSemana.execute({ dataInicio, dataFim });
  } catch (error) {
    console.error("Falha ao buscar dados de alocação diretamente do serviço:", error);
    // Retornar um estado vazio em caso de falha
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