import React from "react";
import AllocationClientView from "./AllocationClientView";
import { getSundayWeekStart, getNowInSampa, parseDateString } from "@/app/utils/date";

interface AllocationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllocationPage({ searchParams }: AllocationPageProps) {
  const params = await searchParams;
  
  const dateParam = params?.date as string | undefined;
  let weekStartDate: Date;

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    // Se a URL tem o parâmetro de data, usa-o para definir o início da semana.
    // A data na URL representa segunda-feira, então precisamos voltar para o domingo
    const mondayDate = parseDateString(dateParam);
    // Usa diretamente a função getSundayWeekStart que já calcula o domingo correto
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

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-8xl mx-auto">
        <AllocationClientView weekStartDate={weekStartDate} />
      </div>
    </main>
  );
}
