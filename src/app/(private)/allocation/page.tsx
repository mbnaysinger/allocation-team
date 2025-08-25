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
    const buscarResumosSemanais = dependencyFactory.createBuscarResumosSemanais();

    // Busca os dados primários
    const alocacaoData = await buscarAlocacaoSemana.execute({ dataInicio, dataFim });
    
    // Extrai os IDs das pessoas para buscar os resumos
    const pessoaIds = alocacaoData.pessoas.map(p => p.id);

    // Busca os resumos para as pessoas e a semana
    const resumosSemanais = await buscarResumosSemanais.execute(pessoaIds, dataInicio);

    return { ...alocacaoData, resumosSemanais };

    } catch (error) {
    console.error("Falha ao buscar dados de alocação diretamente do serviço:", error);
    // Retornar um estado vazio em caso de falha
    return { pessoas: [], projetos: [], atividades: [], resumosSemanais: [] };
  }
}

export default async function AllocationPage({
  searchParams,
}: AllocationPageProps) {
  const params = await searchParams;
  
  const dateParam = params?.data as string | undefined;
  const baseDate = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

  const week = getWeekDates(baseDate);

  // Busca os dados no servidor, agora incluindo os resumos
  const initialData = await getAlocacaoData(formatDate(week.start), formatDate(week.end));

  return (
    <main className="min-h-screen bg-bg text-text-light">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView initialData={initialData} week={week} />
      </div>
    </main>
  );
}
