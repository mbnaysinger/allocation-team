import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import "./Calendar.dark.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.defaultMonth || new Date());

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();
  
  // Gerar anos (10 anos atrás até 10 anos à frente)
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(month);
    newDate.setMonth(monthIndex);
    setMonth(newDate);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(month);
    newDate.setFullYear(year);
    setMonth(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonth(newDate);
  };

  return (
    <div className={cn("rdp p-3 bg-slate-800 text-white rounded-md border border-slate-700", className)}>
      {/* Header personalizado com dropdowns */}
      <div className="flex items-center justify-between w-full px-1 mb-4">
        {/* Mês e Ano com Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
              className="bg-transparent text-slate-200 text-sm font-medium appearance-none cursor-pointer pr-6 focus:outline-none hover:text-sky-400 transition-colors"
            >
              {months.map((monthName, index) => (
                <option key={index} value={index} className="bg-slate-800 text-slate-200">
                  {monthName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 h-3 w-3 text-sky-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={currentYear}
              onChange={(e) => handleYearSelect(parseInt(e.target.value))}
              className="bg-transparent text-slate-200 text-sm font-medium appearance-none cursor-pointer pr-6 focus:outline-none hover:text-sky-400 transition-colors"
            >
              {years.map((year) => (
                <option key={year} value={year} className="bg-slate-800 text-slate-200">
                  {year}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 h-3 w-3 text-sky-400 pointer-events-none" />
          </div>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="h-7 w-7 bg-slate-700 text-sky-400 hover:bg-slate-600 border-0 rounded-md flex items-center justify-center transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="h-7 w-7 bg-slate-700 text-sky-400 hover:bg-slate-600 border-0 rounded-md flex items-center justify-center transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <DayPicker
        month={month}
        onMonthChange={handleMonthChange}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Esconder o caption padrão
          caption_label: "hidden",
          nav: "hidden", // Esconder a navegação padrão
          nav_button: "hidden",
          nav_button_previous: "hidden",
          nav_button_next: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-800/50 [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-sky-500 text-white hover:bg-sky-600 focus:bg-sky-500",
          day_today: "bg-slate-700 text-sky-400",
          day_outside: "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-800/50 aria-selected:text-slate-500 aria-selected:opacity-30",
          day_disabled: "text-slate-500 opacity-50",
          day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-slate-200",
          day_hidden: "invisible",
        }}
        components={{
          Chevron: ({ ...props }) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              {...props}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          ),
        }}
        showOutsideDays
        fixedWeeks
        showWeekNumber
        weekStartsOn={1}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
