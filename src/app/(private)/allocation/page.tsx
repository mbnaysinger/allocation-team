import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getSundayWeekStart, getWeekString, getNowInSampa, parseDateString } from "@/app/utils/date";
import { dependencyFactory } from "@/backend/infrastructure/factories/DependencyFactory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { UserRole } from "@/backend/core/models/UserRole";

interface AllocationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getAlocacaoData(semana: string) {
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
      semana,
      personIds: userRole === UserRole.ADMIN ? undefined : personIds,
    });
    
    // Extrai os IDs das pessoas para buscar os resumos
    const pessoaIdsParaResumo = alocacaoData.pessoas.map(p => p.id);

    // Busca os resumos para as pessoas e a semana
    const resumosSemanais = await buscarResumosSemanais.execute(pessoaIdsParaResumo, semana);

    return { ...alocacaoData, resumosSemanais };

    } catch (error) {
    console.error("Falha ao buscar dados de alocação diretamente do serviço:", error);
    // Retornar um estado vazio em caso de falha
    return { pessoas: [], projetos: [], atividades: [], resumosSemanais: [] };
  }
}

export default async function AllocationPage({ searchParams }: AllocationPageProps) {
  const params = await searchParams;
  
  const dateParam = params?.date as string | undefined;
  let weekStartDate: Date;

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    // Se a URL tem o parâmetro de data, usa-o para definir o início da semana.
    // A data na URL representa segunda-feira, então precisamos voltar para o domingo
    const mondayDate = parseDateString(dateParam);
    weekStartDate = getSundayWeekStart(mondayDate);
  } else {
    // Se não, calcula com base na data atual.
    const baseDate = getNowInSampa();
    
    // REGRA DE NEGÓCIO: Se hoje for domingo, o painel deve abrir na próxima semana.
    if (baseDate.getDay() === 0) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    weekStartDate = getSundayWeekStart(baseDate);
  }

  // Gera o identificador numérico (WWYYYY) para o backend.
  const backendWeekId = getWeekString(weekStartDate);

  // Busca os dados no servidor.
  const initialData = await getAlocacaoData(backendWeekId.toString());

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView initialData={initialData} weekStartDate={weekStartDate} />
      </div>
    </main>
  );
}
