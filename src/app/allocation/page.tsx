"use client";

import React, { useState } from "react";
import AllocationHeader from "../molecules/AllocationHeader";
import AllocationControls from "../molecules/AllocationControls";
import PersonCard from "../molecules/PersonCard";
import AllocationLegend from "../molecules/AllocationLegend";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Button from "../atoms/Button";

interface Allocation {
  id: string;
  hours: number;
  project: string;
  type: "normal" | "partial" | "overtime";
}

interface Person {
  id: string;
  name: string;
  role: string;
  emoji: string;
  allocations: {
    [day: string]: Allocation[];
  };
}

const AllocationPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [people, setPeople] = useState<Person[]>([
    {
      id: "1",
      name: "João Silva",
      role: "Senior Frontend Developer",
      emoji: "👨‍💻",
      allocations: {
        monday: [
          { id: "1", hours: 8, project: "Projeto Alpha", type: "normal" }
        ],
        tuesday: [
          { id: "2", hours: 4, project: "Projeto Beta", type: "partial" }
        ],
        wednesday: [
          { id: "3", hours: 8, project: "Projeto Alpha", type: "normal" }
        ],
        thursday: [
          { id: "4", hours: 6, project: "Code Review", type: "normal" },
          { id: "5", hours: 2, project: "Hotfix", type: "overtime" }
        ],
        friday: [
          { id: "6", hours: 8, project: "Projeto Gamma", type: "normal" }
        ]
      }
    },
    {
      id: "2",
      name: "Maria Santos",
      role: "Backend Developer",
      emoji: "👩‍💻",
      allocations: {
        monday: [
          { id: "7", hours: 8, project: "API Development", type: "normal" }
        ],
        tuesday: [
          { id: "8", hours: 8, project: "Database Migration", type: "normal" }
        ],
        wednesday: [
          { id: "9", hours: 8, project: "API Development", type: "normal" }
        ],
        thursday: [
          { id: "10", hours: 8, project: "Testing", type: "normal" }
        ],
        friday: [
          { id: "11", hours: 8, project: "Documentation", type: "normal" }
        ]
      }
    },
    {
      id: "3",
      name: "Carlos Design",
      role: "UX/UI Designer",
      emoji: "🎨",
      allocations: {
        monday: [
          { id: "12", hours: 8, project: "UI Mockups", type: "normal" }
        ],
        tuesday: [
          { id: "13", hours: 6, project: "User Research", type: "partial" }
        ],
        wednesday: [],
        thursday: [
          { id: "14", hours: 8, project: "Prototyping", type: "normal" }
        ],
        friday: [
          { id: "15", hours: 8, project: "Design System", type: "normal" }
        ]
      }
    }
  ]);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return { start, end };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getTotalHours = (person: Person) => {
    return Object.values(person.allocations).reduce((total, dayAllocations) => {
      return total + dayAllocations.reduce((dayTotal, allocation) => dayTotal + allocation.hours, 0);
    }, 0);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const { start, end } = getWeekDates(currentWeek);

  return (
    <main className="min-h-screen bg-bg text-text-light">
      <div className="max-w-7xl mx-auto">
        <AllocationHeader />
        
        <AllocationControls
          weekStart={start}
          weekEnd={end}
          onPreviousWeek={() => navigateWeek('prev')}
          onNextWeek={() => navigateWeek('next')}
          onAddPerson={() => alert('Funcionalidade para adicionar pessoa')}
        />

        <div className="p-8 space-y-8">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              weekStart={start}
              onAddAllocation={(day: string) => alert(`Adicionar alocação para ${day}`)}
              onEditAllocation={(allocationId: string) => alert(`Editar alocação ${allocationId}`)}
            />
          ))}
        </div>

        <AllocationLegend />
      </div>
    </main>
  );
};

export default AllocationPage; 