import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "./Calendar.dark.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3 bg-slate-800 text-white rounded-md", className)}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
