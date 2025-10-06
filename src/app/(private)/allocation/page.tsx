import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getWeekDates, getWeekString, getDateFromWeekString, getNowInSampa } from "@/app/utils/date";
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

export default async function AllocationPage({ searchParams, }: AllocationPageProps) {
  const params = await searchParams;
  
  const semanaParam = params?.semana as string | undefined;
  let baseDate: Date;

  if (semanaParam && /\d{4}-\d{2}/.test(semanaParam)) {
    // Se a URL tem o parâmetro da semana, converte-o para uma data.
    baseDate = getDateFromWeekString(semanaParam);
  } else {
    // Se não, usa a data atual no fuso horário de São Paulo.
    baseDate = getNowInSampa();
    
    // REGRA DE NEGÓCIO: Se hoje for domingo, o painel deve abrir na próxima semana.
    if (baseDate.getDay() === 0) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
  }

  const week = getWeekDates(baseDate);
  const semana = getWeekString(baseDate);

  // Busca os dados no servidor, agora incluindo os resumos
  const initialData = await getAlocacaoData(semana);

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView initialData={initialData} week={week} />
      </div>
    </main>
  );
}
