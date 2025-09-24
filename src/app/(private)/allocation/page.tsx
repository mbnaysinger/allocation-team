import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getWeekDates, formatDate } from "@/app/utils/date";
import { dependencyFactory } from "@/backend/infrastructure/factories/DependencyFactory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { UserRole } from "@/backend/core/models/UserRole";

interface AllocationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getAlocacaoData(dataInicio: string, dataFim: string) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const personIds = session?.user?.personIds;

  try {
    const buscarAlocacaoSemana = dependencyFactory.createBuscarAlocacaoSemana();
    const buscarResumosSemanais = dependencyFactory.createBuscarResumosSemanais();

    // Se o usuário for USER e não tiver pessoas associadas, retorna vazio.
    if (userRole === UserRole.USER && (!personIds || personIds.length === 0)) {
      return { pessoas: [], projetos: [], atividades: [], resumosSemanais: [] };
    }

    // Passa os personIds para o serviço se o usuário não for ADMIN
    const alocacaoData = await buscarAlocacaoSemana.execute({
      dataInicio,
      dataFim,
      personIds: userRole === UserRole.ADMIN ? undefined : personIds,
    });
    
    // Extrai os IDs das pessoas para buscar os resumos
    const pessoaIdsParaResumo = alocacaoData.pessoas.map(p => p.id);

    // Busca os resumos para as pessoas e a semana
    const resumosSemanais = await buscarResumosSemanais.execute(pessoaIdsParaResumo, dataInicio);

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
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView initialData={initialData} week={week} />
      </div>
    </main>
  );
}
