"use client";

import * as React from "react";
import { DayPicker, useDayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Componente para o dropdown de seleção de mês/ano
const CustomDropdown = ({ value, onChange, options }: { value: number, onChange: (value: number) => void, options: { label: string, value: number }[] }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="bg-transparent text-slate-200 text-sm font-medium appearance-none cursor-pointer pr-6 focus:outline-none hover:text-sky-400 transition-colors"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 text-sky-400 pointer-events-none" />
  </div>
);

// Componente para os botões de navegação (setas)
const NavButton = ({ children, ...props }: React.ComponentProps<'button'>) => (
  <button
    type="button"
    className="h-7 w-7 bg-slate-700 text-sky-400 hover:bg-slate-600 border-0 rounded-md flex items-center justify-center transition-colors"
    {...props}
  >
    {children}
  </button>
);

// Componente do cabeçalho customizado que usa o hook da biblioteca
const CustomCaption = () => {
  const { goToMonth, months } = useDayPicker();
  const currentMonth = months[0]?.date || new Date();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    goToMonth(newDate);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    goToMonth(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    goToMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    goToMonth(newDate);
  };

  return (
    <div className="flex items-center justify-between w-full px-1 mb-4">
      <div className="flex items-center gap-2">
        <CustomDropdown
          value={currentMonth.getMonth()}
          onChange={handleMonthSelect}
          options={monthNames.map((m, i) => ({ label: m, value: i }))}
        />
        <CustomDropdown
          value={currentYear}
          onChange={handleYearSelect}
          options={years.map(y => ({ label: y.toString(), value: y }))}
        />
      </div>
      <div className="flex items-center gap-1">
        <NavButton onClick={goToPreviousMonth} aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </NavButton>
        <NavButton onClick={goToNextMonth} aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </NavButton>
      </div>
    </div>
  );
};

// Componente principal Calendar
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3 bg-slate-800 text-white rounded-md border border-slate-700", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Esconde o cabeçalho padrão
          caption_label: "hidden",
          nav: "hidden", // Esconde a navegação padrão
          table: "w-full border-collapse",
          head_row: "flex justify-around",
          head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2 justify-around",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal rounded-md transition-colors aria-selected:opacity-100",
          day_selected: "bg-sky-500 text-sky-50 hover:bg-sky-500 focus:bg-sky-500 focus:text-sky-50",
          day_today: "bg-slate-700 text-sky-400 rounded-md",
          day_outside: "text-slate-500 opacity-50",
          day_disabled: "text-slate-600 opacity-50 cursor-not-allowed",
          day_hidden: "invisible",
          ...classNames,
        }}
         components={{
           MonthCaption: CustomCaption,
         }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };